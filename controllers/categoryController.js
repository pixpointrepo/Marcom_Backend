const Category = require("../models/Category");
const generateUrl = require("../utils/urlGenerator");

//      Categories to display in the home page

//  Create Multiple Categories at Once
const createCategories = async (req, res) => {
    try {
        const { names } = req.body; // Expecting an array of names

        if (!Array.isArray(names) || names.length === 0) {
            return res.status(400).json({ message: "Provide an array of category names." });
        }

        const categoriesToInsert = [];

        for (const name of names) {
            const url = generateUrl(name);

            // Check if category already exists
            const existingCategory = await Category.findOne({ url });
            if (!existingCategory) {
                categoriesToInsert.push({ name, url });
            }
        }

        if (categoriesToInsert.length === 0) {
            return res.status(400).json({ message: "No new categories to add." });
        }

        // Insert multiple categories
        const newCategories = await Category.insertMany(categoriesToInsert);

        res.status(201).json({ message: "Categories added successfully", categories: newCategories });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};


//  Update a Category
const updateCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ message: "Category name is required" });
        }

        const url = generateUrl(name);

        const category = await Category.findByIdAndUpdate(
            categoryId,
            { name, url },
            { new: true }
        );

        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.status(200).json(category);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

//  Get All Categories
const getCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 });
        res.status(200).json(categories);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

//  Delete a Category
const deleteCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;

        const category = await Category.findByIdAndDelete(categoryId);
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.status(200).json({ message: "Category deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = {
    createCategories,
    updateCategory,
    getCategories,
    deleteCategory
};
