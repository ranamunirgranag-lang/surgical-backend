const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors());

// 💎 FIXED LAYER: Payload limit configuration setup taake laptop ki pictures block na hon
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// DATABASE CONNECTION LOGIC 🔌
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Cloud Database Successfully!'))
  .catch((err) => console.error('❌ Database Connection Error:', err));

// Global System Route Mount Area
app.use('/api/auth', require('./routes/auth'));

app.get('/', (req, res) => {
  res.send('Rana Apex Surgical Node Server Operating Successfully with Cloud DB!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Secure Apex Surgical Server Live on Port: ${PORT}`);
});
