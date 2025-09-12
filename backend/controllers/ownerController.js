const User = require("../models/User");
const bcrypt = require("bcrypt");
const Booking = require("../models/Bookings");
const Review = require("../models/Review");

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

    // Validate input
    if (!previousPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ message: "New password and confirm password do not match" });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify previous password
    const isMatch = await bcrypt.compare(previousPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect previous password" });
    }

    // Hash and update new password
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

// Public/read endpoint to get reviews for an owner
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
