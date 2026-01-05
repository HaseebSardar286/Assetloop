const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const ownerRoutes = require("./routes/ownerRoutes");
const roleRoutes = require("./routes/roleRoutes");
const renterRoutes = require("./routes/renterRoutes");
const adminRoutes = require("./routes/adminRoutes");
const chatRoutes = require("./routes/chatRoutes");
const paymentsRoutes = require("./routes/paymentsRoutes");
const assetConditionRoutes = require("./routes/assetConditionRoutes");
const disputeRoutes = require("./routes/disputeRoutes");

const errorHandler = require("./middlewares/errorHandler");

const connectionMiddleware = require("./middlewares/connectionMiddleware");

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION! Shutting down...");
  console.error("Error:", err.message, err.stack);
  // Don't exit in Vercel serverless - let platform handle it
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION! Shutting down...");
  console.error("Error:", err.message, err.stack);
  // Don't exit in Vercel serverless
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    process.exit(1);
  }
});

if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
  console.error("Missing environment variables in .env file");
  process.exit(1);
}

// Connect to database
// await connectDB();


const app = express();

// CORS configuration - allow requests from frontend
const allowedOrigins = [
  "http://localhost:4200",
  "http://127.0.0.1:4200",
  "https://assetloop-rental-platform.vercel.app",
  process.env.FRONTEND_URL,
].filter(Boolean);

// Also support Vercel preview deployments with regex
const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin (curl, mobile apps)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) return callback(null, true);

    // optional: allow Vercel preview deployments
    if (/^https:\/\/assetloop-.*\.vercel\.app$/.test(origin)) return callback(null, true);

    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};

app.use(cors(corsOptions));
// Handle preflight OPTIONS requests
// app.options("/*", cors(corsOptions)); // ✅ valid path
// Apply CORS globally
app.use(connectionMiddleware); // ensures DB connected for all routes


// ⚠️ CRITICAL: Stripe webhook route MUST come before body parsers
// We only apply express.raw() to the webhook route, not all payment routes
const { stripeWebhookHandler } = require("./controllers/paymentsController");
app.post(
  "/api/payments/stripe/webhook",
  express.raw({ type: "application/json" }), // This gives us a Buffer
  stripeWebhookHandler
);

// Body parsers for all other routes (including other payment routes)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// Root info endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Assetloop API is reachable",
    docs: "/health for status, /api/* for resources",
  });
});

// Public routes
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

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/owner", ownerRoutes);
app.use("/api", roleRoutes);
app.use("/api/renter", renterRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/payments", paymentsRoutes); // Payment routes (other than webhook)
app.use("/api", assetConditionRoutes);
app.use("/api/disputes", disputeRoutes);



// Handle 404 routes
app.use((req, res) => {
  res.status(404).json({
    message: `Route ${req.originalUrl} not found`,
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Export for Vercel or start server for local
if (process.env.VERCEL) {
  module.exports = app;
} else {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}