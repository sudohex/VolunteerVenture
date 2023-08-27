const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Volunteer = require("../models/volunteer"); // Assuming you have a model for Volunteer
const bcrypt = require("bcryptjs"); 

router.post("/", async (req, res) => {
    try {
        const {
            email,
            password,
            acctType,
            firstName,
            lastName,
            phoneNo,
            isSMSOn,
            isEmailOn,
            preferences
        } = req.body;

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).send("User with that email already exists");
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new user and save it to the database
        user = new User({
            email,
            password: hashedPassword,
            acctType,
            lastLogin: new Date(),
            acctCreationDate: new Date()
        });

        await user.save();

        // Once user is created, create a new volunteer using the user's ID
        const volunteer = new Volunteer({
            user: user._id,
            firstName,
            lastName,
            phoneNo,
            isSMSOn,
            isEmailOn,
            preferences
        });

        await volunteer.save();

        res.status(201).send("Volunteer registered successfully");
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

module.exports = router;
