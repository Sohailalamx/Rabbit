const express = require('express');
const Checkout = require('../models/Checkout');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { protect } = require("../middleware/authMiddleware");

require("dotenv").config();

const stripe = require("stripe")(process.env.STRIPE_SECRET);

const router = express.Router();

// @route POST /api/checkout
// @desc Create a new checkout session
// @access Private
router.post('/', protect, async (req, res) => {
    const { checkoutItems, shippingAddress, paymentMethod, totalPrice } = req.body;

    if(!checkoutItems || checkoutItems.length === 0) {
        return res.status(400).json({
            message: "No items in checkout",
        });
    }

    try {
        // Create a new checkout session
        console.log(req.user);
        const newCheckout = await Checkout.create({
            user: req.user._id,
            checkoutItems,
            shippingAddress,
            paymentMethod,
            totalPrice,
            paymentStatus: "Pending",
            isPaid: false,
        });
        // console.log(`Checkout created for user: ${req.user._id}`);

        res.status(201).json(newCheckout);
    } catch (error) {
        console.error("Error Creating checkout session: ", error);
        res.status(500).json({
            message: "Error Creating checkout session",
        });
    }
});


// @route PUT /api/checkout/:id/pay
// @desc Update checkout to make as paid after successful payment
// @access Private
// router.put('/:id/pay', protect, async (req, res) => {
const pay = async(checkoutId) => {
    // const { paymentStatus, paymentDetails } = req.body;
    const paymentStatus = "paid";
    let paymentDetails;
    // const checkoutId = req.params.id;

    try {
        const checkout = await Checkout.findById(checkoutId);

        if(!checkout) {
            // return res.status(404).json({
            //     message: "Checkout not found",
            // });
            throw new Error("Checkout not found");
        }

        if(paymentStatus === "paid") {
            checkout.isPaid = true;
            checkout.paymentStatus = paymentStatus;
            checkout.paymentDetails = paymentDetails;
            checkout.paidAt = Date.now();
            await checkout.save();

            // res.status(200).json(checkout);
            finalize(checkoutId);
        } else {
            // res.status(400).json({
            //     message: "Payment failed",
            // });
            throw new Error("Payment failed");
        }
    } catch (error) {
        console.error("Error updating checkout: ", error);
        // res.status(500).json({
        //     message: "Error updating checkout",
        // });
        throw new Error("Error updating checkout");
    }
}


// @route POST /api/checkout/:id/finalize
// @desc Finalize checkout and convert to an order after payment confirmation
// @access Private 
// router.post('/:id/finalize', protect, async (req, res) => {
const finalize = async (checkoutId) => {
    try {
        // const checkoutId = req.params.id;
        const checkout = await Checkout.findById(checkoutId);

        if(!checkout) {
            // return res.status(404).json({
            //     message: "Checkout not found",
            // });
            throw new Error("Checkout not found");
        }

        if(checkout.isPaid && !checkout.isFinalized) {
            // Create final order based on the checkout details
            const order = await Order.create({
                user: checkout.user,
                orderItems: checkout.checkoutItems,
                shippingAddress: checkout.shippingAddress,
                paymentMethod: checkout.paymentMethod,
                totalPrice: checkout.totalPrice,
                isPaid: true,
                paidAt: checkout.paidAt,
                isDelivered: false,
                paymentStatus: "paid",
                paymentDetails: checkout.paymentDetails,
            });

            // Mark the checkout as finalized to prevent duplication
            checkout.isFinalized = true;
            checkout.finalizedAt = Date.now();
            await checkout.save();
            // Delete the cart associated with the user
            try {
                const deletedCart = await Cart.findOneAndDelete({ user: checkout.user });
                if (!deletedCart) {
                    console.log(`No cart found to delete for user: ${checkout.user}`);
                } else {
                    console.log(`Successfully deleted cart for user: ${checkout.user}`);
                }
            } catch (error) {
                console.error(`Error deleting cart for user ${checkout.user}:`, error);
            }            
            // res.status(201).json(order);

        } else if(checkout.isFinalized) {
            // res.status(400).json({
            //     message: "Checkout already finalized",
            // });
            throw new Error("Checkout already finalized");
        } else {
            // res.status(400).json({
            //     message: "Checkout not paid yet",
            // });
            throw new Error("Checkout not paid yet");
        }

    } catch (error) {
        console.error("Error finalizing checkout: ", error);
        // res.status(500).json({
        //     message: "Error finalizing checkout",
        // });
        throw new Error("Error finalizing checkout");
    }
}


router.post("/create-checkout-session", protect, async(req, res) => {

    try {
        const {product, checkoutId} = req.body;
    
    
    
        const lineItems = product.map((p) => ({
    
            price_data: {
                currency: "usd",
                product_data: {
                    name: p.name,
                    images: [p.image],
                },
                unit_amount: Math.round(p.price * 100), // Convert to cents
            },
            quantity: p.quantity
        }));


        pay(checkoutId);
    
    
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            success_url: `https://rabbit-iw17.vercel.app/order-confirmation`,
            cancel_url: `https://rabbit-iw17.vercel.app/`,
        })
  
        res.json({id: session.id});
    } catch (error) {
        console.error(error);
        res.status(500).json("server error");
    }
})

module.exports = router;