const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema({
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
});

module.exports = mongoose.model("Article", articleSchema);
