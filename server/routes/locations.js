const express = require("express");
const router = express.Router();
const Location = require("../models/location"); // Make sure the path is correct
const mongoose = require("mongoose");
router.get("/", async (req, res) => {
  try {
   
    const locations = await Location.find();

    res.send(locations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
