import Stripe from "stripe";
import Payment from "../models/Payment.js";
import dotenv from "dotenv";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const FRONTEND_URL =
  process.env.FRONTEND_URL || "http://localhost:5173";



// POST /api/payments/stripe/create-checkout
export async function createStripeCheckoutSession(req, res) {
  try {
    const { appointmentId, doctorId, amount } = req.body;
    const patientId = req.user?.id || req.user?._id || req.user?.userId;

    if (!patientId || !appointmentId || !doctorId || !amount) {
      return res.status(400).json({
        message: "patientId, appointmentId, doctorId, and amount are required.",
      });
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ message: "Invalid amount provided." });
    }

    const stripeAmount = Math.round(parsedAmount * 100);

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
        patientId: patientId?.toString() || "",
        appointmentId: appointmentId?.toString() || "",
        doctorId: doctorId?.toString() || "",
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
    console.warn("Webhook signature failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    console.log("Stripe event:", event.type);

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
    console.error("Webhook error:", err.message);
    res.status(500).json({ message: "Webhook processing failed." });
  }
}



export async function getPaymentHistory(req, res) {
  try {
    const payments = await Payment.find({ patientId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20)
      .select("-gatewayResponse -__v");

    res.status(200).json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch payment history." });
  }
}



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
    res.status(500).json({ message: "Failed to fetch payment." });
  }
}



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
    res.status(500).json({ message: "Failed to fetch payment." });
  }
}



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
    res.status(500).json({ message: "Failed to fetch payments." });
  }
}