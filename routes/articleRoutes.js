const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Article = require("../models/Article");

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

// @route POST /api/articles
// @desc Add new article with image upload
router.post("/", upload.single("thumbnail"), async (req, res) => {
    try {
        const { title, summary, description, date, readTime, author, category, categoryUrl, tags, mainArticleUrl } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: "Image file is required" });
        }

        const newArticle = new Article({
            title,
            summary,
            description,
            date,
            readTime,
            author,
            thumbnail: `/uploads/${req.file.filename}`, // Save image path
            category,
            categoryUrl,
            tags: tags.split(","), // Convert tags to array
            mainArticleUrl,
        });

        await newArticle.save();
        res.status(201).json({ message: "Article added successfully", article: newArticle });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

/**
 * @route   GET /api/articles
 * @desc    Get all articles
 */
router.get("/", async (req, res) => {
    try {
        const articles = await Article.find().sort({ date: -1 }); // Sort by latest date
        res.status(200).json(articles);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

/**
 * @route   GET /api/articles/:id
 * @desc    Get a single article by ID
 */
router.get("/:id", async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);
        if (!article) {
            return res.status(404).json({ message: "Article not found" });
        }
        res.status(200).json(article);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

/**
 * @route   PUT /api/articles/:id
 * @desc    Update an article (with optional image upload)
 */
router.put("/:id", upload.single("thumbnail"), async (req, res) => {
    try {
        const { title, summary, description, date, readTime, author, category, categoryUrl, tags, mainArticleUrl } = req.body;

        let article = await Article.findById(req.params.id);
        if (!article) {
            return res.status(404).json({ message: "Article not found" });
        }

        // If a new image is uploaded, delete the old one
        if (req.file) {
            if (article.thumbnail) {
                const oldImagePath = path.join(__dirname, "..", article.thumbnail);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath); // Delete old image
                }
            }
            article.thumbnail = `/uploads/${req.file.filename}`;
        }

        // Update article fields
        article.title = title || article.title;
        article.summary = summary || article.summary;
        article.description = description || article.description;
        article.date = date || article.date;
        article.readTime = readTime || article.readTime;
        article.author = author || article.author;
        article.category = category || article.category;
        article.categoryUrl = categoryUrl || article.categoryUrl;
        article.tags = tags ? tags.split(",") : article.tags;
        article.mainArticleUrl = mainArticleUrl || article.mainArticleUrl;

        await article.save();
        res.status(200).json({ message: "Article updated successfully", article });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

/**
 * @route   DELETE /api/articles/:id
 * @desc    Delete an article (including image deletion)
 */
router.delete("/:id", async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);
        if (!article) {
            return res.status(404).json({ message: "Article not found" });
        }

        // Delete image from the server
        if (article.thumbnail) {
            const imagePath = path.join(__dirname, "..", article.thumbnail);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await article.deleteOne();
        res.status(200).json({ message: "Article deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});


module.exports = router;
