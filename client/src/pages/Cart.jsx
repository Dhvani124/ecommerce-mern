import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";

export function Cart() {
  const { cart, totals, isAuthenticated, isLoading, updateItem, removeItem, clearCart } = useCart();

  if (!isAuthenticated) {
    return (
      <main className="container page cart-page">
        <section className="cart-card cart-card--empty">
          <p className="eyebrow">Your cart</p>
          <h1>Login to view your cart</h1>
          <p className="page-muted">Cart and checkout are now connected to your customer account.</p>
          <div className="cart-actions">
            <Link className="primary-button" to="/login?redirect=/cart">
              Login
            </Link>
            <Link className="ghost-button" to="/register?redirect=/cart">
              Register
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="container page cart-page">
      <div className="section-title">
        <p className="eyebrow">Shopping bag</p>
        <h1>Your cart</h1>
      </div>

      {isLoading ? <p className="page-muted">Loading cart...</p> : null}

      <div className="cart-layout">
        <section className="cart-card">
          {cart.items.length ? (
            <div className="cart-list">
              {cart.items.map((item) => (
                <article key={item.product._id} className="cart-item">
                  <img src={item.product.image} alt={item.product.name} />
                  <div className="cart-item__body">
                    <div>
                      <p className="eyebrow">{item.product.category}</p>
                      <h2>{item.product.name}</h2>
                      <p className="page-muted">Rs {item.product.price}</p>
                    </div>

                    <div className="cart-item__actions">
                      <label>
                        <span>Quantity</span>
                        <input
                          type="number"
                          min="1"
                          max={Math.max(1, item.product.stock || item.quantity)}
                          value={item.quantity}
                          onChange={(event) => updateItem(item.product._id, event.target.value)}
                        />
                      </label>
                      <button type="button" className="ghost-button" onClick={() => removeItem(item.product._id)}>
                        Remove
                      </button>
                      <Link
                        className="primary-button"
                        to={`/checkout?productId=${item.product._id}&quantity=${item.quantity}`}
                      >
                        Checkout this item
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="cart-empty-state">
              <h2>Your cart is empty</h2>
              <p className="page-muted">Add products from the shop and they will appear here.</p>
              <Link className="primary-button" to="/shop">
                Continue shopping
              </Link>
            </div>
          )}
        </section>

        <aside className="cart-card cart-summary">
          <h2>Summary</h2>
          <div className="checkout-totals">
            <div><span>Subtotal</span><strong>Rs {totals.subtotal}</strong></div>
            <div><span>Tax</span><strong>Rs {totals.tax}</strong></div>
            <div><span>Shipping</span><strong>Rs {totals.shippingFee}</strong></div>
            <div className="checkout-total"><span>Total</span><strong>Rs {totals.total}</strong></div>
          </div>

          <div className="cart-actions">
            <Link className="ghost-button full" to="/shop">
              Add more products
            </Link>
            <button type="button" className="primary-button full" onClick={clearCart} disabled={!cart.items.length}>
              Clear cart
            </button>
          </div>
        </aside>
      </div>
    </main>
  );
}
