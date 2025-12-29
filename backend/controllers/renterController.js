// Updated renterController.js
const User = require("../models/User");
const bcrypt = require("bcrypt");
const Joi = require("joi");
const Booking = require("../models/Bookings");
const Wishlist = require("../models/Wishlist"); // Add this import
const mongoose = require("mongoose");
const Asset = require("../models/Asset");
const Cart = require("../models/Cart");

// If using Winston for logging, add:
// const logger = require('../utils/logger'); // Assuming a logger utility file
// Otherwise, use console.error below

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("User Id is: ", userId);
    const user = await User.findById(userId).select("-password -__v");
    if (!user) {
      console.log("User Id is: ", userId);
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error in get Profile:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { error } = Joi.object({
      firstName: Joi.string().optional(),
      lastName: Joi.string().optional(),
      phoneNumber: Joi.string().optional(),
      address: Joi.string().optional(),
      city: Joi.string().optional(),
      country: Joi.string().optional(),
      profilePicture: Joi.string().optional(),
    }).validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const user = await User.findByIdAndUpdate(req.user.id, req.body, {
      new: true,
      runValidators: true,
    }).select("-password -__v");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
      { new: true }
    ).select("notificationSettings");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user.notificationSettings);
  } catch (error) {
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

exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({ message: "Unauthorized: Invalid user ID" });
    }

    console.log("Querying dashboard stats for userId:", userId);
    const [activeRentals, pendingRequests, wishlistItems, user, totalSpent] =
      await Promise.all([
        Booking.countDocuments({
          renter: userId,
          status: { $in: ["active", "expiring soon", "overdue"] },
        }),
        Booking.countDocuments({
          renter: userId,
          status: "pending",
        }),
        Wishlist.countDocuments({ renter: userId }),
        User.findById(userId),
        Booking.aggregate([
          {
            $match: {
              renter: new mongoose.Types.ObjectId(userId),
              status: "completed",
            },
          },
          {
            $group: {
              _id: null,
              total: {
                $sum: {
                  $toDouble: { $ifNull: ["$totalPaid", 0] },
                },
              },
            },
          },
        ]).then((result) =>
          Array.isArray(result) && result[0] ? result[0].total : 0
        ),
      ]);

    console.log("Query results:", {
      activeRentals,
      pendingRequests,
      wishlistItems,
      user,
      totalSpent,
    });

    res.status(200).json({
      activeRentals,
      pendingRequests,
      wishlistItems,
      totalSpent,
    });
  } catch (error) {
    console.error(
      `Error fetching dashboard stats for user ${req.user?.id}: ${error.message}`
    );
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message }); // Temporary for debugging
  }
};

