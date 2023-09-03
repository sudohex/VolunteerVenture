const express = require("express");
const router = express.Router();
const Notification = require("../models/notification");
const auth = require("../middlware/auth");

router.post("/", auth, async (req, res) => {
    try {
        const { id } = req.body;
        // Fetch all notifications from the database
        const allNotifications = await Notification.find();
        // Filter out notifications where sentTo contains the id
        const filteredNotifications = allNotifications.filter(
            (notification) => notification.sentTo.includes(id)
        );
        res.send(filteredNotifications);

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});
router.post("/create", auth, async (req, res) => {
    try {
        const { title, description, sentTo } = req.body;
        const notification = new Notification({
            title,
            description,
            sentTo,
        });
        await notification.save();
        res.send(notification);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});




module.exports = router;