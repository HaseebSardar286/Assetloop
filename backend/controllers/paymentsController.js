const Booking = require("../models/Bookings");
const User = require("../models/User");
const Transaction = require("../models/Transaction");

let stripe = null;
function getStripe() {
  if (stripe) return stripe;
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    throw new Error("Missing STRIPE_SECRET_KEY in environment");
  }
  stripe = require("stripe")(secret);
  return stripe;
}

/**
 * Helper function to get the frontend URL based on request origin
 * This ensures localhost requests redirect back to localhost, and production to production
 */
function getFrontendUrl(req) {
  // Check if successUrl or cancelUrl is provided in request body (highest priority)
  // Otherwise, try to detect from request headers
  const origin = req.headers.origin || req.headers.referer;
  
  if (origin) {
    try {
      const url = new URL(origin);
      // If it's localhost or 127.0.0.1, use localhost
      if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
        return `http://${url.hostname}:${url.port || '4200'}`;
      }
      // Otherwise, use the origin (production URL)
      return `${url.protocol}//${url.host}`;
    } catch (e) {
      // If URL parsing fails, fall through to environment variable
    }
  }
  
  // Fall back to environment variable or default
  return process.env.FRONTEND_URL || "http://localhost:4200";
}

exports.createCheckoutSession = async (req, res) => {
  try {
    const { bookingId, successUrl, cancelUrl, currency = "pkr" } = req.body;
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
            currency: currency.toLowerCase(),
            product_data: {
              name: booking.name || "Asset Booking",
              description: `Payment for booking ${booking._id}`,
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      locale: "en", // Set to English to avoid locale loading issues
      metadata: {
        bookingId: booking._id.toString(),
        renterId: booking.renter.toString(),
        ownerId: booking.owner.toString(),
        type: "booking_payment",
      },
      success_url:
        successUrl ||
        `${getFrontendUrl(req)}/payments?status=success&bookingId={CHECKOUT_SESSION_ID}`,
      cancel_url:
        cancelUrl ||
        `${getFrontendUrl(req)}/payments?status=cancelled&bookingId={CHECKOUT_SESSION_ID}`,
    });

    return res.status(200).json({ id: session.id, url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return res.status(500).json({ message: error.message });
  }
};

// Webhook handler - receives raw body
exports.stripeWebhookHandler = async (req, res) => {
  console.log("🔔 Webhook received!");
  console.log("Body type:", typeof req.body, "Is Buffer:", Buffer.isBuffer(req.body));
  
  const stripeClient = getStripe();
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  if (endpointSecret) {
    // Verify webhook signature
    const sig = req.headers["stripe-signature"];
    
    if (!sig) {
      console.error("❌ No stripe-signature header found");
      return res.status(400).send("Missing stripe-signature header");
    }
    
    try {
      // req.body is a Buffer when using express.raw()
      // Stripe's constructEvent can handle both Buffer and string
      const payload = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body);
      event = stripeClient.webhooks.constructEvent(payload, sig, endpointSecret);
      console.log("✅ Webhook signature verified");
    } catch (err) {
      console.error("⚠️ Webhook signature verification failed:", err.message);
      console.error("Signature:", sig);
      console.error("Endpoint Secret:", endpointSecret?.substring(0, 20) + "...");
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  } else {
    // No signature verification (local development without secret)
    console.warn("⚠️ No STRIPE_WEBHOOK_SECRET - skipping signature verification");
    try {
      // Parse the body if it's a Buffer
      event = Buffer.isBuffer(req.body) ? JSON.parse(req.body.toString()) : req.body;
    } catch (err) {
      console.error("❌ Failed to parse webhook body:", err.message);
      return res.status(400).send("Invalid webhook payload");
    }
  }

  console.log("📦 Event type:", event.type);
  console.log("📦 Event ID:", event.id);
  console.log("📦 Event data:", JSON.stringify(event.data.object, null, 2));

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        console.log("💰 Processing checkout.session.completed");
        const session = event.data.object;
        const { bookingId, type, userId } = session.metadata || {};

        console.log("Metadata:", { bookingId, type, userId });

        if (type === "booking_payment" && bookingId) {
          console.log("Processing booking payment for:", bookingId);
          
          const booking = await Booking.findById(bookingId).populate("owner");
          if (!booking) {
            console.error("❌ Booking not found:", bookingId);
            return res.json({ received: true, error: "Booking not found" });
          }

          console.log("Found booking:", booking._id);

          // Mark as paid/confirmed and update totalPaid
          const amountTotal = (session.amount_total || 0) / 100;
          booking.totalPaid = (booking.totalPaid || 0) + amountTotal;
          
          if (booking.status === "pending") {
            booking.status = "confirmed";
          }
          
          await booking.save();
          console.log("✅ Booking updated - status:", booking.status, "totalPaid:", booking.totalPaid);

          // 1) Renter transaction: payment
          const renterTx = await Transaction.create({
            user: booking.renter,
            amount: amountTotal,
            currency: session.currency || "pkr",
            type: "payment",
            status: "completed",
            description: `Payment for booking ${booking.name}`,
            booking: booking._id,
            stripePaymentIntentId: session.payment_intent,
          });
          console.log("✅ Renter transaction created:", renterTx._id);

          // 2) Owner wallet & transaction: earning / payout
          const owner = await User.findById(booking.owner?._id || booking.owner);
          if (owner) {
            owner.walletBalance = (owner.walletBalance || 0) + amountTotal;
            await owner.save();
            console.log("✅ Owner wallet updated - balance:", owner.walletBalance);

            const ownerTx = await Transaction.create({
              user: owner._id,
              amount: amountTotal,
              currency: session.currency || "pkr",
              type: "payout",
              status: "completed",
              description: `Earnings from booking ${booking.name}`,
              booking: booking._id,
              stripePaymentIntentId: session.payment_intent,
            });
            console.log("✅ Owner transaction created:", ownerTx._id);
          } else {
            console.error("❌ Owner not found");
          }
        } else if (type === "wallet_topup" && userId) {
          console.log("Processing wallet topup for user:", userId);
          
          const user = await User.findById(userId);
          if (!user) {
            console.error("❌ User not found:", userId);
            return res.json({ received: true, error: "User not found" });
          }

          // Check if transaction already exists to prevent duplicates
          const existingTx = await Transaction.findOne({
            stripePaymentIntentId: session.payment_intent,
          });

          if (existingTx) {
            console.log("⚠️ Transaction already processed, skipping duplicate");
            return res.json({ received: true, message: "Already processed" });
          }

          const amountTotal = (session.amount_total || 0) / 100;
          const oldBalance = user.walletBalance || 0;
          user.walletBalance = oldBalance + amountTotal;
          await user.save();
          console.log(`✅ Wallet balance updated: ${oldBalance} → ${user.walletBalance} (+${amountTotal})`);

          const tx = await Transaction.create({
            user: user._id,
            amount: amountTotal,
            currency: session.currency || "pkr",
            type: "deposit",
            status: "completed",
            description: "Wallet Top-up",
            stripePaymentIntentId: session.payment_intent,
          });
          console.log("✅ Transaction created:", tx._id);
        } else {
          console.warn("⚠️ Unknown metadata type or missing required fields");
          console.warn("Metadata received:", { type, userId, bookingId });
        }
        break;
      }
      
      case "payment_intent.succeeded":
        console.log("✅ Payment intent succeeded:", event.data.object.id);
        break;

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }

    return res.json({ received: true });
  } catch (error) {
    console.error("❌ Webhook handling error:", error);
    console.error("Stack:", error.stack);
    return res.status(500).json({ message: "Webhook handling error", error: error.message });
  }
};

