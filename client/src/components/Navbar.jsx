import { LogOut, Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useCustomerAuth } from "../context/CustomerAuthContext.jsx";

const links = [
  ["Home", "/"],
  ["Shop", "/shop"],
  ["Gallery", "/gallery"],
  ["Blog", "/blog"],
  ["About Us", "/about"],
  ["Contact Us", "/contact"]
];

export const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { itemCount } = useCart();
  const { isAuthenticated, logout, user } = useCustomerAuth();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="site-header">
      <div className="shipping-bar">Free shipping on handmade orders above Rs.999</div>
      <nav className="navbar container">
        <button className="menu-button" onClick={() => setOpen(true)} aria-label="Open menu">
          <Menu size={22} />
        </button>
        <Link className="brand" to="/" onClick={() => setOpen(false)}>
          <span className="brand-mark">S</span>
          <span>
            Shrisparsha
            <small>crafted with love</small>
          </span>
        </Link>
        <div className="desktop-links">
          {links.map(([label, path]) => (
            <NavLink key={path} to={path}>
              {label}
            </NavLink>
          ))}
        </div>
        <div className="nav-actions">
          <Link className="nav-icon-button" to="/shop" aria-label="Search products">
            <Search size={19} />
          </Link>
          {isAuthenticated ? (
            <button type="button" className="nav-user-button" onClick={handleLogout} aria-label="Logout">
              <UserRound size={19} />
              <span>{user?.name?.split(" ")[0] || "Account"}</span>
              <LogOut size={16} />
            </button>
          ) : (
            <Link className="nav-icon-button" to="/login" aria-label="Login">
              <UserRound size={19} />
            </Link>
          )}
          <Link className="nav-icon-button nav-cart-button" to="/cart" aria-label="Open cart">
            <ShoppingBag size={19} />
            {itemCount ? <span className="cart-count-badge">{itemCount}</span> : null}
          </Link>
        </div>
      </nav>
      {open ? (
        <div className="mobile-nav-panel container">
          <div className="mobile-nav-panel__header">
            <strong>Menu</strong>
            <button className="drawer-close" onClick={() => setOpen(false)} aria-label="Close menu">
              <X size={22} />
            </button>
          </div>
          <div className="mobile-nav-links">
            {links.map(([label, path]) => (
              <NavLink key={path} to={path}>
                {label}
              </NavLink>
            ))}
          </div>
          <div className="mobile-nav-actions">
            <Link className="ghost-button" to="/cart">
              Cart ({itemCount})
            </Link>
            {isAuthenticated ? (
              <button type="button" className="primary-button" onClick={handleLogout}>
                Logout
              </button>
            ) : (
              <Link className="primary-button" to="/login">
                Login
              </Link>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
};
