// routes/analytics.js
const express = require("express");
const router = express.Router();

const {
  recordPageView,
  getTotalPageViews,
  getUniqueUsers,
  getViewsPerArticle,
  getViewsOverTime,
  getViewsByCategory,
} = require("../controllers/analyticsController");

/**
 * @route POST /api/analytics/pageview
 * @desc Record a page view
 */
router.post("/pageview", recordPageView);

/**
 * @route GET /api/analytics/total-views
 * @desc Get the total number of page views
 */
router.get("/total-views", getTotalPageViews);


/**
 * @route GET /api/analytics/unique-users
 * @desc Get the number of unique users
 */
router.get("/unique-users", getUniqueUsers);


/**
 * @route GET /api/analytics/views-per-article
 * @desc Get the number of views per article
 */
router.get("/views-per-article", getViewsPerArticle);

/**
 * @route GET /api/analytics/views-over-time
 * @desc Get the number of views over time
 */
router.get("/views-over-time", getViewsOverTime);

/**
 * @route GET /api/analytics/views-by-category
 * @desc Get the number of views by category
 */
router.get("/views-by-category", getViewsByCategory);



module.exports = router;
