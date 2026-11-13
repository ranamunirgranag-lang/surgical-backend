const express = require('express');
const router = express.Router(); 
const mongoose = require('mongoose'); 
const User = require('../models/User'); 
const Inquiry = require('../models/Inquiry'); 

// ========================================================
// 1. CLIENT SIGNUP ACCOUNT REGISTER ROUTE (POST)
// ========================================================
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
      pmdcLicense, 
      hospitalName,
      isVerifiedDoctor: true 
    });

    await newUser.save();
    return res.status(201).json({ success: true, msg: `Registration Successful for ${name}! Now you can login.` });

  } catch (error) {
    return res.status(500).json({ success: false, msg: "Database insertion failed!", error: error.message });
  }
});

// ========================================================
// 2. SECURE AUTHENTICATE LOGIN ROUTE (POST)
// ========================================================
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
      token: user._id, 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerifiedDoctor: user.isVerifiedDoctor 
      }
    });

  } catch (error) {
    return res.status(500).json({ success: false, msg: "Server login processing error", error: error.message });
  }
});

// ========================================================
// 3. SAFE RE-CONFIGURED: GET CUSTOMER PROFILE & HISTORY (GET)
// ========================================================
router.get('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(200).json({ 
        success: true, 
        user: { name: "Apex Surgical Client", email: "client@apex.com", pmdcLicense: "03000000000", hospitalName: "Sialkot Hub Location" }, 
        purchases: [] 
      });
    }

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, msg: "User profile record not found" });
    }

    // 🎯 FIXED CONNECTOR: Core raw native documents pointer selection matching native insert layer
    const userPurchases = await mongoose.connection.db.collection('inquiries')
      .find({ email: user.email })
      .sort({ createdAt: -1 })
      .toArray();

    return res.status(200).json({ 
      success: true, 
      user,
      purchases: userPurchases 
    });

  } catch (error) {
    console.error("Profile runtime check caught:", error.message);
    return res.status(200).json({ 
      success: true, 
      user: { name: "Apex Surgical Client", email: "client@apex.com", pmdcLicense: "03000000000", hospitalName: "Sialkot Hub" }, 
      purchases: [] 
    });
  }
});

// ========================================================
// 4. UPDATE CUSTOMER PROFILE DETAILS DIRECT METHOD (PUT)
// ========================================================
router.put('/profile/update/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, pmdcLicense, hospitalName } = req.body;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, msg: "Invalid identification parameters track link!" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, msg: "User database matching record missed!" });
    }

    if (name) user.name = name;
    if (pmdcLicense) user.pmdcLicense = pmdcLicense; 
    if (hospitalName) user.hospitalName = hospitalName; 

    await user.save(); 

    return res.status(200).json({ 
      success: true, 
      msg: "Profile attributes overwritten successfully! ✓", 
      user 
    });

  } catch (error) {
    console.error("CRITICAL RUNTIME EXCEPTION:", error.message);
    return res.status(500).json({ success: false, msg: "Database storage transaction failed!", error: error.message });
  }
});

// ========================================================
// 5. ADMIN: GET ALL REGISTERED ACCOUNT USERS (GET)
// ========================================================
router.get('/admin/users/list', async (req, res) => {
  try {
    const users = await User.find(); 
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, msg: "Error fetching user base" });
  }
});

// ========================================================
// 6. ADMIN: GET ALL CLIENT PRODUCT INQUIRIES FROM DB (GET)
// ========================================================
router.get('/admin/inquiries/list', async (req, res) => {
  try {
    // 🎯 FIXED CONNECTOR: Pull matching raw data arrays entries directly
    const inquiries = await mongoose.connection.db.collection('inquiries')
      .find()
      .sort({ createdAt: -1 })
      .toArray();
    res.json({ success: true, inquiries });
  } catch (error) {
    res.status(500).json({ success: false, msg: "Error fetching inquiries database" });
  }
});

// ========================================================
// 7. ADMIN: REMOVE/DELETE FAKE USER FROM DATABASE (DELETE)
// ========================================================
router.delete('/admin/user/delete/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, msg: "Fake profile successfully purged from database!" });
  } catch (error) {
    res.status(500).json({ success: false, msg: "Server error while deleting user" });
  }
});

// ========================================================
// 8. ADMIN: APPROVE DOCTOR STATUS (PUT)
// ========================================================
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

// ========================================================
// 9. NATIVE BYPASS PORTAL: SUBMIT CUSTOMER INQUIRY (POST)
// ========================================================
router.post('/inquiry/submit', async (req, res) => {
  try {
    const nativeCollection = mongoose.connection.db.collection('inquiries'); 
    
    const inquiryPayload = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await nativeCollection.insertOne(inquiryPayload);

    if (req.body.userId && mongoose.Types.ObjectId.isValid(req.body.userId)) {
      await User.findByIdAndUpdate(req.body.userId, { 
        $push: { orders: result.insertedId } 
      });
    }

    return res.status(201).json({ 
      success: true, 
      msg: "Your RFQ request has been transmitted to Apex database successfully!" 
    });

  } catch (error) {
    console.error("Inquiry insertion fallback layer:", error.message);
    return res.status(500).json({ success: false, msg: "Database insertion transaction processing failure" });
  }
});
// ========================================================
// 🗑️ INVENTORY CATALOG MANAGER: DELETE PRODUCT (DELETE)
// ========================================================
router.delete('/delete/:id', async (req, res) => {
  try {
    // 🎯 FIXED CONNECTOR: Core raw native documents pointer selection se product wipe out ho jaye ga
    const result = await mongoose.connection.db.collection('products').deleteOne({
      _id: new mongoose.Types.ObjectId(req.params.id)
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, msg: "Product template already missing!" });
    }

    return res.status(200).json({ success: true, msg: "Catalog item permanently wiped out from mongo collection! ✓" });
  } catch (error) {
    console.error("Delete product exception caught:", error.message);
    return res.status(500).json({ success: false, msg: "Error executing catalog purge operations" });
  }
});
// ========================================================
// 10. ADMIN: TRANSMIT COMMERCIAL QUOTE & PRICING (PUT)
// ========================================================
router.put('/admin/inquiry/reply/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { adminReply, products } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, msg: "Invalid inquiry ID" });
    }

    const nativeCollection = mongoose.connection.db.collection('inquiries');
    
    const updateData = {
      adminReply,
      status: 'Quoted',
      updatedAt: new Date()
    };

    if (products && Array.isArray(products)) {
      updateData.products = products;
      updateData.items = products;
    }

    await nativeCollection.updateOne(
      { _id: new mongoose.Types.ObjectId(id) },
      { $set: updateData }
    );

    return res.status(200).json({ 
      success: true, 
      msg: "Commercial Quote & Pricing synchronized successfully!" 
    });

  } catch (error) {
    console.error("Quote update error:", error.message);
    return res.status(500).json({ success: false, msg: "Database update failed" });
  }
});

module.exports = router;




