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
} from "../controllers/appointmentController.js";

import {
  protect,
  patientOnly,
  doctorOnly,
  patientOrDoctor,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// ── Appointment routes ──
router.post("/appointments", protect, patientOnly, bookAppointment);

router.get("/appointments/:id", getAppointmentById);

router.get("/appointments/patient/:patientId", getPatientAppointments);

router.get("/appointments/doctor/:doctorId", getDoctorAppointments);

router.put("/appointments/:id/cancel", protect, patientOrDoctor, cancelAppointment);

router.put("/appointments/:id/reschedule", protect, patientOnly, rescheduleAppointment);

router.put("/appointments/:id/confirm", protect, doctorOnly, confirmAppointment);

router.put("/appointments/:id/confirm-payment", protect, patientOnly, confirmPayment);

router.put("/appointments/:id/complete", protect, doctorOnly, completeAppointment);

export default router;