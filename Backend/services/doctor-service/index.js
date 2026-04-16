import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import doctorRoutes from "./routes/doctorRoutes.js";

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());

// Routes
app.use("/api/doctors", doctorRoutes);

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(process.env.PORT || 3002, () => console.log("Doctor Service running on port " + (process.env.PORT || 3002)));
  })
  .catch((err) => console.log(err));