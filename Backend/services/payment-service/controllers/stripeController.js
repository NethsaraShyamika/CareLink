const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Payment = require("../models/Payment");

// POST /api/payments/stripe/create-intent
// Creates a Stripe PaymentIntent and returns client_secret to frontend
const createStripePaymentIntent = async (req, res) => {
  try {
    const { appointmentId, doctorId, amount } = req.body;
    const patientId = req.user.userId;

    if (!appointmentId || !doctorId || !amount) {
      return res.status(400).json({ message: "appointmentId, doctorId, and amount are required." });
    }

    // Stripe amount is in smallest currency unit
    // LKR doesn't support decimals in Stripe, so amount * 100 for USD, just amount for LKR
    // Using USD for Stripe sandbox testing
    const stripeAmount = Math.round(parseFloat(amount) * 100); // cents

    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: stripeAmount,
      currency: "usd", // use "lkr" if your Stripe account supports it
      metadata: {
        patientId: patientId.toString(),
        appointmentId: appointmentId.toString(),
        doctorId: doctorId.toString(),
      },
    });

    // Save pending payment to DB
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
      clientSecret: paymentIntent.client_secret, // sent to frontend for Stripe Elements
    });
  } catch (err) {
    console.error("Stripe create intent error:", err.message);
    res.status(500).json({ message: "Failed to create payment intent." });
  }
};

// POST /api/payments/stripe/create-checkout
// Creates a Stripe Checkout Session (easier for Postman testing)
const createStripeCheckoutSession = async (req, res) => {
  try {
    const { appointmentId, doctorId, amount } = req.body;
    const patientId = req.user.userId;

    if (!appointmentId || !doctorId || !amount) {
      return res.status(400).json({ message: "appointmentId, doctorId, and amount are required." });
    }

    const stripeAmount = Math.round(parseFloat(amount) * 100);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Doctor Consultation Appointment',
            },
            unit_amount: stripeAmount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'http://localhost:3000/payment-success',
      cancel_url: 'http://localhost:3000/payment-cancel',
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
      url: session.url, // Click this in Postman to pay
    });
  } catch (err) {
    console.error("Stripe checkout session error:", err.message);
    res.status(500).json({ message: "Failed to create checkout session." });
  }
};

// POST /api/payments/stripe/webhook
// Stripe calls this automatically when payment status changes
const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body, // raw body (set in server.js)
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.warn("Stripe webhook signature failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle events
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
        { status: "failed", gatewayResponse: intent }
      );
      console.log(`Stripe payment failed: ${intent.id}`);
      break;
    }
    default:
      console.log(`Unhandled Stripe event: ${event.type}`);
  }

  res.status(200).json({ received: true });
};

// POST /api/payments/stripe/confirm
// Called from frontend after Stripe Elements confirms the payment
const confirmStripePayment = async (req, res) => {
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

    res.status(200).json({ success: true, status: newStatus, payment });
  } catch (err) {
    console.error("Stripe confirm error:", err.message);
    res.status(500).json({ message: "Failed to confirm payment." });
  }
};

module.exports = {
  createStripePaymentIntent,
  createStripeCheckoutSession,
  stripeWebhook,
  confirmStripePayment,
};