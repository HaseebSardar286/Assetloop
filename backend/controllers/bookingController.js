const Booking = require("../models/Bookings");
const Review = require("../models/Review");
const Asset = require("../models/Asset");
const User = require("../models/User");

exports.createBooking = async (req, res) => {
  try {
    const { assetId, startDate, endDate, notes } = req.body;
    const renterId = req.user.id;

    console.log("Creating booking for renter:", renterId, "asset:", assetId);
    const asset = await Asset.findById(assetId).populate("owner");
    if (!asset) {
      return res.status(404).json({ message: "Asset not found" });
    }

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
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    console.log("Updating booking status:", { id, status, userId });

    // Verify that the user is the owner of the booking
    const booking = await Booking.findOne({ _id: id, owner: userId });
    if (!booking) {
      console.log("Booking not found or user is not owner:", { id, userId });
      return res
        .status(404)
        .json({ message: "Booking not found or you are not the owner" });
    }

    // Validate status
    const validStatuses = ["confirmed", "cancelled"];
    if (!validStatuses.includes(status)) {
      console.log("Invalid status provided:", status);
      return res.status(400).json({ message: "Invalid status value" });
    }

    // Update status
    booking.status = status;
    await booking.save();

    // Populate renter for response
    await booking.populate("renter");

    console.log(
      "Booking updated successfully:",
      booking._id,
      "new status:",
      status
    );

    res.status(200).json({
      id: booking._id,
      _id: booking._id,
      name: booking.name,
      description: booking.description,
      price: booking.price,
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
      requestDate: booking.requestDate || booking.createdAt,
      address: booking.address,
      imageUrl:
        booking.imageUrl && booking.imageUrl.startsWith("/uploads/")
          ? `http://localhost:${process.env.PORT || 5000}${booking.imageUrl}`
          : booking.imageUrl,
      category: booking.category,
      notes: booking.notes,
      createdAt: booking.createdAt,
    });
  } catch (error) {
    console.error("Error in updateBookingStatus:", error);
    res.status(400).json({ message: error.message });
  }
};

exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ renter: req.user.id })
      .populate("asset owner review")
      .lean();
    console.log("Fetched renter bookings:", bookings.length);
    res.status(200).json(
      bookings.map((booking) => ({
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
        review: booking.review
          ? {
              rating: booking.review.rating,
              comment: booking.review.comment,
            }
          : undefined,
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
    console.error("Error in getBookings:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getOwnerBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ owner: req.user.id })
      .populate("asset renter review")
      .lean();
    console.log("Fetched owner bookings:", bookings.length);
    res.status(200).json(
      bookings.map((booking) => ({
        id: booking._id,
        _id: booking._id,
        name: booking.name,
        description: booking.description,
        price: booking.price,
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
    console.error("Error in getOwnerBookings:", error);
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
    console.log("Booking cancelled:", booking._id);
    res.status(200).json({ message: "Booking cancelled", booking });
  } catch (error) {
    console.error("Error in cancelBooking:", error);
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
    console.log("Review added for booking:", bookingId);
    res.status(201).json({ message: "Review added", review });
  } catch (error) {
    console.error("Error in addReview:", error);
    res.status(500).json({ message: error.message });
  }
};
