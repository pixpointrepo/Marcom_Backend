// routes/analytics.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// PageView Schema
const pageViewSchema = new mongoose.Schema({
  pageUrl: { type: String, required: true },
  userUuid: { type: String, required: true },
  articleId: { type: String }, // Optional
  timestamp: { type: Date, default: Date.now },
});

const PageView = mongoose.model('PageView', pageViewSchema);

// POST /api/analytics/pageview
router.post('/pageview', async (req, res) => {
  const { pageUrl, userUuid, articleId } = req.body;

  if (!pageUrl || !userUuid) {
    return res.status(400).json({ message: 'pageUrl and userUuid are required' });
  }

  try {
    const pageView = new PageView({ pageUrl, userUuid, articleId });
    await pageView.save();
    res.status(201).json({ message: 'Page view recorded' });
  } catch (error) {
    console.error('Error saving page view:', error);
    res.status(500).json({ message: 'Failed to record page view', error: error.message });
  }
});

module.exports = router;