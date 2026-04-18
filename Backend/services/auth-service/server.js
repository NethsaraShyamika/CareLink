import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);

import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import session from 'express-session';
import authRoutes from './routes/authRoutes.js';

const app = express();

// ─── Middleware ────────────────────────────────────────────────────────────────

app.use(session({
  secret: process.env.JWT_SECRET || 'mysecretkey123',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false,            
    httpOnly: true,
    maxAge: 48 * 60 * 60 * 1000,  
  },
}));

app.use(cors({
 
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:5176",
    "http://localhost:3000",
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
}));

app.use(express.json());

// ─── Routes ────────────────────────────────────────────────────────────────────

app.use('/api/auth', authRoutes);

// ─── Database + Server ────────────────────────────────────────────────────────

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB ✅');
    const PORT = process.env.PORT || 3008;
    app.listen(PORT, () => console.log(`Auth service running on port ${PORT} ✅`));
  })
  .catch((err) => console.error('MongoDB connection error:', err));

