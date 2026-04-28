import express from "express";
import { getBlogBySlug, getBlogs, getCategories, getGalleryItems } from "../controllers/contentController.js";

const router = express.Router();

router.get("/blogs", getBlogs);
router.get("/blogs/:slug", getBlogBySlug);
router.get("/categories", getCategories);
router.get("/gallery", getGalleryItems);

export default router;
