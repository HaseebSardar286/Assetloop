// middlewares/connectDBMiddleware.js
const connectDB = require("../config/db");

module.exports = async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("DB connection middleware error:", err);
    res.status(500).json({ error: "Database connection failed" });
  }
};
