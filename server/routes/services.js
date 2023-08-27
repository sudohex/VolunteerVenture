const express = require("express");
const router = express.Router();
const Service = require("../models/service"); // Make sure the path is correct
const mongoose = require("mongoose");
router.get("/", async (req, res) => {
  try {
    const { location, category } = req.query; // Extract location and category from the query params

    // Ensure both parameters are provided
    if (!location || !category) {
      return res.status(400).send("Please provide both location and category.");
    }

    // Find services by location and category
    const services = await Service.find({
      location: new mongoose.Types.ObjectId(location), // Convert string to ObjectId
      category: new mongoose.Types.ObjectId(category),
    });

    res.send(services);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
