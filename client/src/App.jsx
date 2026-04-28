import { Route, Routes } from "react-router-dom";
import { AdminRoute } from "./admin/components/AdminRoute.jsx";
import { AdminBlogs, AdminCategories } from "./admin/pages/AdminCategories.jsx";
import { AdminLayout } from "./admin/layouts/AdminLayout.jsx";
import { AdminDashboard } from "./admin/pages/AdminDashboard.jsx";
import { AdminLogin } from "./admin/pages/AdminLogin.jsx";
import { AdminGallery, AdminOrders } from "./admin/pages/AdminOrders.jsx";
import { AdminDiscounts, AdminProducts } from "./admin/pages/AdminProducts.jsx";
import { AdminUsers } from "./admin/pages/AdminUsers.jsx";
import { PublicLayout } from "./layouts/PublicLayout.jsx";
import { About } from "./pages/About.jsx";
import { Blog } from "./pages/Blog.jsx";
import { BlogDetails } from "./pages/BlogDetails.jsx";
import { Cart } from "./pages/Cart.jsx";
import { Checkout } from "./pages/Checkout.jsx";
import { CheckoutSuccess } from "./pages/CheckoutSuccess.jsx";
import { Contact } from "./pages/Contact.jsx";
import { Gallery } from "./pages/Gallery.jsx";
import { Home } from "./pages/Home.jsx";
import { Login } from "./pages/Login.jsx";
import { PaypalReturn } from "./pages/PaypalReturn.jsx";
import { ProductDetails } from "./pages/ProductDetails.jsx";
import { Register } from "./pages/Register.jsx";
import { Shop } from "./pages/Shop.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogDetails />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/checkout/success" element={<CheckoutSuccess />} />
        <Route path="/checkout/paypal-return" element={<PaypalReturn />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Route>

      <Route path="/admin/login" element={<AdminLogin />} />
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="blogs" element={<AdminBlogs />} />
          <Route path="gallery" element={<AdminGallery />} />
          <Route path="discounts" element={<AdminDiscounts />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="orders" element={<AdminOrders />} />
        </Route>
      </Route>
    </Routes>
  );
}
