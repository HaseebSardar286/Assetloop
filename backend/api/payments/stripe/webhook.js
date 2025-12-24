import { buffer } from "micro";
import Stripe from "stripe";
import connectDB from "../../../config/db.js";
import Booking from "../../../models/Booking.js";

connectDB();

export const config = {
  api: {
    bodyParser: false, // crucial for Stripe webhook
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const buf = await buffer(req);
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(buf.toString(), sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("⚠️ Webhook signature verification failed.", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle events
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object;
  // Find the booking by session.metadata.bookingId (if you passed it)
  const booking = await Booking.findById(session.metadata.bookingId);
  if (booking) {
    booking.status = "paid";
    await booking.save();
  }
  break;
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;
      console.log("Payment succeeded:", paymentIntent);
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
}
