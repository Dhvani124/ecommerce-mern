import { LogOut } from "lucide-react";
import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext.jsx";

export function AdminNavbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAdminAuth();
  const pageTitle = useMemo(() => {
    const titles = {
      "/admin": "Dashboard",
      "/admin/categories": "Categories",
      "/admin/products": "Products",
      "/admin/blogs": "Blog",
      "/admin/gallery": "Gallery",
      "/admin/discounts": "Discounts",
      "/admin/users": "Users",
      "/admin/orders": "Orders"
    };

    return titles[location.pathname] || "Admin";
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <header className="admin-navbar">
      <div>
        <p className="admin-navbar__eyebrow">Welcome back</p>
        <h1>{pageTitle}</h1>
      </div>

      <div className="admin-navbar__actions">
        <div className="admin-user-chip">
          <strong>{user?.name}</strong>
          <span>{user?.role}</span>
        </div>
        <button type="button" className="admin-logout-button" onClick={handleLogout}>
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </header>
  );
}
