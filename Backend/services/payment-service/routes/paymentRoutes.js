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
  getPaymentBySessionId,
  confirmStripePayment,
  getAllPayments,
} from "../controllers/paymentController.js";

const router = express.Router();



const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: "Too many payment requests. Please try again later." },
});



router.post("/stripe/webhook", stripeWebhook);



router.post(
  "/stripe/create-checkout",
  verifyToken,
  requireRole("patient"),
  paymentLimiter,
  createStripeCheckoutSession
);




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

// By session ID
router.get(
  "/session/:sessionId",
  verifyToken,
  requireRole("patient", "admin"),
  getPaymentBySessionId
);

// Confirm stripe payment on return
router.post(
  "/stripe/confirm",
  verifyToken,
  requireRole("patient"),
  confirmStripePayment
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