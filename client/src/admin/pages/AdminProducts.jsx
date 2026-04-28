import { useEffect, useState } from "react";
import { adminApi } from "../lib/adminApi.js";
import { useAdminAuth } from "../context/AdminAuthContext.jsx";

const initialForm = {
  name: "",
  description: "",
  category: "",
  image: "",
  price: "",
  stock: "",
  tags: "",
  isFeatured: false,
  discountPercentage: "",
  discountStartDate: "",
  discountEndDate: ""
};

const couponForm = {
  code: "",
  percentage: "",
  startDate: "",
  endDate: "",
  isActive: true
};

export function AdminProducts() {
  const { token } = useAdminAuth();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState("");
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      const [categoriesData, productsData] = await Promise.all([
        adminApi.getCategories(token),
        adminApi.getProducts(token)
      ]);
      setCategories(categoriesData.categories);
      setProducts(productsData.products);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      if (editingId) await adminApi.updateProduct(token, editingId, form);
      else await adminApi.createProduct(token, form);

      setEditingId("");
      setForm(initialForm);
      loadData();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product._id);
    setForm({
      name: product.name,
      description: product.description,
      category: product.category,
      image: product.image,
      price: String(product.price),
      stock: String(product.stock),
      tags: product.tags?.join(", ") || "",
      isFeatured: Boolean(product.isFeatured),
      discountPercentage: product.discount?.percentage ? String(product.discount.percentage) : "",
      discountStartDate: product.discount?.startDate ? product.discount.startDate.slice(0, 10) : "",
      discountEndDate: product.discount?.endDate ? product.discount.endDate.slice(0, 10) : ""
    });
  };

  const handleDelete = async (id) => {
    try {
      await adminApi.deleteProduct(token, id);
      if (editingId === id) {
        setEditingId("");
        setForm(initialForm);
      }
      loadData();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <div className="admin-crud-grid">
      <section className="admin-panel">
        <div className="admin-panel__header">
          <div>
            <p className="admin-navbar__eyebrow">Product Form</p>
            <h2>{editingId ? "Edit product" : "New product"}</h2>
          </div>
        </div>

        <form className="admin-form-grid" onSubmit={handleSubmit}>
          <label>
            <span>Name</span>
            <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
          </label>

          <label>
            <span>Category</span>
            <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} required>
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category._id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className="admin-form-grid__full">
            <span>Description</span>
            <textarea
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              required
            />
          </label>

          <label className="admin-form-grid__full">
            <span>Image URL</span>
            <input value={form.image} onChange={(event) => setForm({ ...form, image: event.target.value })} required />
          </label>

          <label>
            <span>Price</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(event) => setForm({ ...form, price: event.target.value })}
              required
            />
          </label>

          <label>
            <span>Stock</span>
            <input
              type="number"
              min="0"
              value={form.stock}
              onChange={(event) => setForm({ ...form, stock: event.target.value })}
              required
            />
          </label>

          <label className="admin-form-grid__full">
            <span>Tags</span>
            <input value={form.tags} onChange={(event) => setForm({ ...form, tags: event.target.value })} />
          </label>

          <label>
            <span>Discount %</span>
            <input
              type="number"
              min="0"
              max="100"
              value={form.discountPercentage}
              onChange={(event) => setForm({ ...form, discountPercentage: event.target.value })}
            />
          </label>

          <label>
            <span>Discount Start</span>
            <input
              type="date"
              value={form.discountStartDate}
              onChange={(event) => setForm({ ...form, discountStartDate: event.target.value })}
            />
          </label>

          <label>
            <span>Discount End</span>
            <input
              type="date"
              value={form.discountEndDate}
              onChange={(event) => setForm({ ...form, discountEndDate: event.target.value })}
            />
          </label>

          <label className="admin-checkbox admin-form-grid__full">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(event) => setForm({ ...form, isFeatured: event.target.checked })}
            />
            <span>Featured product</span>
          </label>

          {error ? <p className="admin-form-error admin-form-grid__full">{error}</p> : null}

          <div className="admin-form-actions admin-form-grid__full">
            <button type="submit" className="primary-button">
              {editingId ? "Update Product" : "Add Product"}
            </button>
            {editingId ? (
              <button
                type="button"
                className="ghost-button"
                onClick={() => {
                  setEditingId("");
                  setForm(initialForm);
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
            <p className="admin-navbar__eyebrow">Manage Products</p>
            <h2>Inventory</h2>
          </div>
        </div>

        <div className="admin-list">
          {products.map((product) => (
            <article key={product._id} className="admin-list-card admin-list-card--product">
              <img src={product.image} alt={product.name} className="admin-thumb" />
              <div>
                <strong>{product.name}</strong>
                <p>
                  {product.category} | Rs {product.price} | Stock {product.stock}
                </p>
                {product.discount?.percentage ? (
                  <p>
                    Discount {product.discount.percentage}% from {product.discount.startDate?.slice(0, 10)} to{" "}
                    {product.discount.endDate?.slice(0, 10)}
                  </p>
                ) : null}
              </div>
              <div className="admin-inline-actions">
                <button type="button" className="ghost-button" onClick={() => handleEdit(product)}>
                  Edit
                </button>
                <button type="button" className="admin-danger-button" onClick={() => handleDelete(product._id)}>
                  Delete
                </button>
              </div>
            </article>
          ))}
          {!products.length ? <div className="admin-table__empty">No products found.</div> : null}
        </div>
      </section>
    </div>
  );
}

export function AdminDiscounts() {
  const { token } = useAdminAuth();
  const [coupons, setCoupons] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(couponForm);
  const [editingId, setEditingId] = useState("");
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      const [couponsData, productsData] = await Promise.all([adminApi.getCoupons(token), adminApi.getProducts(token)]);
      setCoupons(couponsData.coupons);
      setProducts(productsData.products.filter((product) => Number(product.discount?.percentage) > 0));
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      if (editingId) await adminApi.updateCoupon(token, editingId, form);
      else await adminApi.createCoupon(token, form);

      setEditingId("");
      setForm(couponForm);
      loadData();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const handleEdit = (coupon) => {
    setEditingId(coupon._id);
    setForm({
      code: coupon.code,
      percentage: String(coupon.percentage),
      startDate: coupon.startDate.slice(0, 10),
      endDate: coupon.endDate.slice(0, 10),
      isActive: Boolean(coupon.isActive)
    });
  };

  const handleDelete = async (id) => {
    try {
      await adminApi.deleteCoupon(token, id);
      if (editingId === id) {
        setEditingId("");
        setForm(couponForm);
      }
      loadData();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <div className="admin-crud-grid">
      <section className="admin-panel">
        <div className="admin-panel__header">
          <div>
            <p className="admin-navbar__eyebrow">Coupon System</p>
            <h2>{editingId ? "Edit coupon" : "New coupon"}</h2>
          </div>
        </div>

        <form className="admin-form-grid" onSubmit={handleSubmit}>
          <label>
            <span>Code</span>
            <input value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} required />
          </label>

          <label>
            <span>Percentage</span>
            <input
              type="number"
              min="1"
              max="100"
              value={form.percentage}
              onChange={(event) => setForm({ ...form, percentage: event.target.value })}
              required
            />
          </label>

          <label>
            <span>Start Date</span>
            <input
              type="date"
              value={form.startDate}
              onChange={(event) => setForm({ ...form, startDate: event.target.value })}
              required
            />
          </label>

          <label>
            <span>End Date</span>
            <input
              type="date"
              value={form.endDate}
              onChange={(event) => setForm({ ...form, endDate: event.target.value })}
              required
            />
          </label>

          <label className="admin-checkbox admin-form-grid__full">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) => setForm({ ...form, isActive: event.target.checked })}
            />
            <span>Coupon active</span>
          </label>

          {error ? <p className="admin-form-error admin-form-grid__full">{error}</p> : null}

          <div className="admin-form-actions admin-form-grid__full">
            <button type="submit" className="primary-button">
              {editingId ? "Update Coupon" : "Add Coupon"}
            </button>
            {editingId ? (
              <button
                type="button"
                className="ghost-button"
                onClick={() => {
                  setEditingId("");
                  setForm(couponForm);
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
            <p className="admin-navbar__eyebrow">Discount Overview</p>
            <h2>Coupons and product discounts</h2>
          </div>
        </div>

        <div className="admin-list">
          {coupons.map((coupon) => (
            <article key={coupon._id} className="admin-list-card">
              <div>
                <strong>{coupon.code}</strong>
                <p>
                  {coupon.percentage}% | {coupon.startDate.slice(0, 10)} to {coupon.endDate.slice(0, 10)} |{" "}
                  {coupon.isActive ? "active" : "inactive"}
                </p>
              </div>
              <div className="admin-inline-actions">
                <button type="button" className="ghost-button" onClick={() => handleEdit(coupon)}>
                  Edit
                </button>
                <button type="button" className="admin-danger-button" onClick={() => handleDelete(coupon._id)}>
                  Delete
                </button>
              </div>
            </article>
          ))}

          {products.map((product) => (
            <article key={product._id} className="admin-list-card admin-list-card--product">
              <img src={product.image} alt={product.name} className="admin-thumb" />
              <div>
                <strong>{product.name}</strong>
                <p>
                  {product.discount.percentage}% off | {product.discount.startDate?.slice(0, 10)} to{" "}
                  {product.discount.endDate?.slice(0, 10)}
                </p>
              </div>
            </article>
          ))}

          {!coupons.length && !products.length ? <div className="admin-table__empty">No discounts found.</div> : null}
        </div>
      </section>
    </div>
  );
}
