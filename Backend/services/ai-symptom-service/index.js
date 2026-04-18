require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const symptomRoutes = require("./routes/symptomRoutes");

const app = express();
const PORT = process.env.SYMPTOM_SERVICE_PORT || 3007;

// Middleware
app.use(cors({ 
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true 
}));
app.use(express.json());

// Routes
app.use("/api/symptoms", symptomRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "Symptom Checker Service is running", port: PORT });
});

// Connect to MongoDB
mongoose
  .connect(process.env.SYMPTOM_DB_URI || "mongodb://localhost:27017/symptomDB")
  .then(() => {
    console.log("Connected to Symptom DB");
    app.listen(PORT, () =>
      console.log(`Symptom Checker Service running on port ${PORT}`)
    );
  })
  .catch((err) => console.error("DB connection error:", err));