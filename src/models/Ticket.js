const crypto = require('node:crypto');
const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  ticketType: { type: String, enum: ['general', 'student', 'vip'], required: true },
  price: { type: Number, required: true, min: 0 },
  buyerInfo: {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, lowercase: true, trim: true, maxlength: 160 },
    phone: { type: String, required: true, trim: true, maxlength: 30 },
    college: { type: String, trim: true, maxlength: 160 },
    studentId: { type: String, trim: true, maxlength: 80 }
  },
  paymentStatus: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
  paymentId: { type: String, trim: true, maxlength: 200 },
  ticketId: { type: String, unique: true, required: true, index: true },
  qrCode: { type: String },
  isCheckedIn: { type: Boolean, default: false },
  checkInTime: { type: Date },
  createdAt: { type: Date, default: Date.now, index: true }
}, { versionKey: false });

ticketSchema.pre('validate', function(next) {
  if (!this.ticketId) {
    this.ticketId = `TEDX${Date.now().toString(36).toUpperCase()}${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  }
  next();
});

module.exports = mongoose.model('Ticket', ticketSchema);
