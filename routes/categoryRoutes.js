const express = require("express");
const { createCategories, updateCategory, getCategories, deleteCategory } = require("../controllers/categoryController");
const { verifyToken, verifyAdmin } = require("../middlewares/authMiddleware");

const router = express.Router();

//  Route to Add a New Category
router.post("/", verifyAdmin, createCategories);

//  Route to Update a Category
// router.put("/:categoryId", verifyToken, updateCategory);

//  Route to Get All Categories
router.get("/", getCategories);

//  Route to Delete a Category
router.delete("/:categoryId", verifyAdmin, deleteCategory);

module.exports = router;
