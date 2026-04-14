const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

// Load .env file
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Allow frontend to call this service
app.use(cors());

// Read JSON from request body
app.use(express.json());

// All routes
app.use("/api", require("./routes/appointmentRoutes"));

// Health check — open http://localhost:5002/health to confirm it is running
app.get("/health", (req, res) => {
  res.json({ status: "OK", service: "Appointment Service" });
});

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
  console.log(`Appointment Service running on port ${PORT}`);
});