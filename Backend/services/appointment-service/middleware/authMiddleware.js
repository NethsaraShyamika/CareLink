const jwt = require("jsonwebtoken");

// 🔐 Protect route
const protect = (req, res, next) => {
  let token = req.headers.authorization;

  // ✅ FIRST check token exists
  if (!token || !token.startsWith("Bearer")) {
    return res.status(401).json({
      message: "Not authorized, token missing",
    });
  }

  try {
    // ✅ THEN split
    token = token.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.id,
      role: decoded.role, // 'patient', 'doctor', 'admin'
    };

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Not authorized, invalid token",
    });
  }
};


// 👤 Only Patient
const patientOnly = (req, res, next) => {
  if (req.user.role !== "patient") {
    return res.status(403).json({
      message: "Access denied: Patients only",
    });
  }
  next();
};


// 🩺 Only Doctor
const doctorOnly = (req, res, next) => {
  if (req.user.role !== "doctor") {
    return res.status(403).json({
      message: "Access denied: Doctors only",
    });
  }
  next();
};


// 🛡 Admin Only
const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Access denied: Admins only",
    });
  }
  next();
};


// 🔄 Patient OR Doctor
const patientOrDoctor = (req, res, next) => {
  if (!["patient", "doctor"].includes(req.user.role)) {
    return res.status(403).json({
      message: "Access denied",
    });
  }
  next();
};


module.exports = {
  protect,
  patientOnly,
  doctorOnly,
  adminOnly,
  patientOrDoctor,
};