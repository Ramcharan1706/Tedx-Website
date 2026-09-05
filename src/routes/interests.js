const express = require('express');
const Interest = require('../models/Interest');
const { contactLimiter } = require('../middleware/security');
const { isValidEmail, cleanString } = require('../utils/validation');

const router = express.Router();
router.use(contactLimiter);

router.post('/', async (req, res, next) => {
  const email = cleanString(req.body?.email, 160).toLowerCase();
  if (!isValidEmail(email)) {
    return res.status(400).json({ message: 'Enter a valid email address.', errors: { email: 'Invalid email.' } });
  }
  if (!process.env.MONGODB_URI) {
    return res.status(503).json({ message: 'Registration interest service is not configured yet.' });
  }

  try {
    await Interest.updateOne(
      { email },
      { $setOnInsert: { email } },
      { upsert: true }
    );
    return res.status(201).json({ message: 'You are on the list.' });
  } catch (error) {
    if (error?.code === 11000) return res.status(200).json({ message: 'You are already on the list.' });
    return next(error);
  }
});

module.exports = router;
