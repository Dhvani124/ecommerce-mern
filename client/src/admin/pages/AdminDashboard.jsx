import { IndianRupee, PackageCheck, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { adminApi } from "../lib/adminApi.js";
import { useAdminAuth } from "../context/AdminAuthContext.jsx";

const iconMap = {
  usersCount: Users,
  ordersCount: PackageCheck,
  totalSales: IndianRupee
};

export function AdminDashboard() {
  const { token } = useAdminAuth();
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const data = await adminApi.getDashboard(token);
        setDashboard(data);
      } catch (requestError) {
        setError(requestError.message || "Unable to load dashboard");
      }
    };

    loadDashboard();
  }, [token]);

  const cards = dashboard
    ? [
        { key: "totalSales", label: "Total sales", value: `Rs ${dashboard.summary.totalSales}` },
        { key: "ordersCount", label: "Orders count", value: dashboard.summary.ordersCount },
        { key: "usersCount", label: "Users count", value: dashboard.summary.usersCount }
      ]
    : [];

  return (
    <div className="admin-dashboard">
      <section className="admin-panel">
        <div className="admin-panel__header">
          <div>
            <p className="admin-navbar__eyebrow">Overview</p>
            <h2>Store snapshot</h2>
          </div>
          {dashboard ? <span className="admin-role-badge">{dashboard.currentUser.role}</span> : null}
        </div>

        {error ? <p className="admin-form-error">{error}</p> : null}

        <div className="admin-stats-grid">
          {cards.map(({ key, label, value }) => {
            const Icon = iconMap[key];

            return (
              <article key={key} className="admin-stat-card">
                <span className="admin-stat-card__icon">
                  <Icon size={18} />
                </span>
                <strong>{value}</strong>
                <p>{label}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="admin-panel">
        <div className="admin-panel__header">
          <div>
            <p className="admin-navbar__eyebrow">Recent Orders</p>
            <h2>Latest activity</h2>
          </div>
        </div>

        <div className="admin-table">
          <div className="admin-table__head">
            <span>Customer</span>
            <span>Status</span>
            <span>Payment</span>
            <span>Total</span>
          </div>

          {dashboard?.recentOrders?.length ? (
            dashboard.recentOrders.map((order) => (
              <div key={order._id} className="admin-table__row">
                <span>{order.user?.name || "Guest"}</span>
                <span>{order.status}</span>
                <span>{order.paymentStatus}</span>
                <span>Rs {order.total}</span>
              </div>
            ))
          ) : (
            <div className="admin-table__empty">No orders yet.</div>
          )}
        </div>
      </section>
    </div>
  );
}
