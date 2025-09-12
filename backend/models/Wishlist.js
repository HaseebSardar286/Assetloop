const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema(
    {
        renter: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        asset: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Asset",
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Wishlist", wishlistSchema);
