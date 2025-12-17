const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        currency: {
            type: String,
            default: "pkr",
        },
        type: {
            type: String,
            enum: ["payment", "deposit", "withdrawal", "refund", "payout"],
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "completed", "failed", "cancelled"],
            default: "pending",
        },
        description: {
            type: String,
        },
        booking: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Booking",
        },
        stripePaymentIntentId: {
            type: String,
        },
        stripeTransferId: {
            type: String,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
