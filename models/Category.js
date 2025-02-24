const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },  // Category name (e.g., "Marketing Initiative")
    url: { type: String, required: true, unique: true }   // URL-friendly ID (e.g., "marketing-initiative")
});

module.exports = mongoose.model("Category", categorySchema);
