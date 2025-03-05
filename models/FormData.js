

const mongoose = require("mongoose");

// Define a schema and model for storing form data
const formSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  subject: String,
  description: String,
});

const FormData = mongoose.model("FormData", formSchema);

module.exports = FormData;