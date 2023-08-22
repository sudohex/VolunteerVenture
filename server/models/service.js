const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  serviceName: String,
  inDisplay: Boolean,
  description: String
});

module.exports = mongoose.model('Service', serviceSchema);
