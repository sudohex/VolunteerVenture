const mongoose = require("mongoose");

const volunteerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  firstName: String,
  lastName: String,
  phoneNo: String,
  isSMSOn: Boolean,
  isEmailOn: Boolean,
  preferences: {
    categories: [{ type: mongoose.Schema.ObjectId, ref: " Category" }],
    locations: [{ type: mongoose.Schema.ObjectId, ref: " Location" }],
  },
  notifications: [{ type: mongoose.Schema.ObjectId, ref: " Notification" }],
});

module.exports = mongoose.model("Volunteer", volunteerSchema);
