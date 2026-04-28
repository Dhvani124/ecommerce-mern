import { Order } from "../models/Order.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort("-createdAt");
  res.json({ orders });
});

export const getOrderById = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate("user", "name email");
  if (!order) return next(new AppError("Order not found", 404));

  const isOwner = order.user._id.toString() === req.user._id.toString();
  const canManage = ["admin", "staff"].includes(req.user.role);

  if (!isOwner && !canManage) {
    return next(new AppError("You do not have permission to access this order", 403));
  }

  res.json({ order });
});
