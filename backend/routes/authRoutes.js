// routes/authRoutes.js
const express = require("express");
const { register, login } = require("../controllers/authController");
const { submitVerification } = require("../controllers/verifyController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

// Protected verification submission (expects JSON with base64 images)
router.post("/verification", authMiddleware, submitVerification);

module.exports = router;
