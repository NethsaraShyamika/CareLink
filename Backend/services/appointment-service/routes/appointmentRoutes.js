const express = require("express");
const router = express.Router();
const { protect, patientOnly, doctorOnly, patientOrDoctor } = require("../middleware/authMiddleware");

const {
  bookAppointment,
  getAppointmentById,
  getPatientAppointments,
  getDoctorAppointments,
  cancelAppointment,
  rescheduleAppointment,
  trackAppointmentStatus,
  confirmAppointment,
  confirmPayment,
  completeAppointment,
  searchDoctors,
} = require("../controllers/appointmentController");

// ── Doctor search ──
router.get("/doctors/search", searchDoctors);

// ── Appointment routes ──

// Note: the /patient/:patientId and /doctor/:doctorId routes MUST come
// before /:id  — otherwise Express reads "patient" as the :id value
router.get("/appointments/patient/:patientId", getPatientAppointments);
router.get("/appointments/doctor/:doctorId", getDoctorAppointments);

router.post("/appointments", protect, patientOnly, bookAppointment);
router.get("/appointments/:id", getAppointmentById);
router.get("/appointments/:id/status", trackAppointmentStatus);
router.put("/appointments/:id/cancel", protect, patientOrDoctor, cancelAppointment);
router.put("/appointments/:id/reschedule", protect, patientOnly, rescheduleAppointment);
router.put("/appointments/:id/confirm", protect, doctorOnly, confirmAppointment);
router.put("/appointments/:id/complete", protect, doctorOnly, completeAppointment);
// payment confirmation by patient (after successful payment)
router.put("/appointments/:id/confirm-payment", protect, patientOnly, confirmPayment);

module.exports = router;