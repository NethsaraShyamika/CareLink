// server.js
import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);

import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import patientRoutes from './routes/patientRoutes.js';

// HARDCODE THE SECRET - This is the single source of truth
const JWT_SECRET = 'mysecretkey123';

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make JWT_SECRET available globally through app.locals
app.locals.JWT_SECRET = JWT_SECRET;

// DEBUG ENDPOINT - Check JWT_SECRET
app.get('/debug/config', (req, res) => {
    res.json({
        jwt_secret: JWT_SECRET,
        port: 3001,
        mongo_uri: process.env.MONGODB_URI ? 'Set' : 'Not set'
    });
});

// TOKEN GENERATION ENDPOINT - Uses SAME secret
app.get('/dev/token/:userId', (req, res) => {
    const token = jwt.sign(
        { 
            userId: req.params.userId,
            role: 'patient',
            email: `${req.params.userId}@test.com`
        },
        JWT_SECRET, // Using hardcoded secret
        { expiresIn: '24h' }
    );
    
    // Verify it immediately to confirm it works
    try {
        const verified = jwt.verify(token, JWT_SECRET);
        console.log('✅ Token verified immediately after generation');
        
        res.json({ 
            token: token,
            secret_used: JWT_SECRET,
            verified_payload: verified
        });
    } catch (err) {
        res.status(500).json({ error: 'Token generation failed', details: err.message });
    }
});

// Debug middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// Routes
app.use('/api/patients', patientRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        service: 'patient-service',
        port: 3001,
        jwt_secret: JWT_SECRET,
        database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
    });
});


// Use only MONGODB_URI from .env for safety
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is not set in environment variables.');
    process.exit(1);
}

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB');
        app.listen(PORT, () => {
            console.log(`🚀 Patient service running on http://localhost:${PORT}`);
            console.log(`📋 Get token: http://localhost:${PORT}/dev/token/patient123`);
        });
    })
    .catch(err => {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    });

export { JWT_SECRET };