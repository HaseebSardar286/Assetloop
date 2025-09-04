const mongoose = require("mongoose");

const assetSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    address: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["available", "unavailable"],
      default: "available",
    },
    capacity: { type: Number },
    features: [{ type: String }],
    image: [{ type: String }],
    amenities: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Asset", assetSchema);
