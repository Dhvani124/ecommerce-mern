import express from "express";
import {
  createBlog,
  createCategory,
  createCoupon,
  createGalleryItem,
  createProduct,
  deleteBlog,
  deleteCategory,
  deleteCoupon,
  deleteGalleryItem,
  deleteProduct,
  deleteUser,
  getBlogs,
  getAdminProducts,
  getCategories,
  getCoupons,
  getDashboardSummary,
  getGalleryItems,
  getOrders,
  getUsers,
  updateBlog,
  updateCategory,
  updateCoupon,
  updateGalleryItem,
  updateProduct,
  updateUserRole
} from "../controllers/adminController.js";
import { authorize, protect } from "../middleware/auth.js";

const router = express.Router();

// All admin routes require authentication and admin/staff role
router.use(protect, authorize("admin", "staff"));

// Dashboard - accessible by admin and staff
router.get("/dashboard", getDashboardSummary);

// Categories - admin and staff can manage
router.get("/categories", getCategories);
router.post("/categories", authorize("admin", "staff"), createCategory);
router.put("/categories/:id", authorize("admin", "staff"), updateCategory);
router.delete("/categories/:id", authorize("admin"), deleteCategory);

// Products - staff can view/create/update, only admin can delete
router.get("/products", getAdminProducts);
router.post("/products", authorize("admin", "staff"), createProduct);
router.put("/products/:id", authorize("admin", "staff"), updateProduct);
router.delete("/products/:id", authorize("admin"), deleteProduct);

// Blogs - staff can manage
router.get("/blogs", getBlogs);
router.post("/blogs", authorize("admin", "staff"), createBlog);
router.put("/blogs/:id", authorize("admin", "staff"), updateBlog);
router.delete("/blogs/:id", authorize("admin"), deleteBlog);

// Gallery - staff can manage
router.get("/gallery", getGalleryItems);
router.post("/gallery", authorize("admin", "staff"), createGalleryItem);
router.put("/gallery/:id", authorize("admin", "staff"), updateGalleryItem);
router.delete("/gallery/:id", authorize("admin"), deleteGalleryItem);

// Coupons - staff can manage
router.get("/coupons", getCoupons);
router.post("/coupons", authorize("admin", "staff"), createCoupon);
router.put("/coupons/:id", authorize("admin", "staff"), updateCoupon);
router.delete("/coupons/:id", authorize("admin"), deleteCoupon);

// Orders - both admin and staff can view/manage
router.get("/orders", getOrders);

// Users - only admin can manage
router.get("/users", authorize("admin"), getUsers);
router.patch("/users/:id/role", authorize("admin"), updateUserRole);
router.delete("/users/:id", authorize("admin"), deleteUser);

export default router;
