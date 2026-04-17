import express from "express";
import {
    appointmentBooked,
    appointmentAccepted,
    consultationCompleted,
    appointmentCancelled,
    getAllNotifications,
    getNotificationsByEmail,
    sendReminder,
    appointmentConfirmed,
    appointmentRescheduled
} from "../controllers/notificationController.js";

const router = express.Router();

router.post("/appointment-booked", appointmentBooked);
router.post("/appointment-accepted", appointmentAccepted);
router.post("/consultation-completed", consultationCompleted);
router.post("/appointment-cancelled", appointmentCancelled);
router.get("/all", getAllNotifications);
router.get("/email/:email", getNotificationsByEmail);
router.post("/reminder", sendReminder);
router.post("/notifications/confirmed", appointmentConfirmed);
router.post("/notifications/rescheduled", appointmentRescheduled);

export default router;