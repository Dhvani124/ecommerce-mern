import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../lib/api.js";
import { getStoredSession } from "../lib/session.js";

const initialShipping = {
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India"
};

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export function Checkout() {
  const [searchParams] = useSearchParams();
  const productId = searchParams.get("productId");
  const requestedQuantity = Math.max(1, Number(searchParams.get("quantity") || 1));
  const isCancelled = searchParams.get("payment") === "cancelled";
  const session = useMemo(() => getStoredSession(), []);
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(requestedQuantity);
  const [shipping, setShipping] = useState(initialShipping);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      if (!productId) {
        setError("Missing product for checkout.");
        return;
      }

      try {
        const data = await api.get(`/products/${productId}`);
        setProduct(data.product);
      } catch (requestError) {
        setError(requestError.message);
      }
    };

    loadProduct();
  }, [productId]);

  const authHeaders = {
    headers: {
      Authorization: `Bearer ${session.token}`
    }
  };

  const submitPayload = {
    productId,
    quantity,
    shippingAddress: shipping
  };

  const finalPrice = product?.discount?.percentage
    ? Number((product.price * (1 - product.discount.percentage / 100)).toFixed(2))
    : product?.price || 0;
  const subtotal = Number((finalPrice * quantity).toFixed(2));
  const tax = Number((subtotal * 0.05).toFixed(2));
  const shippingFee = subtotal >= 999 || subtotal === 0 ? 0 : 79;
  const total = Number((subtotal + tax + shippingFee).toFixed(2));

  const ensureCustomerSession = () => {
    if (!session.token) {
      setError("Login is required before checkout. Store a user JWT in localStorage to continue.");
      return false;
    }

    return true;
  };

  const handleRazorpay = async () => {
    if (!ensureCustomerSession()) return;

    setIsLoading(true);
    setError("");

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) throw new Error("Unable to load Razorpay checkout.");

      const data = await api.post("/payments/razorpay/order", submitPayload, authHeaders);

      const razorpay = new window.Razorpay({
        key: data.razorpay.key,
        amount: data.razorpay.amount,
        currency: data.razorpay.currency,
        name: data.razorpay.name,
        description: data.razorpay.description,
        order_id: data.razorpay.orderId,
        handler: async (response) => {
          const verification = await api.post(
            "/payments/razorpay/verify",
            {
              localOrderId: data.localOrder.id,
              ...response
            },
            authHeaders
          );

          window.location.href = verification.redirectUrl;
        },
        prefill: {
          name: session.user?.name || shipping.fullName,
          email: session.user?.email || ""
        },
        theme: {
          color: "#7a5a50"
        }
      });

      razorpay.open();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaypal = async () => {
    if (!ensureCustomerSession()) return;

    setIsLoading(true);
    setError("");

    try {
      const data = await api.post("/payments/paypal/order", submitPayload, authHeaders);
      window.location.href = data.paypal.approvalUrl;
    } catch (requestError) {
      setError(requestError.message);
      setIsLoading(false);
    }
  };

  return (
    <main className="container page checkout-page">
      <div className="section-title">
        <p className="eyebrow">Checkout</p>
        <h1>Complete your handmade order.</h1>
      </div>

      {isCancelled ? <p className="checkout-notice">Payment was cancelled. You can try again.</p> : null}
      {error ? <p className="admin-form-error">{error}</p> : null}

      <div className="checkout-grid">
        <section className="checkout-card">
          <h2>Shipping Details</h2>
          <div className="checkout-form">
            {Object.entries(shipping).map(([key, value]) => (
              <label key={key} className={key === "addressLine1" || key === "addressLine2" ? "checkout-form__full" : ""}>
                <span>{key.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase())}</span>
                <input value={value} onChange={(event) => setShipping({ ...shipping, [key]: event.target.value })} />
              </label>
            ))}
          </div>
        </section>

        <section className="checkout-card">
          <h2>Order Summary</h2>
          {product ? (
            <>
              <div className="checkout-product">
                <img src={product.image} alt={product.name} />
                <div>
                  <strong>{product.name}</strong>
                  <p>{product.category}</p>
                  <label>
                    <span>Quantity</span>
                    <input
                      type="number"
                      min="1"
                      max={Math.max(1, product.stock)}
                      value={quantity}
                      onChange={(event) => setQuantity(Math.max(1, Number(event.target.value || 1)))}
                    />
                  </label>
                </div>
              </div>

              <div className="checkout-totals">
                <div><span>Subtotal</span><strong>Rs {subtotal}</strong></div>
                <div><span>Tax</span><strong>Rs {tax}</strong></div>
                <div><span>Shipping</span><strong>Rs {shippingFee}</strong></div>
                <div className="checkout-total"><span>Total</span><strong>Rs {total}</strong></div>
              </div>

              <div className="checkout-actions">
                <button type="button" className="primary-button full" disabled={isLoading} onClick={handleRazorpay}>
                  {isLoading ? "Processing..." : "Pay with Razorpay"}
                </button>
                <button type="button" className="ghost-button full" disabled={isLoading} onClick={handlePaypal}>
                  Pay with PayPal
                </button>
              </div>
            </>
          ) : (
            <p className="page-muted">Loading product...</p>
          )}

          <Link className="ghost-button checkout-back" to="/shop">
            Back to shop
          </Link>
        </section>
      </div>
    </main>
  );
}
