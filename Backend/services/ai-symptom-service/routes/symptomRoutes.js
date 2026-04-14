// routes/symptomRoutes.js
const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");
const {
  checkSymptoms,
  getHistoryRoute,
  getCheckById,
} = require("../controllers/symptomController");

// Rate limiter — prevent AI API abuse (max 10 checks per 15 min per IP)
const symptomLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { message: "Too many requests. Please try again later." },
});

// ---------------------------- ROUTES ---------------------------- //

// POST /api/symptoms/check — patients only
router.post(
  "/check",
  verifyToken,
  requireRole("patient"),
  symptomLimiter,
  checkSymptoms
);

// GET /api/symptoms/history — patients view their own history
router.get(
  "/history",
  verifyToken,
  requireRole("patient"),
  getHistoryRoute
);

// GET /api/symptoms/:id — single record (patient or admin)
router.get(
  "/:id",
  verifyToken,
  requireRole("patient", "admin"),
  getCheckById
);

module.exports = router;