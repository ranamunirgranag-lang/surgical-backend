const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// ✅ 100% OPEN CORS FOR VERCEL FRONTEND
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Payload limit for heavy product images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ✅ SERVERLESS MONGODB CONNECTION
const MONGO_URI = process.env.MONGO_URI;

if (MONGO_URI) {
  mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB Cloud Database Successfully!'))
    .catch((err) => console.error('❌ Database Connection Error:', err));
} else {
  console.error('❌ MONGO_URI is missing in Environment Variables!');
}

// Global System Route Mount Area
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/product')); 

app.get('/', (req, res) => {
  res.send('Rana Apex Surgical Node Server Operating Successfully with Cloud DB!');
});

// Local laptop par chalane ke liye
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Secure Apex Surgical Server Live on Port: ${PORT}`);
  });
}

// ✅ VERCEL SERVERLESS KE LIYE SABSE ZAROORI LINE
module.exports = app;
