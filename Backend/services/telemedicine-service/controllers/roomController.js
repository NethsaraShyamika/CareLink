import pkg from "agora-token";
const { RtcTokenBuilder, RtcRole } = pkg;
import Room from "../models/room.js";

/**
 * Generate Agora Token
 */
export const generateToken = async (req, res) => {
  try {
    const { channelName, uid, role } = req.body;

    if (!channelName || uid === undefined) {
      return res.status(400).json({
        error: "channelName and uid are required"
      });
    }

 
    const appId = process.env.AGORA_APP_ID;
    if (!appId) {
      return res.status(500).json({
        error: "AGORA_APP_ID is not set in environment variables"
      });
    }

    const certificate = process.env.AGORA_APP_CERTIFICATE;

    
    if (!certificate) {
      return res.status(200).json({
        token: null,
        channelName,
        uid,
        appId
      });
    }

    // ✅ PRODUCTION MODE: Generate secured token
    const userRole =
      role === "doctor" ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;

    const expirationTime = 3600; // 1 hour
    const currentTime = Math.floor(Date.now() / 1000);
    const privilegeExpireTime = currentTime + expirationTime;

    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      certificate,
      channelName,
      uid,
      userRole,
      privilegeExpireTime
    );

    return res.status(200).json({
      token,
      channelName,
      uid,
      appId
    });

  } catch (error) {
    console.error("Agora Token Error:", error);
    return res.status(500).json({
      error: "Failed to generate Agora token",
      details: error.message
    });
  }
};

/**
 * Create Room
 */
export const createRoom = async (req, res) => {
  try {
    const { appointmentId, doctorId, patientId } = req.body;

    if (!appointmentId || !doctorId || !patientId) {
      return res.status(400).json({
        error: "appointmentId, doctorId and patientId are required"
      });
    }

    const existingRoom = await Room.findOne({ appointmentId });
    if (existingRoom) {
      return res.status(200).json({
        message: "Room already exists",
        room: existingRoom
      });
    }

    const room = new Room({ appointmentId, doctorId, patientId });
    await room.save();

    return res.status(201).json({
      message: "Room created successfully",
      room
    });

  } catch (error) {
    console.error("Create Room Error:", error);
    return res.status(500).json({
      error: error.message
    });
  }
};

/**
 * Get Room by Appointment ID
 */
export const getRoom = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const room = await Room.findOne({ appointmentId });

    if (!room) {
      return res.status(404).json({
        error: "Room not found"
      });
    }

    return res.status(200).json({ room });

  } catch (error) {
    console.error("Get Room Error:", error);
    return res.status(500).json({
      error: error.message
    });
  }
};

/**
 * End Room
 */
export const endRoom = async (req, res) => {
  try {
    const { channelName } = req.body;

    if (!channelName) {
      return res.status(400).json({
        error: "channelName is required"
      });
    }

    const room = await Room.findOneAndUpdate(
      { channelName },
      { status: "ended", endedAt: new Date() },
      { new: true }
    );

    if (!room) {
      return res.status(404).json({
        error: "Room not found"
      });
    }

    return res.status(200).json({
      message: "Consultation session ended successfully",
      room
    });

  } catch (error) {
    console.error("End Room Error:", error);
    return res.status(500).json({
      error: error.message
    });
  }
};

/**
 * Get All Rooms
 */
export const getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find();
    return res.status(200).json({ rooms });

  } catch (error) {
    console.error("Get Rooms Error:", error);
    return res.status(500).json({
      error: error.message
    });
  }
};
