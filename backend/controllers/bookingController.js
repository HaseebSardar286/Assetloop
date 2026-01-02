const Booking = require("../models/Bookings");
const Review = require("../models/Review");
const Asset = require("../models/Asset");
const User = require("../models/User");
const SystemSettings = require("../models/SystemSettings");

exports.createBooking = async (req, res) => {
  try {
    // Check maintenance mode
    const settings = await SystemSettings.findOne({ _id: "system-settings" });
    if (settings?.maintenanceMode) {
      return res.status(503).json({ 
        message: "System is under maintenance. Please try again later." 
      });
    }

    // Check booking request limit
    if (settings?.maxRequestsPerUser) {
      const pendingBookingsCount = await Booking.countDocuments({ 
        renter: req.user.id, 
        status: { $in: ['pending', 'confirmed'] } 
      });
      if (pendingBookingsCount >= settings.maxRequestsPerUser) {
        return res.status(403).json({ 
          message: `You have reached the maximum limit of ${settings.maxRequestsPerUser} active booking requests per user.` 
        });
      }
    }

    const { assetId, startDate, endDate, notes } = req.body;
    const renterId = req.user.id;

    console.log("Creating booking for renter:", renterId, "asset:", assetId);
    const asset = await Asset.findById(assetId).populate("owner");
    if (!asset) {
      return res.status(404).json({ message: "Asset not found" });
    }

    if (!asset.owner || !asset.owner._id) {
      return res.status(400).json({ message: "Asset owner information is invalid" });
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

    // Safely handle owner data
    let ownerData = { name: "Unknown", contact: "" };
    if (booking.owner && typeof booking.owner === 'object') {
      ownerData = {
        name: `${booking.owner.firstName || ''} ${booking.owner.lastName || ''}`.trim() || "Unknown",
        contact: booking.owner.email || "",
      };
    }

    res.status(201).json({
      message: "Booking created successfully",
      booking: {
        id: booking._id,
        _id: booking._id,
        name: booking.name,
        description: booking.description,
        price: booking.price,
        owner: ownerData,
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
      requester: booking.renter && typeof booking.renter === 'object'
        ? {
            firstName: booking.renter.firstName || '',
            middleName: booking.renter.middleName || '',
            lastName: booking.renter.lastName || '',
            email: booking.renter.email || '',
            contact: booking.renter.phoneNumber || booking.renter.email || '',
          }
        : undefined,
      startDate: booking.startDate,
      endDate: booking.endDate,
      status: booking.status,
      totalPaid: booking.totalPaid,
      requestDate: booking.requestDate || booking.createdAt,
      address: booking.address,
        imageUrl: booking.imageUrl || '',
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
        imageUrl: booking.imageUrl || '',
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

exports.getBookingById = async (req, res) => {
  try {
    const bookingId = req.params.id;
    console.log("🔍 getBookingById called with bookingId:", bookingId);
    
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const userId = req.user.id;
    const userRole = req.user.role;
    console.log("👤 User:", userId, "Role:", userRole);

    if (!bookingId) {
      return res.status(400).json({ message: "Booking ID is required" });
    }

    const booking = await Booking.findById(bookingId)
      .populate("asset owner renter review")
      .lean();

    console.log("📦 Booking found:", booking ? "Yes" : "No");

    if (!booking) {
      console.log("❌ Booking not found for ID:", bookingId);
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check if user has permission to view this booking
    const renterId = booking.renter?._id?.toString() || booking.renter?.toString() || null;
    const ownerId = booking.owner?._id?.toString() || booking.owner?.toString() || null;
    
    console.log("🔐 Permission check - User:", userId, "Renter:", renterId, "Owner:", ownerId, "UserRole:", userRole);
    
    const isRenter = userRole === 'renter' && renterId && renterId === userId;
    const isOwner = userRole === 'owner' && ownerId && ownerId === userId;
    const isAdmin = userRole === 'admin';

    console.log("✅ Permission result - isRenter:", isRenter, "isOwner:", isOwner, "isAdmin:", isAdmin);

    if (!isRenter && !isOwner && !isAdmin) {
      console.log("❌ Unauthorized access attempt");
      return res.status(403).json({ message: "Unauthorized to view this booking" });
    }

    // Handle owner data
    let ownerData = {
      name: "Unknown Owner",
      contact: "N/A",
    };
    if (booking.owner) {
      if (typeof booking.owner === 'object') {
        ownerData = {
          _id: booking.owner._id,
          name: `${booking.owner.firstName || ''} ${booking.owner.lastName || ''}`.trim() || "Unknown Owner",
          contact: booking.owner.email || "N/A",
          firstName: booking.owner.firstName || '',
          lastName: booking.owner.lastName || '',
          email: booking.owner.email || '',
        };
      }
    }

    // Handle renter data
    let renterData = null;
    if (booking.renter) {
      if (typeof booking.renter === 'object') {
        renterData = {
          _id: booking.renter._id,
          firstName: booking.renter.firstName || '',
          lastName: booking.renter.lastName || '',
          email: booking.renter.email || '',
          name: `${booking.renter.firstName || ''} ${booking.renter.lastName || ''}`.trim() || "Unknown Renter",
        };
      }
    }

    // Handle asset data
    let assetData = null;
    if (booking.asset) {
      if (typeof booking.asset === 'object' && booking.asset._id) {
        assetData = {
          _id: booking.asset._id,
          name: booking.asset.name || '',
          address: booking.asset.address || '',
          price: booking.asset.price || 0,
          images: booking.asset.images || [],
          category: booking.asset.category || '',
          description: booking.asset.description || '',
          amenities: booking.asset.amenities || [],
        };
      } else if (typeof booking.asset === 'string') {
        assetData = {
          _id: booking.asset,
        };
      }
    }

    res.status(200).json({
      id: booking._id,
      _id: booking._id,
      name: booking.name,
      description: booking.description,
      price: booking.price,
      owner: ownerData,
      renter: renterData,
      asset: assetData,
      startDate: booking.startDate,
      endDate: booking.endDate,
      status: booking.status,
      totalPaid: booking.totalPaid || 0,
      review: booking.review && typeof booking.review === 'object'
        ? {
            rating: booking.review.rating,
            comment: booking.review.comment,
          }
        : undefined,
      requestDate: booking.requestDate || booking.createdAt,
      address: booking.address,
      imageUrl: booking.imageUrl || '',
      category: booking.category,
      notes: booking.notes,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
    });
  } catch (error) {
    console.error("Error in getBookingById:", error);
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
        renter: booking.renter && typeof booking.renter === 'object' && booking.renter._id
          ? {
              _id: booking.renter._id,
              firstName: booking.renter.firstName || '',
              lastName: booking.renter.lastName || '',
              email: booking.renter.email || '',
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
        imageUrl: booking.imageUrl || '',
        category: booking.category,
        notes: booking.notes,
        createdAt: booking.createdAt,
        asset: booking.asset && typeof booking.asset === 'object'
          ? {
              name: booking.asset.name || '',
              address: booking.asset.address || '',
              price: booking.asset.price || 0,
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
        renter: review.renter && typeof review.renter === 'object'
          ? {
              firstName: review.renter.firstName || '',
              lastName: review.renter.lastName || '',
            }
          : { firstName: '', lastName: '' }
      }
    });
  } catch (error) {
    console.error("Error in addReview:", error);
    res.status(500).json({ message: error.message || "Failed to add review" });
  }
};
