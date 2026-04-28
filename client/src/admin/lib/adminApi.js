import { api } from "../../lib/api.js";

const withToken = (token, options = {}) => ({
  ...options,
  headers: {
    Authorization: `Bearer ${token}`,
    ...(options.headers || {})
  }
});

export const adminApi = {
  getDashboard: (token) => api.get("/admin/dashboard", withToken(token)),
  getCategories: (token) => api.get("/admin/categories", withToken(token)),
  createCategory: (token, payload) => api.post("/admin/categories", payload, withToken(token)),
  updateCategory: (token, id, payload) => api.put(`/admin/categories/${id}`, payload, withToken(token)),
  deleteCategory: (token, id) => api.delete(`/admin/categories/${id}`, withToken(token)),
  getProducts: (token) => api.get("/admin/products", withToken(token)),
  createProduct: (token, payload) => api.post("/admin/products", payload, withToken(token)),
  updateProduct: (token, id, payload) => api.put(`/admin/products/${id}`, payload, withToken(token)),
  deleteProduct: (token, id) => api.delete(`/admin/products/${id}`, withToken(token)),
  getBlogs: (token) => api.get("/admin/blogs", withToken(token)),
  createBlog: (token, payload) => api.post("/admin/blogs", payload, withToken(token)),
  updateBlog: (token, id, payload) => api.put(`/admin/blogs/${id}`, payload, withToken(token)),
  deleteBlog: (token, id) => api.delete(`/admin/blogs/${id}`, withToken(token)),
  getGallery: (token) => api.get("/admin/gallery", withToken(token)),
  createGallery: (token, payload) => api.post("/admin/gallery", payload, withToken(token)),
  updateGallery: (token, id, payload) => api.put(`/admin/gallery/${id}`, payload, withToken(token)),
  deleteGallery: (token, id) => api.delete(`/admin/gallery/${id}`, withToken(token)),
  getCoupons: (token) => api.get("/admin/coupons", withToken(token)),
  createCoupon: (token, payload) => api.post("/admin/coupons", payload, withToken(token)),
  updateCoupon: (token, id, payload) => api.put(`/admin/coupons/${id}`, payload, withToken(token)),
  deleteCoupon: (token, id) => api.delete(`/admin/coupons/${id}`, withToken(token)),
  getUsers: (token) => api.get("/admin/users", withToken(token)),
  updateUserRole: (token, id, payload) => api.patch(`/admin/users/${id}/role`, payload, withToken(token)),
  deleteUser: (token, id) => api.delete(`/admin/users/${id}`, withToken(token)),
  getOrders: (token) => api.get("/admin/orders", withToken(token))
};
