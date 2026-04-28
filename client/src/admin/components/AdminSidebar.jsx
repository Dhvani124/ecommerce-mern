import { BadgePercent, Boxes, Images, LayoutDashboard, ListOrdered, Newspaper, Shapes, ShieldCheck, Users } from "lucide-react";
import { NavLink } from "react-router-dom";

const links = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/categories", label: "Categories", icon: Shapes },
  { to: "/admin/products", label: "Products", icon: Boxes },
  { to: "/admin/blogs", label: "Blog", icon: Newspaper },
  { to: "/admin/gallery", label: "Gallery", icon: Images },
  { to: "/admin/discounts", label: "Discounts", icon: BadgePercent },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/orders", label: "Orders", icon: ListOrdered }
];

export function AdminSidebar() {
  return (
    <aside className="admin-sidebar">
      <div>
        <p className="admin-sidebar__eyebrow">Control Panel</p>
        <h2>
          Atelier <span>Admin</span>
        </h2>
      </div>

      <nav className="admin-sidebar__nav">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => `admin-nav-link${isActive ? " active" : ""}`}>
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="admin-sidebar__footer">
        <ShieldCheck size={18} />
        <span>Role-based access enabled</span>
      </div>
    </aside>
  );
}