exports.getWallet = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const transactions = await Transaction.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(10);

    return res.status(200).json({
      balance: user.walletBalance || 0,
      transactions,
    });
  } catch (error) {
    console.error("Error fetching wallet:", error);
    return res.status(500).json({ message: error.message });
  }
};

exports.addMoney = async (req, res) => {
  try {
    const { amount, currency = "pkr", successUrl, cancelUrl } = req.body;
    const userId = req.user.id;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const stripeClient = getStripe();
    const amountCents = Math.round(amount * 100);

    const session = await stripeClient.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: "Wallet Top-up",
              description: "Add funds to your AssetLoop wallet",
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      locale: "en", // Set to English to avoid locale loading issues
      metadata: {
        userId,
        type: "wallet_topup",
      },
      success_url:
        successUrl ||
        `${getFrontendUrl(req)}/payments?status=success&source=wallet_topup`,
      cancel_url:
        cancelUrl ||
        `${getFrontendUrl(req)}/payments?status=cancelled&source=wallet_topup`,
    });

    return res.status(200).json({ id: session.id, url: session.url });
  } catch (error) {
    console.error("Error adding money:", error);
    return res.status(500).json({ message: error.message });
  }
};

exports.withdraw = async (req, res) => {
  try {
    const { amount, payoutMethodId } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if ((user.walletBalance || 0) < amount) {
      return res.status(400).json({ message: "Insufficient funds" });
    }

    let payoutDescription = "Withdrawal to bank account";

    if (payoutMethodId) {
      const methods = user.paymentMethods || [];
      const method = methods.find((m) => m.id === payoutMethodId);
      if (!method) {
        return res.status(400).json({ message: "Selected payout method not found" });
      }
      payoutDescription = `Withdrawal to ${method.details}`;
    }

    user.walletBalance -= amount;
    await user.save();

    await Transaction.create({
      user: userId,
      amount: -amount,
      currency: "pkr",
      type: "withdrawal",
      status: "completed",
      description: payoutDescription,
    });

    return res.status(200).json({ success: true, balance: user.walletBalance });
  } catch (error) {
    console.error("Error withdrawing money:", error);
    return res.status(500).json({ message: error.message });
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, limit = 20, bookingId } = req.query;
    const query = { user: userId };
    if (type) query.type = type;
    if (bookingId) query.booking = bookingId;

    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    return res.status(200).json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return res.status(500).json({ message: error.message });
  }
};

