const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  location: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  firstName: String,
  lastName: String,
  phoneNo: String,
  isAdmin: Boolean
});

module.exports = mongoose.model('Staff', staffSchema);
