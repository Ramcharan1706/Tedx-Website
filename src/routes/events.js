const express = require('express');
const EVENT = require('../config/event');
const router = express.Router();

const schedule = Object.freeze([]);

router.get('/', (_req, res) => res.json({ ...EVENT, schedule }));
router.get('/schedule', (_req, res) => res.json(schedule));

module.exports = router;
