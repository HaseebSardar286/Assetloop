const express = require("express");
const {
  createAsset,
  getAssetById,
  getAssets,
  updateAsset,
  deleteAsset,
  getAssetReviews,
} = require("../controllers/assetController");
const {
  getBookings,
  updateBookingStatus,

  getOwnerBookings,
  getBookingById,
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
  getUsers,
} = require("../controllers/ownerController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const upload = require("../middlewares/multer.config");
const router = express.Router();

// Public owner reviews (no auth needed for read)
router.get("/:ownerId/reviews", getOwnerReviews);

router.use(authMiddleware);
const roleCheck = roleMiddleware(["owner"]); // Invoke and store the middleware
router.use(roleCheck); // Use the returned middleware

router.get("/users", getUsers);

router.post("/create-asset", upload.array("images", 20), createAsset);
router.get("/assets", getAssets);
router.get("/assets/:id", getAssetById);
router.get("/assets/:assetId/reviews", getAssetReviews);
router.put("/assets/:id", upload.array("images", 20), updateAsset);
router.put("/assets/:id/details", updateAsset);
router.delete("/assets/:id", deleteAsset);

router.get("/dashboard-stats", getDashboardStats);
router.get("/active-bookings", getActiveBookings);

router.get("/bookings", getBookings);
router.put("/bookings/:id/status", updateBookingStatus);
router.get("/bookings/:id", getBookingById);
router.get("/rental-requests", getOwnerBookings);


router.get("/profile", getProfile);
router.put("/update-profile", updateProfile);
router.put("/change-password", changePassword);
router.get("/notification-settings", getNotificationSettings);
router.put("/notification-settings", updateNotificationSettings);

module.exports = router;
