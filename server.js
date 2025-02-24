const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
require("dotenv").config();

const articleRoutes = require("./routes/articleRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads")); // Serve uploaded images

// Routes

// Articles
app.use("/api/articles", articleRoutes);

// Categories (for displaying in home page)
app.use("/api/categories", categoryRoutes);

// Auth
app.use("/api/auth", authRoutes);

// Connect to Database
connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
