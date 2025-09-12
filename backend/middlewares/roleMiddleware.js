const jwt = require("jsonwebtoken");

const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    try {
      console.log("roleMiddleware executing, req.user:", req.user); // Debug
      if (!req.user || !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ message: "Forbidden" });
      }
      next();
    } catch (error) {
      console.error("roleMiddleware error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
};

module.exports = roleMiddleware;
