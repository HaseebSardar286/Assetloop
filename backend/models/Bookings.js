const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    renter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Asset",
      required: true,
    },
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    totalPaid: { type: Number, default: 0 },
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "active",
        "expiring soon",
        "overdue",
        "completed",
        "cancelled",
      ],
      default: "pending",
    },
    review: { type: mongoose.Schema.Types.ObjectId, ref: "Review" },
    address: { type: String },
    imageUrl: { type: String },
    category: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
