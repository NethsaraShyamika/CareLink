import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
    {
        roomId: {
            type: String,
            unique: true,
        },
        appointmentId: {
            type: String,
            required: true,
            unique: true,
        },
        channelName: {
            type: String,
            required: false,
        },
        doctorId: {
            type: String,
            required: true,
        },
        patientId: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ["active", "ended"],
            default: "active",
        },
        startedAt: {
            type: Date,
            default: Date.now,
        },
        endedAt: {
            type: Date,
            default: null,
        },
    }
);

// Auto generate roomId before saving
roomSchema.pre("save", async function () {
    if (this.roomId) return;

    const lastRoom = await mongoose.model("Room")
        .findOne()
        .sort({ roomId: -1 });

    const lastNum = lastRoom ? parseInt(lastRoom.roomId.split("-")[1]) : 0;
    this.roomId = `ROOM-${String(lastNum + 1).padStart(4, "0")}`;
    this.channelName = `appointment_${this.appointmentId}`;
});

const Room = mongoose.model("Room", roomSchema);

export default Room;