const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  volunteer: { type: mongoose.Schema.Types.ObjectId, ref: 'Volunteer' },
  staff: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
  subject: String,
  message: String,
  dateSent: Date,
  channelType: String
});

module.exports = mongoose.model('Notification', notificationSchema);
