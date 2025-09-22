const express = require("express");
const {
  createAsset,
  getAssets,
  updateAsset,
  deleteAsset,
  getAssetReviews,
} = require("../controllers/assetController");
const {
  getBookings,
  updateBookingStatus,
  getOwnerBookings,
} = require("../controllers/bookingController");
const {
  updateProfile,
  getProfile,
  changePassword,
  getNotificationSettings,
  updateNotificationSettings,
  getOwnerReviews,
  getDashboardStats,
  getActiveBookings,
} = require("../controllers/ownerController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

const router = express.Router();

// Public owner reviews (no auth needed for read)
router.get("/:ownerId/reviews", getOwnerReviews);

router.use(authMiddleware);
const roleCheck = roleMiddleware(["owner"]); // Invoke and store the middleware
router.use(roleCheck); // Use the returned middleware

router.post("/create-asset", createAsset);
router.get("/assets", getAssets);
router.put("/assets/:id", updateAsset);
router.delete("/assets/:id", deleteAsset);

router.get("/dashboard-stats", getDashboardStats);
router.get("/active-bookings", getActiveBookings);

router.get("/bookings", getBookings);
router.put("/bookings/:id/status", updateBookingStatus);
router.get("/rental-requests", getOwnerBookings);

router.get("/profile", getProfile);
router.put("/update-profile", updateProfile);
router.put("/change-password", changePassword);
router.get("/notification-settings", getNotificationSettings);
router.put("/notification-settings", updateNotificationSettings);

module.exports = router;
