const Booking = require("../models/Bookings");
const express = require("express");

let stripe = null;
function getStripe() {
  if (stripe) return stripe;
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    throw new Error("Missing STRIPE_SECRET_KEY in environment");
  }
  // Lazy require to avoid load if not configured
  // eslint-disable-next-line global-require
  stripe = require("stripe")(secret);
  return stripe;
}

exports.createCheckoutSession = async (req, res) => {
  try {
    const { bookingId, successUrl, cancelUrl, currency = "usd" } = req.body;
    const userId = req.user.id;

    if (!bookingId) {
      return res.status(400).json({ message: "bookingId is required" });
    }

    const booking = await Booking.findById(bookingId).populate("owner", "firstName lastName");
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.renter.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized to pay for this booking" });
    }

    const stripeClient = getStripe();

    const amountCents = Math.max(0, Math.round((booking.price || 0) * 100));
    if (amountCents <= 0) {
      return res.status(400).json({ message: "Invalid booking amount" });
    }

    const session = await stripeClient.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: booking.name || "Asset Booking",
              description: `Payment for booking ${booking._id}`,
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        bookingId: booking._id.toString(),
        renterId: booking.renter.toString(),
        ownerId: booking.owner.toString(),
      },
      success_url:
        successUrl ||
        "http://localhost:4200/payments?status=success&bookingId={CHECKOUT_SESSION:METADATA:bookingId}",
      cancel_url:
        cancelUrl ||
        "http://localhost:4200/payments?status=cancelled&bookingId={CHECKOUT_SESSION:METADATA:bookingId}",
    });

    return res.status(200).json({ id: session.id, url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return res.status(500).json({ message: error.message });
  }
};

// Webhook must receive the raw body
exports.stripeWebhookHandler = async (req, res) => {
  let event = req.body;
  const stripeClient = getStripe();
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (endpointSecret) {
    const sig = req.headers["stripe-signature"];
    try {
      event = stripeClient.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error("⚠️  Webhook signature verification failed.", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const bookingId = session.metadata?.bookingId;
        if (bookingId) {
          const booking = await Booking.findById(bookingId);
          if (booking) {
            // Mark as paid/confirmed and update totalPaid
            const amountTotal = (session.amount_total || 0) / 100;
            booking.totalPaid = (booking.totalPaid || 0) + amountTotal;
            if (booking.status === "pending") {
              booking.status = "confirmed";
            }
            await booking.save();
          }
        }
        break;
      }
      default:
        break;
    }
    return res.json({ received: true });
  } catch (error) {
    console.error("Webhook handling error:", error);
    return res.status(500).json({ message: "Webhook handling error" });
  }
};


