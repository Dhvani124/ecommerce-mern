import crypto from "crypto";
import Razorpay from "razorpay";
import { env } from "../config/env.js";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { User } from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  buildOrderTotals,
  getEffectivePrice,
  normalizeShippingAddress,
  validateShippingAddress
} from "../utils/orderPricing.js";
import { sendOrderConfirmation, sendWhatsAppNotification } from "../services/notificationService.js";

const razorpayClient =
  env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET
    ? new Razorpay({ key_id: env.RAZORPAY_KEY_ID, key_secret: env.RAZORPAY_KEY_SECRET })
    : null;

const getClientBaseUrl = () => env.CORS_ORIGIN.split(",")[0].trim();
const getPaypalBaseUrl = () =>
  env.PAYPAL_ENV === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";

const createPendingOrder = async ({ userId, productId, quantity = 1, shippingAddress, paymentMethod }) => {
  const product = await Product.findById(productId);
  if (!product) throw new AppError("Product not found", 404);

  const normalizedShipping = normalizeShippingAddress(shippingAddress);
  validateShippingAddress(normalizedShipping);

  const safeQuantity = Math.max(1, Number(quantity || 1));
  if (safeQuantity > product.stock) throw new AppError("Requested quantity is not available", 400);

  const { finalPrice } = getEffectivePrice(product);
  const totals = buildOrderTotals(finalPrice, safeQuantity);

  const order = await Order.create({
    user: userId,
    items: [
      {
        product: product._id,
        name: product.name,
        image: product.image,
        quantity: safeQuantity,
        price: finalPrice
      }
    ],
    shippingAddress: normalizedShipping,
    subtotal: totals.subtotal,
    tax: totals.tax,
    shippingFee: totals.shippingFee,
    total: totals.total,
    paymentMethod,
    paymentStatus: "pending",
    paymentResult: { provider: paymentMethod }
  });

  return { order, product };
};

const markOrderPaid = async (order, note, paymentResult) => {
  await Promise.all(
    order.items.map((item) =>
      Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      })
    )
  );

  order.paymentStatus = "paid";
  order.paymentResult = paymentResult;
  order.statusHistory.push({ status: order.status, note });
  await order.save();

  // Send email and WhatsApp notifications
  try {
    const user = await User.findById(order.user);
    if (user) {
      await sendOrderConfirmation(order, user);
      if (order.shippingAddress?.phone) {
        await sendWhatsAppNotification(order, order.shippingAddress.phone);
      }
    }
  } catch (notificationError) {
    console.error("Failed to send notifications:", notificationError.message);
  }
};

