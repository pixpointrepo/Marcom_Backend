const jwt = require("jsonwebtoken");
require("dotenv").config();

// 🔹 Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const token = req.header("Authorization");

    if (!token) {
        return res.status(401).json({ message: "Access Denied! No token provided." });
    }

    try {
        const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ message: "Invalid or Expired Token" });
    }
};

// 🔹 Middleware to check if user is admin
const verifyAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.role === "admin") {
            next();
        } else {
            return res.status(403).json({ message: "Access Denied! Admins only." });
        }
    });
};

module.exports = { verifyToken, verifyAdmin };
