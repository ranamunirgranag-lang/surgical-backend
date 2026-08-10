const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true // Taake ek email par do accounts na ban sakein
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
    default: false // Shuru mein false hoga, jab tak admin verified nahi karega!
  }
}, { timestamps: true }); // Is se signup ki date aur time automatic save ho jata hai

module.exports = mongoose.model('User', UserSchema);
