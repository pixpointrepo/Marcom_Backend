const PageView = require("../models/PageView");
const Article = require("../models/Article");
const buildDateFilter = require("../utils/buildDateFilter");

// POST /api/analytics/pageview
const recordPageView = async (req, res) => {
  const { pageUrl, userUuid, articleId } = req.body;

  if (!pageUrl || !userUuid) {
    return res
      .status(400)
      .json({ message: "pageUrl and userUuid are required" });
  }

  try {
    const pageView = new PageView({ pageUrl, userUuid, articleId });
    await pageView.save();
    res.status(201).json({ message: "Page view recorded" });
  } catch (error) {
    console.error("Error saving page view:", error);
    res
      .status(500)
      .json({ message: "Failed to record page view", error: error.message });
  }
};

// Get Views Per Page
// Updated: Get Views Per Article with Date Filter
const getViewsPerArticle = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dateFilter = buildDateFilter(startDate, endDate);

    const viewsPerArticle = await PageView.aggregate([
      {
        $match: dateFilter ? { timestamp: dateFilter } : {}, // Filter by date range
      },
      {
        $group: {
          _id: '$articleId', // Now an ObjectId
          views: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'articles',
          localField: '_id', // ObjectId from PageView
          foreignField: '_id', // ObjectId from Article
          as: 'articleDetails',
        },
      },
      {
        $unwind: {
          path: '$articleDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $sort: { views: -1 },
      },
      {
        $limit: 10,
      },
      {
        $project: {
          articleId: '$_id',
          views: 1,
          category: '$articleDetails.category',
          title: '$articleDetails.title',
          thumbnail: '$articleDetails.thumbnail',
          summary: '$articleDetails.summary',
          date: '$articleDetails.date',
          readTime: '$articleDetails.readTime',
          author: '$articleDetails.author',
        },
      },
    ]);

    if (viewsPerArticle.length === 0) {
      console.log('No page view records found or no matches with articles');
    }

    res.status(200).json(viewsPerArticle);
  } catch (error) {
    console.error('Error fetching views per article:', error);
    res.status(500).json({
      message: 'Failed to fetch views per article',
      error: error.message,
    });
  }
};

const getViewsOverTime = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dateFilter = buildDateFilter(startDate, endDate);

    const viewsOverTime = await PageView.aggregate([
      {
        $match: dateFilter ? { timestamp: dateFilter } : {}, // Apply date filter if provided
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } }, // Sort by date ascending
    ]);

    res.status(200).json(
      viewsOverTime.map((item) => ({ date: item._id, views: item.count }))
    );
  } catch (error) {
    console.error("Error fetching views over time:", error);
    res.status(500).json({
      message: "Failed to fetch views over time",
      error: error.message,
    });
  }
};


// Get Views By Category
const getViewsByCategory = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dateFilter = buildDateFilter(startDate, endDate);

    const viewsByCategory = await PageView.aggregate([
      {
        $match: dateFilter ? { timestamp: dateFilter } : {}, // Filter by date range
      },
      {
        $lookup: {
          from: 'articles',
          localField: 'articleId',
          foreignField: '_id',
          as: 'articleDetails',
        },
      },
      {
        $unwind: {
          path: '$articleDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: { 'articleDetails.category': { $exists: true, $ne: null } },
      },
      {
        $group: {
          _id: '$articleDetails.category',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    res.status(200).json(
      viewsByCategory.map(item => ({
        category: item._id,
        views: item.count,
      }))
    );
  } catch (error) {
    console.error('Error fetching views by category:', error);
    res.status(500).json({
      message: 'Failed to fetch views by category',
      error: error.message,
    });
  }
};
// GET /api/analytics/overview
const getAnalyticsOverview = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dateFilter = buildDateFilter(startDate, endDate);

    const [totalViews, uniqueUsersResult, articlesViewed] = await Promise.all([
      PageView.countDocuments(dateFilter ? { timestamp: dateFilter } : {}),
      PageView.distinct(
        "userUuid",
        dateFilter ? { timestamp: dateFilter } : {}
      ),
      PageView.distinct(
        "articleId",
        dateFilter ? { timestamp: dateFilter } : {}
      ),
    ]);

    const uniqueUsers = uniqueUsersResult.length;
    const avgViewsPerUser =
      uniqueUsers > 0 ? (totalViews / uniqueUsers).toFixed(2) : 0;

    res.status(200).json({
      totalViews,
      uniqueUsers,
      avgViewsPerUser,
      articlesViewed: articlesViewed.length,
    });
  } catch (error) {
    console.error("Error fetching analytics overview:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch overview", error: error.message });
  }
};

