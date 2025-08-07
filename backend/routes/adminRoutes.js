const express = require("express");
const User = require("../models/User");
const { protect, isAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

// @route GET /api/admin/users
// @desc Get all users (Admin only)
// @access Private/Admin
router.get("/", protect, isAdmin, async (req, res) => {
    try {
        const users = await User.find({}).select("-password");
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

// @route POST /api/admin/users
// @desc Add a new user (admin only)
// @access Private/Admin
router.post("/", protect, isAdmin, async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
        res.status(400);
        throw new Error("Please fill all fields");
    }

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json("User already exists");
        }

        const user = await User.create({
            name,
            email,
            password,
            role: role || "customer",
        });

        if (user) {
            res.status(201).json(
                {
                    message: "User created successfully",
                },
                newUser = {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                }
            );
        } else {
            res.status(400);
            throw new Error("Invalid user data");
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});


// @route PUT /api/users/:id
// @desc Update a user info (Admin only) -> name, email, role
// @access Private/Admin
router.put("/:id", protect, isAdmin, async (req, res) => {
    const { name, email, role } = req.body;

    try {
        const user = await User.findById(req.params.id);

        if (user) {
            user.name = name || user.name;
            user.email = email || user.email;
            user.role = role || user.role;

            const updatedUser = await user.save()

            res.json({
                message: "User updated successfully",
                user: updatedUser,
            });
        } else {
            res.status(404);
            throw new Error("User not found");
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});  


// @route DELETE /api/admin/users/:id
// @desc Delete a user (Admin only)
// @access Private/Admin
router.delete("/:id", protect, isAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            await user.deleteOne();
            res.json({ message: "User deleted successfully" });
        } else {
            res.status(404);
            throw new Error("User not found");
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;
