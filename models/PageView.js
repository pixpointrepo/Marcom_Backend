const mongoose = require('mongoose');
// PageView Schema
const pageViewSchema = new mongoose.Schema({
  pageUrl: { type: String, required: true },
  userUuid: { type: String, required: true },
  articleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Article' }, // ObjectId with reference
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('PageView', pageViewSchema);