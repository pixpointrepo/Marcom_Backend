// routes/analytics.js
const express = require("express");
const { verifyAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();

const {
  recordPageView,
  getViewsPerArticle,
  getViewsOverTime,
  getViewsByCategory,
  getAnalyticsOverview,
  getArticleAnalytics,
  getTrends,
} = require("../controllers/analyticsController");

/**
 * @route POST /api/analytics/pageview
 * @desc Record a page view
 */
router.post("/pageview", recordPageView);


/**
 * @route GET /api/analytics/views-per-article
 * @desc Get the number of views per article
 */
router.get("/views-per-article", verifyAdmin, getViewsPerArticle);

/**
 * @route GET /api/analytics/views-over-time
 * @desc Get the number of total views over time
 */
router.get("/views-over-time",verifyAdmin, getViewsOverTime);

/**
 * @route GET /api/analytics/views-by-category
 * @desc Get the number of views by category
 */
router.get("/views-by-category",verifyAdmin, getViewsByCategory);

// Get analytics metrics

/**
 * @route GET /api/analytics/overview
 * @desc Get an overview of analytics
 */
router.get("/overview", verifyAdmin, getAnalyticsOverview);

/**
 * @route GET /api/analytics/article-analytics
 *  @desc Get analytics for a specific article
 */
router.get("/article-analytics", verifyAdmin, getArticleAnalytics);

/**
 * @route GET /api/analytics/trends
 * @desc Get analytics trends
 */
router.get("/trends", verifyAdmin, getTrends);


module.exports = router;
