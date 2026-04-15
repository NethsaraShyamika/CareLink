import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import doctorRoutes from "./routes/doctorRoutes.js";

dotenv.config();

const app = express();

app.use(express.json());

// Routes
app.use("/api/doctors", doctorRoutes);

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(5002, () => console.log("Doctor Service running on port 5002"));
  })
  .catch((err) => console.log(err));