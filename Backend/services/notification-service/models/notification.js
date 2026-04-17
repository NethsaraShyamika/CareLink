import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        notificationId: {
            type: String,
            unique: true,
        },
        recipientEmail: {
            type: String,
            required: true,
        },
        recipientName: {
            type: String,
            required: true,
        },
        subject: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ["appointment_booked", "consultation_completed", "appointment_cancelled"],
            required: true,
        },
        status: {
            type: String,
            enum: ["sent", "failed"],
            default: "sent",
        },
        sentAt: {
            type: Date,
            default: Date.now,
        }
    }
);

notificationSchema.pre("save", async function () {
    if (this.notificationId) return;

    const lastNotification = await mongoose.model("Notification")
        .findOne()
        .sort({ notificationId: -1 });

    const lastNum = lastNotification ? parseInt(lastNotification.notificationId.split("-")[1]) : 0;
    this.notificationId = `NOT-${String(lastNum + 1).padStart(4, "0")}`;
});

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;