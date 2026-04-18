import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { createServer } from "http";
import { Server } from "socket.io";
import roomRoutes from "./routes/roomRoutes.js";

dotenv.config();

const app = express();


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

app.use("/api/telemedicine", roomRoutes);

const PORT = process.env.PORT || 3004;
const server = createServer(app);


const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});


const activeRooms = new Map();


io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join room
    socket.on('join-room', (data) => {
        const { appointmentId, role, userId } = data;
        const roomName = `appointment_${appointmentId}`;

        socket.join(roomName);

        // Initialize room if not exists
        if (!activeRooms.has(roomName)) {
            activeRooms.set(roomName, new Map());
        }

        // Add user to room
        activeRooms.get(roomName).set(socket.id, {
            role,
            userId,
            socketId: socket.id
        });

        console.log(`User ${socket.id} (${role}) joined room ${roomName}`);

        // Notify others in room
        socket.to(roomName).emit('user-joined', {
            userId,
            role,
            message: `${role === 'doctor' ? 'Doctor' : 'Patient'} joined the consultation`
        });
    });

    // Handle chat messages
    socket.on('send-message', (data) => {
        const { appointmentId, message, sender, senderRole } = data;
        const roomName = `appointment_${appointmentId}`;

        const messageData = {
            id: Date.now() + Math.random(),
            text: message,
            sender,
            senderRole,
            type: 'text',
            timestamp: new Date().toISOString()
        };

        // Broadcast to room
        io.to(roomName).emit('receive-message', messageData);
    });

    // Handle file sharing
    socket.on('send-file', (data) => {
        const { appointmentId, fileName, fileData, fileSize, sender, senderRole } = data;
        const roomName = `appointment_${appointmentId}`;

        const fileMessageData = {
            id: Date.now() + Math.random(),
            fileName,
            fileData, // Base64 encoded file data
            fileSize,
            sender,
            senderRole,
            type: 'file',
            timestamp: new Date().toISOString()
        };

        // Broadcast to room
        io.to(roomName).emit('receive-file', fileMessageData);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);

        // Remove from all rooms
        activeRooms.forEach((users, roomName) => {
            if (users.has(socket.id)) {
                const userData = users.get(socket.id);
                users.delete(socket.id);

                // Notify others
                socket.to(roomName).emit('user-left', {
                    userId: userData.userId,
                    role: userData.role,
                    message: `${userData.role === 'doctor' ? 'Doctor' : 'Patient'} left the consultation`
                });

                // Clean up empty rooms
                if (users.size === 0) {
                    activeRooms.delete(roomName);
                }
            }
        });
    });
});

server.listen(PORT, () => {
    console.log(`Telemedicine Service with Socket.IO running on port ${PORT}`);
});