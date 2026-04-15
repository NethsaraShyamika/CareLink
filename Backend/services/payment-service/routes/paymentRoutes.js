import express from "express";
import rateLimit from "express-rate-limit";

import { verifyToken, requireRole } from "../middleware/authMiddleware.js";

import {
  createStripePaymentIntent,
  createStripeCheckoutSession,
  stripeWebhook,
  confirmStripePayment,
} from "../controllers/stripeController.js";

import {
  getPaymentHistory,
  getPaymentById,
  getPaymentByAppointment,
  getAllPayments,
} from "../controllers/paymentController.js";

const router = express.Router();

// Rate limiter for payment initiation
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: "Too many payment requests. Please try again later." },
});

// ── Stripe Routes ───────────────────────────────────────────────

// Stripe webhook (must be first, no auth, raw body required)
router.post("/stripe/webhook", stripeWebhook);

// Create Stripe Checkout Session
router.post(
  "/stripe/create-checkout",
  verifyToken,
  requireRole("patient"),
  paymentLimiter,
  createStripeCheckoutSession,
);

// Create Stripe PaymentIntent
router.post(
  "/stripe/create-intent",
  verifyToken,
  requireRole("patient"),
  paymentLimiter,
  createStripePaymentIntent,
);

// Confirm Stripe payment
router.post(
  "/stripe/confirm",
  verifyToken,
  requireRole("patient"),
  confirmStripePayment,
);

// ── General Routes ───────────────────────────────────────────────

// Patient payment history
router.get("/history", verifyToken, requireRole("patient"), getPaymentHistory);

// Payment by appointment ID
router.get(
  "/appointment/:appointmentId",
  verifyToken,
  requireRole("patient", "doctor", "admin"),
  getPaymentByAppointment,
);

// Admin — all payments
router.get("/admin/all", verifyToken, requireRole("admin"), getAllPayments);

// Single payment by ID
router.get(
  "/:id",
  verifyToken,
  requireRole("patient", "admin"),
  getPaymentById,
);

export default router;