// GET /api/analytics/article-analytics
const getArticleAnalytics = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      category,
      limit = 10,
      sortBy = "views",
      sortOrder = "desc",
    } = req.query;
    const dateFilter = buildDateFilter(startDate, endDate);

    const matchStage = dateFilter ? { timestamp: dateFilter } : {};
    if (category) matchStage["articleDetails.category"] = category;

    const articles = await PageView.aggregate([
      { $match: dateFilter ? { timestamp: dateFilter } : {} },
      {
        $group: {
          _id: "$articleId",
          views: { $sum: 1 },
          uniqueUsers: { $addToSet: "$userUuid" }, // Array of unique userUuids
        },
      },
      {
        $lookup: {
          from: "articles",
          localField: "_id",
          foreignField: "_id",
          as: "articleDetails",
        },
      },
      {
        $unwind: "$articleDetails",
      },
      { $match: category ? { "articleDetails.category": category } : {} },
      {
        $project: {
          articleId: "$_id",
          views: 1,
          uniqueUsers: { $size: "$uniqueUsers" }, // Count unique users
          avgViewsPerUser: { $divide: ["$views", { $size: "$uniqueUsers" }] },
          title: "$articleDetails.title",
          thumbnail: "$articleDetails.thumbnail",
          category: "$articleDetails.category",
        },
      },
      { $sort: { [sortBy]: sortOrder === "desc" ? -1 : 1 } },
      { $limit: parseInt(limit) },
    ]);

    res.status(200).json(articles);
  } catch (error) {
    console.error("Error fetching article analytics:", error);
    res
      .status(500)
      .json({
        message: "Failed to fetch article analytics",
        error: error.message,
      });
  }
};

// GET /api/analytics/trends
const getTrends = async (req, res) => {
  try {
    const { startDate, endDate, granularity = "day", category } = req.query;
    const dateFilter = buildDateFilter(startDate, endDate);

    const formatMap = {
      hour: "%Y-%m-%dT%H",
      day: "%Y-%m-%d",
      week: "%Y-%U",
      month: "%Y-%m",
    };
    const dateFormat = formatMap[granularity] || "%Y-%m-%d";

    const trends = await PageView.aggregate([
      { $match: dateFilter ? { timestamp: dateFilter } : {} },
      {
        $lookup: {
          from: "articles",
          localField: "articleId",
          foreignField: "_id",
          as: "articleDetails",
        },
      },
      {
        $unwind: "$articleDetails",
      },
      { $match: category ? { "articleDetails.category": category } : {} },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: "$timestamp" } },
          views: { $sum: 1 },
          uniqueUsers: { $addToSet: "$userUuid" },
        },
      },
      {
        $project: {
          time: "$_id",
          views: 1,
          uniqueUsers: { $size: "$uniqueUsers" },
        },
      },
      { $sort: { time: 1 } },
    ]);

    res.status(200).json(trends);
  } catch (error) {
    console.error("Error fetching trends:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch trends", error: error.message });
  }
};

// Export all controller functions
module.exports = {
  recordPageView,
  getViewsPerArticle,
  getViewsOverTime,
  getViewsByCategory,
  getAnalyticsOverview,
  getArticleAnalytics,
  getTrends,
};
