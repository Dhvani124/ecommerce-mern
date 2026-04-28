import express from "express";
import {
  addCompare,
  addWishlist,
  getCompare,
  getWishlist,
  removeCompare,
  removeWishlist
} from "../controllers/userController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);
router.get("/wishlist", getWishlist);
router.post("/wishlist/:productId", addWishlist);
router.delete("/wishlist/:productId", removeWishlist);
router.get("/compare", getCompare);
router.post("/compare/:productId", addCompare);
router.delete("/compare/:productId", removeCompare);

export default router;
