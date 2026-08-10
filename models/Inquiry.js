const mongoose = require('mongoose');

const InquirySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  company: { type: String },
  message: { type: String, required: true },
  itemsCount: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Inquiry', InquirySchema);
