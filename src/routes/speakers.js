const express = require('express');
const mongoose = require('mongoose');
const Speaker = require('../models/Speaker');

const router = express.Router();

router.get('/', async (_req, res, next) => {
  try {
    const speakers = await Speaker.find({ isActive: true })
      .sort({ order: 1, name: 1 })
      .select('name title bio topic image socialMedia order')
      .lean();
    res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    return res.json(speakers);
  } catch (error) {
    return next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid speaker id.' });
  }

  try {
    const speaker = await Speaker.findOne({ _id: req.params.id, isActive: true })
      .select('name title bio topic image socialMedia order')
      .lean();

    if (!speaker) return res.status(404).json({ message: 'Speaker not found.' });
    return res.json(speaker);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
