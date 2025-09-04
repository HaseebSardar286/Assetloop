const express = require("express");
const {
  createAsset,
  getAssets,
  updateAsset,
  deleteAsset,
} = require("../controllers/assetController");
const {
  getBookings,
  updateBookingStatus,
} = require("../controllers/bookingController");
const { updateProfile } = require("../controllers/ownerController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const { roleMiddleware } = require("../middlewares/roleMiddleware");

const router = express.Router();

router.use(authMiddleware); // Apply authentication to all routes

// Apply roleMiddleware for 'owner' role
router.use(roleMiddleware(["owner"]));

router.post("/assets", createAsset);
router.get("/assets", getAssets);
router.put("/assets/:id", updateAsset);
router.delete("/assets/:id", deleteAsset);

router.get("/bookings", getBookings);
router.put("/bookings/:id/status", updateBookingStatus);

router.put("/profile", updateProfile);

module.exports = router;
