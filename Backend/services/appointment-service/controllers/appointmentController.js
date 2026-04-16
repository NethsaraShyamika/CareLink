const Appointment = require("../models/appointment");
const axios = require("axios");

// ────────────────────────────────────────────────────
// Book a new appointment
// POST /api/appointments
// ────────────────────────────────────────────────────
const bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, timeSlot, reason } = req.body;
    // prefer authenticated user as patientId when available
    const patientId = req.body.patientId || (req.user && req.user.id);

    // Check all required fields are provided
    if (!patientId || !doctorId || !date || !timeSlot) {
      return res.status(400).json({
        message: "patientId, doctorId, date, and timeSlot are required",
      });
    }

    const checkDate = new Date(date);

    // Prevent double-booking for the doctor
    const doctorConflict = await Appointment.findOne({
      doctorId,
      date: checkDate,
      timeSlot,
      status: { $in: ["pending", "accepted", "confirmed", "rescheduled"] },
    });
    if (doctorConflict) {
      return res.status(400).json({ message: "Doctor already has a booking at this time" });
    }

    // Prevent patient having two appointments at same time
    const patientConflict = await Appointment.findOne({
      patientId,
      date: checkDate,
      timeSlot,
      status: { $in: ["pending", "accepted", "confirmed", "rescheduled"] },
    });
    if (patientConflict) {
      return res.status(400).json({ message: "You already have an appointment at this time" });
    }

    // Create the appointment (status = pending)
    const appointment = await Appointment.create({
      patientId,
      doctorId,
      date: checkDate,
      timeSlot,
      reason: reason || "",
    });

    res.status(201).json({ message: "Appointment booked successfully", appointment });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ────────────────────────────────────────────────────
// Get a single appointment by its ID
// GET /api/appointments/:id
// ────────────────────────────────────────────────────
const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.status(200).json(appointment);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ────────────────────────────────────────────────────
// Get all appointments for a patient
// GET /api/appointments/patient/:patientId
// ────────────────────────────────────────────────────
const getPatientAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      patientId: req.params.patientId,
    }).sort({ date: -1 }); // newest first

    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ────────────────────────────────────────────────────
// Get all appointments for a doctor
// GET /api/appointments/doctor/:doctorId
// ────────────────────────────────────────────────────
const getDoctorAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      doctorId: req.params.doctorId,
    }).sort({ date: 1 }); // upcoming first

    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ────────────────────────────────────────────────────
