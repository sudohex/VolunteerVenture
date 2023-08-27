const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  acctType: String,
  lastLogin: Date,
  acctCreationDate: Date
});

module.exports = mongoose.model('User', userSchema);
