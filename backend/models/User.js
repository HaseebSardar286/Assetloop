const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    middleName: { type: String },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phoneNumber: { type: String },
    country: { type: String },
    address: { type: String },
    city: { type: String },
    role: {
      type: String,
      enum: ["owner", "renter", "admin"],
      required: true,
    },
    totalSpent: { type: Number, default: 0 },
    notificationSettings: {
      emailEnabled: { type: Boolean, default: true },
      smsEnabled: { type: Boolean, default: false },
      inAppEnabled: { type: Boolean, default: true },
      pushEnabled: { type: Boolean, default: false },
      newBookings: { type: Boolean, default: true },
      bookingConfirmations: { type: Boolean, default: true },
      bookingCancellations: { type: Boolean, default: true },
      activeReminders: { type: Boolean, default: true },
      completedBookings: { type: Boolean, default: false },
      pendingReviews: { type: Boolean, default: true },
      assetStatusChanges: { type: Boolean, default: true },
      paymentUpdates: { type: Boolean, default: true },
      systemUpdates: { type: Boolean, default: false },
      frequency: {
        type: String,
        enum: ["immediate", "daily", "weekly"],
        default: "immediate",
      },
      reminderThreshold: { type: Number, default: 1 }, // Days before/after
      email: { type: String, default: "" }, // Override profile email
      phoneNumber: { type: String, default: "" }, // For SMS
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
