const express = require("express");
const dotenv = require("dotenv");
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

dotenv.config();
if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
  console.error("Missing environment variables in .env file");
  process.exit(1);
}
connectDB(); // <--- This will read MONGO_URI from .env

const app = express();

// CORS configuration
app.use(
  cors({
    origin: ["http://localhost:2000", "http://127.0.0.1:4200", "http://localhost:4200"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Stripe webhook must be defined BEFORE body parsers to retain raw body
app.post("/api/payments/webhook", express.raw({ type: "application/json" }), stripeWebhookHandler);

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

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/owner", ownerRoutes);
app.use("/api", roleRoutes);
app.use("/api/renter", renterRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/payments", paymentsRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

// Handle 404 routes with JSON instead of Express default "Cannot GET /"
app.use("*", (req, res) => {
  res.status(404).json({
    message: `Route ${req.originalUrl} not found`,
  });
});

const PORT = process.env.PORT || 5000;

if (process.env.VERCEL) {
  module.exports = app;
} else {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
