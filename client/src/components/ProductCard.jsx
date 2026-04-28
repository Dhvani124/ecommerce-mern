import { Heart } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useCustomerAuth } from "../context/CustomerAuthContext.jsx";

export const ProductCard = ({ product }) => {
  const productId = product._id || product.id;
  const price = product.discount?.percentage
    ? Number((product.price * (1 - product.discount.percentage / 100)).toFixed(2))
    : product.price;
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { isAuthenticated } = useCustomerAuth();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    if (!product._id) {
      navigate(`/product/${productId}`);
      return;
    }

    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(`/product/${productId}`)}`);
      return;
    }

    setIsAdding(true);
    try {
      await addItem(product._id, 1);
      navigate("/cart");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <article className="product-card">
      <Link className="product-image" to={`/product/${productId}`}>
        <img src={product.image} alt={product.name} loading="lazy" />
        <span className="product-image__badge" aria-hidden="true">
          <Heart size={16} />
        </span>
      </Link>
      <div className="product-body">
        <p>{product.category}</p>
        <h3>{product.name}</h3>
        <div className="product-body__actions">
          <strong>Rs.{price}</strong>
          <div className="product-card__buttons">
            <Link to={`/product/${productId}`}>View</Link>
            <button type="button" className="ghost-button" onClick={handleAddToCart} disabled={isAdding}>
              {isAdding ? "Adding..." : "Add to cart"}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
