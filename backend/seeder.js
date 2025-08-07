const mongoose = require("mongoose");
const dotenv = require("dotenv");
const products = require("./data/products.js");
const Product = require("./models/Product.js");
const Cart = require("./models/Cart.js");
const User = require("./models/User.js");

dotenv.config();

// Connect to mongoDB
mongoose.connect(process.env.MONGODB_URI);

// Function to seed the data

const seedData = async () => {
    try {
        // Clear existing data;
        await Product.deleteMany();
        await User.deleteMany();
        await Cart.deleteMany();

        // Create a default admin User
        const createdUser = await User.create({
            name: "Admin User",
            email: "admin@example.com",
            password: "123456",
            role: "admin",
        });

        // Assign the default user ID to each product
        const userId = createdUser._id;

        const sampleProducts = products.map((product) => {
            return { ...product, user: userId };
        });

        // Insert the sample products into the database
        await Product.insertMany(sampleProducts);

        console.log("Data seeded successfully");
        process.exit();
    } catch (error) {
        console.error("Error seeding data:", error);
        process.exit(1);
    }
}

seedData();