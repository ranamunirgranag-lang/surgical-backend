const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// DATABASE CONNECTION LOGIC 🔌
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)


  .then(() => console.log('✅ Connected to MongoDB Cloud Database Successfully!'))
  .catch((err) => console.error('❌ Database Connection Error:', err));

// Main Landing Route
// Global System Route Mount Area
app.use('/api/auth', require('./routes/auth'));
app.get('/', (req, res) => {
  res.send('Rana Apex Surgical Node Server Operating Successfully with Cloud DB!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Secure Apex Surgical Server Live on Port: ${PORT}`);
});
