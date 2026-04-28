import express from "express";
import { addToCart, clearCart, getCart, removeCartItem, updateCartItem } from "../controllers/cartController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);
router.get("/", getCart);
router.post("/", addToCart);
router.delete("/clear/all", clearCart);
router.patch("/:productId", updateCartItem);
router.delete("/:productId", removeCartItem);

export default router;
