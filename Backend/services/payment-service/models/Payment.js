const mongoose = require("mongoose");

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
    gatewayOrderId: String,   // PayHere order_id / Stripe PaymentIntent ID
    gatewayPaymentId: String, // PayHere payment_id / Stripe charge ID
    gatewayResponse: Object,  // Raw response from gateway (for debugging)

    // Refund
    refundedAt: Date,
    refundReason: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);