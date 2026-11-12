const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true }, // Image ka URL ya path
    category: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
