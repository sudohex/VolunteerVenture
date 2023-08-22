const mongoose = require('mongoose');

const volunteerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  firstName: String,
  lastName: String,
  phoneNo: String,
  isSMSOn: Boolean,
  isEmailOn: Boolean
});

module.exports = mongoose.model('Volunteer', volunteerSchema);
