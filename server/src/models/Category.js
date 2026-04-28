import mongoose from "mongoose";
import slugify from "slugify";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, unique: true, lowercase: true }
  },
  { timestamps: true }
);

categorySchema.pre("validate", function createSlug(next) {
  if (this.name) this.slug = slugify(this.name, { lower: true, strict: true });
  next();
});

export const Category = mongoose.model("Category", categorySchema);
