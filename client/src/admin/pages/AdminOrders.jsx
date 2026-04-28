import { useEffect, useState } from "react";
import { adminApi } from "../lib/adminApi.js";
import { useAdminAuth } from "../context/AdminAuthContext.jsx";

export function AdminOrders() {
  const { token } = useAdminAuth();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await adminApi.getOrders(token);
        setOrders(data.orders);
      } catch (requestError) {
        setError(requestError.message);
      }
    };

    loadOrders();
  }, [token]);

  return (
    <section className="admin-panel">
      <div className="admin-panel__header">
        <div>
          <p className="admin-navbar__eyebrow">Orders List</p>
          <h2>Recent orders</h2>
        </div>
      </div>

      {error ? <p className="admin-form-error">{error}</p> : null}

      <div className="admin-table">
        <div className="admin-table__head admin-table__head--orders">
          <span>Customer</span>
          <span>Items</span>
          <span>Status</span>
          <span>Payment</span>
          <span>Total</span>
        </div>

        {orders.length ? (
          orders.map((order) => (
            <div key={order._id} className="admin-table__row admin-table__row--orders">
              <span>{order.user?.name || "Guest"}</span>
              <span>{order.items.length}</span>
              <span>{order.status}</span>
              <span>{order.paymentStatus}</span>
              <span>Rs {order.total}</span>
            </div>
          ))
        ) : (
          <div className="admin-table__empty">No orders found.</div>
        )}
      </div>
    </section>
  );
}

const galleryForm = {
  title: "",
  image: "",
  altText: "",
  category: "",
  sortOrder: "",
  isFeatured: false
};

export function AdminGallery() {
  const { token } = useAdminAuth();
  const [galleryItems, setGalleryItems] = useState([]);
  const [form, setForm] = useState(galleryForm);
  const [editingId, setEditingId] = useState("");
  const [error, setError] = useState("");

  const loadGallery = async () => {
    try {
      const data = await adminApi.getGallery(token);
      setGalleryItems(data.galleryItems);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  useEffect(() => {
    loadGallery();
  }, [token]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      if (editingId) await adminApi.updateGallery(token, editingId, form);
      else await adminApi.createGallery(token, form);

      setEditingId("");
      setForm(galleryForm);
      loadGallery();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setForm({
      title: item.title,
      image: item.image,
      altText: item.altText || "",
      category: item.category || "",
      sortOrder: String(item.sortOrder || 0),
      isFeatured: Boolean(item.isFeatured)
    });
  };

  const handleDelete = async (id) => {
    try {
      await adminApi.deleteGallery(token, id);
      if (editingId === id) {
        setEditingId("");
        setForm(galleryForm);
      }
      loadGallery();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <div className="admin-crud-grid">
      <section className="admin-panel">
        <div className="admin-panel__header">
          <div>
            <p className="admin-navbar__eyebrow">Gallery CRUD</p>
            <h2>{editingId ? "Edit gallery item" : "New gallery item"}</h2>
          </div>
        </div>

        <form className="admin-form-grid" onSubmit={handleSubmit}>
          <label>
            <span>Title</span>
            <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
          </label>

          <label>
            <span>Category</span>
            <input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} />
          </label>

          <label className="admin-form-grid__full">
            <span>Image URL</span>
            <input value={form.image} onChange={(event) => setForm({ ...form, image: event.target.value })} required />
          </label>

          <label>
            <span>Alt Text</span>
            <input value={form.altText} onChange={(event) => setForm({ ...form, altText: event.target.value })} />
          </label>

          <label>
            <span>Sort Order</span>
            <input
              type="number"
              value={form.sortOrder}
              onChange={(event) => setForm({ ...form, sortOrder: event.target.value })}
            />
          </label>

          <label className="admin-checkbox admin-form-grid__full">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(event) => setForm({ ...form, isFeatured: event.target.checked })}
            />
            <span>Featured image</span>
          </label>

          {error ? <p className="admin-form-error admin-form-grid__full">{error}</p> : null}

          <div className="admin-form-actions admin-form-grid__full">
            <button type="submit" className="primary-button">
              {editingId ? "Update Item" : "Add Item"}
            </button>
            {editingId ? (
              <button
                type="button"
                className="ghost-button"
                onClick={() => {
                  setEditingId("");
                  setForm(galleryForm);
                }}
              >
                Cancel
              </button>
            ) : null}
          </div>
        </form>
      </section>

      <section className="admin-panel">
        <div className="admin-panel__header">
          <div>
            <p className="admin-navbar__eyebrow">Manage Gallery</p>
            <h2>Image collection</h2>
          </div>
        </div>

        <div className="admin-list">
          {galleryItems.map((item) => (
            <article key={item._id} className="admin-list-card admin-list-card--product">
              <img src={item.image} alt={item.title} className="admin-thumb" />
              <div>
                <strong>{item.title}</strong>
                <p>
                  {item.category || "general"} | sort {item.sortOrder} | {item.isFeatured ? "featured" : "standard"}
                </p>
              </div>
              <div className="admin-inline-actions">
                <button type="button" className="ghost-button" onClick={() => handleEdit(item)}>
                  Edit
                </button>
                <button type="button" className="admin-danger-button" onClick={() => handleDelete(item._id)}>
                  Delete
                </button>
              </div>
            </article>
          ))}
          {!galleryItems.length ? <div className="admin-table__empty">No gallery items found.</div> : null}
        </div>
      </section>
    </div>
  );
}
