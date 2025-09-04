import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "No token or invalid format provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.id || !decoded.role) {
      return res.status(403).json({ message: "Invalid token payload" });
    }
    req.user = decoded; // Attach decoded user data (id, role, etc.)
    next();
  } catch (err) {
    console.error("JWT Verification Error:", err.message); // Log for debugging
    if (err.name === "TokenExpiredError") {
      return res.status(403).json({ message: "Token has expired" });
    }
    res.status(403).json({ message: "Invalid or expired token" });
  }
};
