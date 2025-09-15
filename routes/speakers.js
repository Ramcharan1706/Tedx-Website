const express = require('express');
const router = express.Router();
const Speaker = require('../models/Speaker');

// GET all speakers
router.get('/', async (req, res) => {
  try {
    const speakers = await Speaker.find({ isActive: true }).sort({ order: 1 });
    res.json(speakers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET single speaker by ID
router.get('/:id', async (req, res) => {
  try {
    const speaker = await Speaker.findById(req.params.id);
    if (!speaker) {
      return res.status(404).json({ message: 'Speaker not found' });
    }
    res.json(speaker);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST new speaker
router.post('/', async (req, res) => {
  try {
    const speaker = new Speaker(req.body);
    const savedSpeaker = await speaker.save();
    res.status(201).json(savedSpeaker);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update speaker
router.put('/:id', async (req, res) => {
  try {
    const speaker = await Speaker.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!speaker) {
      return res.status(404).json({ message: 'Speaker not found' });
    }
    res.json(speaker);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE speaker
router.delete('/:id', async (req, res) => {
  try {
    const speaker = await Speaker.findByIdAndDelete(req.params.id);
    if (!speaker) {
      return res.status(404).json({ message: 'Speaker not found' });
    }
    res.json({ message: 'Speaker deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
