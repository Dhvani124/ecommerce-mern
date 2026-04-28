import express from "express";
import {
  addAddress,
  adminLogin,
  deleteAddress,
  login,
  me,
  register,
  updateAddress,
  updateProfile
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/admin/login", adminLogin);
router.get("/me", protect, me);
router.patch("/profile", protect, updateProfile);
router.post("/addresses", protect, addAddress);
router.patch("/addresses/:addressId", protect, updateAddress);
router.delete("/addresses/:addressId", protect, deleteAddress);

export default router;
