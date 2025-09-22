const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    middleName: { type: String },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["owner", "renter", "admin"], required: true },
    phoneNumber: { type: String },
    country: { type: String },
    city: { type: String },
    address: { type: String },
    totalSpent: { type: Number, default: 0 },
    terms: { type: Boolean, default: false },
    notificationSettings: {
      emailEnabled: { type: Boolean, default: true },
      smsEnabled: { type: Boolean, default: false },
      inAppEnabled: { type: Boolean, default: true },
      pushEnabled: { type: Boolean, default: false },
      newBookings: { type: Boolean, default: true },
      bookingConfirmations: { type: Boolean, default: true },
      bookingCancellations: { type: Boolean, default: true },
      activeReminders: { type: Boolean, default: true },
      completedBookings: { type: Boolean, default: true },
      pendingReviews: { type: Boolean, default: true },
      assetStatusChanges: { type: Boolean, default: true },
      paymentUpdates: { type: Boolean, default: true },
      systemUpdates: { type: Boolean, default: true },
      frequency: {
        type: String,
        enum: ["immediate", "daily", "weekly"],
        default: "immediate",
      },
      reminderThreshold: { type: Number, default: 1 },
      email: { type: String },
      phoneNumber: { type: String },
    },
    verification: {
      fullName: { type: String },
      dateOfBirth: { type: Date },
      issueDate: { type: Date },
      expiryDate: { type: Date },
      cnicNumber: { type: String },
      address: { type: String },
      idFront: { type: String }, // Base64 string
      idBack: { type: String }, // Base64 string
      selfie: { type: String }, // Base64 string
    },
    verificationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
