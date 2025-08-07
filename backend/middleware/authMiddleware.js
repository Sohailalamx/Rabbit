const jwt = require("jsonwebtoken");
const User = require("../models/User.js");

// Middleware to protect routes
const protect = async (req, res, next) => {
    let token;

    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            // console.log("Decoded token:", decoded);
            req.user = await User.findById(decoded.user._id).select("-password"); // Exclude password
            // console.log("Token verified successfully", req.user);
            next();
        } catch (error) {
            console.error("Token verification is faild", error);
            res.status(401).json({ message: "Not authorized, token failed" });
        }
    } else {
        res.status(401).json({ message: "Not authorized, no token provide" });
    }
};

// Middleware to check if the user is an admin
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: "Not authorized as an admin" });
    }
};

module.exports = { 
    protect,
    isAdmin,
};