// Cancel an appointment
// PUT /api/appointments/:id/cancel
// ────────────────────────────────────────────────────
const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // ❌ Only block completed + confirmed
    if (["completed", "confirmed"].includes(appointment.status)) {
      return res.status(400).json({
        message: `Cannot cancel a ${appointment.status} appointment`,
      });
    }

    appointment.status = "cancelled";
    await appointment.save();

    res.status(200).json({
      message: "Appointment cancelled successfully",
      appointment,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ────────────────────────────────────────────────────
// Reschedule an appointment
// PUT /api/appointments/:id/reschedule
// Body: { newDate, newTimeSlot }
// Only allowed when appointment is still 'pending' (patient can reschedule)
// ────────────────────────────────────────────────────
const rescheduleAppointment = async (req, res) => {
  try {
    const { newDate, newTimeSlot } = req.body;

    if (!newDate || !newTimeSlot) {
      return res.status(400).json({ message: "newDate and newTimeSlot are required" });
    }

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // ✅ Allow reschedule for pending + rescheduled
    if (!["pending", "rescheduled"].includes(appointment.status)) {
      return res.status(400).json({
        message: "Only pending or rescheduled appointments can be changed",
      });
    }

    const checkDate = new Date(newDate);

    // Conflict checks (same as yours)
    const doctorConflict = await Appointment.findOne({
      doctorId: appointment.doctorId,
      date: checkDate,
      timeSlot: newTimeSlot,
      status: { $in: ["pending", "accepted", "confirmed", "rescheduled"] },
      _id: { $ne: appointment._id },
    });

    if (doctorConflict) {
      return res.status(400).json({ message: "Time slot already taken" });
    }

    const patientConflict = await Appointment.findOne({
      patientId: appointment.patientId,
      date: checkDate,
      timeSlot: newTimeSlot,
      status: { $in: ["pending", "accepted", "confirmed", "rescheduled"] },
      _id: { $ne: appointment._id },
    });

    if (patientConflict) {
      return res.status(400).json({ message: "You already have an appointment at this time" });
    }

    appointment.rescheduledDate = checkDate;
    appointment.rescheduledTimeSlot = newTimeSlot;
    appointment.date = checkDate;
    appointment.timeSlot = newTimeSlot;
    appointment.status = "rescheduled";

    await appointment.save();

    res.status(200).json({
      message: "Appointment rescheduled successfully",
      appointment,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ────────────────────────────────────────────────────
// Track appointment status
// GET /api/appointments/:id/status
// ────────────────────────────────────────────────────
const trackAppointmentStatus = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id).select(
      "status date timeSlot patientId doctorId"
    );

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.status(200).json({
      appointmentId: appointment._id,
      status: appointment.status,
      date: appointment.date,
      timeSlot: appointment.timeSlot,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ────────────────────────────────────────────────────
// Doctor accepts appointment (moves from 'pending' -> 'accepted')
// PUT /api/appointments/:id/confirm
// After acceptance, patient can make payment. Acceptance must ensure no conflicts.
// ────────────────────────────────────────────────────
const confirmAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // ✅ Allow BOTH pending + rescheduled
    if (!["pending", "rescheduled"].includes(appointment.status)) {
      return res.status(400).json({
        message: "Only pending or rescheduled appointments can be accepted",
      });
    }

    // Conflict checks (same)
    const doctorConflict = await Appointment.findOne({
      doctorId: appointment.doctorId,
      date: appointment.date,
      timeSlot: appointment.timeSlot,
      status: { $in: ["accepted", "confirmed"] },
      _id: { $ne: appointment._id },
    });

    if (doctorConflict) {
      return res.status(400).json({
        message: "Doctor already has a booking at this time",
      });
    }

    const patientConflict = await Appointment.findOne({
      patientId: appointment.patientId,
      date: appointment.date,
      timeSlot: appointment.timeSlot,
      status: { $in: ["accepted", "confirmed"] },
      _id: { $ne: appointment._id },
    });

    if (patientConflict) {
      return res.status(400).json({
        message: "Patient already has a booking at this time",
      });
    }

    appointment.status = "accepted";
    await appointment.save();

    res.status(200).json({
      message: "Appointment accepted",
      appointment,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ────────────────────────────────────────────────────
// Patient confirms payment for appointment -> set to 'confirmed'
// PUT /api/appointments/:id/confirm-payment
// ────────────────────────────────────────────────────
const confirmPayment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    if (appointment.status !== "accepted") {
      return res.status(400).json({ message: "Payment can only be made after doctor acceptance" });
    }

    // Optionally check patient identity (if req.user present)
    if (req.user && req.user.id && appointment.patientId !== req.user.id) {
      return res.status(403).json({ message: "You may only pay for your own appointments" });
    }

    appointment.status = "confirmed";
    await appointment.save();

    res.status(200).json({ message: "Payment recorded, appointment confirmed", appointment });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ────────────────────────────────────────────────────
// Doctor marks appointment as completed
// PUT /api/appointments/:id/complete
// Body: { doctorNotes } (optional)
// ────────────────────────────────────────────────────
const completeAppointment = async (req, res) => {
  try {
    const { doctorNotes } = req.body;

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (appointment.status !== "confirmed") {
      return res.status(400).json({ message: "Only confirmed appointments can be completed" });
    }

    appointment.status = "completed";
    if (doctorNotes) appointment.doctorNotes = doctorNotes;

    await appointment.save();

    res.status(200).json({ message: "Appointment completed", appointment });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ────────────────────────────────────────────────────
// Search doctors by specialty (calls Doctor Service)
// GET /api/doctors/search?specialty=Cardiology
// ────────────────────────────────────────────────────
const searchDoctors = async (req, res) => {
  try {
    const { specialty, name } = req.query;

    // Build query string
    const params = new URLSearchParams();
    if (specialty) params.append("specialty", specialty);
    if (name) params.append("name", name);

    // Call Pasan's Doctor Service
    const response = await axios.get(
      `${process.env.DOCTOR_SERVICE_URL}/api/doctors?${params.toString()}`
    );

    res.status(200).json(response.data);
  } catch (error) {
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    res.status(500).json({
      message: "Could not reach Doctor Service",
      error: error.message,
    });
  }
};

module.exports = {
  bookAppointment,
  getAppointmentById,
  getPatientAppointments,
  getDoctorAppointments,
  cancelAppointment,
  rescheduleAppointment,
  trackAppointmentStatus,
  confirmAppointment,
  completeAppointment,
  confirmPayment,
  searchDoctors,
};