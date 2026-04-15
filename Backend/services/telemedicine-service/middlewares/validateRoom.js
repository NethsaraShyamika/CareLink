import Room from "../models/room.js";

const validateRoom = async (req, res, next) => {
    try {
        const { channelName, appointmentId } = req.body;

        // Check using channelName
        if (channelName) {
            const room = await Room.findOne({ channelName });
            if (!room) {
                return res.status(404).json({ error: "Room not found for this channel." });
            }
            if (room.status === "ended") {
                return res.status(400).json({ error: "This consultation session has already ended." });
            }
            req.room = room;
            return next();
        }

        // Check using appointmentId
        if (appointmentId) {
            const room = await Room.findOne({ appointmentId });
            if (!room) {
                return res.status(404).json({ error: "Room not found for this appointment." });
            }
            if (room.status === "ended") {
                return res.status(400).json({ error: "This consultation session has already ended." });
            }
            req.room = room;
            return next();
        }

        return res.status(400).json({ error: "channelName or appointmentId is required." });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export default validateRoom;