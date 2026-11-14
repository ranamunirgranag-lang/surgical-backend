const express = require('express');
const router = express.Router(); 
const mongoose = require('mongoose'); 
const nodemailer = require('nodemailer');
const User = require('../models/User'); 
const Inquiry = require('../models/Inquiry'); 

const ADMIN_EMAIL = 'ranaapexsurgical640@gmail.com';

const sendNotificationEmail = async (toEmail, subject, htmlContent) => {
  try {
    if (!process.env.EMAIL_APP_PASSWORD) return;
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: ADMIN_EMAIL, pass: process.env.EMAIL_APP_PASSWORD }
    });
    await transporter.sendMail({
      from: `"Rana Apex Surgical" <${ADMIN_EMAIL}>`,
      to: toEmail,
      subject,
      html: htmlContent
    });
  } catch (err) {
    console.error('Email error:', err.message);
  }
};

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, pmdcLicense, hospitalName } = req.body;
    let userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ success: false, msg: "This email is already registered!" });

    const newUser = new User({ name, email, password, pmdcLicense, hospitalName, isVerifiedDoctor: true });
    await newUser.save();

    await sendNotificationEmail(
      ADMIN_EMAIL,
      `New Client Registered: ${name}`,
      `<h3>New Account Created</h3><p><b>Name:</b> ${name}</p><p><b>Email:</b> ${email}</p><p><b>Phone:</b> ${pmdcLicense || 'N/A'}</p><p><b>Hospital:</b> ${hospitalName || 'N/A'}</p>`
    );

    return res.status(201).json({ success: true, msg: `Registration Successful for ${name}! Now you can login.` });
  } catch (error) {
    return res.status(500).json({ success: false, msg: "Database insertion failed!", error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, msg: "Invalid login credentials!" });
    if (user.password !== password) return res.status(400).json({ success: false, msg: "Invalid password key match!" });

    return res.status(200).json({
      success: true,
      msg: `Welcome back, ${user.name}!`,
      token: user._id, 
      user: { id: user._id, name: user.name, email: user.email, isVerifiedDoctor: user.isVerifiedDoctor }
    });
  } catch (error) {
    return res.status(500).json({ success: false, msg: "Server login processing error", error: error.message });
  }
});

router.get('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(200).json({ success: true, user: { name: "Apex Surgical Client", email: "client@apex.com", pmdcLicense: "03000000000", hospitalName: "Sialkot Hub" }, purchases: [] });
    }
    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ success: false, msg: "User profile record not found" });

    const userPurchases = await mongoose.connection.db.collection('inquiries').find({ email: user.email }).sort({ createdAt: -1 }).toArray();
    return res.status(200).json({ success: true, user, purchases: userPurchases });
  } catch (error) {
    return res.status(200).json({ success: true, user: { name: "Apex Surgical Client", email: "client@apex.com", pmdcLicense: "03000000000", hospitalName: "Sialkot Hub" }, purchases: [] });
  }
});

router.put('/profile/update/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, pmdcLicense, hospitalName } = req.body;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) return res.status(400).json({ success: false, msg: "Invalid ID!" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, msg: "User not found!" });

    if (name) user.name = name;
    if (pmdcLicense) user.pmdcLicense = pmdcLicense; 
    if (hospitalName) user.hospitalName = hospitalName; 
    await user.save(); 

    return res.status(200).json({ success: true, msg: "Profile updated successfully!", user });
  } catch (error) {
    return res.status(500).json({ success: false, msg: "Database update failed!", error: error.message });
  }
});

router.get('/admin/users/list', async (req, res) => {
  try {
    const users = await User.find(); 
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, msg: "Error fetching users" });
  }
});

router.get('/admin/inquiries/list', async (req, res) => {
  try {
    const inquiries = await mongoose.connection.db.collection('inquiries').find().sort({ createdAt: -1 }).toArray();
    res.json({ success: true, inquiries });
  } catch (error) {
    res.status(500).json({ success: false, msg: "Error fetching inquiries" });
  }
});

