// server.js
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import ownerRoutes from "./routes/ownerRoutes.js";
import roleRoutes from "./routes/roleRoutes.js";
import renterRoutes from "./routes/renterRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import paymentsRoutes from "./routes/paymentsRoutes.js";
import errorHandler from "./middlewares/errorHandler.js";

// Connect to MongoDB
if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
  console.error("Missing environment variables in .env file");
  process.exit(1);
}
connectDB();

const app = express();

// CORS configuration
const allowedOrigins = [
  "http://localhost:4200",
  "http://127.0.0.1:4200",
  "https://assetloop-rental-platform.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow mobile apps / Postman
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Preflight handling
app.options("*", cors());

// Body parsers
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Health check
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

// Public system settings
import SystemSettings from "./models/SystemSettings.js";
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

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: `Route ${req.originalUrl} not found`,
  });
});

// Error handling middleware
app.use(errorHandler);

// Export for Vercel
export default app;

// Local development support
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// Handle unhandled rejections
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION! Shutting down...");
  console.error("Error:", err.message, err.stack);
  if (process.env.NODE_ENV === "production" || process.env.VERCEL) process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION! Shutting down...");
  console.error("Error:", err.message, err.stack);
  process.exit(1);
});
