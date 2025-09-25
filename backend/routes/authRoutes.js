// routes/authRoutes.js
const express = require("express");
const { register, login } = require("../controllers/authController");
const { submitVerification } = require("../controllers/verifyController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

// Protected verification submission (expects JSON with base64 images)
// Allow either authenticated user or pendingUserId in body to submit verification
router.post("/verification", submitVerification);

module.exports = router;
