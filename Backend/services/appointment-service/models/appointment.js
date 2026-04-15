const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    // Patient who booked
    patientId: {
      type: String,
      required: [true, "Patient ID is required"],
    },

    // Doctor being booked
    doctorId: {
      type: String,
      required: [true, "Doctor ID is required"],
    },

    // Appointment date  e.g. "2026-04-10"
    date: {
      type: Date,
      required: [true, "Date is required"],
    },

    // Time slot  e.g. "10:00 AM - 10:30 AM"
    timeSlot: {
      type: String,
      required: [true, "Time slot is required"],
    },

    // Reason for visit (optional)
    reason: {
      type: String,
      default: "",
    },

    // Status of the appointment
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed", "rescheduled"],
      default: "pending",
    },

    // Doctor can add notes after the visit
    doctorNotes: {
      type: String,
      default: "",
    },

    // Stored when rescheduled
    rescheduledDate: {
      type: Date,
      default: null,
    },

    rescheduledTimeSlot: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true, // auto adds createdAt and updatedAt
  }
);

const Appointment = mongoose.model("Appointment", appointmentSchema);

module.exports = Appointment;