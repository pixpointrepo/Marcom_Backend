const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const articleRoutes = require("./routes/articleRoutes");

require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads")); // Serve uploaded images
app.use("/api/articles", articleRoutes);

// Connect to Database
connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
