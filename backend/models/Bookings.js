const mongoose = require("mongoose");

const bookingSchema = mongoose.Schema(
  {
    renter: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    asset: { type: mongoose.Schema.Types.ObjectId, ref: "Assets" },
    startDate: { type: Date },
    endDate: { type: Date },
    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "rejected",
        "cancelled",
        "expired",
        "completed",
      ],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Bookings", bookingSchema);
