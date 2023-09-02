const express = require("express");
const router = express.Router();
const Notification = require("../models/notification");
const Staff = require("../models/staff");
const auth = require("../middlware/auth");


router.post("/", auth, async(req, res) => {
    try {
        const { id } = req.body;

        const notifications = await Notification.find({ sentTo: id });

        // Collect all unique createdBy values from notifications
        const createdByIds = notifications.map(notification => notification.createdBy);

        // Fetch staff details 
        const staffDetails = await Staff.find({ _id: { $in: createdByIds } });

        // Create a map of createdBy IDs to staff names
        const createdByMap = new Map(staffDetails.map(staff => [staff._id.toString(), `${staff.firstName} ${staff.lastName}`]));
        console.log(createdByMap);
        // Replacing createdBy values with staff names
        const notificationsWithStaffNames = notifications.map(notification => ({...notification.toObject(),
            createdBy: createdByMap.get(notification.createdBy.toString()) || notification.createdBy
        }));

        res.send(notificationsWithStaffNames);

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

module.exports = router;