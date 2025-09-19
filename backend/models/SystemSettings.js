const mongoose = require("mongoose");

const systemSettingsSchema = new mongoose.Schema(
  {
    _id: { type: String, default: "system-settings" }, // Explicitly set _id as String
    platformName: { type: String, required: true, default: "Rental Platform" },
    emailNotifications: { type: Boolean, default: true },
    notificationFrequency: {
      type: String,
      enum: ["daily", "weekly", "instant"],
      default: "daily",
    },
    currency: { type: String, enum: ["PKR", "USD", "EUR"], default: "PKR" },
    timezone: {
      type: String,
      enum: ["Asia/Karachi", "UTC", "America/New_York"],
      default: "Asia/Karachi",
    },
    maintenanceMode: { type: Boolean, default: false },
    maxListingsPerUser: { type: Number, default: 10, min: 1, max: 50 },
    maxRequestsPerUser: { type: Number, default: 5, min: 1, max: 50 },
    sessionTimeout: { type: Number, default: 30, min: 15, max: 60 },
    twoFactorAuth: { type: Boolean, default: true },
    allowedFileTypes: { type: String, default: "jpg,png,pdf" },
    defaultLanguage: { type: String, enum: ["en", "ur"], default: "en" },
    theme: { type: String, enum: ["light", "dark"], default: "light" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SystemSettings", systemSettingsSchema);
