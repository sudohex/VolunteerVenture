const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  departmentName: String
});

module.exports = mongoose.model('Department', departmentSchema);
