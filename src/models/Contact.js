const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 160 },
  message: { type: String, required: true, trim: true, minlength: 10, maxlength: 2000 },
  createdAt: { type: Date, default: Date.now, index: true }
}, { versionKey: false });

module.exports = mongoose.model('Contact', contactSchema);
