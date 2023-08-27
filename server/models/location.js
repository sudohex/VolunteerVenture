const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  locationName: String,
  locationDetails: String
});

module.exports = mongoose.model('Location', locationSchema);
