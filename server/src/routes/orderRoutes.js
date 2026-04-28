import express from "express";
import { getMyOrders, getOrderById } from "../controllers/orderController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);
router.get("/mine", getMyOrders);
router.get("/:id", getOrderById);

export default router;
