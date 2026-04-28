import { Category } from "../models/Category.js";
import { Order } from "../models/Order.js";
import { Blog, Coupon, Gallery, Product } from "../models/Product.js";
import { User } from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const ensureCategoryExists = async (name) => {
  const category = await Category.findOne({ name: name?.trim() });
  if (!category) throw new AppError("Category not found", 404);
  return category;
};

const parseDate = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const normalizeDiscount = (body) => {
  const percentage = Number(body.discountPercentage ?? body.discount?.percentage ?? 0);
  const startDate = parseDate(body.discountStartDate ?? body.discount?.startDate);
  const endDate = parseDate(body.discountEndDate ?? body.discount?.endDate);

  if (!percentage) return { percentage: 0, startDate: null, endDate: null };
  return { percentage, startDate, endDate };
};

const validateDiscount = (discount) => {
  if (discount.percentage < 0 || discount.percentage > 100) {
    throw new AppError("Discount percentage must be between 0 and 100", 400);
  }

  if (discount.percentage > 0 && (!discount.startDate || !discount.endDate)) {
    throw new AppError("Discount start and end dates are required", 400);
  }

  if (discount.startDate && discount.endDate && discount.startDate > discount.endDate) {
    throw new AppError("Discount end date must be after start date", 400);
  }
};

const normalizeProductPayload = (body) => ({
  name: body.name?.trim(),
  description: body.description?.trim(),
  category: body.category?.trim(),
  image: body.image?.trim(),
  price: Number(body.price),
  stock: Number(body.stock),
  tags: Array.isArray(body.tags)
    ? body.tags
    : String(body.tags || "")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
  isFeatured: Boolean(body.isFeatured),
  discount: normalizeDiscount(body)
});

const normalizeBlogPayload = (body) => ({
  title: body.title?.trim(),
  image: body.image?.trim(),
  description: body.description?.trim(),
  tags: Array.isArray(body.tags)
    ? body.tags
    : String(body.tags || "")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
});

const normalizeGalleryPayload = (body) => ({
  title: body.title?.trim(),
  image: body.image?.trim(),
  altText: body.altText?.trim() || "",
  category: body.category?.trim() || "general",
  sortOrder: Number(body.sortOrder || 0),
  isFeatured: Boolean(body.isFeatured)
});

const normalizeCouponPayload = (body) => ({
  code: body.code?.trim().toUpperCase(),
  percentage: Number(body.percentage),
  startDate: parseDate(body.startDate),
  endDate: parseDate(body.endDate),
  isActive: body.isActive !== false && body.isActive !== "false"
});

const validateCoupon = (coupon) => {
  if (!coupon.code) throw new AppError("Coupon code is required", 400);
  if (Number.isNaN(coupon.percentage) || coupon.percentage < 1 || coupon.percentage > 100) {
    throw new AppError("Coupon percentage must be between 1 and 100", 400);
  }
  if (!coupon.startDate || !coupon.endDate) {
    throw new AppError("Coupon start and end dates are required", 400);
  }
  if (coupon.startDate > coupon.endDate) {
    throw new AppError("Coupon end date must be after start date", 400);
  }
};

export const getDashboardSummary = asyncHandler(async (req, res) => {
  const [totalUsers, totalOrders, revenueResult, recentOrders] = await Promise.all([
    User.countDocuments(),
    Order.countDocuments(),
    Order.aggregate([{ $group: { _id: null, totalRevenue: { $sum: "$total" } } }]),
    Order.find()
      .sort("-createdAt")
      .limit(5)
      .populate("user", "name email")
      .select("total status paymentStatus createdAt user")
  ]);

  res.json({
    summary: {
      usersCount: totalUsers,
      ordersCount: totalOrders,
      totalSales: revenueResult[0]?.totalRevenue || 0
    },
    recentOrders,
    currentUser: {
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    }
  });
});

export const getCategories = asyncHandler(async (_req, res) => {
  const categories = await Category.find().sort("name");
  res.json({ categories });
});

export const createCategory = asyncHandler(async (req, res, next) => {
  const name = req.body.name?.trim();
  if (!name) return next(new AppError("Category name is required", 400));
  if (await Category.findOne({ name })) return next(new AppError("Category already exists", 409));

  const category = await Category.create({ name });
  res.status(201).json({ category });
});

export const updateCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) return next(new AppError("Category not found", 404));

  const nextName = req.body.name?.trim();
  if (!nextName) return next(new AppError("Category name is required", 400));

  const duplicate = await Category.findOne({ name: nextName, _id: { $ne: category._id } });
  if (duplicate) return next(new AppError("Category already exists", 409));

  const previousName = category.name;
  category.name = nextName;
  await category.save();

  if (previousName !== nextName) {
    await Product.updateMany({ category: previousName }, { $set: { category: nextName } });
  }

  res.json({ category });
});

export const deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) return next(new AppError("Category not found", 404));

  const linkedProducts = await Product.countDocuments({ category: category.name });
  if (linkedProducts > 0) {
    return next(new AppError("Delete products in this category first", 400));
  }

  await category.deleteOne();
  res.json({ message: "Category deleted" });
});

export const getAdminProducts = asyncHandler(async (_req, res) => {
  const products = await Product.find().sort("-createdAt");
  res.json({ products });
});

export const createProduct = asyncHandler(async (req, res, next) => {
  const payload = normalizeProductPayload(req.body);

  if (!payload.name || !payload.description || !payload.category || !payload.image) {
    return next(new AppError("Name, description, category and image are required", 400));
  }

  if (Number.isNaN(payload.price) || Number.isNaN(payload.stock)) {
    return next(new AppError("Price and stock must be valid numbers", 400));
  }

  try {
    validateDiscount(payload.discount);
    await ensureCategoryExists(payload.category);
  } catch (error) {
    return next(error);
  }

  const product = await Product.create(payload);
  res.status(201).json({ product });
});

