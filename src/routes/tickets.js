const express = require('express');
const Ticket = require('../models/Ticket');
const router = express.Router();

router.post('/', (_req, res) => {
  res.status(503).json({ message: 'Registration is not open yet.' });
});

router.get('/', (_req, res) => {
  res.status(403).json({ message: 'Ticket records are private.' });
});

router.get('/:id', async (req, res, next) => {
  const ticketId = String(req.params.id || '').trim();
  if (!/^TEDX[A-Z0-9_-]{8,80}$/i.test(ticketId)) {
    return res.status(400).json({ message: 'Invalid ticket id.' });
  }

  try {
    const ticket = await Ticket.findOne({ ticketId })
      .select('ticketId ticketType paymentStatus isCheckedIn checkInTime createdAt')
      .lean();

    if (!ticket) return res.status(404).json({ message: 'Ticket not found.' });
    return res.json(ticket);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
