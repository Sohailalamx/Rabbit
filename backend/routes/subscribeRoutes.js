const express = require("express");
const Subscriber = require("../models/Subscriber");

const router = express.Router();


// @route POST /api/subscribe
// @desc Handle newsletter subscripton
// @access Public
router.post("/", async(req, res) => {
    const { email } = req.body;
    if(!email) {
        res.status(400).json({ message: "Email is required" });
    }

    try {
        // Check if the email is already subscribed
        const existingSubscriber = await Subscriber.findOne({ email });
        if(existingSubscriber) {
            return res.status(400).json({ message: "Email is already subscribed" });
        }

        // Create a new subscriber
        const newSubscriber = await Subscriber.create(
            {
                email,
            }
        );

        res.status(201).json({
            message: "Subscriber created successfully",
            subscriber: newSubscriber,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
})

module.exports = router;