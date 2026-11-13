const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


// 💎 FIXED LAYER: Payload limit ko 50mb se barha kar 100mb kiya taake laptop ki heavy pictures block na hon
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// DATABASE CONNECTION LOGIC 🔌
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Cloud Database Successfully!'))
  .catch((err) => console.error('❌ Database Connection Error:', err));

// Global System Route Mount Area
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/product')); 

app.get('/', (req, res) => {
  res.send('Rana Apex Surgical Node Server Operating Successfully with Cloud DB!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Secure Apex Surgical Server Live on Port: ${PORT}`);
});
