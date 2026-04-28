import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../lib/api.js";
import { getStoredSession } from "../lib/session.js";

export function PaypalReturn() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const session = useMemo(() => getStoredSession(), []);
  const [error, setError] = useState("");

  useEffect(() => {
    const capturePayment = async () => {
      const localOrderId = searchParams.get("localOrderId");
      const paypalOrderId = searchParams.get("token");

      if (!localOrderId || !paypalOrderId || !session.token) {
        setError("Unable to complete PayPal payment.");
        return;
      }

      try {
        const data = await api.post(
          "/payments/paypal/capture",
          { localOrderId, paypalOrderId },
          {
            headers: {
              Authorization: `Bearer ${session.token}`
            }
          }
        );

        navigate(`/checkout/success?orderId=${data.orderId}&method=paypal`, { replace: true });
      } catch (requestError) {
        setError(requestError.message);
      }
    };

    capturePayment();
  }, [navigate, searchParams, session.token]);

  return (
    <main className="container page checkout-result-page">
      <section className="checkout-result-card">
        <p className="eyebrow">PayPal</p>
        <h1>Finalizing your payment...</h1>
        {error ? <p className="admin-form-error">{error}</p> : <p className="page-muted">Please wait a moment.</p>}
      </section>
    </main>
  );
}
