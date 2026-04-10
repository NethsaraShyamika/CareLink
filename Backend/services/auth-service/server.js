const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', require('./routes/authRoutes.js'));

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB ✅');
    app.listen(process.env.PORT || 5001,
      () => console.log('Auth service running on port 5001 ✅'));
  })
  .catch(err => console.error('MongoDB connection error:', err));

  /*{
    "name": "John",
    "email": "add@email.com",
    "password": "1234",
    "role": "patient"
}*/