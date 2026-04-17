import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },

    // Payment details
    amount: {
      type: Number,
      required: true, // in LKR
    },
    currency: {
      type: String,
      default: "LKR",
    },
    gateway: {
      type: String,
      enum: ["payhere", "stripe"],
      required: true,
    },

    // Status
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded", "cancelled"],
      default: "pending",
    },

    // Gateway-specific IDs
    gatewayOrderId: String,
    gatewayPaymentId: String,
    gatewayResponse: Object,

    // Refund
    refundedAt: Date,
    refundReason: String,
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;