const Appointment = require("../models/appointment");
const axios = require("axios");

// ────────────────────────────────────────────────────
// Book a new appointment
// POST /api/appointments
// ────────────────────────────────────────────────────
const bookAppointment = async (req, res) => {
  try {
    const { patientId, doctorId, date, timeSlot, reason } = req.body;

    // Check all required fields are provided
    if (!patientId || !doctorId || !date || !timeSlot) {
      return res.status(400).json({
        message: "patientId, doctorId, date, and timeSlot are required",
      });
    }

    // Check if this doctor already has a booking at this date + time
    const existing = await Appointment.findOne({
      doctorId,
      date: new Date(date),
      timeSlot,
      status: { $in: ["pending", "confirmed"] },
    });

    if (existing) {
      return res.status(400).json({
        message: "This time slot is already booked. Please choose another.",
      });
    }

    // Create the appointment
    const appointment = await Appointment.create({
      patientId,
      doctorId,
      date: new Date(date),
      timeSlot,
      reason: reason || "",
    });

    res.status(201).json({
      message: "Appointment booked successfully",
      appointment,
    });
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

    if (appointment.status === "cancelled") {
      return res.status(400).json({ message: "Appointment is already cancelled" });
    }

    if (appointment.status === "completed") {
      return res.status(400).json({ message: "Cannot cancel a completed appointment" });
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

    if (appointment.status === "cancelled" || appointment.status === "completed") {
      return res.status(400).json({
        message: `Cannot reschedule a ${appointment.status} appointment`,
      });
    }

    // Check if the new slot is free for that doctor
    const conflict = await Appointment.findOne({
      doctorId: appointment.doctorId,
      date: new Date(newDate),
      timeSlot: newTimeSlot,
      status: { $in: ["pending", "confirmed"] },
      _id: { $ne: appointment._id }, // exclude this appointment itself
    });

    if (conflict) {
      return res.status(400).json({
        message: "That new time slot is already taken. Choose another.",
      });
    }

    // Save old values for reference, update to new ones
    appointment.rescheduledDate = new Date(newDate);
    appointment.rescheduledTimeSlot = newTimeSlot;
    appointment.date = new Date(newDate);
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
// Doctor confirms appointment
// PUT /api/appointments/:id/confirm
// ────────────────────────────────────────────────────
const confirmAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (appointment.status !== "pending") {
      return res.status(400).json({ message: "Only pending appointments can be confirmed" });
    }

    appointment.status = "confirmed";
    await appointment.save();

    res.status(200).json({ message: "Appointment confirmed", appointment });
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
  searchDoctors,
};