const express = require("express");
console.log("roleMiddleware:", require("../middlewares/roleMiddleware")); // Logs the imported function
const {
  createAsset,
  getAssets,
  updateAsset,
  deleteAsset,
  getDashboardStats,
  getActiveBookings,
} = require("../controllers/assetController");
const {
  getBookings,
  updateBookingStatus,
} = require("../controllers/bookingController");
const { updateProfile } = require("../controllers/ownerController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

const router = express.Router();

router.use(authMiddleware);
const roleCheck = roleMiddleware(["owner"]); // Invoke and store the middleware
console.log("roleCheck:", roleCheck); // Should log the returned function
router.use(roleCheck); // Use the returned middleware

router.post("/create-asset", createAsset);
router.get("/assets", getAssets);
router.put("/assets/:id", updateAsset);
router.delete("/assets/:id", deleteAsset);
router.get("/dashboard-stats", getDashboardStats);
router.get("/active-bookings", getActiveBookings);

router.get("/bookings", getBookings);
router.put("/bookings/:id/status", updateBookingStatus);

router.put("/profile", updateProfile);

module.exports = router;
