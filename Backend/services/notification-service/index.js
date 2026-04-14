import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import notificationRoutes from "./routes/notificationRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.log("MongoDB error:", err));

app.use("/notification", notificationRoutes);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`Notification Service running on port ${PORT}`);
});