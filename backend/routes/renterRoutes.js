const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const {
  getBookings,
  getBookingById,
  createBooking,
  cancelBooking,
  addReview,
} = require("../controllers/bookingController");
const {
  getProfile,
  updateProfile,
  getDashboardStats,
  getNotificationSettings,
  updateNotificationSettings,
  changePassword,
} = require("../controllers/renterController");
const {
  getAllAssets,
  getAssetById,
  getAssetReviews,
} = require("../controllers/assetController");
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getRenterReviews,
  getUsers,
} = require("../controllers/renterController");
const router = express.Router();

// Public, read-only routes (no auth)
router.get("/allAssets", getAllAssets);
router.get("/assets/:id", getAssetById);
router.get("/assets/:assetId/reviews", getAssetReviews);
router.get("/renters/:renterId/reviews", getRenterReviews);

// Protected routes (renter only)
router.use(authMiddleware);
const roleCheck = roleMiddleware(["renter"]);
router.use(roleCheck);

router.get("/users", getUsers);

router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.put("/update-profile", updateProfile);
router.get("/dashboard-stats", getDashboardStats);
// Bookings routes - order matters: specific routes before parameterized
router.get("/bookings", getBookings);
router.post("/bookings", createBooking);
router.put("/bookings/:id/cancel", cancelBooking);
// GET booking by ID route
router.get("/bookings/:id", (req, res, next) => {
  console.log("📍 Route /bookings/:id matched! ID:", req.params.id);
  next();
}, getBookingById);
router.post("/reviews", addReview);

router.put("/change-password", changePassword);
router.get("/notification-settings", getNotificationSettings);
router.put("/notification-settings", updateNotificationSettings);

// Wishlist
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} = require("../controllers/renterController");
router.get("/wishlist", getWishlist);
router.post("/wishlist", addToWishlist);
router.delete("/wishlist/:assetId", removeFromWishlist);

// Cart
router.get("/cart", getCart);
router.post("/cart", addToCart);
router.put("/cart/:assetId", updateCartItem);
router.delete("/cart/:assetId", removeFromCart);
router.delete("/cart", clearCart);

module.exports = router;
