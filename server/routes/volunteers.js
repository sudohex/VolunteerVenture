const express = require("express");
const router = express.Router();
const Volunteer = require("../models/volunteer"); // Make sure the path is correct
router.get("/", async (req, res) => {
  try {
   
    const volunteers = await Volunteer.find();

    res.send(volunteers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
