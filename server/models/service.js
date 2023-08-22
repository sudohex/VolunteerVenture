const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  locations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Location'}],
  serviceName: String,
  inDisplay: Boolean,
  description: String
});

module.exports = mongoose.model('Service', serviceSchema);
