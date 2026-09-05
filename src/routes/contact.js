const express = require('express');
const Contact = require('../models/Contact');
const { contactLimiter } = require('../middleware/security');
const { validateContactPayload } = require('../utils/validation');

const router = express.Router();
router.use(contactLimiter);

router.post('/', async (req, res, next) => {
  try {
    const result = validateContactPayload(req.body);
    if (!result.valid) {
      return res.status(400).json({ message: 'Please correct the highlighted fields.', errors: result.errors });
    }

    if (!process.env.MONGODB_URI) {
      return res.status(503).json({ message: 'Contact service is not configured yet.' });
    }

    const contact = await Contact.create(result.value);
    return res.status(201).json({ message: 'Transmission received.', id: contact.id });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
