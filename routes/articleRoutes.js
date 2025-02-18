const express = require("express");
const multer = require("multer");
const path = require("path");

const {uploadArticle, getAllArticles, getArticleById, updateArticle, deleteArticle, getAllCategories} = require("../controllers/articleController");
const { verifyToken, verifyAdmin } = require("../middlewares/authMiddleware");

const router = express.Router();

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // Save images to 'uploads' folder
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    }
});

const upload = multer({ storage });

/**
 * @route POST /api/articles
 * @desc Add new article with image upload
 */
router.post("/", verifyAdmin, upload.single("thumbnail"), uploadArticle);

/**
 * @route   GET /api/articles/categories
 * @desc    Get all categories
 */
router.get("/categories", getAllCategories);


/**
 * @route   GET /api/articles
 * @desc    Get all articles
 */
router.get("/", getAllArticles);

/**
 * @route   GET /api/articles/:id
 * @desc    Get a single article by ID
 */
router.get("/:id", getArticleById);

/**
 * @route   PUT /api/articles/:id
 * @desc    Update an article (with optional image upload)
 */
router.put("/:id", verifyAdmin, upload.single("thumbnail"), updateArticle);

/**
 * @route   DELETE /api/articles/:id
 * @desc    Delete an article (including image deletion)
 */
router.delete("/:id", verifyAdmin, deleteArticle);



module.exports = router;
