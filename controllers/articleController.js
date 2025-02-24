const path = require("path");
const fs = require("fs");

const Article = require("../models/Article");
const generateUrl = require("../utils/urlGenerator");

const uploadArticle = async (req, res) => {
  try {
    const {
      title,
      summary,
      description,
      date,
      readTime,
      author,
      category,
      tags,
      mainArticleUrl,
      isFeatured
    } = req.body;

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
      categoryUrl: generateUrl(category), 
      tags: tags.split(","), // Convert tags to array
      mainArticleUrl,
      isFeatured
    });

    await newArticle.save();
    res
      .status(201)
      .json({ message: "Article added successfully", article: newArticle });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Server Error : ${error.message}` });
  }
};

const getAllArticles = async (req, res) => {
  try {
    
    let { page = 1, limit = 10, isFeatured, category, tags, date, search } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    const filter = {};

    // 🔹 Filter by Category
    if (category) {
        filter.categoryUrl = category.toLowerCase().split(" ").join("-");
    }

    // 🔹 Filter by Tags (comma-separated)
    if (tags) {
        const tagsArray = tags.split(",").map(tag => tag.trim());
        filter.tags = { $in: tagsArray };
    }
    // console.log("Received date string:", date);  


     // 🔹 Filter by Date (Exact Match or Range)
     if (date) {
      const startDate = new Date(date + "T00:00:00.000Z"); // Start of the day in UTC
      const endDate = new Date(date + "T23:59:59.999Z");
      filter.date = { $gte: startDate, $lte: endDate };
      }

    // 🔹 Search by Title, Summary, or Description
    if (search) {
      filter.$or = [
          { title: { $regex: search, $options: "i" } },  // Case-insensitive search
          { summary: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } }
      ];
    }

    // 🔹 Filter by isFeatured (Only Return Featured Articles If True)
    if (isFeatured === "true") {
      filter.isFeatured = true;
    }else if(isFeatured === "false"){
      filter.isFeatured = false;
    }

    // 🔹 Get total count for pagination
    const totalArticles = await Article.countDocuments(filter);

    // 🔹 Fetch articles
    const articles = await Article.find(filter)
        .sort({ date: -1 }) // Newest first
        .skip((page - 1) * limit)
        .limit(limit);

    res.status(200).json({
        totalArticles,
        totalPages: Math.ceil(totalArticles / limit),
        currentPage: page,
        articles
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const getArticleById = async (req, res) => {
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
};

const updateArticle = async (req, res) => {
  try {
    const {
      title,
      summary,
      description,
      date,
      readTime,
      author,
      category,
      tags,
      mainArticleUrl,
      isFeatured
    } = req.body;

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
    article.categoryUrl =  generateUrl(category) || article.categoryUrl;
    article.tags = tags ? tags.split(",") : article.tags;
    article.mainArticleUrl = mainArticleUrl || article.mainArticleUrl;
    article.isFeatured = isFeatured || article.isFeatured;

    await article.save();
    res.status(200).json({ message: "Article updated successfully", article });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const deleteArticle = async (req, res) => {
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
};


const getAllCategories =  async (req, res) => {
   try {
       const categories = await Article.find().select("category categoryUrl");

       // Extract unique categories
       const uniqueCategories = [];
       const categorySet = new Set();

       categories.forEach(({ category, categoryUrl }) => {
           if (!categorySet.has(category)) {
               uniqueCategories.push({ category, categoryUrl });
               categorySet.add(category);
           }
       });

       res.status(200).json(uniqueCategories);
   } catch (error) {
       console.error(error);
       res.status(500).json({ message: "Server Error" });
   }
};

const getAllTags = async (req, res) => {
  try {
      const tags = await Article.distinct("tags");
      res.status(200).json(tags);
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  uploadArticle,
  getAllArticles,
  getArticleById,
  updateArticle,
  deleteArticle,
  getAllCategories,
  getAllTags
};
