require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const paymentRoutes = require("./routes/paymentRoutes");

const app = express();
const PORT = process.env.PAYMENT_SERVICE_PORT || 3005;

// Stripe webhooks need raw body — must be before express.json()
app.use(
  "/api/payments/stripe/webhook",
  express.raw({ type: "application/json" })
);

// General middleware
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // needed for PayHere notify

// Routes
app.use("/api/payments", paymentRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "Payment Service is running", port: PORT });
});

// Connect to MongoDB
mongoose
  .connect(process.env.PAYMENT_DB_URI || "mongodb://localhost:27017/paymentDB")
  .then(() => {
    console.log("Connected to Payment DB");
    app.listen(PORT, () =>
      console.log(`Payment Service running on port ${PORT}`)
    );
  })
  .catch((err) => console.error("DB connection error:", err));