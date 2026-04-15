import jwt from "jsonwebtoken";

// Verify token
export const protect = (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      if (!process.env.JWT_SECRET) {
        return res.status(500).json({
          message: "JWT_SECRET not configured in doctor-service",
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = decoded;
      next();
    } catch (error) {
      console.log("JWT ERROR:", error.message);

      return res.status(401).json({
        message: "Not authorized, token failed",
        error: error.message,
      });
    }
  } else {
    return res.status(401).json({
      message: "No token, not authorized",
    });
  }
};

// Role-based access
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    next();
  };
};