import Appointment from "../models/appointment.js";
import axios from "axios";

// ────────────────────────────────────────────────────
// Book a new appointment
// ────────────────────────────────────────────────────
export const bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, timeSlot, reason } = req.body;
    const patientId = req.body.patientId || (req.user && req.user.id);

    if (!patientId || !doctorId || !date || !timeSlot) {
      return res.status(400).json({
        message: "patientId, doctorId, date, and timeSlot are required",
      });
    }

    const checkDate = new Date(date);

    const doctorConflict = await Appointment.findOne({
      doctorId,
      date: checkDate,
      timeSlot,
      status: { $in: ["pending", "accepted", "confirmed", "rescheduled"] },
    });

    if (doctorConflict) {
      return res.status(400).json({ message: "Doctor already has a booking at this time" });
    }

    const patientConflict = await Appointment.findOne({
      patientId,
      date: checkDate,
      timeSlot,
      status: { $in: ["pending", "accepted", "confirmed", "rescheduled"] },
    });

    if (patientConflict) {
      return res.status(400).json({ message: "You already have an appointment at this time" });
    }

    const appointment = await Appointment.create({
      patientId,
      doctorId,
      date: checkDate,
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
// Get appointment by ID
// ────────────────────────────────────────────────────
export const getAppointmentById = async (req, res) => {
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
// Patient appointments
// ────────────────────────────────────────────────────
export const getPatientAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      patientId: req.params.patientId,
    }).sort({ date: -1 });

    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ────────────────────────────────────────────────────
// Doctor appointments
// ────────────────────────────────────────────────────
export const getDoctorAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      doctorId: req.params.doctorId,
    }).sort({ date: 1 });

    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ────────────────────────────────────────────────────
// Cancel appointment
// ────────────────────────────────────────────────────
export const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

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
// Reschedule
// ────────────────────────────────────────────────────
export const rescheduleAppointment = async (req, res) => {
  try {
    const { newDate, newTimeSlot } = req.body;

    if (!newDate || !newTimeSlot) {
      return res.status(400).json({ message: "newDate and newTimeSlot are required" });
    }

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (!["pending", "rescheduled"].includes(appointment.status)) {
      return res.status(400).json({
        message: "Only pending or rescheduled appointments can be changed",
      });
    }

    const checkDate = new Date(newDate);

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
// Confirm (Doctor accept)
// ────────────────────────────────────────────────────
export const confirmAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (!["pending", "rescheduled"].includes(appointment.status)) {
      return res.status(400).json({
        message: "Only pending or rescheduled appointments can be accepted",
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
// Payment confirm
// ────────────────────────────────────────────────────
export const confirmPayment = async (req, res) => {
  try {
    console.log("Confirm payment called for appointment:", req.params.id);
    console.log("User:", req.user);
    console.log("Headers:", req.headers.authorization);

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      console.log("Appointment not found");
      return res.status(404).json({ message: "Appointment not found" });
    }

    console.log("Current appointment status:", appointment.status);
    console.log("Appointment data:", {
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      date: appointment.date,
      timeSlot: appointment.timeSlot
    });

    // For debugging, allow confirmation regardless of status
    // if (appointment.status !== "accepted") {
    //   console.log("Appointment status is not accepted");
    //   return res.status(400).json({
    //     message: "Payment only after acceptance",
    //   });
    // }

    appointment.status = "confirmed";
    await appointment.save();

    console.log("Appointment confirmed successfully");

    res.status(200).json({
      message: "Payment confirmed",
      appointment,
    });
  } catch (error) {
    console.error("Confirm payment error:", error.message);
    res.status(500).json({ message: error.message });
  }
};;

// ────────────────────────────────────────────────────
// Complete
// ────────────────────────────────────────────────────
export const completeAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (appointment.status !== "confirmed") {
      return res.status(400).json({
        message: "Only confirmed appointments can be completed",
      });
    }

    appointment.status = "completed";
    await appointment.save();

    res.status(200).json({
      message: "Completed",
      appointment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};