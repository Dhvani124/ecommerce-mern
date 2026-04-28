import { Facebook, Instagram, MessageCircle, Twitter } from "lucide-react";
import { Link } from "react-router-dom";

export const Footer = () => (
  <footer className="footer">
    <div className="container footer-grid">
      <div>
        <Link className="brand footer-brand" to="/">
          <span className="brand-mark">S</span>
          <span>
            Shrisparsha
            <small>soft, slow, handmade</small>
          </span>
        </Link>
        <p>Minimal handmade products crafted for gifting, collecting, and cherishing.</p>
      </div>
      <div>
        <h3>Quick Links</h3>
        <Link to="/shop">Shop</Link>
        <Link to="/gallery">Gallery</Link>
        <Link to="/blog">Blog</Link>
        <Link to="/contact">Contact</Link>
      </div>
      <div>
        <h3>Customer Care</h3>
        <a href="#shipping">Shipping Policy</a>
        <a href="#returns">Returns</a>
        <a href="#custom">Custom Orders</a>
        <a href="#privacy">Privacy Policy</a>
      </div>
      <div>
        <h3>Follow Us</h3>
        <div className="social-links">
          <a href="https://facebook.com" aria-label="Facebook"><Facebook size={18} /></a>
          <a href="https://instagram.com" aria-label="Instagram"><Instagram size={18} /></a>
          <a href="https://twitter.com" aria-label="Twitter"><Twitter size={18} /></a>
          <a href="https://wa.me/911234567890" aria-label="WhatsApp"><MessageCircle size={18} /></a>
        </div>
      </div>
    </div>
    <p className="copyright">© 2026 Shrisparsha Studio. All rights reserved.</p>
  </footer>
);

