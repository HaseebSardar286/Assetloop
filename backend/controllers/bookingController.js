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
        asset.images && asset.images.length > 0 ? asset.images[0] : undefined,
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
            firstName: booking.renter.firstName,
            middleName: booking.renter.middleName,
            lastName: booking.renter.lastName,
            email: booking.renter.email,
            contact: booking.renter.phoneNumber || booking.renter.email,
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
    const renterId = req.user.id;
    console.log("Fetching bookings for renter:", renterId);
    
    const bookings = await Booking.find({ renter: renterId })
      .populate("asset owner review")
      .lean();
    
    console.log(`Fetched ${bookings.length} bookings for renter ${renterId}`);
    console.log("Booking statuses:", bookings.map(b => ({ id: b._id, status: b.status, endDate: b.endDate })));
    
    const formattedBookings = bookings.map((booking) => {
      // Handle case where owner might not be populated
      let ownerData = {
        name: "Unknown Owner",
        contact: "N/A",
      };
      
      if (booking.owner) {
        if (typeof booking.owner === 'object') {
          ownerData = {
            name: `${booking.owner.firstName || ''} ${booking.owner.lastName || ''}`.trim() || "Unknown Owner",
            contact: booking.owner.email || "N/A",
          };
        }
      }
      
      return {
        id: booking._id,
        _id: booking._id,
        name: booking.name,
        description: booking.description,
        price: booking.price,
        owner: ownerData,
        startDate: booking.startDate,
        endDate: booking.endDate,
        status: booking.status,
        totalPaid: booking.totalPaid || 0,
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
      };
    });
    
    console.log(`Returning ${formattedBookings.length} formatted bookings`);
    res.status(200).json(formattedBookings);
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
        renter: booking.renter
          ? {
              _id: booking.renter._id,
              firstName: booking.renter.firstName,
              lastName: booking.renter.lastName,
              email: booking.renter.email,
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
        asset: booking.asset
          ? {
              name: booking.asset.name,
              address: booking.asset.address,
              price: booking.asset.price,
            }
          : undefined,
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

    // Validate input
    if (!bookingId) {
      return res.status(400).json({ message: "Booking ID is required" });
    }
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    // Find booking and check if it belongs to the renter
    const booking = await Booking.findOne({
      _id: bookingId,
      renter: req.user.id,
    });

    if (!booking) {
      return res
        .status(404)
        .json({ message: "Booking not found or you are not authorized to review this booking" });
    }

    // Check if booking is reviewable (completed or past end date)
    const now = new Date();
    const isPastEndDate = booking.endDate && new Date(booking.endDate) < now;
    const isCompleted = booking.status === "completed";
    
    if (!isCompleted && !isPastEndDate) {
      return res
        .status(400)
        .json({ message: "You can only review completed bookings or bookings that have ended" });
    }

    // Check if review already exists
    if (booking.review) {
      return res
        .status(400)
        .json({ message: "You have already reviewed this booking" });
    }

    // Get owner from booking
    await booking.populate("owner");
    const ownerId = booking.owner?._id || booking.owner;

    // Create review
    const review = new Review({
      rental: bookingId,
      renter: req.user.id,
      owner: ownerId,
      rating,
      comment: comment || "",
    });
    await review.save();

    // Link review to booking
    booking.review = review._id;
    await booking.save();

    // Populate review for response
    await review.populate("renter", "firstName lastName");

    console.log("Review added for booking:", bookingId);
    res.status(201).json({ 
      message: "Review added successfully", 
      review: {
        _id: review._id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
        renter: {
          firstName: review.renter.firstName,
          lastName: review.renter.lastName,
        }
      }
    });
  } catch (error) {
    console.error("Error in addReview:", error);
    res.status(500).json({ message: error.message || "Failed to add review" });
  }
};
