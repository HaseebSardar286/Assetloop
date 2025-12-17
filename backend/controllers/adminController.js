const User = require("../models/User");
const Asset = require("../models/Asset");
const Booking = require("../models/Bookings");
const Review = require("../models/Review");
const SystemSettings = require("../models/SystemSettings");
const PendingUser = require("../models/PendingUser");
const Wishlist = require("../models/Wishlist");
const Cart = require("../models/Cart");
const Transaction = require("../models/Transaction");

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

// Role-based user summary (owner/renter)
exports.getUserSummary = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userId = user._id;
    const base = {
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    if (user.role === "owner") {
      const [assetsCount, activeAssets, bookingsAsOwner] = await Promise.all([
        Asset.countDocuments({ owner: userId }),
        Asset.countDocuments({ owner: userId, status: "Active" }),
        Booking.countDocuments({ owner: userId }),
      ]);

      return res.json({
        ...base,
        assetsCount,
        activeAssets,
        bookingsAsOwner,
      });
    }

    if (user.role === "renter") {
      const [bookingsAsRenter, wishlistCount, cartCount] = await Promise.all([
        Booking.countDocuments({ renter: userId }),
        Wishlist.countDocuments({ renter: userId }),
        Cart.countDocuments({ renter: userId }),
      ]);

      return res.json({
        ...base,
        bookingsAsRenter,
        wishlistCount,
        cartCount,
        totalSpent: user.totalSpent || 0,
      });
    }

    // Admin or other roles - minimal summary
    return res.json(base);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Pending user management
exports.getPendingUsers = async (req, res) => {
  try {
    console.log("PendingUser collection name:", PendingUser.collection.name);
    const pending = await PendingUser.find()
      .select("-password -__v")
      .sort({ createdAt: -1 });
    console.log("Found docs:", pending);
    console.log("Fetched pending users:", pending); // Debug log
    res.status(200).json({ pendingUsers: pending, total: pending.length });
  } catch (error) {
    console.error("Error fetching pending users:", error);
    res
      .status(500)
      .json({ message: `Failed to fetch pending users: ${error.message}` });
  }
};

exports.getPendingUserById = async (req, res) => {
  try {
    const pending = await PendingUser.findById(req.params.id).select(
      "-password -__v"
    );
    if (!pending) {
      return res.status(404).json({ message: "Pending user not found" });
    }
    console.log("Fetched pending user:", pending); // Debug log
    res.status(200).json(pending);
  } catch (error) {
    console.error("Error fetching pending user:", error);
    res
      .status(500)
      .json({ message: `Failed to fetch pending user: ${error.message}` });
  }
};

exports.approvePendingUser = async (req, res) => {
  try {
    const { id } = req.params;
    const pending = await PendingUser.findById(id);
    if (!pending) {
      return res.status(404).json({ message: "Pending user not found" });
    }
    if (pending.verificationStatus === "approved") {
      return res.status(400).json({ message: "User already approved" });
    }

    const user = await User.create({
      firstName: pending.firstName,
      middleName: pending.middleName,
      lastName: pending.lastName,
      email: pending.email,
      password: pending.password,
      phoneNumber: pending.phoneNumber,
      country: pending.country,
      city: pending.city,
      address: pending.address,
      role: pending.role,
      terms: pending.terms,
      totalSpent: pending.totalSpent,
      notificationSettings: pending.notificationSettings,
      verification: pending.verification,
      verificationStatus: "approved",
    });

    await PendingUser.findByIdAndDelete(id);
    console.log("Approved user:", user._id); // Debug log
    res
      .status(200)
      .json({ message: "User approved and activated", userId: user._id });
  } catch (error) {
    console.error("Error approving user:", error);
    res.status(500).json({ message: `Approval failed: ${error.message}` });
  }
};

exports.rejectPendingUser = async (req, res) => {
  try {
    const { id } = req.params;
    const pending = await PendingUser.findById(id);
    if (!pending) {
      return res.status(404).json({ message: "Pending user not found" });
    }
    pending.verificationStatus = "rejected";
    await pending.save();
    console.log("Rejected user:", id); // Debug log
    res.status(200).json({ message: "Pending user rejected" });
  } catch (error) {
    console.error("Error rejecting user:", error);
    res.status(500).json({ message: `Rejection failed: ${error.message}` });
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
      .sort({ createdAt: -1 })
      .lean();

    const total = await Asset.countDocuments(query);

    const response = assets.map((asset) => {
      let ownerData = null;
      if (asset.owner && typeof asset.owner === 'object') {
        ownerData = {
          _id: asset.owner._id ? asset.owner._id.toString() : '',
          firstName: asset.owner.firstName || '',
          lastName: asset.owner.lastName || '',
          email: asset.owner.email || '',
          middleName: asset.owner.middleName || '',
        };
      } else if (asset.owner) {
        ownerData = asset.owner.toString();
      }

      return {
        _id: asset._id.toString(),
        id: asset._id.toString(),
        owner: ownerData,
        name: asset.name || '',
        address: asset.address || '',
        description: asset.description || '',
        price: asset.price || 0,
        status: asset.status || 'Inactive',
        availability: asset.availability || 'available',
        category: asset.category || '',
        capacity: asset.capacity || 0,
        startDate: asset.startDate || null,
        endDate: asset.endDate || null,
        images: Array.isArray(asset.images) ? asset.images : [],
        features: Array.isArray(asset.features) ? asset.features : [],
        amenities: Array.isArray(asset.amenities) ? asset.amenities : [],
        createdAt: asset.createdAt ? (asset.createdAt.toISOString ? asset.createdAt.toISOString() : asset.createdAt) : new Date().toISOString(),
        updatedAt: asset.updatedAt ? (asset.updatedAt.toISOString ? asset.updatedAt.toISOString() : asset.updatedAt) : new Date().toISOString(),
      };
    });

    res.json({
      assets: response,
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

// Transaction management
exports.getAllTransactions = async (req, res) => {
  try {
    const { status, type, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }
    if (type) {
      query.type = type;
    }

    const skip = (Number(page) - 1) * Number(limit);

    let transactions = await Transaction.find(query)
      .populate("user", "firstName lastName email")
      .populate("booking", "name asset")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    // If search is provided, filter by user name or email
    if (search) {
      const searchLower = search.toLowerCase();
      transactions = transactions.filter((t) => {
        const user = t.user;
        if (user && typeof user === "object") {
          const fullName = `${user.firstName || ""} ${user.lastName || ""}`.toLowerCase();
          const email = (user.email || "").toLowerCase();
          return fullName.includes(searchLower) || email.includes(searchLower);
        }
        return false;
      });
    }

    const total = await Transaction.countDocuments(query);

    // Format transactions for frontend
    const formattedTransactions = transactions.map((t) => ({
      id: t._id.toString(),
      _id: t._id.toString(),
      user: t.user
        ? {
            id: t.user._id?.toString() || "",
            name: `${t.user.firstName || ""} ${t.user.lastName || ""}`.trim() || "Unknown User",
            email: t.user.email || "",
          }
        : { id: "", name: "Unknown User", email: "" },
      booking: t.booking
        ? {
            id: t.booking._id?.toString() || "",
            name: t.booking.name || "Unknown Booking",
            asset: t.booking.asset || "",
          }
        : null,
      amount: t.amount,
      currency: t.currency || "usd",
      type: t.type,
      status: t.status,
      description: t.description || "",
      createdAt: t.createdAt,
      date: t.createdAt ? new Date(t.createdAt).toISOString() : new Date().toISOString(),
    }));

    res.status(200).json({
      transactions: formattedTransactions,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    console.error("Error in getAllTransactions:", error);
    res.status(500).json({ message: `Failed to fetch transactions: ${error.message}` });
  }
};

exports.updateTransactionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !["pending", "completed", "failed", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status. Must be one of: pending, completed, failed, cancelled" });
    }

    const transaction = await Transaction.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    )
      .populate("user", "firstName lastName email")
      .populate("booking", "name asset");

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // Format response
    const formattedTransaction = {
      id: transaction._id.toString(),
      _id: transaction._id.toString(),
      user: transaction.user
        ? {
            id: transaction.user._id?.toString() || "",
            name: `${transaction.user.firstName || ""} ${transaction.user.lastName || ""}`.trim() || "Unknown User",
            email: transaction.user.email || "",
          }
        : { id: "", name: "Unknown User", email: "" },
      booking: transaction.booking
        ? {
            id: transaction.booking._id?.toString() || "",
            name: transaction.booking.name || "Unknown Booking",
            asset: transaction.booking.asset || "",
          }
        : null,
      amount: transaction.amount,
      currency: transaction.currency || "usd",
      type: transaction.type,
      status: transaction.status,
      description: transaction.description || "",
      createdAt: transaction.createdAt,
      date: transaction.createdAt ? new Date(transaction.createdAt).toISOString() : new Date().toISOString(),
    };

    res.status(200).json({
      message: "Transaction status updated successfully",
      transaction: formattedTransaction,
    });
  } catch (error) {
    console.error("Error in updateTransactionStatus:", error);
    res.status(500).json({ message: `Failed to update transaction: ${error.message}` });
  }
};
