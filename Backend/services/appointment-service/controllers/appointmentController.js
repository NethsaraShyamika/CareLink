import Appointment from "../models/appointment.js";
import axios from "axios";

const sendNotification = async (type, appointment) => {
  try {
    const NOTIFICATION_URL = process.env.NOTIFICATION_SERVICE_URL || "http://localhost:3006/notification";
    const AUTH_URL = process.env.AUTH_SERVICE_URL || "http://localhost:3008";
    const DOCTOR_URL = process.env.DOCTOR_SERVICE_URL || "http://localhost:3002";

    // 1. Fetch patient user data
    let patientData = null;
    try {
      const pRes = await axios.get(`${AUTH_URL}/api/auth/internal/users/${appointment.patientId}`);
      patientData = pRes.data;
    } catch(e) { console.error("Error fetching patient", e.message); }

    // 2. Fetch doctor user data
    let doctorData = null;
    try {
      const dRes = await axios.get(`${DOCTOR_URL}/api/doctors/doc/${appointment.doctorId}`);
      if (dRes.data && dRes.data.userId) {
         const uRes = await axios.get(`${AUTH_URL}/api/auth/internal/users/${dRes.data.userId}`);
         doctorData = uRes.data;
      }
    } catch(e) { console.error("Error fetching doctor", e.message); }

    const patientEmail = patientData?.email || "patient@gmail.com";
    const patientName = patientData ? `${patientData.firstName} ${patientData.lastName}` : `${appointment.firstName} ${appointment.lastName}`;
    const patientPhone = patientData?.phone || "";

    const doctorEmail = doctorData?.email || "doctor@gmail.com";
    const doctorName = doctorData ? `${doctorData.firstName} ${doctorData.lastName}` : `${appointment.doctorId}`;
    const doctorPhone = doctorData?.phone || "";

    // Map 'type' to the correct endpoint in notification service
    let endpoint = "";
    if (type === "booked") endpoint = "/appointment-booked";
    else if (type === "accepted") endpoint = "/appointment-accepted";
    else if (type === "cancelled") endpoint = "/appointment-cancelled";
    else if (type === "completed") endpoint = "/consultation-completed";
    else if (type === "confirmed") endpoint = "/notifications/confirmed";
    else if (type === "rescheduled") endpoint = "/notifications/rescheduled";
    else {
      console.log(`No explicit mapped route for notification type: ${type}`);
      return; 
    }

    await axios.post(
      `${NOTIFICATION_URL}${endpoint}`,
      {
        patientEmail,
        patientName,
        patientPhone,
        doctorEmail,
        doctorName: "Dr. " + doctorName,
        doctorPhone,
        appointmentId: appointment._id,
        date: appointment.date,
        time: appointment.timeSlot,
      }
    );

    console.log(`✅ Notification sent: ${type}`);
  } catch (err) {
    console.error("❌ Notification failed:", err.message);
  }
};

