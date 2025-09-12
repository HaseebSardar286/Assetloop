const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const User = require("../models/User");
const Asset = require("../models/Asset");
const Booking = require("../models/Bookings");
const Review = require("../models/Review");

const router = express.Router();

// Apply authentication and admin role middleware to all routes
router.use(authMiddleware);
router.use(roleMiddleware(["admin"]));

// Dashboard statistics
router.get("/dashboard-stats", async (req, res) => {
  try {
    const [totalUsers, totalAssets, totalBookings, totalReviews] = await Promise.all([
      User.countDocuments(),
      Asset.countDocuments(),
      Booking.countDocuments(),
      Review.countDocuments()
    ]);

    const usersByRole = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } }
    ]);

    const bookingsByStatus = await Booking.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    res.json({
      totalUsers,
      totalAssets,
      totalBookings,
      totalReviews,
      usersByRole,
      bookingsByStatus
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// User management
router.get("/users", async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    const query = {};
    
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    const users = await User.find(query)
      .select("-password")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalUsers: total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get specific user
router.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user
router.put("/users/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select("-password");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete user
router.delete("/users/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Asset management
router.get("/assets", async (req, res) => {
  try {
    const { page = 1, limit = 10, status, category, search } = req.query;
    const query = {};
    
    if (status) query.status = status;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } }
      ];
    }

    const assets = await Asset.find(query)
      .populate("owner", "firstName lastName email")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Asset.countDocuments(query);

    res.json({
      assets,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalAssets: total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update asset status
router.put("/assets/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const asset = await Asset.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!asset) {
      return res.status(404).json({ message: "Asset not found" });
    }
    
    res.json(asset);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Booking management
router.get("/bookings", async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const query = {};
    
    if (status) query.status = status;

    const bookings = await Booking.find(query)
      .populate("asset", "name address")
      .populate("owner", "firstName lastName email")
      .populate("renter", "firstName lastName email")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Booking.countDocuments(query);

    res.json({
      bookings,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalBookings: total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Review management
router.get("/reviews", async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const reviews = await Review.find()
      .populate("rental", "name")
      .populate("renter", "firstName lastName email")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Review.countDocuments();

    res.json({
      reviews,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalReviews: total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete review
router.delete("/reviews/:id", async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }
    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;