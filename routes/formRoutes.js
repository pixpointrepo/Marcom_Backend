const express = require("express");
const router = express.Router();
const FormData = require("../models/FormData");


// Handle form submission
router.post("/submit", async (req, res) => {
  try {
    const { fullName, email, subject, description } = req.body;
    console.log("Form data:", req.body);
    // Basic validation
    if (!fullName || !email || !subject || !description ) {
      return res.status(400).json({ message: "All fields are required and terms must be accepted." });
    }

    // Save to MongoDB
    const newFormEntry = new FormData({ fullName, email, subject, description });
    await newFormEntry.save();

    res.status(201).json({ message: "Form submitted successfully!" });
  } catch (error) {
    console.error("Error submitting form:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// Get all form submissions
router.get("/", async (req, res) => {
    try {
      const allForms = await FormData.find(); 
      res.status(200).json(allForms);
    } catch (error) {
      console.error("Error fetching form submissions:", error);
      res.status(500).json({ message: "Server error. Please try again later." });
    }
  });
  

module.exports = router;
