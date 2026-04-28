import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const protect = asyncHandler(async (req, _res, next) => {
  const token = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.split(" ")[1]
    : null;

  if (!token) return next(new AppError("Authentication required", 401));

  const decoded = jwt.verify(token, env.JWT_SECRET);
  const user = await User.findById(decoded.id);
  if (!user) return next(new AppError("User no longer exists", 401));

  req.user = user;
  next();
});

export const authorize = (...roles) => (req, _res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new AppError("You do not have permission to access this resource", 403));
  }

  next();
};
