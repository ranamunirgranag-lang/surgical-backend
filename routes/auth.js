const express = require('express');
const router = express.Router(); 
const User = require('../models/User'); 
const Inquiry = require('../models/Inquiry'); 

// 1. CLIENT SIGNUP ACCOUNT REGISTER ROUTE (POST)
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, pmdcLicense, hospitalName } = req.body;

    let userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, msg: "This email is already registered!" });
    }

    const newUser = new User({
      name,
      email,
      password, 
      pmdcLicense, // Frontend se phone number automatically yahan save ho jaye ga
      hospitalName,
      isVerifiedDoctor: true 
    });

    await newUser.save();
    return res.status(201).json({ success: true, msg: `Registration Successful for ${name}! Now you can login.` });

  } catch (error) {
    return res.status(500).json({ success: false, msg: "Database insertion failed!", error: error.message });
  }
});

// 2. SECURE AUTHENTICATE LOGIN ROUTE (POST)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, msg: "Invalid login credentials!" });
    }

    if (user.password !== password) {
      return res.status(400).json({ success: false, msg: "Invalid password key match!" });
    }

    return res.status(200).json({
      success: true,
      msg: `Welcome back, ${user.name}!`,
      user: {
        name: user.name,
        email: user.email,
        isVerifiedDoctor: user.isVerifiedDoctor 
      }
    });

  } catch (error) {
    return res.status(500).json({ success: false, msg: "Server login processing error", error: error.message });
  }
});

// 3. ADMIN: GET ALL REGISTERED ACCOUNT USERS (GET - FIXED SPLIT CHANNEL 💎)
router.get('/admin/users/list', async (req, res) => {
  try {
    const users = await User.find(); // Saare registered customers database se load karein ge
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, msg: "Error fetching user base" });
  }
});

// 4. ADMIN: GET ALL CLIENT PRODUCT INQUIRIES FROM DB (GET - FIXED SPLIT CHANNEL 📬)
router.get('/admin/inquiries/list', async (req, res) => {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 }); // Saari bucket notifications load karein ge
    res.json({ success: true, inquiries });
  } catch (error) {
    res.status(500).json({ success: false, msg: "Error fetching inquiries database" });
  }
});

// 5. ADMIN: REMOVE/DELETE FAKE USER FROM DATABASE (DELETE - NEW 🗑️)
router.delete('/admin/user/delete/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, msg: "Fake profile successfully purged from database!" });
  } catch (error) {
    res.status(500).json({ success: false, msg: "Server error while deleting user" });
  }
});

// 6. ADMIN: APPROVE DOCTOR STATUS (PUT - COMPATIBILITY HOLDER)
router.put('/admin/approve/:id', async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id, 
      { isVerifiedDoctor: true }, 
      { new: true }
    );
    res.json({ success: true, msg: `User Approved Successfully!`, user: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, msg: "Error approving user" });
  }
});

// 7. SUBMIT CUSTOMER INQUIRY MESSAGE FROM CONTACT FORM (POST)
router.post('/inquiry/submit', async (req, res) => {
  try {
    const { name, email, company, message, itemsCount } = req.body;
    const newInquiry = new Inquiry({ name, email, company, message, itemsCount });
    await newInquiry.save();
    return res.status(201).json({ success: true, msg: "Your RFQ request has been transmitted to Apex database!" });
  } catch (error) {
    return res.status(500).json({ success: false, msg: "Database submission error", error: error.message });
  }
});

// 8. ADMIN: SEND REPLY TO INQUIRY (PUT)
router.put('/admin/reply/:id', async (req, res) => {
  try {
    const { replyMessage } = req.body;
    const updatedInquiry = await Inquiry.findByIdAndUpdate(
      req.params.id, 
      { message: `${req.body.oldMessage} \n\n➡️ [Admin Reply]: ${replyMessage}` }, 
      { new: true }
    );
    res.json({ success: true, msg: "Reply sent and stored in database successfully!", inquiry: updatedInquiry });
  } catch (error) {
    res.status(500).json({ success: false, msg: "Server error while replying" });
  }
});

module.exports = router;
