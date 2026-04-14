const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");

const {
  createStripePaymentIntent,
  createStripeCheckoutSession,
  stripeWebhook,
  confirmStripePayment,
} = require("../controllers/stripeController");

const {
  getPaymentHistory,
  getPaymentById,
  getPaymentByAppointment,
  getAllPayments,
} = require("../controllers/paymentController");

// Rate limiter for payment initiation
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: "Too many payment requests. Please try again later." },
});

// ── Stripe Routes ───────────────────────────────────────────────────────────

// Stripe webhook — must be first, needs raw body (no JWT auth)
router.post("/stripe/webhook", stripeWebhook);

// Create Stripe Checkout Session (easier for Postman testing)
router.post(
  "/stripe/create-checkout",
  verifyToken,
  requireRole("patient"),
  paymentLimiter,
  createStripeCheckoutSession
);

// Create Stripe PaymentIntent (patient only)
router.post(
  "/stripe/create-intent",
  verifyToken,
  requireRole("patient"),
  paymentLimiter,
  createStripePaymentIntent
);

// Confirm Stripe payment from frontend (patient only)
router.post(
  "/stripe/confirm",
  verifyToken,
  requireRole("patient"),
  confirmStripePayment
);

// ── General Routes ──────────────────────────────────────────────────────────

// Patient payment history
router.get("/history", verifyToken, requireRole("patient"), getPaymentHistory);

// Payment by appointment ID
router.get(
  "/appointment/:appointmentId",
  verifyToken,
  requireRole("patient", "doctor", "admin"),
  getPaymentByAppointment
);

// Admin — all payments
router.get("/admin/all", verifyToken, requireRole("admin"), getAllPayments);

// Single payment by ID
router.get("/:id", verifyToken, requireRole("patient", "admin"), getPaymentById);

module.exports = router;