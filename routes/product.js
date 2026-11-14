const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// 1. Naya Product Add karne ki API (Admin ke liye)
router.post('/add', async (req, res) => {
    try {
        const { name, description, price, image, category } = req.body;
        
        const newProduct = new Product({ 
            name, 
            description, 
            price: price || 0, 
            image, 
            category: category || 'Surgical Instruments' 
        });
        await newProduct.save();
        
        res.status(201).json({ success: true, message: "Product successfully added!", product: newProduct });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 2. Product ki Price ya Details Update karne ki API (Admin ke liye)
router.put('/update/:id', async (req, res) => {
    try {
        const { price, name, description, image, category } = req.body;
        
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            { price: price || 0, name, description, image, category },
            { new: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ success: false, message: "Product not found!" });
        }

        res.status(200).json({ success: true, message: "Product price/details updated!", product: updatedProduct });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 3. Tamam Products Get karne ki API (Taake website par dikhayein)
router.get('/all', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 4. Product Delete karne ki API (Admin ke liye)
router.delete('/delete/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "Product successfully deleted!" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
