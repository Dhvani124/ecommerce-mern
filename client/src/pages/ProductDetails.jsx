import { ArrowLeft, PackageCheck, ShieldCheck, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useCustomerAuth } from "../context/CustomerAuthContext.jsx";
import { api } from "../lib/api.js";

export const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { isAuthenticated } = useCustomerAuth();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");
  const [cartMessage, setCartMessage] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const data = await api.get(`/products/${id}`);
        setProduct(data.product);
      } catch (requestError) {
        setError(requestError.message);
      }
    };

    loadProduct();
  }, [id]);

  if (error) {
    return (
      <main className="container product-detail-page">
        <p className="admin-form-error">{error}</p>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="container product-detail-page">
        <p className="page-muted">Loading product...</p>
      </main>
    );
  }

  const finalPrice = product.discount?.percentage
    ? Number((product.price * (1 - product.discount.percentage / 100)).toFixed(2))
    : product.price;
  const checkoutPath = `/checkout?productId=${product._id}&quantity=${quantity}`;
  const checkoutLink = isAuthenticated ? checkoutPath : `/login?redirect=${encodeURIComponent(checkoutPath)}`;

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(`/product/${id}`)}`);
      return;
    }

    setIsAdding(true);
    setCartMessage("");

    try {
      await addItem(product._id, quantity);
      setCartMessage("Added to cart successfully.");
    } catch (requestError) {
      setCartMessage(requestError.message);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <main className="container product-detail-page">
      <Link className="back-link" to="/shop">
        <ArrowLeft size={17} /> Back to shop
      </Link>
      <section className="product-detail-grid">
        <div className="detail-image">
          <img src={product.image} alt={product.name} />
        </div>
        <div className="detail-panel">
          <p className="eyebrow">{product.category}</p>
          <h1>{product.name}</h1>
          <p className="price">Rs.{finalPrice}</p>
          {product.discount?.percentage ? (
            <p className="page-muted">
              {product.discount.percentage}% off until {product.discount.endDate?.slice(0, 10)}
            </p>
          ) : null}
          <p>{product.description}</p>
          <div className="quantity-row">
            <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))}>-</button>
            <span>{quantity}</span>
            <button type="button" onClick={() => setQuantity((value) => Math.min(product.stock || 1, value + 1))}>+</button>
          </div>
          <div className="detail-actions">
            <button type="button" className="ghost-button full" onClick={handleAddToCart} disabled={isAdding}>
              {isAdding ? "Adding..." : "Add to cart"}
            </button>
            <Link className="primary-button full" to={checkoutLink}>
              Buy now
            </Link>
          </div>
          {cartMessage ? <p className={cartMessage.includes("successfully") ? "page-muted" : "admin-form-error"}>{cartMessage}</p> : null}
          <div className="detail-promises">
            <span><Sparkles size={18} /> Handmade finish</span>
            <span><PackageCheck size={18} /> Gift-ready packing</span>
            <span><ShieldCheck size={18} /> Secure checkout</span>
          </div>
        </div>
      </section>
    </main>
  );
};
