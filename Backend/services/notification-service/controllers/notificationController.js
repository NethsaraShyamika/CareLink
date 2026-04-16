import transporter from "../middlewares/emailTransporter.js";
import Notification from "../models/notification.js";
import {
    appointmentBookedTemplate,
    consultationCompletedTemplate,
    appointmentCancelledTemplate
} from "../utils/emailTemplates.js";
import twilio from 'twilio';
import dotenv from 'dotenv';
dotenv.config();

// ==================== TWILIO WHATSAPP SETUP ====================
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const fromWhatsApp = `whatsapp:${process.env.TWILIO_WHATSAPP_SANDBOX_NUMBER}`; // e.g., +14155238886

/**
 * Send a WhatsApp message via Twilio Sandbox
 * @param {string} toPhone - recipient's phone number (E.164 format)
 * @param {string} message - plain text message body
 */
const sendWhatsApp = async (toPhone, message) => {
    if (!toPhone) {
        console.warn("No phone number provided, skipping WhatsApp notification");
        return;
    }
    try {
        const msg = await twilioClient.messages.create({
            body: message,
            from: fromWhatsApp,
            to: `whatsapp:${toPhone}`
        });
        console.log(`WhatsApp message sent to ${toPhone}: ${msg.sid}`);
        return msg;
    } catch (error) {
        console.error(`WhatsApp send failed to ${toPhone}:`, error.message);
        // Don't throw - we don't want to break the email flow
    }
};

/**
 * Generate a video call link to the frontend redirect page based on appointment ID
 * @param {string} appointmentId 
 * @param {string} role
 * @returns {string}
 */
const generateVideoLink = (appointmentId, role = "patient") => {
    const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const encodedId = encodeURIComponent(appointmentId);
    const roleParam = role === "doctor" ? "doctor" : "patient";
    return `${baseUrl}/?appointmentId=${encodedId}&autoJoin=1&role=${roleParam}`;
};

// ==================== EXISTING EMAIL FUNCTIONS (unchanged) ====================
// Send Email
const sendEmail = async (recipientEmail, recipientName, subject, html) => {
    await transporter.sendMail({
        from: `"HealthCare Platform" <${process.env.EMAIL_USER}>`,
        to: recipientEmail,
        subject: subject,
        html: html,
    });
};

