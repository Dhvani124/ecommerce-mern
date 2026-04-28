import { Outlet } from "react-router-dom";
import { AdminNavbar } from "../components/AdminNavbar.jsx";
import { AdminSidebar } from "../components/AdminSidebar.jsx";

export function AdminLayout() {
  return (
    <div className="admin-shell">
      <AdminSidebar />
      <div className="admin-main">
        <AdminNavbar />
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
