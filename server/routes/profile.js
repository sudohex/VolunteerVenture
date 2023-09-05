const express = require("express");
const router = express.Router();
const auth = require("../middlware/auth");
const User = require("../models/user");
const Volunteer = require("../models/volunteer");

router.post("/", auth, async(req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        console.log(user);
        var volunteer = await Volunteer.findOne({ user: req.user.id });
        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        } else { //if valid user add email to the response
            volunteer.email = user.email; //Not updating i don't why
        }
        var response = [{ user, volunteer }];
        if (user.id === req.user.id) {
            res.json(response);
        } else {
            res.status(403).json({ msg: "Access denied" });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});
module.exports = router;