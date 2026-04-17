import express from "express";

import {
  bookAppointment,
  getAppointmentById,
  getPatientAppointments,
  getDoctorAppointments,
  cancelAppointment,
  rescheduleAppointment,
  confirmAppointment,
  confirmPayment,
  completeAppointment,
  getAllAppointments,
  deleteAppointment,
  updateAppointment,
  rejectAppointment,
  getAvailableSlots,
  getAppointmentsByStatus
} from "../controllers/appointmentController.js";

import {
  protect,
  patientOnly,
  doctorOnly,
  patientOrDoctor,
  adminOnly
} from "../middleware/authMiddleware.js";

const router = express.Router();


// ─────────────────────────────────────────────
// 🟢 CREATE APPOINTMENT
// ─────────────────────────────────────────────
router.post("/appointments", protect, patientOnly, bookAppointment);


// ─────────────────────────────────────────────
// 🔍 FILTER & SPECIAL ROUTES (IMPORTANT FIRST)
// ─────────────────────────────────────────────

// Get appointments by status (pending, confirmed, etc.)
router.get("/appointments/status/:status", protect,getAppointmentsByStatus);

// Get available slots for a doctor
router.get("/appointments/availability/:doctorId", getAvailableSlots);

// Get all appointments of a patient
router.get("/appointments/patient/:patientId", getPatientAppointments);

// Get all appointments of a doctor
router.get("/appointments/doctor/:doctorId", getDoctorAppointments);


// ─────────────────────────────────────────────
// 🛡️ ADMIN ROUTES
// ─────────────────────────────────────────────

// Get all appointments
router.get("/appointments", protect, adminOnly, getAllAppointments);

// Delete appointment (hard delete)
router.delete("/appointments/:id", protect, adminOnly, deleteAppointment);


// ─────────────────────────────────────────────
// ⚙️ ACTION ROUTES
// ─────────────────────────────────────────────

// Cancel appointment
router.put("/appointments/:id/cancel", protect, patientOrDoctor, cancelAppointment);

// Reschedule appointment
router.put("/appointments/:id/reschedule", protect, patientOnly, rescheduleAppointment);

// Doctor confirms appointment
router.put("/appointments/:id/confirm", protect, doctorOnly, confirmAppointment);

// Doctor rejects appointment
router.put("/appointments/:id/reject", protect, doctorOnly, rejectAppointment);

// Patient confirms payment
router.put("/appointments/:id/confirm-payment", protect, patientOnly, confirmPayment);

// Doctor marks as completed
router.put("/appointments/:id/complete", protect, doctorOnly, completeAppointment);

// Update appointment details (reason, notes, etc.)
router.put("/appointments/:id", protect, patientOnly, updateAppointment);


// ─────────────────────────────────────────────
// 📌 SINGLE APPOINTMENT (KEEP LAST)
// ─────────────────────────────────────────────
router.get("/appointments/:id", getAppointmentById);


export default router;