export const bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, timeSlot, reason } = req.body;
    
    // Get patient info from the authenticated user (from token)
    const patientId = req.user.id;
    const firstName = req.user.firstName;
    const lastName = req.user.lastName;

    if (!patientId || !doctorId || !date || !timeSlot) {
      return res.status(400).json({
        message: "doctorId, date, and timeSlot are required",
      });
    }

    if (!firstName || !lastName) {
      return res.status(400).json({
        message: "User profile missing first name or last name",
      });
    }

    const checkDate = new Date(date);

    // Check for doctor conflict
    const doctorConflict = await Appointment.findOne({
      doctorId,
      date: checkDate,
      timeSlot,
      status: { $in: ["pending", "accepted", "confirmed", "rescheduled"] },
    });

    if (doctorConflict) {
      return res.status(400).json({ message: "Doctor already has a booking at this time" });
    }

    // Check for patient conflict
    const patientConflict = await Appointment.findOne({
      patientId,
      date: checkDate,
      timeSlot,
      status: { $in: ["pending", "accepted", "confirmed", "rescheduled"] },
    });

    if (patientConflict) {
      return res.status(400).json({ message: "You already have an appointment at this time" });
    }

    // Create appointment with status "pending"
    const appointment = await Appointment.create({
      patientId,
      firstName,
      lastName,
      doctorId,
      date: checkDate,
      timeSlot,
      reason: reason || "",
      status: "pending",
    });

    res.status(201).json({
      message: "Appointment booked successfully",
      appointment,
    });
  } catch (error) {
    console.error("Book appointment error:", error);
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

    const appointmentWithName = {
      ...appointment.toObject(),
      patientName: `${appointment.firstName} ${appointment.lastName}`,
    };

    res.status(200).json(appointmentWithName);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ────────────────────────────────────────────────────
// Patient appointments
// ────────────────────────────────────────────────────
export const getPatientAppointments = async (req, res) => {
  try {
    const patientId = req.user?.id || req.params.patientId;
    
    const appointments = await Appointment.find({
      patientId: patientId,
    }).sort({ date: -1 });

    const enrichedAppointments = appointments.map(apt => ({
      ...apt.toObject(),
      patientName: `${apt.firstName} ${apt.lastName}`,
    }));

    res.status(200).json(enrichedAppointments);
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
    })
      .sort({ date: 1 })
      .lean();

    const enrichedAppointments = appointments.map(apt => ({
      ...apt,
      patientName: `${apt.firstName || ''} ${apt.lastName || ''}`.trim() || "Unknown Patient",
    }));
    
    res.status(200).json(enrichedAppointments);
  } catch (error) {
    console.error("Error in getDoctorAppointments:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ────────────────────────────────────────────────────
// Cancel appointment
// Allowed in: pending, accepted, rescheduled states only
// Not allowed in: confirmed, completed
// ────────────────────────────────────────────────────
export const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Check authorization - patient or doctor can cancel
    if (req.user.role === "patient" && appointment.patientId !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to cancel this appointment" });
    }

    // Cannot cancel in confirmed or completed states
    if (appointment.status === "confirmed") {
      return res.status(400).json({
        message: "Cannot cancel a confirmed appointment. Please contact support.",
      });
    }

    if (appointment.status === "completed") {
      return res.status(400).json({
        message: "Cannot cancel a completed appointment",
      });
    }

    // Allow cancellation only in these states
    if (!["pending", "accepted", "rescheduled"].includes(appointment.status)) {
      return res.status(400).json({
        message: `Cannot cancel appointment in ${appointment.status} state`,
      });
    }

    appointment.status = "cancelled";
    await appointment.save();

    await sendNotification("cancelled", appointment);

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
// Allowed only in: pending state
// ────────────────────────────────────────────────────
export const rescheduleAppointment = async (req, res) => {
  try {
    const { newDate, newTimeSlot } = req.body;

    if (!newDate || !newTimeSlot) {
      return res.status(400).json({
        message: "newDate and newTimeSlot are required"
      });
    }

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Check authorization - only patient can reschedule
    if (req.user.role !== "patient" || appointment.patientId !== req.user.id) {
      return res.status(403).json({ message: "Only the patient can reschedule this appointment" });
    }

    // Only pending appointments can be rescheduled
    if (appointment.status !== "pending") {
      return res.status(400).json({
        message: `Cannot reschedule appointment in ${appointment.status} state. Only pending appointments can be rescheduled.`,
      });
    }

    const checkDate = new Date(newDate);

    // Check for conflicts with new time
    const doctorConflict = await Appointment.findOne({
      doctorId: appointment.doctorId,
      date: checkDate,
      timeSlot: newTimeSlot,
      status: { $in: ["pending", "accepted", "confirmed", "rescheduled"] },
      _id: { $ne: appointment._id }
    });

    if (doctorConflict) {
      return res.status(400).json({ message: "Doctor already has a booking at this time" });
    }

    appointment.date = checkDate;
    appointment.timeSlot = newTimeSlot;
    appointment.status = "rescheduled";

    await appointment.save();

    await axios.post(`${process.env.NOTIFICATION_SERVICE_URL}/api/notifications/rescheduled`, {
      patientEmail: "patient@gmail.com",
      patientName: `${appointment.firstName} ${appointment.lastName}`,
      doctorName: "Dr. " + appointment.doctorId,
      appointmentId: appointment._id,
      date: appointment.date,
      time: appointment.timeSlot
    }).catch(err => console.error("Notification error:", err.message));

    res.status(200).json({
      message: "Appointment rescheduled successfully",
      appointment,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ────────────────────────────────────────────────────
// Doctor Confirm Appointment
// Changes status from pending/rescheduled to confirmed
// ────────────────────────────────────────────────────
export const acceptAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Only doctor can accept
    if (req.user.role !== "doctor") {
      return res.status(403).json({ message: "Only doctors can accept appointments" });
    }

    // Only pending, rescheduled, or already accepted appointments can be confirmed by doctor
    if (!["pending", "rescheduled", "accepted"].includes(appointment.status)) {
      return res.status(400).json({
        message: `Cannot confirm appointment in ${appointment.status} state. Only pending, accepted, or rescheduled appointments can be confirmed.`,
      });
    }

    appointment.status = "accepted";
    await appointment.save();
    await sendNotification("accepted", appointment);

    res.status(200).json({
      message: "Appointment accepted. Patient has been notified.",
      appointment,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// ────────────────────────────────────────────────────
// Confirm Payment
// Changes status from accepted to confirmed
// ────────────────────────────────────────────────────
export const confirmPayment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Only the patient who booked can confirm payment
    if (appointment.patientId !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to confirm payment for this appointment" });
    }

    // Only accepted appointments can be paid for
    if (appointment.status !== "accepted") {
      return res.status(400).json({
        message: `Cannot process payment for appointment in ${appointment.status} state. Appointment must be accepted by doctor first.`,
      });
    }

    appointment.status = "confirmed";
    await appointment.save();
    await sendNotification("confirmed", appointment);

    res.status(200).json({
      message: "Payment confirmed. Appointment is now confirmed.",
      appointment,
    });

  } catch (error) {
    console.error("Confirm payment error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// ────────────────────────────────────────────────────
// Complete Appointment (after video session)
// Changes status from confirmed to completed
// ────────────────────────────────────────────────────
export const completeAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Doctor can complete, or system can auto-complete after session
    if (req.user && req.user.role === "doctor" && appointment.doctorId !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to complete this appointment" });
    }

    // Only confirmed appointments can be completed
    if (appointment.status !== "confirmed") {
      return res.status(400).json({
        message: `Cannot complete appointment in ${appointment.status} state. Only confirmed appointments can be completed.`,
      });
    }

    appointment.status = "completed";
    await appointment.save();

    res.status(200).json({
      message: "Appointment completed successfully",
      appointment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ────────────────────────────────────────────────────
// Reject Appointment (by doctor)
// ────────────────────────────────────────────────────
export const rejectAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Only doctor can reject
    if (req.user.role !== "doctor") {
      return res.status(403).json({ message: "Only doctors can reject appointments" });
    }

    // Cannot reject completed or confirmed appointments
    if (["completed", "confirmed", "cancelled"].includes(appointment.status)) {
      return res.status(400).json({
        message: `Cannot reject a ${appointment.status} appointment`
      });
    }

    // Only pending or rescheduled appointments can be rejected
    if (!["pending", "rescheduled"].includes(appointment.status)) {
      return res.status(400).json({
        message: "Only pending or rescheduled appointments can be rejected"
      });
    }

    appointment.status = "rejected";
    await appointment.save();
    await sendNotification("rejected", appointment);

    res.status(200).json({
      message: "Appointment rejected successfully",
      appointment
    });

  } catch (error) {
    console.error("Reject error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ────────────────────────────────────────────────────
// Get appointment status (helper)
// ────────────────────────────────────────────────────
export const getAppointmentStatus = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const statusInfo = {
      status: appointment.status,
      canCancel: ["pending", "accepted", "rescheduled"].includes(appointment.status),
      canReschedule: appointment.status === "pending",
      canPay: appointment.status === "accepted",
      canJoin: appointment.status === "confirmed",
      canComplete: appointment.status === "confirmed",
      message: ""
    };

    if (appointment.status === "pending") {
      statusInfo.message = "Waiting for doctor to accept";
    } else if (appointment.status === "accepted") {
      statusInfo.message = "Doctor accepted. Please complete payment to confirm.";
    } else if (appointment.status === "confirmed") {
      statusInfo.message = "Payment confirmed. Join the session at scheduled time.";
    } else if (appointment.status === "completed") {
      statusInfo.message = "Appointment completed";
    } else if (appointment.status === "cancelled") {
      statusInfo.message = "Appointment cancelled";
    } else if (appointment.status === "rejected") {
      statusInfo.message = "Appointment rejected by doctor";
    }

    res.status(200).json(statusInfo);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ────────────────────────────────────────────────────
// Get appointments by status
// ────────────────────────────────────────────────────
export const getAppointmentsByStatus = async (req, res) => {
  try {
    const { status } = req.params;

    const appointments = await Appointment.find({ status }).sort({ date: -1 });

    const enrichedAppointments = appointments.map(apt => ({
      ...apt.toObject(),
      patientName: `${apt.firstName} ${apt.lastName}`,
    }));

    res.status(200).json(enrichedAppointments);
  } catch (error) {
    console.error("Error fetching appointments by status:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Only admin can delete appointments
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete appointments" });
    }

    await Appointment.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Appointment deleted successfully",
    });
  } catch (error) {
    console.error("Delete error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ date: -1 });

    const enrichedAppointments = appointments.map(apt => ({
      ...apt.toObject(),
      patientName: `${apt.firstName || ''} ${apt.lastName || ''}`.trim() || "Unknown Patient",
    }));

    res.status(200).json({
      count: appointments.length,
      appointments: enrichedAppointments,
    });
  } catch (error) {
    console.error("Get all error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAvailableSlots = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    if (!doctorId || !date) {
      return res.status(400).json({
        message: "doctorId and date are required"
      });
    }

    const checkDate = new Date(date);

    const bookedAppointments = await Appointment.find({
      doctorId,
      date: checkDate,
      status: { $in: ["pending", "accepted", "confirmed", "rescheduled"] }
    });

    const bookedSlots = bookedAppointments.map(app => app.timeSlot);

    const allSlots = [
      "09:00 AM",
      "10:00 AM",
      "11:00 AM",
      "12:00 PM",
      "02:00 PM",
      "03:00 PM",
      "04:00 PM",
      "05:00 PM"
    ];

    const availableSlots = allSlots.filter(
      slot => !bookedSlots.includes(slot)
    );

    res.status(200).json({
      doctorId,
      date: checkDate,
      availableSlots
    });

  } catch (error) {
    console.error("Error fetching slots:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.id;

    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Check authorization
    if (req.user.role === "patient" && appointment.patientId !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to update this appointment" });
    }

    if (["completed", "cancelled", "rejected", "confirmed"].includes(appointment.status)) {
      return res.status(400).json({
        message: `Cannot update a ${appointment.status} appointment`
      });
    }

    const allowedUpdates = ["reason", "notes"];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        appointment[field] = req.body[field];
      }
    });

    await appointment.save();

    res.status(200).json({
      message: "Appointment updated successfully",
      appointment
    });

  } catch (error) {
    console.error("Update error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Note: confirmAppointment is renamed to acceptAppointment to better reflect the workflow
// Keep both for backward compatibility
export const confirmAppointment = acceptAppointment;