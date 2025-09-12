const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

const router = express.Router();

// Renter-only route
router.get(
  "/renter/dashboard",
  authMiddleware,
  roleMiddleware(["renter"]),
  (req, res) => {
    res.json({ message: "Welcome Renter Dashboard" });
  }
);

// Owner-only route
router.post(
  "/owner/listing",
  authMiddleware,
  roleMiddleware(["owner"]),
  (req, res) => {
    res.json({ message: "Listing created successfully" });
  }
);

// Admin-only route
router.get(
  "/admin/users",
  authMiddleware,
  roleMiddleware(["admin"]),
  (req, res) => {
    res.json({ message: "List of users for admin" });
  }
);

module.exports = router;
