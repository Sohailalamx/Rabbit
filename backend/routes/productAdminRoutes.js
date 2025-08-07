const express = require("express");
const Product = require("../models/Product");
const { protect, isAdmin } = require("../middleware/authMiddleware");

const router = express.Router();


// @rote GET /api/admin/products
// @desc Get all products (Admin only)
// @access Private/Admin
router.get("/", protect, isAdmin, async (req, res) => {
    try {
        const products = await Product.find({});
        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;