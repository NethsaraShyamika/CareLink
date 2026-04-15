import express from "express";
import rateLimit from "express-rate-limit";

import { verifyToken, requireRole } from "../middleware/authMiddleware.js";

import {
  createStripeCheckoutSession,
  stripeWebhook,
} from "../controllers/stripeController.js";

import {
  getPaymentHistory,
  getPaymentById,
  getPaymentByAppointment,
  getAllPayments,
} from "../controllers/paymentController.js";

const router = express.Router();


// ─────────────────────────────────────────────
// RATE LIMITER
// ─────────────────────────────────────────────
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: "Too many payment requests. Please try again later." },
});


// ─────────────────────────────────────────────
// STRIPE WEBHOOK (IMPORTANT)
// ─────────────────────────────────────────────
// ⚠ DO NOT use verifyToken here
// ⚠ MUST be raw body (handled in app.js)
router.post("/stripe/webhook", stripeWebhook);


// ─────────────────────────────────────────────
// STRIPE CHECKOUT (ONLY FLOW USED)
// ─────────────────────────────────────────────
router.post(
  "/stripe/create-checkout",
  verifyToken,
  requireRole("patient"),
  paymentLimiter,
  createStripeCheckoutSession
);


// ─────────────────────────────────────────────
// PAYMENT QUERIES
// ─────────────────────────────────────────────

// Patient history
router.get(
  "/history",
  verifyToken,
  requireRole("patient"),
  getPaymentHistory
);

// By appointment
router.get(
  "/appointment/:appointmentId",
  verifyToken,
  requireRole("patient", "doctor", "admin"),
  getPaymentByAppointment
);

// Admin all payments
router.get(
  "/admin/all",
  verifyToken,
  requireRole("admin"),
  getAllPayments
);

// Single payment
router.get(
  "/:id",
  verifyToken,
  requireRole("patient", "admin"),
  getPaymentById
);

export default router;