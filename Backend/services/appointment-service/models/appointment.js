import mongoose from "mongoose";

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

    // Appointment date
    date: {
      type: Date,
      required: [true, "Date is required"],
    },

    // Time slot
    timeSlot: {
      type: String,
      required: [true, "Time slot is required"],
    },

    // Reason
    reason: {
      type: String,
      default: "",
    },

    // Status
    status: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "confirmed",
        "cancelled",
        "completed",
        "rescheduled",
      ],
      default: "pending",
    },

    // Doctor notes
    doctorNotes: {
      type: String,
      default: "",
    },

    // Reschedule tracking
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
    timestamps: true,
  }
);

// ✅ Export as default
const Appointment = mongoose.model("Appointment", appointmentSchema);

export default Appointment;