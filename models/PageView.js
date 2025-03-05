// models/PageView.js
const mongoose = require('mongoose');

const pageViewSchema = new mongoose.Schema({
  pageUrl: { type: String, required: true },
  userUuid: { type: String, required: true },
  articleId: { type: String }, // Optional: Track the article
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('PageView', pageViewSchema);