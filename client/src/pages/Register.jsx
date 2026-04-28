import { useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useCustomerAuth } from "../context/CustomerAuthContext.jsx";

export function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, register } = useCustomerAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const redirectTo = searchParams.get("redirect") || "/";

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password
      });
      navigate(redirectTo, { replace: true });
    } catch (requestError) {
      setError(requestError.message || "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="container page auth-page">
      <section className="auth-card">
        <p className="eyebrow">Create account</p>
        <h1>Join the handmade store</h1>
        <p className="auth-copy">Register once and your cart plus checkout flow will work properly.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            <span>Full name</span>
            <input
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              placeholder="Your name"
              required
            />
          </label>

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
              minLength="8"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              placeholder="Minimum 8 characters"
              required
            />
          </label>

          <label>
            <span>Confirm password</span>
            <input
              type="password"
              minLength="8"
              value={form.confirmPassword}
              onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })}
              placeholder="Repeat password"
              required
            />
          </label>

          {error ? <p className="admin-form-error">{error}</p> : null}

          <button type="submit" className="primary-button full" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to={`/login?redirect=${encodeURIComponent(redirectTo)}`}>Login</Link>
        </p>
      </section>
    </main>
  );
}
