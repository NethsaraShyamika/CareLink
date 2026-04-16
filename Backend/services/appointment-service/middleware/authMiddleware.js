import jwt from "jsonwebtoken";

// 🔐 Protect route
export const protect = (req, res, next) => {
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
export const patientOnly = (req, res, next) => {
  if (req.user.role !== "patient") {
    return res.status(403).json({
      message: "Access denied: Patients only",
    });
  }
  next();
};


// 🩺 Only Doctor
export const doctorOnly = (req, res, next) => {
  if (req.user.role !== "doctor") {
    return res.status(403).json({
      message: "Access denied: Doctors only",
    });
  }
  next();
};


// 🛡 Admin Only
export const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Access denied: Admins only",
    });
  }
  next();
};


// 🔄 Patient OR Doctor
export const patientOrDoctor = (req, res, next) => {
  if (!["patient", "doctor"].includes(req.user.role)) {
    return res.status(403).json({
      message: "Access denied",
    });
  }
  next();
};