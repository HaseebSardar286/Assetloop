const mongoose = require("mongoose");

const assetSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true },
    address: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    startDate: { type: String, required: false }, // Optional
    endDate: { type: String, required: false }, // Optional
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    availability: {
      type: String,
      enum: ["available", "unavailable"],
      default: "available",
    },
    category: {
      type: String,
      enum: ["car", "apartment", "house", "tool"],
      required: true,
    },
    capacity: { type: Number, required: true },
    images: [{ type: Buffer }], // Array of file paths
    features: [{ type: String }],
    amenities: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Asset", assetSchema);
