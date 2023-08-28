const express = require("express");
const router = express.Router();
const Service = require("../models/service");
const Category = require("../models/category");
const Location = require("../models/location");

router.get("/", async (req, res) => {
    try {
        const query = req.query.q;

        // Fetch Category and Location Ids based on the query
        const categoryId = (await Category.findOne({ categoryName: query }))?._id;
        const locationIds = (await Location.find({ locationName: query })).map(loc => loc._id);

        const services = await Service.find({
            $or: [
                { categoryName: categoryId },
                { locationName: { $in: locationIds } },
                { serviceName: new RegExp(query, "i") }, // Case-insensitive search
                { description: new RegExp(query, "i") }  // Case-insensitive search
            ]
        }).populate('category').populate('locations'); // Populate the references for better data structure
        
        res.send(services);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

module.exports = router;
