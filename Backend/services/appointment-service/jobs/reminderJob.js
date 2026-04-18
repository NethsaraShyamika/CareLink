import cron from "node-cron";
import Appointment from "../models/appointment.js";
import axios from "axios";

const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL;

// Run every minute
cron.schedule("* * * * *", async () => {
  try {
    const now = new Date();
    const inOneHour = new Date(now.getTime() + 60 * 60 * 1000);

    const appointments = await Appointment.find({
      date: {
        $gte: now,
        $lte: inOneHour,
      },
      status: "confirmed",
      reminderSent: { $ne: true },
    });

    for (const appt of appointments) {
      console.log("📢 Sending reminder for:", appt._id);

      await axios.post(`${NOTIFICATION_SERVICE_URL}/api/reminder`, {
        appointmentId: appt._id,
        patientId: appt.patientId,
        doctorId: appt.doctorId,
        date: appt.date,
        timeSlot: appt.timeSlot,
      });

      appt.reminderSent = true;
      await appt.save();
    }

  } catch (err) {
    console.error("❌ Reminder Job Error:", err.message);
  }
});