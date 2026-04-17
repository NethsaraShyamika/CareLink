import Appointment from "../models/appointment.js";
import axios from "axios";

const sendNotification = async (type, appointment) => {
  try {
    await axios.post(
      `${process.env.NOTIFICATION_SERVICE_URL}/api/notifications/${type}`,
      {
        patientEmail: "patient@gmail.com", // temp
        patientName: "Patient",
        doctorName: "Dr. " + appointment.doctorId,
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
      return res.status(400).json({
        message: "newDate and newTimeSlot are required"
      });
    }

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const checkDate = new Date(newDate);

    appointment.date = checkDate;
    appointment.timeSlot = newTimeSlot;
    appointment.status = "rescheduled";

    await appointment.save();

    // 🔔 Send notification
    await axios.post("http://localhost:5003/api/notifications/rescheduled", {
      patientEmail: "patient@gmail.com",
      patientName: "Patient",
      doctorName: "Dr. " + appointment.doctorId,
      appointmentId: appointment._id,
      date: appointment.date,
      time: appointment.timeSlot
    });

    res.status(200).json({
      message: "Appointment rescheduled successfully",
      appointment,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
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
        message: "Only pending or rescheduled appointments can be confirmed",
      });
    }

    // ✅ Update status
    appointment.status = "confirmed";
    await appointment.save();
    await sendNotification("confirmed", appointment);

    // 🔔 Send notification
  
    res.status(200).json({
      message: "Appointment confirmed",
      appointment,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
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
    await sendNotification("confirmed", appointment);


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

export const getAppointmentsByStatus = async (req, res) => {
  try {
    const { status } = req.params;

    const appointments = await Appointment.find({ status }).sort({ date: -1 });

    res.status(200).json(appointments);
  } catch (error) {
    console.error("Error fetching appointments by status:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

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

    res.status(200).json({
      count: appointments.length,
      appointments,
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

    // Get all booked slots for this doctor on that date
    const bookedAppointments = await Appointment.find({
      doctorId,
      date: checkDate
    });

    const bookedSlots = bookedAppointments.map(app => app.timeSlot);

    // Example fixed time slots (you can change this later)
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

    // Filter available slots
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

export const rejectAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Only allow rejection in valid states
    if (["completed", "cancelled"].includes(appointment.status)) {
      return res.status(400).json({
        message: `Cannot reject a ${appointment.status} appointment`
      });
    }

    // Optional rule: only pending/rescheduled can be rejected
    if (!["pending", "rescheduled"].includes(appointment.status)) {
      return res.status(400).json({
        message: "Only pending or rescheduled appointments can be rejected"
      });
    }

    appointment.status = "rejected";
    await appointment.save();

    res.status(200).json({
      message: "Appointment rejected successfully",
      appointment
    });

  } catch (error) {
    console.error("Reject error:", error.message);
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

    // Only allow updates in safe states
    if (["completed", "cancelled", "rejected"].includes(appointment.status)) {
      return res.status(400).json({
        message: `Cannot update a ${appointment.status} appointment`
      });
    }

    // Allowed fields to update (safe update)
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