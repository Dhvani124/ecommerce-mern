import { Product } from "../models/Product.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getProducts = asyncHandler(async (req, res) => {
  const { 
    search, category, featured, 
    minPrice, maxPrice, minRating,
    page = 1, limit = 12, sort = "-createdAt"
  } = req.query;

  const query = {};
  if (search) query.$text = { $search: search };
  if (category) query.category = category;
  if (featured) query.isFeatured = featured === "true";
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }
  if (minRating) query.rating = { $gte: Number(minRating) };

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    Product.find(query).sort(sort).skip(skip).limit(limitNum),
    Product.countDocuments(query)
  ]);

  const result = {
    products,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    }
  };

  res.json(result);
});

export const getProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) return next(new AppError("Product not found", 404));
  res.json({ product });
});

export const addReview = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) return next(new AppError("Product not found", 404));

  if (product.reviews.some((review) => review.user.toString() === req.user._id.toString())) {
    return next(new AppError("You already reviewed this product", 409));
  }

  product.reviews.push({
    user: req.user._id,
    name: req.user.name,
    rating: Number(req.body.rating),
    comment: req.body.comment
  });
  product.numReviews = product.reviews.length;
  product.rating = product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.numReviews;
  await product.save();
  res.status(201).json({ product });
});
