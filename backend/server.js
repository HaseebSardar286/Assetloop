const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes"); // Updated to match file name
const ownerRoutes = require("./routes/ownerRoutes");
const roleRoutes = require("./routes/roleRoutes");
const renterRoutes = require("./routes/renterRoutes");
const adminRoutes = require("./routes/adminRoutes");
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
    origin: ["http://localhost:2000", "http://127.0.0.1:4200"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
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

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/owner", ownerRoutes);
app.use("/api", roleRoutes);
app.use("/api/renter", renterRoutes);
app.use("/api/admin", adminRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

// Handle 404 routes
// app.use('*', (req, res) => {
//   res.status(404).json({
//     message: `Route ${req.originalUrl} not found`
//   });
// });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
