const User = require("../models/User");
const Asset = require("../models/Asset");
const Booking = require("../models/Bookings");
const Review = require("../models/Review");
const SystemSettings = require("../models/SystemSettings");

// Dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalAssets, totalBookings, totalReviews] =
      await Promise.all([
        User.countDocuments(),
        Asset.countDocuments(),
        Booking.countDocuments(),
        Review.countDocuments(),
      ]);

    const usersByRole = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);

    const bookingsByStatus = await Booking.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    res.json({
      totalUsers,
      totalAssets,
      totalBookings,
      totalReviews,
      usersByRole,
      bookingsByStatus,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// User management
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password -__v")
      .sort({ createdAt: -1 });
    const totalUsers = users.length;
    res.status(200).json({ users, totalUsers });
  } catch (error) {
    res
      .status(500)
      .json({ message: `Failed to fetch users: ${error.message}` });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Asset management
exports.getAssets = async (req, res) => {
  try {
    const { status, category, search } = req.query;
    const query = {};

    if (status) query.status = status;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
      ];
    }

    const assets = await Asset.find(query)
      .populate("owner", "firstName lastName email middleName")
      .sort({ createdAt: -1 });

    const total = await Asset.countDocuments(query);

    res.json({
      assets,
      totalAssets: total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateAssetStatus = async (req, res) => {
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
};

exports.deleteAsset = async (req, res) => {
  try {
    const asset = await Asset.findByIdAndDelete(req.params.id);
    if (!asset) {
      return res.status(404).json({ message: "Asset not found" });
    }
    res.json({ message: "Asset deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Booking management
exports.getAllBookings = async (req, res) => {
  try {
    const { search } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { "asset.name": { $regex: search, $options: "i" } },
        { "owner.firstName": { $regex: search, $options: "i" } },
        { "owner.middleName": { $regex: search, $options: "i" } },
        { "owner.lastName": { $regex: search, $options: "i" } },
        { "renter.firstName": { $regex: search, $options: "i" } },
        { "renter.middleName": { $regex: search, $options: "i" } },
        { "renter.lastName": { $regex: search, $options: "i" } },
      ];
    }

    const bookings = await Booking.find(query)
      .populate("asset", "name address")
      .populate("owner", "firstName lastName email middleName")
      .populate("renter", "firstName lastName email middleName")
      .sort({ createdAt: -1 });

    const total = await Booking.countDocuments(query);

    res.json({
      bookings,
      totalBookings: total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Review management
exports.getAllReviews = async (req, res) => {
  try {
    const { search } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { "rental.name": { $regex: search, $options: "i" } },
        { "renter.firstName": { $regex: search, $options: "i" } },
        { "renter.middleName": { $regex: search, $options: "i" } },
        { "renter.lastName": { $regex: search, $options: "i" } },
      ];
    }

    const reviews = await Review.find(query)
      .populate("rental", "name")
      .populate("renter", "firstName lastName email middleName")
      .populate("owner", "firstName lastName email middleName")
      .sort({ createdAt: -1 });

    const total = await Review.countDocuments(query);

    res.json({
      reviews,
      totalReviews: total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }
    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// System settings
exports.getSystemSettings = async (req, res) => {
  try {
    let settings = await SystemSettings.findOne({ _id: "system-settings" });
    if (!settings) {
      console.log("Creating default system settings");
      settings = await SystemSettings.create({ _id: "system-settings" });
    }
    res.status(200).json(settings);
  } catch (error) {
    console.error("Error in getSystemSettings:", error);
    res
      .status(500)
      .json({ message: `Failed to fetch settings: ${error.message}` });
  }
};

exports.updateSystemSettings = async (req, res) => {
  try {
    const settings = await SystemSettings.findOneAndUpdate(
      { _id: "system-settings" },
      req.body,
      { new: true, runValidators: true, upsert: true }
    );
    res.status(200).json(settings);
  } catch (error) {
    console.error("Error in updateSystemSettings:", error);
    res
      .status(400)
      .json({ message: `Failed to update settings: ${error.message}` });
  }
};

// Review management
exports.getAllReviews = async (req, res) => {
  try {
    const { search } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { "rental.name": { $regex: search, $options: "i" } },
        { "renter.firstName": { $regex: search, $options: "i" } },
        { "renter.middleName": { $regex: search, $options: "i" } },
        { "renter.lastName": { $regex: search, $options: "i" } },
        { "owner.firstName": { $regex: search, $options: "i" } },
        { "owner.middleName": { $regex: search, $options: "i" } },
        { "owner.lastName": { $regex: search, $options: "i" } },
        { comment: { $regex: search, $options: "i" } },
      ];
    }

    const reviews = await Review.find(query)
      .populate("rental", "name")
      .populate("renter", "firstName lastName email middleName")
      .populate("owner", "firstName lastName email middleName")
      .sort({ createdAt: -1 });

    const total = await Review.countDocuments(query);

    res.json({
      reviews,
      totalReviews: total,
    });
  } catch (error) {
    console.error("Error in getAllReviews:", error);
    res
      .status(500)
      .json({ message: `Failed to fetch reviews: ${error.message}` });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }
    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Error in deleteReview:", error);
    res
      .status(500)
      .json({ message: `Failed to delete review: ${error.message}` });
  }
};
