const mongoose = require("mongoose");
const { subscribe } = require("../routes/userRoutes");

const subscriberSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            
        },
        subscribe: {
            type: Date,
            default: Date.now,
        },
    }
);

module.exports = mongoose.model("Subscriber", subscriberSchema);