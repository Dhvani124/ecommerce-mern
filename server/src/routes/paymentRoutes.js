import express from "express";
import {
  capturePaypalPayment,
  createPaypalOrder,
  createRazorpayOrder,
  verifyRazorpayPayment
} from "../controllers/paymentController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);
router.post("/razorpay/order", createRazorpayOrder);
router.post("/razorpay/verify", verifyRazorpayPayment);
router.post("/paypal/order", createPaypalOrder);
router.post("/paypal/capture", capturePaypalPayment);

export default router;
