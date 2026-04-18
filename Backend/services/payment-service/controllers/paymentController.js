import Stripe from "stripe";
import Payment from "../models/Payment.js";
import dotenv from "dotenv";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";



// POST /api/payments/stripe/create-checkout
export async function createStripeCheckoutSession(req, res) {
  try {
    const { appointmentId, doctorId, amount } = req.body;
    const patientId = req.user.id;

    if (!appointmentId || !doctorId || !amount) {
      return res.status(400).json({
        message: "appointmentId, doctorId, and amount are required.",
      });
    }

    const stripeAmount = Math.round(parseFloat(amount) * 100);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Doctor Consultation Appointment",
            },
            unit_amount: stripeAmount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",

      success_url: `${FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${FRONTEND_URL}/payment/fail`,

      metadata: {
        patientId: patientId.toString(),
        appointmentId: appointmentId.toString(),
        doctorId: doctorId.toString(),
      },
    });

    const payment = await Payment.create({
      patientId,
      appointmentId,
      doctorId,
      amount,
      currency: "USD",
      gateway: "stripe",
      gatewayOrderId: session.id,
      status: "pending",
    });

    res.status(200).json({
      success: true,
      message: "Checkout session created successfully.",
      paymentId: payment._id,
      url: session.url,
    });
  } catch (err) {
    console.error("Stripe checkout error:", err.message);
    res.status(500).json({ message: "Failed to create checkout session." });
  }
}



// POST /api/payments/stripe/webhook
export async function stripeWebhook(req, res) {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    console.log("Stripe event received:", event.type);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;

        await Payment.findOneAndUpdate(
          { gatewayOrderId: session.id },
          {
            status: "completed",
            gatewayPaymentId: session.payment_intent,
            gatewayResponse: session,
          }
        );

        console.log("Payment completed:", session.id);
        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object;

        await Payment.findOneAndUpdate(
          { gatewayOrderId: session.id },
          {
            status: "failed",
            gatewayResponse: session,
          }
        );

        console.log("Payment expired:", session.id);
        break;
      }

      default:
        console.log("Unhandled event:", event.type);
    }

    res.json({ received: true });
  } catch (err) {
    console.error("Webhook processing error:", err.message);
    res.status(500).json({ message: "Webhook processing failed." });
  }
}



// GET /api/payments/history
export async function getPaymentHistory(req, res) {
  try {
    const patientId = req.user.id;

    const payments = await Payment.find({ patientId })
      .sort({ createdAt: -1 })
      .limit(20)
      .select("-gatewayResponse -__v");

    res.status(200).json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (err) {
    console.error("History error:", err.message);
    res.status(500).json({ message: "Failed to fetch payment history." });
  }
}



// GET /api/payments/:id
export async function getPaymentById(req, res) {
  try {
    const payment = await Payment.findById(req.params.id).select(
      "-gatewayResponse -__v"
    );

    if (!payment) {
      return res.status(404).json({ message: "Payment not found." });
    }

    if (
      req.user.role === "patient" &&
      payment.patientId.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Access denied." });
    }

    res.status(200).json({
      success: true,
      payment,
    });
  } catch (err) {
    console.error("Get payment error:", err.message);
    res.status(500).json({ message: "Failed to fetch payment." });
  }
}



// GET /api/payments/appointment/:appointmentId
export async function getPaymentByAppointment(req, res) {
  try {
    const payment = await Payment.findOne({
      appointmentId: req.params.appointmentId,
    }).select("-gatewayResponse -__v");

    if (!payment) {
      return res.status(404).json({
        message: "No payment found for this appointment.",
      });
    }

    if (
      req.user.role === "patient" &&
      payment.patientId.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Access denied." });
    }

    res.status(200).json({
      success: true,
      payment,
    });
  } catch (err) {
    console.error("Appointment payment error:", err.message);
    res.status(500).json({ message: "Failed to fetch payment." });
  }
}



// GET /api/payments/session/:sessionId
export async function getPaymentBySessionId(req, res) {
  try {
    console.log("Getting payment by session ID:", req.params.sessionId);
    console.log("User:", req.user);

    const payment = await Payment.findOne({
      gatewayOrderId: req.params.sessionId,
    }).select("-gatewayResponse -__v");

    console.log("Payment found:", payment ? "yes" : "no");

    if (!payment) {
      return res.status(404).json({
        message: "No payment found for this session.",
      });
    }

    if (
      req.user.role === "patient" &&
      payment.patientId.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Access denied." });
    }

    res.status(200).json({
      success: true,
      payment,
    });
  } catch (err) {
    console.error("Session payment error:", err.message);
    res.status(500).json({ message: "Failed to fetch payment." });
  }
}



// POST /api/payments/stripe/confirm
export async function confirmStripePayment(req, res) {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ message: "sessionId is required." });
    }

    const payment = await Payment.findOne({
      gatewayOrderId: sessionId,
    });

    if (!payment) {
      return res.status(404).json({ message: "No payment found for this session." });
    }

    if (
      req.user.role === "patient" &&
      payment.patientId.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Access denied." });
    }

    payment.status = "completed";
    await payment.save();

    res.status(200).json({
      success: true,
      payment,
    });
  } catch (err) {
    console.error("Confirm stripe payment error:", err.message);
    res.status(500).json({ message: "Failed to confirm payment." });
  }
}



// GET /api/payments/admin/all
export async function getAllPayments(req, res) {
  try {
    const { status, gateway, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (gateway) filter.gateway = gateway;

    const pageNumber = Math.max(1, parseInt(page));
    const limitNumber = Math.max(1, parseInt(limit));

    const payments = await Payment.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .select("-gatewayResponse -__v");

    const total = await Payment.countDocuments(filter);

    res.status(200).json({
      success: true,
      total,
      page: pageNumber,
      pages: Math.ceil(total / limitNumber),
      payments,
    });
  } catch (err) {
    console.error("Admin payments error:", err.message);
    res.status(500).json({ message: "Failed to fetch payments." });
  }
}