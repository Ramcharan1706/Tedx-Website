const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  ticketType: {
    type: String,
    enum: ['general', 'student', 'vip'],
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  buyerInfo: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    college: {
      type: String,
      trim: true
    },
    studentId: {
      type: String,
      trim: true
    }
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentId: {
    type: String,
    trim: true
  },
  ticketId: {
    type: String,
    unique: true,
    required: true
  },
  qrCode: {
    type: String
  },
  isCheckedIn: {
    type: Boolean,
    default: false
  },
  checkInTime: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Generate unique ticket ID before saving
ticketSchema.pre('save', function(next) {
  if (!this.ticketId) {
    this.ticketId = 'TEDX' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Ticket', ticketSchema);
