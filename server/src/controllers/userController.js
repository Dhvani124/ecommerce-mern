import { Product } from "../models/Product.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleProductList = async (req, res, next, field, maxItems = Infinity) => {
  const product = await Product.findById(req.params.productId);
  if (!product) return next(new AppError("Product not found", 404));

  const exists = req.user[field].some((id) => id.toString() === product._id.toString());
  if (req.method === "DELETE") {
    req.user[field] = req.user[field].filter((id) => id.toString() !== product._id.toString());
  } else if (!exists) {
    if (req.user[field].length >= maxItems) return next(new AppError(`Compare allows up to ${maxItems} products`, 400));
    req.user[field].push(product._id);
  }

  await req.user.save();
  const populated = await req.user.populate(field);
  res.json({ [field]: populated[field] });
};

export const getWishlist = asyncHandler(async (req, res) => {
  const user = await req.user.populate("wishlist");
  res.json({ wishlist: user.wishlist });
});

export const addWishlist = asyncHandler((req, res, next) => toggleProductList(req, res, next, "wishlist"));
export const removeWishlist = asyncHandler((req, res, next) => toggleProductList(req, res, next, "wishlist"));

export const getCompare = asyncHandler(async (req, res) => {
  const user = await req.user.populate("compare");
  res.json({ compare: user.compare });
});

export const addCompare = asyncHandler((req, res, next) => toggleProductList(req, res, next, "compare", 4));
export const removeCompare = asyncHandler((req, res, next) => toggleProductList(req, res, next, "compare"));

