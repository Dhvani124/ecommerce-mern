import express from "express";
import { addReview, getProduct, getProducts } from "../controllers/productController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/:id", getProduct);
router.post("/:id/reviews", protect, addReview);

export default router;
