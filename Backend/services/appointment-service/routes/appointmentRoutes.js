import express from "express";

import {
  bookAppointment,
  getAppointmentById,
  getPatientAppointments,
  getDoctorAppointments,
  cancelAppointment,
  rescheduleAppointment,
  confirmAppointment,
  acceptAppointment,  
  confirmPayment,
  completeAppointment,
  getAllAppointments,
  deleteAppointment,
  updateAppointment,
  rejectAppointment,
  getAvailableSlots,
  getAppointmentsByStatus,
  getAppointmentStatus  
} from "../controllers/appointmentController.js";

import {
  protect,
  patientOnly,
  doctorOnly,
  patientOrDoctor,
  adminOnly
} from "../middleware/authMiddleware.js";

const router = express.Router();


router.post("/appointments", protect, patientOnly, bookAppointment);


// Get appointment status info (can cancel, can reschedule, etc.)
router.get("/appointments/:id/status", protect, getAppointmentStatus);

// Get appointments by status (pending, confirmed, etc.)
router.get("/appointments/status/:status", protect, getAppointmentsByStatus);

// Get available slots for a doctor
router.get("/appointments/availability/:doctorId", getAvailableSlots);

// Get all appointments of a patient
router.get("/appointments/patient/:patientId", protect, patientOnly, getPatientAppointments);

// Get all appointments of a doctor
router.get("/appointments/doctor/:doctorId", protect, doctorOnly, getDoctorAppointments);



// Get all appointments
router.get("/appointments", protect, adminOnly, getAllAppointments);

// Delete appointment (hard delete)
router.delete("/appointments/:id", protect, adminOnly, deleteAppointment);




// 1. Cancel appointment (patient/doctor can cancel in pending/accepted/rescheduled states)
router.put("/appointments/:id/cancel", protect, patientOrDoctor, cancelAppointment);

// 2. Reschedule appointment (patient only, only in pending state)
router.put("/appointments/:id/reschedule", protect, patientOnly, rescheduleAppointment);

// 3. Doctor confirms appointment (pending/rescheduled -> confirmed)
router.put("/appointments/:id/accept", protect, doctorOnly, acceptAppointment);

// 4. Doctor rejects appointment (pending/rescheduled -> rejected)
router.put("/appointments/:id/reject", protect, doctorOnly, rejectAppointment);

// 5. Patient confirms payment (accepted -> confirmed)
router.put("/appointments/:id/confirm-payment", protect, patientOnly, confirmPayment);

// 6. Doctor completes appointment after session (confirmed -> completed)
router.put("/appointments/:id/complete", protect, doctorOnly, completeAppointment);

// 7. Update appointment details (reason, notes, etc.) - only in pending/accepted states
router.put("/appointments/:id", protect, patientOnly, updateAppointment);


router.get("/appointments/:id", getAppointmentById);

// Backward compatibility - keep old confirm route
router.put("/appointments/:id/confirm", protect, doctorOnly, confirmAppointment);

export default router;