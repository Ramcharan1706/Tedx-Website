const mongoose = require('mongoose');

const socialMediaSchema = new mongoose.Schema({
  twitter: { type: String, trim: true },
  linkedin: { type: String, trim: true },
  instagram: { type: String, trim: true },
  website: { type: String, trim: true }
}, { _id: false });

const speakerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  title: { type: String, required: true, trim: true, maxlength: 160 },
  bio: { type: String, required: true, trim: true, maxlength: 1000 },
  topic: { type: String, required: true, trim: true, maxlength: 200 },
  image: { type: String, required: true, trim: true, maxlength: 300 },
  socialMedia: { type: socialMediaSchema, default: () => ({}) },
  order: { type: Number, default: 0, min: 0, index: true },
  isActive: { type: Boolean, default: true, index: true }
}, { timestamps: true, versionKey: false });

speakerSchema.index({ isActive: 1, order: 1, name: 1 });

module.exports = mongoose.model('Speaker', speakerSchema);