router.delete('/admin/user/delete/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, msg: "User deleted!" });
  } catch (error) {
    res.status(500).json({ success: false, msg: "Error deleting user" });
  }
});

router.put('/admin/approve/:id', async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, { isVerifiedDoctor: true }, { new: true });
    res.json({ success: true, msg: "User Approved!", user: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, msg: "Error approving user" });
  }
});

router.post('/inquiry/submit', async (req, res) => {
  try {
    const nativeCollection = mongoose.connection.db.collection('inquiries'); 
    const inquiryPayload = { ...req.body, createdAt: new Date(), updatedAt: new Date() };
    const result = await nativeCollection.insertOne(inquiryPayload);

    if (req.body.userId && mongoose.Types.ObjectId.isValid(req.body.userId)) {
      await User.findByIdAndUpdate(req.body.userId, { $push: { orders: result.insertedId } });
    }

    await sendNotificationEmail(
      ADMIN_EMAIL,
      `New Surgical RFQ Order from ${req.body.name || 'Client'}`,
      `<h3>New Order Received</h3><p><b>Name:</b> ${req.body.name || 'N/A'}</p><p><b>Email:</b> ${req.body.email || 'N/A'}</p><p><b>Phone:</b> ${req.body.phone || 'N/A'}</p><p><b>Notes:</b> ${req.body.notes || req.body.message || 'N/A'}</p>`
    );

    if (req.body.email) {
      await sendNotificationEmail(
        req.body.email,
        `Order Inquiry Received - Rana Apex Surgical`,
        `<h3>Thank you, ${req.body.name || 'Client'}!</h3><p>We have received your surgical instrument RFQ request and will send commercial pricing shortly.</p>`
      );
    }

    return res.status(201).json({ success: true, msg: "Your RFQ request has been submitted successfully!" });
  } catch (error) {
    return res.status(500).json({ success: false, msg: "Database insertion failure" });
  }
});

router.put('/admin/inquiry/reply/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { adminReply, products } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, msg: "Invalid ID" });

    const nativeCollection = mongoose.connection.db.collection('inquiries');
    const existingInquiry = await nativeCollection.findOne({ _id: new mongoose.Types.ObjectId(id) });

    const updateData = { adminReply, status: 'Quoted', updatedAt: new Date() };
    if (products && Array.isArray(products)) {
      updateData.products = products;
      updateData.items = products;
    }

    await nativeCollection.updateOne({ _id: new mongoose.Types.ObjectId(id) }, { $set: updateData });

    if (existingInquiry && existingInquiry.email) {
      await sendNotificationEmail(
        existingInquiry.email,
        `Commercial Quotation Sent - Rana Apex Surgical`,
        `<h3>Quotation Ready</h3><p>Dear ${existingInquiry.name || 'Client'},</p><p>Rana Apex Surgical has updated your inquiry with pricing and remarks:</p><p><b>${adminReply || 'Updated on dashboard'}</b></p>`
      );
    }

    return res.status(200).json({ success: true, msg: "Commercial Quote synchronized successfully!" });
  } catch (error) {
    return res.status(500).json({ success: false, msg: "Database update failed" });
  }
});

router.put('/profile/password/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const oldPassword = req.body.oldPassword || req.body.currentPassword;
    const newPassword = req.body.newPassword;

    if (!mongoose.Types.ObjectId.isValid(userId)) return res.status(400).json({ success: false, msg: "Invalid user ID!" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, msg: "User not found!" });

    if (user.password !== oldPassword) return res.status(400).json({ success: false, msg: "Your current (old) password does not match!" });
    if (user.password === newPassword) return res.status(400).json({ success: false, msg: "New password is already the same as your current password!" });

    user.password = newPassword;
    await user.save();

    return res.status(200).json({ success: true, msg: "Password updated successfully!" });
  } catch (error) {
    return res.status(500).json({ success: false, msg: "Server error while updating password" });
  }
});

module.exports = router;
