import Stripe from "stripe";
import Payment from "../models/Payment.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const FRONTEND_URL =
  process.env.FRONTEND_URL || "http://localhost:5173";

// POST /api/payments/stripe/create-intent
export async function createStripePaymentIntent(req, res) {
  try {
    const { appointmentId, doctorId, amount } = req.body;
    const patientId = req.user.userId;

    if (!appointmentId || !doctorId || !amount) {
      return res.status(400).json({
        message: "appointmentId, doctorId, and amount are required.",
      });
    }

    const stripeAmount = Math.round(parseFloat(amount) * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: stripeAmount,
      currency: "usd",
      metadata: {
        patientId: patientId.toString(),
        appointmentId: appointmentId.toString(),
        doctorId: doctorId.toString(),
      },
    });

    const payment = new Payment({
      patientId,
      appointmentId,
      doctorId,
      amount,
      currency: "USD",
      gateway: "stripe",
      gatewayOrderId: paymentIntent.id,
      status: "pending",
    });

    await payment.save();

    res.status(200).json({
      success: true,
      paymentId: payment._id,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    console.error("Stripe create intent error:", err.message);
    res
      .status(500)
      .json({ message: "Failed to create payment intent." });
  }
}

// POST /api/payments/stripe/create-checkout
export async function createStripeCheckoutSession(req, res) {
  try {
    const { appointmentId, doctorId, amount } = req.body;
    const patientId = req.user.userId;

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
      success_url: `${FRONTEND_URL}/payment/success`,
      cancel_url: `${FRONTEND_URL}/payment/fail`,
      metadata: {
        patientId: patientId.toString(),
        appointmentId: appointmentId.toString(),
        doctorId: doctorId.toString(),
      },
    });

    const payment = new Payment({
      patientId,
      appointmentId,
      doctorId,
      amount,
      currency: "USD",
      gateway: "stripe",
      gatewayOrderId: session.id,
      status: "pending",
    });

    await payment.save();

    res.status(200).json({
      success: true,
      message: "Checkout session created directly.",
      paymentId: payment._id,
      url: session.url,
    });
  } catch (err) {
    console.error("Stripe checkout session error:", err.message);
    res
      .status(500)
      .json({ message: "Failed to create checkout session." });
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
    console.warn("Stripe webhook signature failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const intent = event.data.object;

        await Payment.findOneAndUpdate(
          { gatewayOrderId: intent.id },
          {
            status: "completed",
            gatewayPaymentId: intent.latest_charge,
            gatewayResponse: intent,
          }
        );

        console.log(`Stripe payment succeeded: ${intent.id}`);
        break;
      }

      case "payment_intent.payment_failed": {
        const intent = event.data.object;

        await Payment.findOneAndUpdate(
          { gatewayOrderId: intent.id },
          {
            status: "failed",
            gatewayResponse: intent,
          }
        );

        console.log(`Stripe payment failed: ${intent.id}`);
        break;
      }

      default:
        console.log(`Unhandled Stripe event: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error("Webhook handling error:", err.message);
    res.status(500).json({ message: "Webhook processing failed." });
  }
}

// POST /api/payments/stripe/confirm
export async function confirmStripePayment(req, res) {
  try {
    const { paymentIntentId } = req.body;

    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);

    const statusMap = {
      succeeded: "completed",
      canceled: "cancelled",
      requires_payment_method: "failed",
    };

    const newStatus = statusMap[intent.status] || "pending";

    const payment = await Payment.findOneAndUpdate(
      { gatewayOrderId: paymentIntentId },
      { status: newStatus, gatewayResponse: intent },
      { new: true }
    );

    res.status(200).json({
      success: true,
      status: newStatus,
      payment,
    });
  } catch (err) {
    console.error("Stripe confirm error:", err.message);
    res.status(500).json({ message: "Failed to confirm payment." });
  }
}