// Appointment Booked Notification (ENHANCED with WhatsApp)
export const appointmentBooked = async (req, res) => {
    try {
        const { 
            doctorEmail, doctorName, doctorPhone,
            patientEmail, patientName, patientPhone,
            appointmentId, date, time 
        } = req.body;

        if (!doctorEmail || !doctorName || !patientEmail || !patientName || !appointmentId || !date || !time) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // Generate video call links
        const patientVideoLink = generateVideoLink(appointmentId, "patient");
        const doctorVideoLink = generateVideoLink(appointmentId, "doctor");

        // ----- PATIENT NOTIFICATIONS -----
        // Email
        await sendEmail(patientEmail, patientName, "✅ Appointment Booked Successfully",
            appointmentBookedTemplate(patientName, appointmentId, doctorName, patientName, date, time, false, patientVideoLink)
        );
        await new Notification({ 
            recipientEmail: patientEmail, recipientName: patientName, 
            subject: "Appointment Booked Successfully", 
            message: `Your appointment ${appointmentId} has been booked on ${date} at ${time}.`, 
            type: "appointment_booked", status: "sent" 
        }).save();

        // WhatsApp for patient
        const patientWhatsAppMsg = `🩺 *Appointment Confirmation*\n\nHi ${patientName},\nYour appointment with Dr. ${doctorName} is confirmed.\n📅 Date: ${date}\n⏰ Time: ${time}\n🔗 Video Call Link: ${patientVideoLink}\n\nPlease click the link at the scheduled time.`;
        await sendWhatsApp(patientPhone, patientWhatsAppMsg);

        // ----- DOCTOR NOTIFICATIONS -----
        // Email
        await sendEmail(doctorEmail, doctorName, "📅 New Appointment Scheduled",
            appointmentBookedTemplate(doctorName, appointmentId, doctorName, patientName, date, time, true, doctorVideoLink)
        );
        await new Notification({ 
            recipientEmail: doctorEmail, recipientName: doctorName, 
            subject: "New Appointment Scheduled", 
            message: `New appointment ${appointmentId} with patient ${patientName} on ${date} at ${time}.`, 
            type: "appointment_booked", status: "sent" 
        }).save();

        // WhatsApp for doctor
        const doctorWhatsAppMsg = `👨‍⚕️ *New Appointment*\n\nDr. ${doctorName},\nYou have a new appointment with patient ${patientName}.\n📅 Date: ${date}\n⏰ Time: ${time}\n🔗 Join Video Call: ${doctorVideoLink}\n\nClick the link to start the session.`;
        await sendWhatsApp(doctorPhone, doctorWhatsAppMsg);

        return res.status(200).json({ message: "Email and WhatsApp notifications sent successfully to doctor and patient" });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Consultation Completed Notification (ENHANCED with WhatsApp)
export const consultationCompleted = async (req, res) => {
    try {
        const { 
            doctorEmail, doctorName, doctorPhone,
            patientEmail, patientName, patientPhone,
            appointmentId 
        } = req.body;

        if (!doctorEmail || !doctorName || !patientEmail || !patientName || !appointmentId) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // ----- PATIENT -----
        await sendEmail(patientEmail, patientName, "✅ Consultation Completed",
            consultationCompletedTemplate(patientName, appointmentId, doctorName, patientName, false)
        );
        await new Notification({ 
            recipientEmail: patientEmail, recipientName: patientName, 
            subject: "Consultation Completed", 
            message: `Your consultation for appointment ${appointmentId} has been completed.`, 
            type: "consultation_completed", status: "sent" 
        }).save();
        await sendWhatsApp(patientPhone, `✅ *Consultation Completed*\n\nHi ${patientName},\nYour consultation (Appointment ID: ${appointmentId}) with Dr. ${doctorName} has been marked as completed.\nThank you for using our service.`);

        // ----- DOCTOR -----
        await sendEmail(doctorEmail, doctorName, "✅ Consultation Completed",
            consultationCompletedTemplate(doctorName, appointmentId, doctorName, patientName, true)
        );
        await new Notification({ 
            recipientEmail: doctorEmail, recipientName: doctorName, 
            subject: "Consultation Completed", 
            message: `Consultation for appointment ${appointmentId} with patient ${patientName} has been completed.`, 
            type: "consultation_completed", status: "sent" 
        }).save();
        await sendWhatsApp(doctorPhone, `✅ *Consultation Completed*\n\nDr. ${doctorName},\nThe consultation for appointment ${appointmentId} with patient ${patientName} is now completed.`);

        return res.status(200).json({ message: "Email and WhatsApp notifications sent successfully" });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Appointment Cancelled Notification (ENHANCED with WhatsApp)
export const appointmentCancelled = async (req, res) => {
    try {
        const { 
            doctorEmail, doctorName, doctorPhone,
            patientEmail, patientName, patientPhone,
            appointmentId 
        } = req.body;

        if (!doctorEmail || !doctorName || !patientEmail || !patientName || !appointmentId) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // ----- PATIENT -----
        await sendEmail(patientEmail, patientName, "❌ Appointment Cancelled",
            appointmentCancelledTemplate(patientName, appointmentId, doctorName, patientName, false)
        );
        await new Notification({ 
            recipientEmail: patientEmail, recipientName: patientName, 
            subject: "Appointment Cancelled", 
            message: `Your appointment ${appointmentId} has been cancelled.`, 
            type: "appointment_cancelled", status: "sent" 
        }).save();
        await sendWhatsApp(patientPhone, `❌ *Appointment Cancelled*\n\nHi ${patientName},\nYour appointment (ID: ${appointmentId}) with Dr. ${doctorName} has been cancelled.\nPlease contact support if you have any questions.`);

        // ----- DOCTOR -----
        await sendEmail(doctorEmail, doctorName, "❌ Appointment Cancelled",
            appointmentCancelledTemplate(doctorName, appointmentId, doctorName, patientName, true)
        );
        await new Notification({ 
            recipientEmail: doctorEmail, recipientName: doctorName, 
            subject: "Appointment Cancelled", 
            message: `Appointment ${appointmentId} with patient ${patientName} has been cancelled.`, 
            type: "appointment_cancelled", status: "sent" 
        }).save();
        await sendWhatsApp(doctorPhone, `❌ *Appointment Cancelled*\n\nDr. ${doctorName},\nThe appointment ${appointmentId} with patient ${patientName} has been cancelled.`);

        return res.status(200).json({ message: "Email and WhatsApp notifications sent successfully" });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Get All Notifications (unchanged)
export const getAllNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find();
        return res.json({ notifications });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Get Notifications by Email (unchanged)
export const getNotificationsByEmail = async (req, res) => {
    try {
        const { email } = req.params;
        const notifications = await Notification.find({ recipientEmail: email });
        if (!notifications.length) {
            return res.status(404).json({ error: "No notifications found for this email" });
        }
        return res.json({ notifications });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export const sendReminder = async (req, res) => {
  try {
    const {
      patientEmail,
      patientName,
      doctorName,
      appointmentId,
      date,
      time
    } = req.body;

    if (!patientEmail || !patientName || !appointmentId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    await sendEmail(
      patientEmail,
      patientName,
      "⏰ Appointment Reminder",
      `
        <p>Hi ${patientName},</p>
        <p>This is a reminder for your appointment.</p>
        <p><strong>Doctor:</strong> ${doctorName}</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${time}</p>
        <p>Please be ready on time.</p>
      `
    );

    return res.status(200).json({ message: "Reminder sent" });

  } catch (error) {
    console.error("Reminder error:", error);
    return res.status(500).json({ error: error.message });
  }
};