const getPaypalAccessToken = async () => {
  if (!env.PAYPAL_CLIENT_ID || !env.PAYPAL_CLIENT_SECRET) {
    throw new AppError("PayPal credentials are not configured", 500);
  }

  const auth = Buffer.from(`${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`).toString("base64");
  const response = await fetch(`${getPaypalBaseUrl()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "grant_type=client_credentials"
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new AppError(`PayPal auth failed: ${errorText}`, 502);
  }

  const data = await response.json();
  return data.access_token;
};

export const createRazorpayOrder = asyncHandler(async (req, res, next) => {
  if (!razorpayClient) return next(new AppError("Razorpay credentials are not configured", 500));

  const { order } = await createPendingOrder({
    userId: req.user._id,
    productId: req.body.productId,
    quantity: req.body.quantity,
    shippingAddress: req.body.shippingAddress,
    paymentMethod: "razorpay"
  });

  const razorpayOrder = await razorpayClient.orders.create({
    amount: Math.round(order.total * 100),
    currency: "INR",
    receipt: `receipt_${order._id.toString().slice(-12)}`,
    notes: {
      localOrderId: order._id.toString(),
      userId: req.user._id.toString()
    }
  });

  order.paymentResult = {
    provider: "razorpay",
    orderId: razorpayOrder.id,
    raw: razorpayOrder
  };
  await order.save();

  res.status(201).json({
    localOrder: {
      id: order._id,
      total: order.total,
      subtotal: order.subtotal,
      tax: order.tax,
      shippingFee: order.shippingFee
    },
    razorpay: {
      key: env.RAZORPAY_KEY_ID,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      name: "Shrisparsha",
      description: `Order ${order._id}`
    }
  });
});

export const verifyRazorpayPayment = asyncHandler(async (req, res, next) => {
  if (!razorpayClient || !env.RAZORPAY_KEY_SECRET) {
    return next(new AppError("Razorpay credentials are not configured", 500));
  }

  const { localOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const order = await Order.findOne({ _id: localOrderId, user: req.user._id });

  if (!order) return next(new AppError("Order not found", 404));
  if (order.paymentStatus === "paid") {
    return res.json({
      message: "Order already paid",
      orderId: order._id,
      redirectUrl: `${getClientBaseUrl()}/checkout/success?orderId=${order._id}&method=razorpay`
    });
  }
  if (order.paymentResult?.orderId !== razorpay_order_id) {
    return next(new AppError("Razorpay order mismatch", 400));
  }

  const expectedSignature = crypto
    .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    order.paymentStatus = "failed";
    await order.save();
    return next(new AppError("Invalid Razorpay signature", 400));
  }

  const payment = await razorpayClient.payments.fetch(razorpay_payment_id);

  await markOrderPaid(order, "Payment completed via Razorpay", {
    provider: "razorpay",
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
    signature: razorpay_signature,
    raw: payment
  });

  res.json({
    message: "Razorpay payment verified",
    orderId: order._id,
    redirectUrl: `${getClientBaseUrl()}/checkout/success?orderId=${order._id}&method=razorpay`
  });
});

export const createPaypalOrder = asyncHandler(async (req, res) => {
  const { order } = await createPendingOrder({
    userId: req.user._id,
    productId: req.body.productId,
    quantity: req.body.quantity,
    shippingAddress: req.body.shippingAddress,
    paymentMethod: "paypal"
  });

  const accessToken = await getPaypalAccessToken();
  const clientBase = getClientBaseUrl();

  const response = await fetch(`${getPaypalBaseUrl()}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: order._id.toString(),
          description: `Shrisparsha order ${order._id}`,
          amount: {
            currency_code: env.PAYPAL_CURRENCY,
            value: order.total.toFixed(2)
          }
        }
      ],
      application_context: {
        brand_name: "Shrisparsha",
        user_action: "PAY_NOW",
        return_url: `${clientBase}/checkout/paypal-return?localOrderId=${order._id}`,
        cancel_url: `${clientBase}/checkout?payment=cancelled`
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new AppError(`PayPal order creation failed: ${errorText}`, 502);
  }

  const paypalOrder = await response.json();
  const approvalUrl = paypalOrder.links?.find((link) => link.rel === "approve")?.href;

  order.paymentResult = {
    provider: "paypal",
    orderId: paypalOrder.id,
    raw: paypalOrder
  };
  await order.save();

  res.status(201).json({
    localOrder: { id: order._id, total: order.total },
    paypal: {
      orderId: paypalOrder.id,
      approvalUrl
    }
  });
});

export const capturePaypalPayment = asyncHandler(async (req, res, next) => {
  const { localOrderId, paypalOrderId } = req.body;
  const order = await Order.findOne({ _id: localOrderId, user: req.user._id });

  if (!order) return next(new AppError("Order not found", 404));
  if (order.paymentStatus === "paid") {
    return res.json({
      message: "Order already paid",
      orderId: order._id,
      redirectUrl: `${getClientBaseUrl()}/checkout/success?orderId=${order._id}&method=paypal`
    });
  }
  if (order.paymentResult?.orderId !== paypalOrderId) {
    return next(new AppError("PayPal order mismatch", 400));
  }

  const accessToken = await getPaypalAccessToken();
  const response = await fetch(`${getPaypalBaseUrl()}/v2/checkout/orders/${paypalOrderId}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    order.paymentStatus = "failed";
    await order.save();
    throw new AppError(`PayPal capture failed: ${errorText}`, 502);
  }

  const captureResult = await response.json();
  const capture = captureResult.purchase_units?.[0]?.payments?.captures?.[0];

  await markOrderPaid(order, "Payment completed via PayPal", {
    provider: "paypal",
    orderId: paypalOrderId,
    captureId: capture?.id,
    raw: captureResult
  });

  res.json({
    message: "PayPal payment captured",
    orderId: order._id,
    redirectUrl: `${getClientBaseUrl()}/checkout/success?orderId=${order._id}&method=paypal`
  });
});
