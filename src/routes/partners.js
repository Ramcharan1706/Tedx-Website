const express = require('express');
const router = express.Router();

router.get('/', (_req, res) => {
  res.set('Cache-Control', 'public, max-age=300');
  res.json({ status: 'coming-soon', partners: [] });
});

module.exports = router;
