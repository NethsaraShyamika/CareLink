const express = require("express");
const router = express.Router();

const {
  bookAppointment,
  getAppointmentById,
  getPatientAppointments,
  getDoctorAppointments,
  cancelAppointment,
  rescheduleAppointment,
  trackAppointmentStatus,
  confirmAppointment,
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

router.post("/appointments", bookAppointment);
router.get("/appointments/:id", getAppointmentById);
router.get("/appointments/:id/status", trackAppointmentStatus);
router.put("/appointments/:id/cancel", cancelAppointment);
router.put("/appointments/:id/reschedule", rescheduleAppointment);
router.put("/appointments/:id/confirm", confirmAppointment);
router.put("/appointments/:id/complete", completeAppointment);

module.exports = router;