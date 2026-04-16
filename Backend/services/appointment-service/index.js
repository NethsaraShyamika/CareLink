import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

// Load .env file
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
import appointmentRoutes from "./routes/appointmentRoutes.js";
app.use("/api", appointmentRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", service: "Appointment Service" });
});

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
  console.log(`Appointment Service running on port ${PORT}`);
});