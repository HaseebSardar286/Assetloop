const User = require("../models/User");
const bcrypt = require("bcrypt");
const Booking = require("../models/Bookings");
const Review = require("../models/Review");
const Asset = require("../models/Asset");

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password -__v");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error in getProfile:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user.id, req.body, {
      new: true,
    });
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getNotificationSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("notificationSettings");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user.notificationSettings || {});
  } catch (error) {
    console.error("Error in getNotificationSettings:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateNotificationSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const settings = req.body;
    const user = await User.findByIdAndUpdate(
      userId,
      { notificationSettings: settings },
      { new: true, runValidators: true }
    ).select("notificationSettings");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user.notificationSettings);
  } catch (error) {
    console.error("Error in updateNotificationSettings:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { previousPassword, newPassword, confirmPassword } = req.body;

    if (!previousPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ message: "New password and confirm password do not match" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(previousPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect previous password" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error in changePassword:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getOwnerReviews = async (req, res) => {
  try {
    const { ownerId } = req.params;
    const bookings = await Booking.find({
      owner: ownerId,
      review: { $exists: true },
    })
      .populate({ path: "review", select: "rating comment createdAt" })
      .populate({ path: "renter", select: "firstName lastName" })
      .lean();

    const reviews = bookings
      .filter((b) => b.review)
      .map((b) => ({
        rating: b.review.rating,
        comment: b.review.comment,
        createdAt: b.review.createdAt,
        reviewer: `${b.renter?.firstName || ""} ${
          b.renter?.lastName || ""
        }`.trim(),
      }));

    res.status(200).json({ reviews });
  } catch (error) {
    console.error("Error in getOwnerReviews:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const currentDate = new Date().toISOString().split("T")[0];

    const totalAssets = await Asset.countDocuments({ owner: ownerId });
    const activeBookings = await Booking.countDocuments({
      owner: ownerId,
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate },
      status: "confirmed",
    });
    const totalEarnings = await Booking.aggregate([
      { $match: { owner: ownerId, status: "completed" } },
      { $group: { _id: null, total: { $sum: "$price" } } },
    ]).then((results) => results[0]?.total || 0);
    const pendingReviews = await Booking.countDocuments({
      owner: ownerId,
      status: "completed",
      review: { $exists: false },
    });

    res.status(200).json({
      totalAssets,
      activeBookings,
      totalEarnings,
      pendingReviews,
    });
  } catch (error) {
    console.error("Error in getDashboardStats:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getActiveBookings = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const currentDate = new Date().toISOString().split("T")[0];

    const activeBookings = await Booking.find({
      owner: ownerId,
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate },
      status: "confirmed",
      renter: { $exists: true, $ne: null },
    })
      .populate({
        path: "renter",
        select: "firstName lastName email",
        match: { _id: { $exists: true } },
      })
      .populate("asset", "name address price")
      .lean();

    const validBookings = activeBookings.filter((booking) => booking.renter);
    if (activeBookings.length !== validBookings.length) {
      console.warn(
        `Filtered out ${
          activeBookings.length - validBookings.length
        } bookings with invalid renter IDs`
      );
    }

    res.status(200).json(
      validBookings.map((booking) => ({
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
        address: booking.address,
        imageUrl:
          booking.imageUrl && booking.imageUrl.startsWith("/uploads/")
            ? `http://localhost:${process.env.PORT || 5000}${booking.imageUrl}`
            : booking.imageUrl,
        category: booking.category,
        notes: booking.notes,
        createdAt: booking.createdAt,
        requestDate: booking.requestDate || booking.createdAt,
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
    console.error("Error in getActiveBookings:", error);
    res.status(500).json({ message: error.message });
  }
};

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
