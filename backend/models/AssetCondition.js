const mongoose = require("mongoose");

const assetConditionSchema = new mongoose.Schema(
    {
        booking: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Booking",
            required: true,
            unique: true,
        },
        // Owner uploads before handover
        beforeImages: [
            {
                url: { type: String, required: true },
                uploadedAt: { type: Date, default: Date.now },
            },
        ],
        // Renter uploads after return
        afterImages: [
            {
                url: { type: String, required: true },
                uploadedAt: { type: Date, default: Date.now },
            },
        ],
        beforeConditionUploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        afterConditionUploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        status: {
            type: String,
            enum: ["PENDING", "BEFORE_UPLOADED", "COMPLETED"], // COMPLETED means both uploaded or cycle finished
            default: "PENDING",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("AssetCondition", assetConditionSchema);
