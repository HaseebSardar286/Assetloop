const Booking = require("../models/Bookings");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
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
        type: "booking_payment",
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
        const { bookingId, type, userId } = session.metadata || {};

        if (type === "booking_payment" && bookingId) {
          const booking = await Booking.findById(bookingId).populate("owner");
          if (booking) {
            // Mark as paid/confirmed and update totalPaid
            const amountTotal = (session.amount_total || 0) / 100;
            booking.totalPaid = (booking.totalPaid || 0) + amountTotal;
            if (booking.status === "pending") {
              booking.status = "confirmed";
            }
            await booking.save();

            // 1) Renter transaction: payment
            await Transaction.create({
              user: booking.renter,
              amount: amountTotal,
              currency: session.currency,
              type: "payment",
              status: "completed",
              description: `Payment for booking ${booking.name}`,
              booking: booking._id,
              stripePaymentIntentId: session.payment_intent,
            });

            // 2) Owner wallet & transaction: earning / payout
            const owner = await User.findById(booking.owner?._id || booking.owner);
            if (owner) {
              owner.walletBalance = (owner.walletBalance || 0) + amountTotal;
              await owner.save();

              await Transaction.create({
                user: owner._id,
                amount: amountTotal,
                currency: session.currency,
                type: "payout", // earning for owner, withdrawable later
                status: "completed",
                description: `Earnings from booking ${booking.name}`,
                booking: booking._id,
                stripePaymentIntentId: session.payment_intent,
              });
            }
          }
        } else if (type === "wallet_topup" && userId) {
          const user = await User.findById(userId);
          if (user) {
            const amountTotal = (session.amount_total || 0) / 100;
            user.walletBalance = (user.walletBalance || 0) + amountTotal;
            await user.save();

            await Transaction.create({
              user: user._id,
              amount: amountTotal,
              currency: session.currency,
              type: "deposit",
              status: "completed",
              description: "Wallet Top-up",
              stripePaymentIntentId: session.payment_intent,
            });
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
            currency,
            product_data: {
              name: "Wallet Top-up",
              description: "Add funds to your AssetLoop wallet",
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId,
        type: "wallet_topup",
      },
      // Redirect back to the main payments page (tabbed wallet UI)
      // so the route definitely exists in the Angular app.
      success_url:
        successUrl ||
        "http://localhost:4200/payments?status=success&source=wallet_topup",
      cancel_url:
        cancelUrl ||
        "http://localhost:4200/payments?status=cancelled&source=wallet_topup",
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

    // For now, just deduct balance and create a withdrawal transaction
    // In real app, this would trigger a Stripe Connect payout
    user.walletBalance -= amount;
    await user.save();

    await Transaction.create({
      user: userId,
      amount: -amount,
      currency: "pkr",
      type: "withdrawal",
      status: "completed", // Assume instant for mock
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
      // Handle wallet payment method
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
      // Handle card payment method
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
      // reset defaults
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
    // Invoices are essentially completed bookings or specific payment transactions
    // For this implementation, we'll treat completed bookings as invoices
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
        fees: 0, // Placeholder
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
    // Fetch transactions of type 'refund'
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

// Test payment endpoints (simulate successful payments without Stripe)
// These are useful for development/testing without needing Stripe CLI or webhooks
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

    // Simulate successful payment - update booking
    booking.totalPaid = (booking.totalPaid || 0) + amountTotal;
    if (booking.status === "pending") {
      booking.status = "confirmed";
    }
    await booking.save();

    // Create renter transaction
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

    // Credit owner wallet
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

    // Simulate successful top-up
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
