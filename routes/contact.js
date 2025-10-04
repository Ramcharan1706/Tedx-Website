const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact'); // Make sure this path is correct

// GET /api/contact - Retrieve all contact messages
router.get('/', async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json(contacts);
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/contact - Submit contact form
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message, category } = req.body;

    // Simple validation
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }

    // Create and save new contact message
    const newContact = new Contact({ name, email, subject, message, category });
    await newContact.save();

    res.status(201).json({ message: 'Contact form submitted successfully' });
  } catch (error) {
    console.error('Error submitting contact form:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