// Wishlist endpoints
exports.getWishlist = async (req, res) => {
  try {
    const renterId = req.user.id;
    const items = await Wishlist.find({ renter: renterId })
      .populate({
        path: "asset",
        select: "name address description price images category",
      })
      .lean();

    const response = items
      .filter((w) => w.asset)
      .map((w) => ({
        id: w.asset._id.toString(),
        _id: w.asset._id.toString(),
        name: w.asset.name,
        description: w.asset.description,
        price: w.asset.price,
        owner: { name: "", contact: "" },
        startDate: undefined,
        endDate: undefined,
        status: "pending",
        address: w.asset.address,
        // images:
        //   Array.isArray(w.asset.images) && w.asset.images.length
        //     ? w.asset.images.map((img) => {
        //         try {
        //           return `data:image/png;base64,${Buffer.from(img).toString(
        //             "base64"
        //           )}`;
        //         } catch (e) {
        //           console.error("Invalid image buffer:", e);
        //           return "/images/default.jpg";
        //         }
        //       })
        //     : ["/images/default.jpg"],
        imageUrl:
          Array.isArray(w.asset.images) && w.asset.images.length
            ? w.asset.images[0]
            : undefined,
        category: w.asset.category,
      }));

    console.log("Wishlist response:", response);
    res.status(200).json(response);
  } catch (error) {
    console.error("Error in getWishlist:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.addToWishlist = async (req, res) => {
  try {
    const renterId = req.user.id;
    const { assetId } = req.body;
    if (!assetId || !mongoose.Types.ObjectId.isValid(assetId)) {
      return res.status(400).json({ message: "Valid assetId is required" });
    }
    const asset = await Asset.findById(assetId).lean();
    if (!asset) return res.status(404).json({ message: "Asset not found" });
    const existing = await Wishlist.findOne({
      renter: renterId,
      asset: assetId,
    });
    if (existing)
      return res.status(200).json({ message: "Already in wishlist" });
    await Wishlist.create({ renter: renterId, asset: assetId });
    res.status(201).json({ message: "Added to wishlist" });
  } catch (error) {
    console.error("Error in addToWishlist:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    const renterId = req.user.id;
    const { assetId } = req.params;
    if (!assetId || !mongoose.Types.ObjectId.isValid(assetId)) {
      return res.status(400).json({ message: "Valid assetId is required" });
    }
    await Wishlist.deleteOne({ renter: renterId, asset: assetId });
    res.status(200).json({ message: "Removed from wishlist" });
  } catch (error) {
    console.error("Error in removeFromWishlist:", error);
    res.status(500).json({ message: error.message });
  }
};

// Cart endpoints
exports.getCart = async (req, res) => {
  try {
    const renterId = req.user.id;
    let cart = await Cart.findOne({ renter: renterId }).populate({
      path: "items.asset",
      select: "name address description price images category",
    });
    if (!cart) {
      cart = await Cart.create({ renter: renterId, items: [] });
    }
    const response = cart.items
      .filter((ci) => ci.asset)
      .map((ci) => ({
        id: ci.asset._id.toString(),
        name: ci.asset.name,
        address: ci.asset.address,
        pricePerDay: String(ci.asset.price),
        description: ci.asset.description,
        amenities: [],
        imageUrl:
          Array.isArray(ci.asset.images) && ci.asset.images.length
            ? ci.asset.images[0]
            : undefined,
        quantity: ci.quantity,
      }));
    res.status(200).json(response);
  } catch (error) {
    console.error("Error in getCart:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const renterId = req.user.id;
    const { assetId, quantity } = req.body;
    if (!assetId || !mongoose.Types.ObjectId.isValid(assetId)) {
      return res.status(400).json({ message: "Valid assetId is required" });
    }
    let cart = await Cart.findOne({ renter: renterId });
    if (!cart) cart = await Cart.create({ renter: renterId, items: [] });
    const existing = cart.items.find((i) => i.asset.toString() === assetId);
    if (existing) {
      existing.quantity += Number(quantity || 1);
    } else {
      cart.items.push({ asset: assetId, quantity: Number(quantity || 1) });
    }
    await cart.save();
    res.status(200).json({ message: "Added to cart" });
  } catch (error) {
    console.error("Error in addToCart:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const renterId = req.user.id;
    const { assetId } = req.params;
    const { quantity } = req.body;
    if (!assetId || !mongoose.Types.ObjectId.isValid(assetId) || !quantity) {
      return res
        .status(400)
        .json({ message: "assetId and quantity are required" });
    }
    const cart = await Cart.findOne({ renter: renterId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });
    const item = cart.items.find((i) => i.asset.toString() === assetId);
    if (!item)
      return res.status(404).json({ message: "Item not found in cart" });
    item.quantity = Number(quantity);
    await cart.save();
    res.status(200).json({ message: "Quantity updated" });
  } catch (error) {
    console.error("Error in updateCartItem:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const renterId = req.user.id;
    const { assetId } = req.params;
    const cart = await Cart.findOne({ renter: renterId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });
    cart.items = cart.items.filter((i) => i.asset.toString() !== assetId);
    await cart.save();
    res.status(200).json({ message: "Removed from cart" });
  } catch (error) {
    console.error("Error in removeFromCart:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const renterId = req.user.id;
    const cart = await Cart.findOne({ renter: renterId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });
    cart.items = [];
    await cart.save();
    res.status(200).json({ message: "Cart cleared" });
  } catch (error) {
    console.error("Error in clearCart:", error);
    res.status(500).json({ message: error.message });
  }
};

// Public/read endpoint to get reviews for a renter (for owners to view)
exports.getRenterReviews = async (req, res) => {
  try {
    const { renterId } = req.params;
    const bookings = await Booking.find({
      renter: renterId,
      review: { $exists: true },
    })
      .populate({ path: "review", select: "rating comment createdAt" })
      .populate({ path: "owner", select: "firstName lastName" })
      .lean();

    const reviews = bookings
      .filter((b) => b.review)
      .map((b) => ({
        rating: b.review.rating,
        comment: b.review.comment,
        createdAt: b.review.createdAt,
        reviewer: `${b.owner?.firstName || ""} ${
          b.owner?.lastName || ""
        }`.trim(),
      }));

    res.status(200).json({ reviews });
  } catch (error) {
    console.error("Error in getRenterReviews:", error);
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
