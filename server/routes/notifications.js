const express = require("express");
const router = express.Router();
const Notification = require("../models/notification");
const auth = require("../middlware/auth")
/*
const notificationSchema = new mongoose.Schema({
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
  sentTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Volunteer' }],
  subject: String,
  message: String,
  dateSent: Date,
  channelType: String
});
*/

router.post("/", auth, async (req, res) => {
  try {
    req.get("")
    const notifications = await Notification.find({ sentTo: id });

    res.send(notifications);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
