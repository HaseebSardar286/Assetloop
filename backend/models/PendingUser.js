const mongoose = require("mongoose");

const pendingUserSchema = new mongoose.Schema(
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
    verification: {
      fullName: { type: String },
      dateOfBirth: { type: Date },
      issueDate: { type: Date },
      expiryDate: { type: Date },
      cnicNumber: { type: String },
      address: { type: String },
      idFront: { type: String },
      idBack: { type: String },
      selfie: { type: String },
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PendingUser", pendingUserSchema);
