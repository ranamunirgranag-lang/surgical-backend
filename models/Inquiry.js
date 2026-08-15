const mongoose = require('mongoose');

const InquirySchema = new mongoose.Schema({
  userId: {
    type: String, // 🌟 FIXED: Object ID validation tracking hata kar simple string kar di taake database validation strict na ho
    default: ""
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    default: "+92 000 0000000"
  },
  city: {
    type: String,
    default: "Sialkot"
  },
  company: {
    type: String,
    default: "Private Medical Clinic"
  },
  message: {
    type: String,
    required: true
  },
  // 🛒 Selected surgical products array payload configuration tracking
  products: {
    type: Array, // 🌟 FIXED: Isay direct plain array kar diya taake structural objects validation crash na hon
    default: []
  },
  itemsCount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    default: "Pending"
  },
  adminReply: {
    type: String,
    default: ""
  }
}, { timestamps: true });

// Explicitly force to save inside choti abc वाला 'inquiries' collection in Compass
module.exports = mongoose.model('Inquiry', InquirySchema, 'inquiries');
