import { useEffect, useState } from "react";
import { adminApi } from "../lib/adminApi.js";
import { useAdminAuth } from "../context/AdminAuthContext.jsx";

const categoryForm = { name: "" };
const blogForm = {
  title: "",
  image: "",
  description: "",
  tags: ""
};

export function AdminCategories() {
  const { token } = useAdminAuth();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(categoryForm);
  const [editingId, setEditingId] = useState("");
  const [error, setError] = useState("");

  const loadCategories = async () => {
    try {
      const data = await adminApi.getCategories(token);
      setCategories(data.categories);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  useEffect(() => {
    loadCategories();
  }, [token]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      if (editingId) await adminApi.updateCategory(token, editingId, form);
      else await adminApi.createCategory(token, form);

      setForm(categoryForm);
      setEditingId("");
      loadCategories();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const handleEdit = (category) => {
    setEditingId(category._id);
    setForm({ name: category.name });
  };

  const handleDelete = async (id) => {
    try {
      await adminApi.deleteCategory(token, id);
      if (editingId === id) {
        setEditingId("");
        setForm(categoryForm);
      }
      loadCategories();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <div className="admin-crud-grid">
      <section className="admin-panel">
        <div className="admin-panel__header">
          <div>
            <p className="admin-navbar__eyebrow">Create Category</p>
            <h2>{editingId ? "Edit category" : "New category"}</h2>
          </div>
        </div>

        <form className="admin-form-grid" onSubmit={handleSubmit}>
          <label>
            <span>Name</span>
            <input value={form.name} onChange={(event) => setForm({ name: event.target.value })} required />
          </label>

          {error ? <p className="admin-form-error">{error}</p> : null}

          <div className="admin-form-actions">
            <button type="submit" className="primary-button">
              {editingId ? "Update Category" : "Add Category"}
            </button>
            {editingId ? (
              <button
                type="button"
                className="ghost-button"
                onClick={() => {
                  setEditingId("");
                  setForm(categoryForm);
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
            <p className="admin-navbar__eyebrow">Manage Categories</p>
            <h2>All categories</h2>
          </div>
        </div>

        <div className="admin-list">
          {categories.map((category) => (
            <article key={category._id} className="admin-list-card">
              <div>
                <strong>{category.name}</strong>
                <p>{category.slug}</p>
              </div>
              <div className="admin-inline-actions">
                <button type="button" className="ghost-button" onClick={() => handleEdit(category)}>
                  Edit
                </button>
                <button type="button" className="admin-danger-button" onClick={() => handleDelete(category._id)}>
                  Delete
                </button>
              </div>
            </article>
          ))}
          {!categories.length ? <div className="admin-table__empty">No categories found.</div> : null}
        </div>
      </section>
    </div>
  );
}

export function AdminBlogs() {
  const { token } = useAdminAuth();
  const [blogs, setBlogs] = useState([]);
  const [form, setForm] = useState(blogForm);
  const [editingId, setEditingId] = useState("");
  const [error, setError] = useState("");

  const loadBlogs = async () => {
    try {
      const data = await adminApi.getBlogs(token);
      setBlogs(data.blogs);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  useEffect(() => {
    loadBlogs();
  }, [token]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      if (editingId) await adminApi.updateBlog(token, editingId, form);
      else await adminApi.createBlog(token, form);

      setEditingId("");
      setForm(blogForm);
      loadBlogs();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const handleEdit = (blog) => {
    setEditingId(blog._id);
    setForm({
      title: blog.title,
      image: blog.image,
      description: blog.description,
      tags: blog.tags?.join(", ") || ""
    });
  };

  const handleDelete = async (id) => {
    try {
      await adminApi.deleteBlog(token, id);
      if (editingId === id) {
        setEditingId("");
        setForm(blogForm);
      }
      loadBlogs();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <div className="admin-crud-grid">
      <section className="admin-panel">
        <div className="admin-panel__header">
          <div>
            <p className="admin-navbar__eyebrow">Blog CRUD</p>
            <h2>{editingId ? "Edit post" : "New post"}</h2>
          </div>
        </div>

        <form className="admin-form-grid" onSubmit={handleSubmit}>
          <label className="admin-form-grid__full">
            <span>Title</span>
            <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
          </label>

          <label className="admin-form-grid__full">
            <span>Image</span>
            <input value={form.image} onChange={(event) => setForm({ ...form, image: event.target.value })} required />
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
            <span>Tags</span>
            <input value={form.tags} onChange={(event) => setForm({ ...form, tags: event.target.value })} />
          </label>

          {error ? <p className="admin-form-error admin-form-grid__full">{error}</p> : null}

          <div className="admin-form-actions admin-form-grid__full">
            <button type="submit" className="primary-button">
              {editingId ? "Update Post" : "Add Post"}
            </button>
            {editingId ? (
              <button
                type="button"
                className="ghost-button"
                onClick={() => {
                  setEditingId("");
                  setForm(blogForm);
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
            <p className="admin-navbar__eyebrow">Manage Posts</p>
            <h2>Blog list</h2>
          </div>
        </div>

        <div className="admin-list">
          {blogs.map((blog) => (
            <article key={blog._id} className="admin-list-card admin-list-card--product">
              <img src={blog.image} alt={blog.title} className="admin-thumb" />
              <div>
                <strong>{blog.title}</strong>
                <p>
                  {blog.slug}
                </p>
                {blog.tags?.length ? <p>{blog.tags.join(", ")}</p> : null}
              </div>
              <div className="admin-inline-actions">
                <button type="button" className="ghost-button" onClick={() => handleEdit(blog)}>
                  Edit
                </button>
                <button type="button" className="admin-danger-button" onClick={() => handleDelete(blog._id)}>
                  Delete
                </button>
              </div>
            </article>
          ))}
          {!blogs.length ? <div className="admin-table__empty">No blog posts found.</div> : null}
        </div>
      </section>
    </div>
  );
}
