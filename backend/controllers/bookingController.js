const Booking = require("../models/Bookings");
const Review = require("../models/Review");
const Asset = require("../models/Asset");
const User = require("../models/User");

exports.createBooking = async (req, res) => {
  try {
    const { assetId, startDate, endDate, notes } = req.body;
    const renterId = req.user.id;

    // Find the asset and its owner
    const asset = await Asset.findById(assetId).populate("owner");
    if (!asset) {
      return res.status(404).json({ message: "Asset not found" });
    }

    // Create the booking
    const booking = new Booking({
      renter: renterId,
      owner: asset.owner._id,
      asset: assetId,
      name: asset.name,
      description: asset.description,
      price: asset.price,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      address: asset.address,
      imageUrl:
        asset.images && asset.images.length > 0
          ? `data:image/png;base64,${asset.images[0].toString("base64")}`
          : undefined,
      category: asset.category,
      notes: notes || "",
      status: "pending",
      // NEW: Explicitly set requestDate for frontend
      requestDate: new Date(),
    });

    await booking.save();
    await booking.populate("asset owner");

    res.status(201).json({
      message: "Booking created successfully",
      booking: {
        id: booking._id,
        _id: booking._id,
        name: booking.name,
        description: booking.description,
        price: booking.price,
        owner: {
          name: booking.owner.firstName + " " + booking.owner.lastName,
          contact: booking.owner.email,
        },
        startDate: booking.startDate,
        endDate: booking.endDate,
        status: booking.status,
        totalPaid: booking.totalPaid,
        // NEW: Include requestDate in response
        requestDate: booking.requestDate,
        address: booking.address,
        imageUrl: booking.imageUrl,
        category: booking.category,
        notes: booking.notes,
        createdAt: booking.createdAt,
      },
    });
  } catch (error) {
    console.error("Error in createBooking:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ renter: req.user.id })
      .populate("asset owner review")
      .lean();
    res.status(200).json(
      bookings.map((booking) => ({
        id: booking._id,
        _id: booking._id, // For compatibility
        name: booking.name,
        description: booking.description,
        price: booking.price,
        owner: {
          name: booking.owner.firstName + " " + booking.owner.lastName,
          contact: booking.owner.email,
        },
        startDate: booking.startDate,
        endDate: booking.endDate,
        status: booking.status,
        totalPaid: booking.totalPaid,
        review: booking.review
          ? {
              rating: booking.review.rating,
              comment: booking.review.comment,
            }
          : undefined,
        // NEW: Include requestDate with fallback to createdAt
        requestDate: booking.requestDate || booking.createdAt,
        address: booking.address,
        imageUrl:
          booking.imageUrl && booking.imageUrl.startsWith("/uploads/")
            ? `http://localhost:${process.env.PORT || 5000}${booking.imageUrl}`
            : booking.imageUrl,
        category: booking.category,
        notes: booking.notes,
        createdAt: booking.createdAt,
      }))
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Owner view of bookings (pending/confirmed/etc.) for their assets
exports.getOwnerBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ owner: req.user.id })
      .populate("asset renter review")
      .lean();
    res.status(200).json(
      bookings.map((booking) => ({
        id: booking._id,
        _id: booking._id,
        name: booking.name,
        description: booking.description,
        price: booking.price,
        // CHANGED: Renamed 'renter' to 'requester' to match frontend interface
        requester: booking.renter
          ? {
              name: `${booking.renter.firstName} ${booking.renter.lastName}`,
              contact: booking.renter.email,
            }
          : undefined,
        startDate: booking.startDate,
        endDate: booking.endDate,
        status: booking.status,
        totalPaid: booking.totalPaid,
        review: booking.review
          ? { rating: booking.review.rating, comment: booking.review.comment }
          : undefined,
        // NEW: Include requestDate with fallback to createdAt
        requestDate: booking.requestDate || booking.createdAt,
        address: booking.address,
        imageUrl:
          booking.imageUrl && booking.imageUrl.startsWith("/uploads/")
            ? `http://localhost:${process.env.PORT || 5000}${booking.imageUrl}`
            : booking.imageUrl,
        category: booking.category,
        notes: booking.notes,
        createdAt: booking.createdAt,
      }))
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.id, renter: req.user.id, status: "pending" },
      { status: "cancelled" },
      { new: true }
    );
    if (!booking)
      return res
        .status(404)
        .json({ message: "Booking not found or not cancellable" });
    res.status(200).json({ message: "Booking cancelled", booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addReview = async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;
    const booking = await Booking.findOne({
      _id: bookingId,
      renter: req.user.id,
      status: "completed",
    });
    if (!booking)
      return res
        .status(404)
        .json({ message: "Booking not found or not reviewable" });

    const review = new Review({
      rental: bookingId,
      renter: req.user.id,
      rating,
      comment,
    });
    await review.save();
    booking.review = review._id;
    await booking.save();
    res.status(201).json({ message: "Review added", review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
