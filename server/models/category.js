const mongoose = require('mongoose');

// Define Category schema
const categorySchema = new mongoose.Schema({
    categoryName: {
        type: String,
        required: true,
        trim: true,
        unique: true
    }
});

// Create and export the Category model
const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
