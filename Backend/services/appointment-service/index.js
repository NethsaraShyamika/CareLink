import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import "./jobs/reminderJob.js"; // Start the reminder job when the service starts
import appointmentRoutes from "./routes/appointmentRoutes.js";

// Load .env file
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"], // Allow frontend origins
    credentials: true, // Allow credentials
  })
);
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes

app.use("/api", appointmentRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", service: "Appointment Service" });
});

const PORT = process.env.PORT || 5003;

app.listen(PORT, () => {
  console.log(`Appointment Service running on port ${PORT}`);
});