const express = require("express");
const Cart = require("../models/Cart.js");
const Product = require("../models/Product.js");
const { protect } = require("../middleware/authMiddleware.js");
const mongoose  = require("mongoose");

const router = express.Router();

// Helper function to get a cart by user Id or guest Id
const getCart = async (userId, guestId) => {
    if(userId) {
        return await Cart.findOne({ user: userId });
    } else if(guestId) {
        return await Cart.findOne({ guestId });
    }
    return null;
} 

// @route POST /api/cart
// @desc Add a product to the cart for a guest or logged in user
// @access Public
router.post("/", async(req, res) => {
    const { productId, quantity, size, color, guestId, userId } = req.body;
    console.log("userId send via addToCart", userId);
    try {
        const product = await Product.findById(productId);
        if(!product) {
            return res.status(404).json({
                message: "Product not found",
            });
        }

        // Determine if the user is a guest or logged in
        let cart = await getCart(userId, guestId);

        // If the cart exists, update it
        if(cart) {
            const productIndex = cart.products.findIndex(
                (item) => item.productId.toString() === productId.toString() && item.size === size && item.color === color
            );

            if(productIndex > -1) {
                // If the item already exists, update the quantity
                cart.products[productIndex].quantity = Number(cart.products[productIndex].quantity) + Number(quantity);
            } else {
                // add new product
                cart.products.push({
                    productId,
                    name: product.name,
                    image: product.images[0].url,
                    price: product.price,
                    size,
                    color,
                    quantity,
                });
            }

            // Recalculate the total price
            cart.totalPrice = cart.products.reduce(
                (total, item) => total + item.price * item.quantity,
                0
            );
            await cart.save();
            return res.status(200).json(cart);
        } else {
            // Create a new cart for the guest or user
            const newCart = await Cart.create({
                user: userId ? userId : undefined,
                guestId: guestId ? guestId : "guest_" + new Date().getTime(),
                products: [
                    {
                        productId,
                        name: product.name,
                        image: product.images[0].url,
                        price: product.price,
                        size,
                        color,
                        quantity,
                    }
                ],
                totalPrice: product.price * quantity,
            });
            return res.status(201).json(newCart);  
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error",
        });
    }
})


// @route PUT /api/cart
// @desc Update product quantity in the cart for a guest or logged in user
// @access Public
router.put("/", async(req, res) => {
    const { productId, quantity, size, color, guestId, userId } = req.body;
    
    // console.log(productId, quantity, size, color, guestId, userId);
    
    try {
        let cart = await getCart(userId, guestId);
        if(!cart) {
            return res.status(404).json({
                message: "Cart not found",
            });
        }

        const productIndex = cart.products.findIndex((item) => item.productId.toString() === productId.toString() && item.size === size && item.color === color);
        if(productIndex > -1) {
            if(quantity > 0) {
                cart.products[productIndex].quantity = quantity;
             } else {
                cart.products.splice(productIndex, 1);
            }

            cart.totalPrice = cart.products.reduce(
                (total, item) => total + item.price * item.quantity,
                0
            );
            await cart.save();
            return res.status(200).json(cart);
        } else {
            return res.status(404).json({
                message: "Product not found in cart",
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error",
        });
    }
});


// @route DELETE /api/cart
// @desc Remove a product from the cart for a guest or logged in user
// @access Public
router.delete("/", async(req, res) => {
    const { productId, size, color, guestId, userId } = req.body;
    // console.log(productId, size, color, guestId, userId);

    try {
        let cart = await getCart(userId, guestId);
        if(!cart) {
            return res.status(404).json({
                message: "Cart not found",
            });
        }

        const productIndex = cart.products.findIndex((item) => item.productId.toString() === productId.toString() && item.size === size && item.color === color);

        if(productIndex > -1) {
            cart.products.splice(productIndex, 1);
            cart.totalPrice = cart.products.reduce(
                (total, item) => total + item.price * item.quantity,
                0
            );
            await cart.save();
            return res.status(200).json(cart);
        } else {
            return res.status(404).json({
                message: "Product not found in cart",
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error",
        });
    }   
});


// @route GET /api/cart
// @desc Get the cart for a guest or logged in user
// @access Public
router.get("/", async(req, res) => {
    const { guestId, userId } = req.query;

    try {
        let cart = await getCart(userId, guestId);
        if(!cart) {
            return res.status(404).json({
                message: "Cart not found",
            });
        }

        return res.status(200).json(cart);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error",
        });
    }
});


// @route POST /api/cart/merge
// @desc Merge guest cart with user cart on login
// @acces Private
router.post("/merge", protect, async(req, res) => {
    const { guestId } = req.body;
    const userId = req.user._id;

    try {
        // Find the guest cart and user cart
        const guestCart = await Cart.findOne({ guestId });
        const userCart = await Cart.findOne({ user: userId });

        if(guestCart) {
            if(guestCart.products.lengthn === 0) {
                return res.status(400).json({ message: "Guest cart is empty" });
            }

            if(userCart) {
                // Merge the guest cart with the user cart
                guestCart.products.forEach((guestProduct) => {
                    const userProductIndex = userCart.products.findIndex(
                        (userProduct) => userProduct.productId.toString() === guestProduct.productId.toString() && userProduct.size === guestProduct.size && userProduct.color === guestProduct.color
                    );

                    if(userProductIndex > -1) {
                        userCart.products[userProductIndex].quantity += guestProduct.quantity;
                    } else {
                        userCart.products.push(guestProduct);
                    }
                });

                userCart.totalPrice = userCart.products.reduce(
                    (total, item) => total + item.price * item.quantity,
                    0
                );

                await userCart.save();

                // Remove the guest cart after mergin
                try {
                    await Cart.findOneAndDelete({ guestId });
                } catch (error) {
                    console.log("error deleting guest cart", error);
                }

                res.status(200).json(userCart);
            } else {
                // If user cart doesn't exist, create a new one
                guestCart.user = userId;
                guestCart.guestId = undefined;
                await guestCart.save();
                
                res.status(200).json(guestCart);
            } 
        } else {
            if(userCart) {
                // Geust cart has already been merged, return user cart
                return res.status(200).json(userCart);
            }
            return res.status(404).json({ message: "Guest cart not found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error",
        });
    }

});


module.exports = router;