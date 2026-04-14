const Payment = require("../models/Payment");

// GET /api/payments/history — patient's payment history
const getPaymentHistory = async (req, res) => {
  try {
    const patientId = req.user.userId;
    const payments = await Payment.find({ patientId })
      .sort({ createdAt: -1 })
      .limit(20)
      .select("-gatewayResponse -__v");

    res.status(200).json({ success: true, count: payments.length, payments });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch payment history." });
  }
};

// GET /api/payments/:id — single payment details
const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).select("-gatewayResponse");

    if (!payment) {
      return res.status(404).json({ message: "Payment not found." });
    }

    // Patient can only view their own payment
    if (
      req.user.role === "patient" &&
      payment.patientId.toString() !== req.user.userId
    ) {
      return res.status(403).json({ message: "Access denied." });
    }

    res.status(200).json({ success: true, payment });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch payment." });
  }
};

// GET /api/payments/appointment/:appointmentId — check payment status for an appointment
const getPaymentByAppointment = async (req, res) => {
  try {
    const payment = await Payment.findOne({
      appointmentId: req.params.appointmentId,
    }).select("-gatewayResponse -__v");

    if (!payment) {
      return res.status(404).json({ message: "No payment found for this appointment." });
    }

    res.status(200).json({ success: true, payment });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch payment." });
  }
};

// GET /api/payments/admin/all — admin views all payments
const getAllPayments = async (req, res) => {
  try {
    const { status, gateway, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (gateway) filter.gateway = gateway;

    const payments = await Payment.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select("-gatewayResponse -__v");

    const total = await Payment.countDocuments(filter);

    res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      payments,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch payments." });
  }
};

module.exports = {
  getPaymentHistory,
  getPaymentById,
  getPaymentByAppointment,
  getAllPayments,
};