export const updateProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) return next(new AppError("Product not found", 404));

  const payload = normalizeProductPayload(req.body);
  if (!payload.name || !payload.description || !payload.category || !payload.image) {
    return next(new AppError("Name, description, category and image are required", 400));
  }

  if (Number.isNaN(payload.price) || Number.isNaN(payload.stock)) {
    return next(new AppError("Price and stock must be valid numbers", 400));
  }

  try {
    validateDiscount(payload.discount);
    await ensureCategoryExists(payload.category);
  } catch (error) {
    return next(error);
  }

  Object.assign(product, payload);
  await product.save();
  res.json({ product });
});

export const deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) return next(new AppError("Product not found", 404));

  await product.deleteOne();
  res.json({ message: "Product deleted" });
});

export const getBlogs = asyncHandler(async (_req, res) => {
  const blogs = await Blog.find().sort("-createdAt");
  res.json({ blogs });
});

export const createBlog = asyncHandler(async (req, res, next) => {
  const payload = normalizeBlogPayload(req.body);

  if (!payload.title || !payload.image || !payload.description) {
    return next(new AppError("Title, image and description are required", 400));
  }

  const blog = await Blog.create(payload);
  res.status(201).json({ blog });
});

export const updateBlog = asyncHandler(async (req, res, next) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) return next(new AppError("Blog not found", 404));

  const payload = normalizeBlogPayload(req.body);
  if (!payload.title || !payload.image || !payload.description) {
    return next(new AppError("Title, image and description are required", 400));
  }

  Object.assign(blog, payload);
  await blog.save();
  res.json({ blog });
});

export const deleteBlog = asyncHandler(async (req, res, next) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) return next(new AppError("Blog not found", 404));

  await blog.deleteOne();
  res.json({ message: "Blog deleted" });
});

export const getGalleryItems = asyncHandler(async (_req, res) => {
  const galleryItems = await Gallery.find().sort({ sortOrder: 1, createdAt: -1 });
  res.json({ galleryItems });
});

export const createGalleryItem = asyncHandler(async (req, res, next) => {
  const payload = normalizeGalleryPayload(req.body);

  if (!payload.title || !payload.image) {
    return next(new AppError("Title and image are required", 400));
  }

  const galleryItem = await Gallery.create(payload);
  res.status(201).json({ galleryItem });
});

export const updateGalleryItem = asyncHandler(async (req, res, next) => {
  const galleryItem = await Gallery.findById(req.params.id);
  if (!galleryItem) return next(new AppError("Gallery item not found", 404));

  const payload = normalizeGalleryPayload(req.body);
  if (!payload.title || !payload.image) {
    return next(new AppError("Title and image are required", 400));
  }

  Object.assign(galleryItem, payload);
  await galleryItem.save();
  res.json({ galleryItem });
});

export const deleteGalleryItem = asyncHandler(async (req, res, next) => {
  const galleryItem = await Gallery.findById(req.params.id);
  if (!galleryItem) return next(new AppError("Gallery item not found", 404));

  await galleryItem.deleteOne();
  res.json({ message: "Gallery item deleted" });
});

export const getCoupons = asyncHandler(async (_req, res) => {
  const coupons = await Coupon.find().sort("-createdAt");
  res.json({ coupons });
});

export const createCoupon = asyncHandler(async (req, res, next) => {
  const payload = normalizeCouponPayload(req.body);

  try {
    validateCoupon(payload);
  } catch (error) {
    return next(error);
  }

  if (await Coupon.findOne({ code: payload.code })) {
    return next(new AppError("Coupon already exists", 409));
  }

  const coupon = await Coupon.create(payload);
  res.status(201).json({ coupon });
});

export const updateCoupon = asyncHandler(async (req, res, next) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) return next(new AppError("Coupon not found", 404));

  const payload = normalizeCouponPayload(req.body);

  try {
    validateCoupon(payload);
  } catch (error) {
    return next(error);
  }

  const duplicate = await Coupon.findOne({ code: payload.code, _id: { $ne: coupon._id } });
  if (duplicate) return next(new AppError("Coupon already exists", 409));

  Object.assign(coupon, payload);
  await coupon.save();
  res.json({ coupon });
});

export const deleteCoupon = asyncHandler(async (req, res, next) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) return next(new AppError("Coupon not found", 404));

  await coupon.deleteOne();
  res.json({ message: "Coupon deleted" });
});

export const getUsers = asyncHandler(async (_req, res) => {
  const users = await User.find().sort("-createdAt").select("name email role phone createdAt");
  res.json({ users });
});

export const updateUserRole = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new AppError("User not found", 404));

  if (req.user._id.toString() === user._id.toString()) {
    return next(new AppError("You cannot change your own role", 400));
  }

  const role = req.body.role;
  if (!["admin", "staff", "user"].includes(role)) {
    return next(new AppError("Invalid role", 400));
  }

  user.role = role;
  await user.save();
  res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone } });
});

export const deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new AppError("User not found", 404));

  if (req.user._id.toString() === user._id.toString()) {
    return next(new AppError("You cannot delete your own account", 400));
  }

  await user.deleteOne();
  res.json({ message: "User deleted" });
});

export const getOrders = asyncHandler(async (_req, res) => {
  const orders = await Order.find()
    .sort("-createdAt")
    .populate("user", "name email")
    .select("user items total status paymentStatus paymentMethod createdAt");

  res.json({ orders });
});
