import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: String,
      required: [true, "Patient ID is required"],
    },
    firstName: {
      type: String,
      required: [true, "First name is required"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
    },
    doctorId: {
      type: String,
      required: [true, "Doctor ID is required"],
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    timeSlot: {
      type: String,
      required: [true, "Time slot is required"],
    },
    reason: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "confirmed",
        "cancelled",
        "completed",
        "rescheduled",
        "rejected",
      ],
      default: "pending",
    },
    doctorNotes: {
      type: String,
      default: "",
    },
    rescheduledDate: {
      type: Date,
      default: null,
    },
    rescheduledTimeSlot: {
      type: String,
      default: null,
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Appointment = mongoose.model("Appointment", appointmentSchema);
export default Appointment;