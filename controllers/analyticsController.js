const PageView = require("../models/PageView");
const Article = require("../models/Article");

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

// Get Total Page Views
const getTotalPageViews = async (req, res) => {
  try {
    const total = await PageView.countDocuments();
    res.status(200).json({ totalPageViews: total });
  } catch (error) {
    console.error("Error fetching total page views:", error);
    res
      .status(500)
      .json({
        message: "Failed to fetch total page views",
        error: error.message,
      });
  }
};

// Get Unique Users
const getUniqueUsers = async (req, res) => {
  try {
    const uniqueUsers = await PageView.distinct("userUuid").then(
      (users) => users.length
    );
    res.status(200).json({ uniqueUsers });
  } catch (error) {
    console.error("Error fetching unique users:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch unique users", error: error.message });
  }
};

// Get Views Per Page
// Get Views Per Article with Article Details
const getViewsPerArticle = async (req, res) => {
    try {
      const viewsPerArticle = await PageView.aggregate([
        {
          $group: {
            _id: '$articleId', // Now an ObjectId
            views: { $sum: 1 },
            // category: { $first: '$category' },
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
            // category: 1,
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


// Get Views Over Time (Daily)
const getViewsOverTime = async (req, res) => {
  try {
    const viewsOverTime = await PageView.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } }, // Sort by date ascending
    ]);
    res
      .status(200)
      .json(
        viewsOverTime.map((item) => ({ date: item._id, views: item.count }))
      );
  } catch (error) {
    console.error("Error fetching views over time:", error);
    res
      .status(500)
      .json({
        message: "Failed to fetch views over time",
        error: error.message,
      });
  }
};

// Get Views By Category 
const getViewsByCategory = async (req, res) => {
    try {
      const viewsByCategory = await PageView.aggregate([
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
            preserveNullAndEmptyArrays: true, // Keep non-matching records
          },
        },
        {
          $match: { 'articleDetails.category': { $exists: true, $ne: null } }, // Filter out null categories
        },
        {
          $group: {
            _id: '$articleDetails.category', // Group by category from Article
            count: { $sum: 1 },
          },
        },
        {
          $sort: { count: -1 }, // Sort by count descending
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

// Export all controller functions
module.exports = {
  recordPageView,
  getTotalPageViews,
  getUniqueUsers,
  getViewsPerArticle,
  getViewsOverTime,
  getViewsByCategory,
};
