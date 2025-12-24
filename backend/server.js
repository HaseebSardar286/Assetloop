const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes"); // Updated to match file name
const ownerRoutes = require("./routes/ownerRoutes");
const roleRoutes = require("./routes/roleRoutes");
const renterRoutes = require("./routes/renterRoutes");
const adminRoutes = require("./routes/adminRoutes");
const chatRoutes = require("./routes/chatRoutes");
const paymentsRoutes = require("./routes/paymentsRoutes");
const { stripeWebhookHandler } = require("./controllers/paymentsController");
const errorHandler = require("./middlewares/errorHandler");



// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION! Shutting down...");
  console.error("Error:", err.message, err.stack);
  // In production, exit the process
  if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION! Shutting down...");
  console.error("Error:", err.message, err.stack);
  process.exit(1);
});

if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
  console.error("Missing environment variables in .env file");
  process.exit(1);
}
connectDB(); // <--- This will read MONGO_URI from .env

const app = express();

// CORS configuration - allow requests from frontend
// const allowedOrigins = process.env.CORS_ORIGINS
//   ? process.env.CORS_ORIGINS.split(",").map(origin => origin.trim())
//   : ["http://localhost:4200", "http://127.0.0.1:4200", "https://assetloop-rental-platform.vercel.app"];

const allowedOrigins = "https://assetloop-rental-platform.vercel.app";

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Stripe webhook must be defined BEFORE body parsers to retain raw body
app.post(
  "/api/payments/stripe/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhookHandler
);

app.use(express.json({ limit: "50mb" })); // Increase payload limit for base64 images
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// Root info endpoint for sanity checks
app.get("/", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Assetloop API is reachable",
    docs: "/health for status, /api/* for resources",
  });
});

// Public routes (no auth required)
const SystemSettings = require("./models/SystemSettings");
app.get("/api/settings", async (req, res) => {
  try {
    let settings = await SystemSettings.findOne({ _id: "system-settings" });
    if (!settings) {
      settings = await SystemSettings.create({ _id: "system-settings" });
    }
    res.status(200).json(settings);
  } catch (error) {
    console.error("Error in public getSystemSettings:", error);
    res.status(500).json({ message: `Failed to fetch settings: ${error.message}` });
  }
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/owner", ownerRoutes);
app.use("/api", roleRoutes);
app.use("/api/renter", renterRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/payments", paymentsRoutes);

// Handle 404 routes with JSON instead of Express default "Cannot GET /"
app.use((req, res) => {
  res.status(404).json({
    message: `Route ${req.originalUrl} not found`,
  });
});

// Error handling middleware (must be last, after all routes)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (process.env.VERCEL) {
  module.exports = app;
} else {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