exports.getPaymentMethods = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const methods = [...(user.paymentMethods || [])].sort((a, b) =>
      a.isDefault === b.isDefault ? 0 : a.isDefault ? -1 : 1
    );
    return res.status(200).json(methods);
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    return res.status(500).json({ message: error.message });
  }
};

exports.addPaymentMethod = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      type = "card",
      cardNumber,
      cardName,
      expiry,
      brand,
      walletProvider,
      walletAccount,
      walletName,
      isDefault = false,
    } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const paymentMethodId = `pm_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    let method;

    if (type === "wallet") {
      if (!walletProvider || !walletAccount || !walletName) {
        return res
          .status(400)
          .json({ message: "walletProvider, walletAccount, and walletName are required for wallet type" });
      }

      const last4 = String(walletAccount).slice(-4);
      method = {
        id: paymentMethodId,
        type: "wallet",
        brand: walletProvider.toLowerCase(),
        last4,
        name: walletName,
        details: `${walletProvider} •••• ${last4}`,
        isDefault: false,
        createdAt: new Date(),
      };
    } else {
      if (!cardNumber || !cardName || !expiry) {
        return res
          .status(400)
          .json({ message: "cardNumber, cardName, and expiry are required for card type" });
      }

      const digits = String(cardNumber).replace(/\D/g, "");
      if (digits.length < 12 || digits.length > 19) {
        return res.status(400).json({ message: "Invalid card number" });
      }

      const [expMonthStr, expYearStr] = String(expiry).split("/").map((v) => v.trim());
      const expMonth = Number(expMonthStr);
      const expYear = Number(expYearStr?.length === 2 ? `20${expYearStr}` : expYearStr);
      if (
        Number.isNaN(expMonth) ||
        Number.isNaN(expYear) ||
        expMonth < 1 ||
        expMonth > 12 ||
        expYear < new Date().getFullYear()
      ) {
        return res.status(400).json({ message: "Invalid expiry" });
      }

      const last4 = digits.slice(-4);
      const inferredBrand =
        brand ||
        (digits.startsWith("4")
          ? "visa"
          : digits.startsWith("5")
          ? "mastercard"
          : digits.startsWith("3")
          ? "amex"
          : "card");

      method = {
        id: paymentMethodId,
        type: "card",
        brand: inferredBrand,
        last4,
        expMonth,
        expYear,
        name: cardName,
        details: `${inferredBrand.toUpperCase()} •••• ${last4}`,
        isDefault: false,
        createdAt: new Date(),
      };
    }

    let methods = user.paymentMethods || [];

    if (!methods.length || isDefault) {
      methods = methods.map((m) => ({ ...m.toObject?.() ?? m, isDefault: false }));
      method.isDefault = true;
    }

    methods.push(method);
    user.paymentMethods = methods;
    await user.save();

    const sorted = [...user.paymentMethods].sort((a, b) =>
      a.isDefault === b.isDefault ? 0 : a.isDefault ? -1 : 1
    );
    return res.status(201).json(sorted);
  } catch (error) {
    console.error("Error adding payment method:", error);
    return res.status(500).json({ message: error.message });
  }
};

exports.removePaymentMethod = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const methods = user.paymentMethods || [];
    const toRemove = methods.find((m) => m.id === id);
    if (!toRemove) return res.status(404).json({ message: "Payment method not found" });

    const remaining = methods.filter((m) => m.id !== id);
    if (toRemove.isDefault && remaining.length) {
      remaining[0].isDefault = true;
    }

    user.paymentMethods = remaining;
    await user.save();
    return res.status(200).json({ success: true, methods: remaining });
  } catch (error) {
    console.error("Error removing payment method:", error);
    return res.status(500).json({ message: error.message });
  }
};

exports.setDefaultPaymentMethod = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const methods = user.paymentMethods || [];
    let found = false;
    user.paymentMethods = methods.map((m) => {
      const isMatch = m.id === id;
      if (isMatch) found = true;
      return { ...m.toObject?.() ?? m, isDefault: isMatch };
    });

    if (!found) return res.status(404).json({ message: "Payment method not found" });
    await user.save();

    const sorted = [...user.paymentMethods].sort((a, b) =>
      a.isDefault === b.isDefault ? 0 : a.isDefault ? -1 : 1
    );
    return res.status(200).json({ success: true, methods: sorted });
  } catch (error) {
    console.error("Error setting default payment method:", error);
    return res.status(500).json({ message: error.message });
  }
};

exports.getInvoices = async (req, res) => {
  try {
    const userId = req.user.id;
    const bookings = await Booking.find({
      renter: userId,
      status: { $in: ["confirmed", "completed"] },
    })
      .populate("asset", "name")
      .sort({ createdAt: -1 });

    const invoices = bookings.map((b) => ({
      id: b._id,
      bookingId: b._id,
      asset: b.asset?.name || "Unknown Asset",
      dates: `${new Date(b.startDate).toLocaleDateString()} to ${new Date(
        b.endDate
      ).toLocaleDateString()}`,
      amounts: {
        rent: b.price,
        fees: 0,
      },
      status: "paid",
      createdAt: b.createdAt,
    }));

    return res.status(200).json(invoices);
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return res.status(500).json({ message: error.message });
  }
};

exports.getRefunds = async (req, res) => {
  try {
    const userId = req.user.id;
    const refunds = await Transaction.find({
      user: userId,
      type: "refund",
    }).sort({ createdAt: -1 });

    const formattedRefunds = refunds.map((r) => ({
      id: r._id,
      amount: r.amount,
      status: r.status === "completed" ? "resolved" : "in progress",
      timeline: [`${new Date(r.createdAt).toLocaleDateString()}: Refund initiated`],
    }));

    return res.status(200).json(formattedRefunds);
  } catch (error) {
    console.error("Error fetching refunds:", error);
    return res.status(500).json({ message: error.message });
  }
};

exports.testBookingPayment = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const userId = req.user.id;

    if (!bookingId) {
      return res.status(400).json({ message: "bookingId is required" });
    }

    const booking = await Booking.findById(bookingId).populate("owner");
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.renter.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized to pay for this booking" });
    }

    const amountTotal = Math.max(0, booking.price || 0);
    if (amountTotal <= 0) {
      return res.status(400).json({ message: "Invalid booking amount" });
    }

    booking.totalPaid = (booking.totalPaid || 0) + amountTotal;
    if (booking.status === "pending") {
      booking.status = "confirmed";
    }
    await booking.save();

    await Transaction.create({
      user: booking.renter,
      amount: amountTotal,
      currency: "pkr",
      type: "payment",
      status: "completed",
      description: `Test Payment for booking ${booking.name}`,
      booking: booking._id,
      stripePaymentIntentId: `test_pi_${Date.now()}`,
    });

    const owner = await User.findById(booking.owner?._id || booking.owner);
    if (owner) {
      owner.walletBalance = (owner.walletBalance || 0) + amountTotal;
      await owner.save();

      await Transaction.create({
        user: owner._id,
        amount: amountTotal,
        currency: "pkr",
        type: "payout",
        status: "completed",
        description: `Test Earnings from booking ${booking.name}`,
        booking: booking._id,
        stripePaymentIntentId: `test_pi_${Date.now()}`,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Test payment completed successfully",
      amount: amountTotal,
      bookingId: booking._id,
    });
  } catch (error) {
    console.error("Error in test booking payment:", error);
    return res.status(500).json({ message: error.message });
  }
};

exports.testWalletTopup = async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user.id;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.walletBalance = (user.walletBalance || 0) + amount;
    await user.save();

    await Transaction.create({
      user: user._id,
      amount: amount,
      currency: "pkr",
      type: "deposit",
      status: "completed",
      description: "Test Wallet Top-up",
      stripePaymentIntentId: `test_pi_${Date.now()}`,
    });

    return res.status(200).json({
      success: true,
      message: "Test wallet top-up completed successfully",
      amount: amount,
      balance: user.walletBalance,
    });
  } catch (error) {
    console.error("Error in test wallet topup:", error);
    return res.status(500).json({ message: error.message });
  }
};

// Verify payment status from Stripe and update wallet if needed
// This is a fallback in case webhook fails or is delayed
exports.verifyPayment = async (req, res) => {
  try {
    const { sessionId } = req.query;
    const userId = req.user.id;

    if (!sessionId) {
      return res.status(400).json({ message: "Session ID is required" });
    }

    const stripeClient = getStripe();
    
    // Retrieve the checkout session from Stripe
    const session = await stripeClient.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent']
    });

    console.log("🔍 Verifying payment session:", sessionId);
    console.log("Session status:", session.payment_status);
    console.log("Session metadata:", session.metadata);

    // Check if payment was successful
    if (session.payment_status !== 'paid') {
      return res.status(200).json({
        success: false,
        message: "Payment not completed",
        paymentStatus: session.payment_status,
      });
    }

    const { type, userId: metadataUserId } = session.metadata || {};

    // Verify the session belongs to the current user
    if (metadataUserId && metadataUserId !== userId) {
      return res.status(403).json({ message: "Unauthorized: Session does not belong to user" });
    }

    // Check if we've already processed this payment
    const existingTx = await Transaction.findOne({
      stripePaymentIntentId: session.payment_intent,
    });

    if (existingTx) {
      console.log("✅ Payment already processed");
      const user = await User.findById(userId);
      return res.status(200).json({
        success: true,
        message: "Payment already processed",
        balance: user?.walletBalance || 0,
        alreadyProcessed: true,
      });
    }

    // Process wallet topup if type matches
    if (type === "wallet_topup") {
      const amountTotal = (session.amount_total || 0) / 100;
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Update wallet balance
      user.walletBalance = (user.walletBalance || 0) + amountTotal;
      await user.save();
      console.log("✅ Wallet balance updated via verification:", user.walletBalance);

      // Create transaction record
      const tx = await Transaction.create({
        user: user._id,
        amount: amountTotal,
        currency: session.currency || "pkr",
        type: "deposit",
        status: "completed",
        description: "Wallet Top-up",
        stripePaymentIntentId: session.payment_intent,
      });
      console.log("✅ Transaction created via verification:", tx._id);

      return res.status(200).json({
        success: true,
        message: "Payment verified and wallet updated",
        balance: user.walletBalance,
        amount: amountTotal,
        alreadyProcessed: false,
      });
    }

    // For booking payments, just verify status
    if (type === "booking_payment") {
      return res.status(200).json({
        success: true,
        message: "Booking payment verified",
        paymentStatus: session.payment_status,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified",
      paymentStatus: session.payment_status,
    });
  } catch (error) {
    console.error("❌ Error verifying payment:", error);
    return res.status(500).json({ message: error.message });
  }
};