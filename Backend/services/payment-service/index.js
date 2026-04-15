import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import paymentRoutes from "./routes/paymentRoutes.js";

const app = express();
const PORT = process.env.PAYMENT_SERVICE_PORT || 3005;

// Stripe webhook must use raw body BEFORE json middleware
app.use(
  "/api/payments/stripe/webhook",
  express.raw({ type: "application/json" })
);

// Middleware
app.use(
  cors({ origin: process.env.CLIENT_URL || "http://localhost:3000" })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/payments", paymentRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "Payment Service is running",
    port: PORT,
  });
});

// MongoDB connection
mongoose
  .connect(
    process.env.PAYMENT_DB_URI || "mongodb://localhost:27017/paymentDB"
  )
  .then(() => {
    console.log("Connected to Payment DB");

    app.listen(PORT, () => {
      console.log(`Payment Service running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("DB connection error:", err);
  });