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
    startDate: { type: String, required: false },
    endDate: { type: String, required: false },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    availability: {
      type: String,
      enum: ["Available", "Unavailable"],
      default: "Available",
    },
    category: {
      type: String,
      enum: ['Car', 'Apartment', 'House', 'Tool', 'Electronics'],
      required: true,
    },
    capacity: { type: Number, required: true },
    images: [{ type: String }], // Array of Supabase URLs
    features: [{ type: String }],
    amenities: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Asset", assetSchema);
