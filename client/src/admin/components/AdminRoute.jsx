import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext.jsx";

export function AdminRoute() {
  const location = useLocation();
  const { isAuthenticated, user } = useAdminAuth();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  if (!["admin", "staff"].includes(user?.role)) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}
