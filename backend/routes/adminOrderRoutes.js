const express = require("express");
const Order = require("../models/Order");
const { protect, isAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

// @route GET /api/admin/orders
// @desc Get all orders (Admin only)
// @access Private/Admin
router.get("/", protect, isAdmin, async (req, res) => {
    try {
        const orders = await Order.find({}).populate("user", "name email");
        console.log(orders);
        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});


// @route PUT /api/admin/orders/:id
// @desc Update order status (Admin only)
// @access Private/Admin
router.put("/:id", protect, isAdmin, async (req, res) => {
    const { status } = req.body;

    try {
        const order = await Order.findById(req.params.id).populate("user", "name");
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        order.status = status || order.status;
        order.isDelivered = status === "Delivered" ? true : order.isDelivered;
        order.deliveredAt = status === "Delivered" ? Date.now() : order.deliveredAt;

        const updatedOrder = await order.save();

        res.json(order);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});


// @route DELETE /api/admin/orders/:id
// @desc Delete an order (Admin only)
// @access Private/Admin
router.delete("/:id", protect, isAdmin, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        await order.deleteOne();
        res.json({ message: "Order deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});




module.exports = router;