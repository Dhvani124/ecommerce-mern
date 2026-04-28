import { Blog, Gallery } from "../models/Product.js";
import { Category } from "../models/Category.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";

export const getBlogs = asyncHandler(async (_req, res) => {
  const blogs = await Blog.find().sort("-createdAt");
  res.json({ blogs });
});

export const getBlogBySlug = asyncHandler(async (req, res, next) => {
  const blog = await Blog.findOne({ slug: req.params.slug });
  if (!blog) return next(new AppError("Blog not found", 404));
  res.json({ blog });
});

export const getGalleryItems = asyncHandler(async (req, res) => {
  const query = req.query.category ? { category: req.query.category } : {};
  const galleryItems = await Gallery.find(query).sort({ sortOrder: 1, createdAt: -1 });
  const categories = await Gallery.distinct("category");

  res.json({
    galleryItems,
    categories: categories.filter(Boolean).sort()
  });
});

export const getCategories = asyncHandler(async (_req, res) => {
  const categories = await Category.find().sort("name").select("name slug");
  res.json({ categories });
});
