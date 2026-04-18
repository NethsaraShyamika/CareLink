import jwt from "jsonwebtoken";
import axios from "axios";


export const protect = async (req, res, next) => {
  let token = req.headers.authorization;


  if (!token || !token.startsWith("Bearer")) {
    return res.status(401).json({
      message: "Not authorized, token missing",
    });
  }

  try {
    
    token = token.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Set basic user info from token
    req.user = {
      id: decoded.id,
      role: decoded.role,
      firstName: decoded.firstName || "",
      lastName: decoded.lastName || "",
      email: decoded.email || "",
    };

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Not authorized, invalid token",
    });
  }
};


export const patientOnly = (req, res, next) => {
  if (req.user.role !== "patient") {
    return res.status(403).json({
      message: "Access denied: Patients only",
    });
  }
  next();
};


export const doctorOnly = (req, res, next) => {
  if (req.user.role !== "doctor") {
    return res.status(403).json({
      message: "Access denied: Doctors only",
    });
  }
  next();
};


export const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Access denied: Admins only",
    });
  }
  next();
};


export const patientOrDoctor = (req, res, next) => {
  if (!["patient", "doctor"].includes(req.user.role)) {
    return res.status(403).json({
      message: "Access denied",
    });
  }
  next();
};