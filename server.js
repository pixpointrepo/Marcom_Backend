// server.js
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
require("dotenv").config();

const articleRoutes = require("./routes/articleRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const formRoutes = require("./routes/formRoutes");
const authRoutes = require("./routes/authRoutes");
const analyticsRoutes = require("./routes/analytics"); // Import analytics routes

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads")); // Serve uploaded images



// Articles
app.use("/api/articles", articleRoutes);

// Categories (for displaying in home page)
app.use("/api/categories", categoryRoutes);

// Routes for submitted form 
app.use("/api/form", formRoutes);

// Auth
app.use("/api/auth", authRoutes);

// Connect to Database
connectDB();

// Routes
app.use("/api/articles", articleRoutes); // Articles
app.use("/api/categories", categoryRoutes); // Categories
app.use("/api/auth", authRoutes); // Auth
app.use("/api/analytics", analyticsRoutes); // Analytics (e.g., /api/analytics/pageview)

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));