import { useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useCustomerAuth } from "../context/CustomerAuthContext.jsx";

export function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, login } = useCustomerAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const redirectTo = searchParams.get("redirect") || "/";

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login(form);
      navigate(redirectTo, { replace: true });
    } catch (requestError) {
      setError(requestError.message || "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="container page auth-page">
      <section className="auth-card">
        <p className="eyebrow">Welcome back</p>
        <h1>Login to your account</h1>
        <p className="auth-copy">Use your customer account to manage cart, checkout, and orders.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            <span>Email</span>
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              placeholder="you@example.com"
              required
            />
          </label>

          <label>
            <span>Password</span>
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              placeholder="Enter your password"
              required
            />
          </label>

          {error ? <p className="admin-form-error">{error}</p> : null}

          <button type="submit" className="primary-button full" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="auth-switch">
          New here? <Link to={`/register?redirect=${encodeURIComponent(redirectTo)}`}>Create an account</Link>
        </p>
      </section>
    </main>
  );
}
