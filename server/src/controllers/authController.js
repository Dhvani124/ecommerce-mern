import { User } from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendToken } from "../utils/jwt.js";

export const register = asyncHandler(async (req, res, next) => {
  const name = req.body.name?.trim();
  const email = req.body.email?.trim().toLowerCase();
  const password = req.body.password;

  if (!name || !email || !password) {
    return next(new AppError("Name, email and password are required", 400));
  }

  if (password.length < 8) {
    return next(new AppError("Password must be at least 8 characters", 400));
  }

  if (await User.findOne({ email })) return next(new AppError("Email is already registered", 409));
  const user = await User.create({ name, email, password });
  sendToken(res, user, 201);
});

export const login = asyncHandler(async (req, res, next) => {
  const email = req.body.email?.trim().toLowerCase();
  const password = req.body.password;

  if (!email || !password) {
    return next(new AppError("Email and password are required", 400));
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError("Invalid email or password", 401));
  }
  sendToken(res, user);
});

export const adminLogin = asyncHandler(async (req, res, next) => {
  const email = req.body.email?.trim().toLowerCase();
  const password = req.body.password;

  if (!email || !password) {
    return next(new AppError("Email and password are required", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError("Invalid email or password", 401));
  }

  if (!["admin", "staff"].includes(user.role)) {
    return next(new AppError("Admin access only", 403));
  }

  sendToken(res, user);
});

export const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate("wishlist compare");
  res.json({ user });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;
  req.user.name = name ?? req.user.name;
  req.user.phone = phone ?? req.user.phone;
  await req.user.save();
  res.json({ user: req.user });
});

export const addAddress = asyncHandler(async (req, res) => {
  if (req.body.isDefault) req.user.addresses.forEach((address) => (address.isDefault = false));
  req.user.addresses.push(req.body);
  await req.user.save();
  res.status(201).json({ addresses: req.user.addresses });
});

export const updateAddress = asyncHandler(async (req, res, next) => {
  const address = req.user.addresses.id(req.params.addressId);
  if (!address) return next(new AppError("Address not found", 404));
  if (req.body.isDefault) req.user.addresses.forEach((item) => (item.isDefault = false));
  Object.assign(address, req.body);
  await req.user.save();
  res.json({ addresses: req.user.addresses });
});

export const deleteAddress = asyncHandler(async (req, res, next) => {
  const address = req.user.addresses.id(req.params.addressId);
  if (!address) return next(new AppError("Address not found", 404));
  address.deleteOne();
  await req.user.save();
  res.json({ addresses: req.user.addresses });
});
