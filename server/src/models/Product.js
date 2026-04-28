import mongoose from "mongoose";
import slugify from "slugify";

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true }
  },
  { timestamps: true }
);

const discountSchema = new mongoose.Schema(
  {
    percentage: { type: Number, min: 0, max: 100, default: 0 },
    startDate: Date,
    endDate: Date
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, required: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
    tags: [String],
    reviews: [reviewSchema],
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    discount: { type: discountSchema, default: () => ({ percentage: 0 }) }
  },
  { timestamps: true }
);

productSchema.pre("validate", function createSlug(next) {
  if (this.name) this.slug = slugify(this.name, { lower: true, strict: true });
  next();
});

productSchema.index({ name: "text", category: "text", description: "text" });

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true },
    image: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    tags: [String]
  },
  { timestamps: true }
);

blogSchema.pre("validate", function normalizeBlog(next) {
  if (this.title) this.slug = slugify(this.title, { lower: true, strict: true });
  next();
});

const gallerySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    image: { type: String, required: true, trim: true },
    altText: { type: String, default: "", trim: true },
    category: { type: String, default: "general", trim: true },
    sortOrder: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    percentage: { type: Number, required: true, min: 1, max: 100 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

couponSchema.pre("validate", function normalizeCoupon(next) {
  if (this.code) this.code = this.code.trim().toUpperCase();
  next();
});

export const Product = mongoose.model("Product", productSchema);
export const Blog = mongoose.model("Blog", blogSchema);
export const Gallery = mongoose.model("Gallery", gallerySchema);
export const Coupon = mongoose.model("Coupon", couponSchema);
