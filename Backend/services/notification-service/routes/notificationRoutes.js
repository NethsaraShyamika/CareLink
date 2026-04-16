import express from "express";
import {
    appointmentBooked,
    consultationCompleted,
    appointmentCancelled,
    getAllNotifications,
    getNotificationsByEmail,
    sendReminder
} from "../controllers/notificationController.js";

const router = express.Router();

router.post("/appointment-booked", appointmentBooked);
router.post("/consultation-completed", consultationCompleted);
router.post("/appointment-cancelled", appointmentCancelled);
router.get("/all", getAllNotifications);
router.get("/email/:email", getNotificationsByEmail);
router.post("/reminder", sendReminder);

export default router;