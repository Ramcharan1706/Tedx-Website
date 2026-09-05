const mongoose = require('mongoose');

const interestSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    maxlength: 160,
    index: true
  },
  createdAt: { type: Date, default: Date.now, index: true }
}, { versionKey: false });

interestSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model('Interest', interestSchema);
