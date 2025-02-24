const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Article = require('../models/Article');

require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));


// Read JSON file and insert data into MongoDB
const seedArticles = async () => {
  try {
    // Load articles from the JSON file
    const articlesData = JSON.parse(fs.readFileSync(path.join(__dirname, './articles.json'), 'utf8'));
    await Article.insertMany(articlesData);
    console.log('Articles inserted successfully!');
  } catch (err) {
    console.error('Error seeding articles:', err);
  } finally {
    mongoose.connection.close(); // Close the connection after seeding
  }
};

// Run the seeder
seedArticles();
