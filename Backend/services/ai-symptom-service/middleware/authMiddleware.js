const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  try {
    const secret = process.env.JWT_SECRET || 'mysecretkey123';
    console.log('🔐 Verifying token with secret:', secret);
    const decoded = jwt.verify(token, secret);
    req.user = decoded; // { userId, role, ... }
    console.log('✅ Token verified, user:', decoded);
    next();
  } catch (err) {
    console.error('❌ Token verification failed:', err.message);
    return res.status(403).json({ message: "Invalid or expired token", error: err.message });
  }
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    next();
  };
};

module.exports = { verifyToken, requireRole };