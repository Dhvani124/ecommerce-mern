import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext.jsx";

export function AdminLogin() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAdminAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login(form);
      navigate(location.state?.from?.pathname || "/admin", { replace: true });
    } catch (requestError) {
      setError(requestError.message || "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="admin-login-page">
      <div className="admin-login-card">
        <p className="admin-login__eyebrow">Admin Login</p>
        <h1>Manage store operations</h1>
        <p className="admin-login__copy">Only users with Admin or Staff roles can sign in here.</p>

        <form className="admin-login-form" onSubmit={handleSubmit}>
          <label>
            <span>Email</span>
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              placeholder="admin@example.com"
              required
            />
          </label>

          <label>
            <span>Password</span>
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              placeholder="Enter password"
              required
            />
          </label>

          {error ? <p className="admin-form-error">{error}</p> : null}

          <button type="submit" className="primary-button full" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Login to admin"}
          </button>
        </form>
      </div>
    </section>
  );
}
