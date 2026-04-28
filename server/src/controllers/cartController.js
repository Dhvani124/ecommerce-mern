import { Cart } from "../models/Cart.js";
import { Product } from "../models/Product.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const findCart = (userId) =>
  Cart.findOneAndUpdate({ user: userId }, { $setOnInsert: { user: userId, items: [] } }, { new: true, upsert: true })
    .populate("items.product");

const cartTotals = (cart) => {
  const subtotal = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const tax = Number((subtotal * 0.05).toFixed(2));
  const shippingFee = subtotal >= 999 || subtotal === 0 ? 0 : 79;
  return { subtotal, tax, shippingFee, total: Number((subtotal + tax + shippingFee).toFixed(2)) };
};

export const getCart = asyncHandler(async (req, res) => {
  const cart = await findCart(req.user._id);
  res.json({ cart, totals: cartTotals(cart) });
});

export const addToCart = asyncHandler(async (req, res, next) => {
  const { productId, quantity = 1 } = req.body;
  const product = await Product.findById(productId);
  if (!product) return next(new AppError("Product not found", 404));

  const cart = await Cart.findOneAndUpdate(
    { user: req.user._id },
    { $setOnInsert: { user: req.user._id, items: [] } },
    { new: true, upsert: true }
  );
  const item = cart.items.find((entry) => entry.product.toString() === productId);
  if (item) item.quantity += Number(quantity);
  else cart.items.push({ product: productId, quantity });
  await cart.save();

  const populated = await cart.populate("items.product");
  res.json({ cart: populated, totals: cartTotals(populated) });
});

export const updateCartItem = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return res.json({ cart: { items: [] }, totals: cartTotals({ items: [] }) });
  }

  const item = cart.items.find((entry) => entry.product.toString() === req.params.productId);
  if (item) item.quantity = Math.max(1, Number(req.body.quantity));
  await cart.save();
  const populated = await cart.populate("items.product");
  res.json({ cart: populated, totals: cartTotals(populated) });
});

export const removeCartItem = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return res.json({ cart: { items: [] }, totals: cartTotals({ items: [] }) });
  }

  cart.items = cart.items.filter((entry) => entry.product.toString() !== req.params.productId);
  await cart.save();
  const populated = await cart.populate("items.product");
  res.json({ cart: populated, totals: cartTotals(populated) });
});

export const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOneAndUpdate(
    { user: req.user._id },
    { $set: { items: [] } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).populate("items.product");
  res.json({ cart, totals: cartTotals(cart) });
});
