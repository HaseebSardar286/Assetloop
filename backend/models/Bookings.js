const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
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
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    price: { type: Number, required: true }, // Price for the booking period
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
    review: { type: String }, // Optional review field
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
