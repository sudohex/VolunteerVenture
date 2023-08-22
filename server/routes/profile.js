const express = require("express");
const router = express.Router();
const auth = require("../middlware/auth");
const User = require("../models/user");
const Volunteer = require("../models/volunteer");

router.post("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    const volunteer = await Volunteer.findOne({ user: req.user.id });
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (user.id === req.user.id) {
      res.json(volunteer);
    } else {
      res.status(403).json({ msg: "Access denied" });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
module.exports = router;
