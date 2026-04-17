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
    secure: false,             // set true when using HTTPS in production
    httpOnly: true,
    maxAge: 48 * 60 * 60 * 1000,  // 48 hours
  },
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
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
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => console.log(`Auth service running on port ${PORT} ✅`));
  })
  .catch((err) => console.error('MongoDB connection error:', err));


  /*{
{
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "patient@gmail.com",
  "password": "SecurePass123",
  "phone": "+1234567890",
  "role": "patient"
}
}
}*/