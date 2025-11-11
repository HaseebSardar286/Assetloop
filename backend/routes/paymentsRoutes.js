const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const { createCheckoutSession } = require("../controllers/paymentsController");

const router = express.Router();

// Authenticated routes
router.use(authMiddleware);

// Create a Stripe Checkout session for a booking
router.post("/create-checkout-session", createCheckoutSession);

module.exports = router;


