import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../lib/api.js";
import { getStoredSession } from "../lib/session.js";

export function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const method = searchParams.get("method");
  const session = useMemo(() => getStoredSession(), []);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId || !session.token) return;

      try {
        const data = await api.get(`/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${session.token}` }
        });
        setOrder(data.order);
      } catch (requestError) {
        setError(requestError.message);
      }
    };

    loadOrder();
  }, [orderId, session.token]);

  return (
    <main className="container page checkout-result-page">
      <section className="checkout-result-card">
        <p className="eyebrow">Payment Success</p>
        <h1>Your payment was completed.</h1>
        <p className="page-muted">Payment method: {method || "online payment"}</p>
        {orderId ? <p className="page-muted">Order ID: {orderId}</p> : null}
        {error ? <p className="admin-form-error">{error}</p> : null}

        {order ? (
          <div className="checkout-success-summary">
            <div><span>Status</span><strong>{order.paymentStatus}</strong></div>
            <div><span>Total</span><strong>Rs {order.total}</strong></div>
            <div><span>Items</span><strong>{order.items.length}</strong></div>
          </div>
        ) : null}

        <div className="checkout-actions">
          <Link className="primary-button" to="/shop">Continue shopping</Link>
          <Link className="ghost-button" to="/">Go home</Link>
        </div>
      </section>
    </main>
  );
}
