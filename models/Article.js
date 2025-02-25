const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema({
    url: { type: String, required: false },
    title: { type: String, required: true },
    summary: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    readTime: { type: String, required: true },
    author: { type: String, required: true },
    thumbnail: { type: String, required: true },
    category: { type: String, required: true },
    categoryUrl: { type: String, required: true },
    tags: { type: [String], required: true },
    mainArticleUrl: { type: String, required: true },
    isFeatured: { type: Boolean, required: true, default: false },
});

module.exports = mongoose.model("Article", articleSchema);
