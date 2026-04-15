import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import roomRoutes from "./routes/roomRoutes.js";

dotenv.config();

const app = express();

// Fix CORS - allow all origins
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Bypass-Tunnel-Reminder", "ngrok-skip-browser-warning"]
}));

app.use(express.json());
app.use("/uploads", express.static("uploads"));

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.log("MongoDB error:", err));

app.use("/telemedicine", roomRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Telemedicine Service running on port ${PORT}`);
});