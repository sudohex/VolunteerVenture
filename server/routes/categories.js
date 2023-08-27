const express = require("express");
const router = express.Router();
const Category = require("../models/category"); // Make sure the path is correct
const mongoose = require("mongoose");
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find();

    res.send(categories);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
