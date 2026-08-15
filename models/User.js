const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true 
  },
  password: {
    type: String,
    required: true
  },
  pmdcLicense: {
    type: String,
    required: true
  },
  hospitalName: {
    type: String,
    required: true
  },
  isVerifiedDoctor: {
    type: Boolean,
    default: false 
  },
  // 📸 NEW: User dashboard profile picture avatar field tracker
  profilePic: {
    type: String,
    default: "https://unsplash.com"
  },
  // 🛒 NEW: Link to track user's purchases from the Order model
  orders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order' // Jab Order schema banayengi to ye auto link ho jaye ga
  }]
}, { timestamps: true }); 

module.exports = mongoose.model('User', UserSchema);
