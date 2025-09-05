const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes"); // Updated to match file name
const ownerRoutes = require("./routes/ownerRoutes");
const roleRoutes = require("./routes/roleRoutes");
// Remove multer import

dotenv.config();
if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
    console.error("Missing environment variables in .env file");
    process.exit(1);
}
connectDB(); // <--- This will read MONGO_URI from .env

const app = express();
app.use(cors({ origin: "http://localhost:4200" })); // Restrict CORS for development
app.use(express.json({ limit: "50mb" })); // Increase payload limit for base64 images
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
// Remove multer middleware

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/owner", ownerRoutes);
app.use("/api", roleRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
