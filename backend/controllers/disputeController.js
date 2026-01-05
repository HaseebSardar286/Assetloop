const Dispute = require("../models/Dispute");
const Booking = require("../models/Bookings");

exports.createDispute = async (req, res) => {
    try {
        const { bookingId, reason } = req.body;
        const userId = req.user.id;

        if (!bookingId || !reason) {
            return res.status(400).json({ message: "Booking ID and reason are required" });
        }

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        // Verify user is part of the booking
        if (
            booking.owner.toString() !== userId &&
            booking.renter.toString() !== userId
        ) {
            return res.status(403).json({ message: "You are not authorized to raise a dispute for this booking" });
        }

        const dispute = await Dispute.create({
            booking: bookingId,
            raisedBy: userId,
            reason,
        });

        res.status(201).json(dispute);
    } catch (error) {
        console.error("Error creating dispute:", error);
        res.status(500).json({ message: error.message });
    }
};

exports.getDisputes = async (req, res) => {
    try {
        const userId = req.user.id;
        const disputes = await Dispute.find({ raisedBy: userId })
            .populate({
                path: 'booking',
                populate: { path: 'asset' }
            })
            .sort({ createdAt: -1 });
        res.json(disputes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin functions
exports.getAllDisputes = async (req, res) => {
    try {
        const disputes = await Dispute.find()
            .populate('raisedBy', 'firstName lastName email')
            .populate({
                path: 'booking',
                populate: { path: 'asset owner renter' }
            })
            .sort({ createdAt: -1 });
        res.json(disputes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.resolveDispute = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminComments } = req.body;

        const dispute = await Dispute.findByIdAndUpdate(
            id,
            { status, adminComments },
            { new: true }
        );

        if (!dispute) {
            return res.status(404).json({ message: "Dispute not found" });
        }

        res.json(dispute);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
