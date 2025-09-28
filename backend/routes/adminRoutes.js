const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const {
  getDashboardStats,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAssets,
  updateAssetStatus,
  deleteAsset,
  getAllBookings,
  getAllReviews,
  deleteReview,
  getSystemSettings,
  updateSystemSettings,
  getPendingUsers,
  getPendingUserById,
  approvePendingUser,
  rejectPendingUser,
} = require("../controllers/adminController");

const router = express.Router();

// Apply authentication and admin role middleware to all routes
router.use(authMiddleware);
router.use(roleMiddleware(["admin"]));

// Dashboard statistics
router.get("/dashboard-stats", getDashboardStats);

// User management
router.get("/users", getUsers);
router.get("/users/:id", getUserById);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

// Pending users management
router.get("/pending-users", getPendingUsers);
router.get("/pending-users/:id", getPendingUserById);
router.post("/pending-users/:id/approve", approvePendingUser);
router.post("/pending-users/:id/reject", rejectPendingUser);

// Asset management
router.get("/assets", getAssets);
router.put("/assets/:id/status", updateAssetStatus);
router.delete("/assets/:id", deleteAsset);

// Booking management
router.get("/bookings", getAllBookings);

// Review management
router.get("/reviews", getAllReviews);
router.delete("/reviews/:id", deleteReview);

// System settings
router.get("/settings", getSystemSettings);
router.put("/settings", updateSystemSettings);

module.exports = router;
