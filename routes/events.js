const express = require('express');
const router = express.Router();

// Mock event data
const eventData = {
  title: "TEDxKPRIT 2024: Break The Loop",
  date: "2024-03-15",
  time: "09:00",
  venue: "KPR Institute of Technology",
  theme: "Break The Loop",
  description: "A day of inspiring talks, performances, and networking",
  schedule: [
    {
      time: "09:00",
      activity: "Registration & Welcome Coffee",
      duration: 60
    },
    {
      time: "10:00",
      activity: "Opening Ceremony",
      duration: 30
    },
    {
      time: "10:30",
      activity: "Speaker Session 1",
      duration: 90
    },
    {
      time: "12:00",
      activity: "Lunch Break & Networking",
      duration: 60
    },
    {
      time: "13:00",
      activity: "Speaker Session 2",
      duration: 90
    },
    {
      time: "14:30",
      activity: "Workshop & Interactive Sessions",
      duration: 60
    },
    {
      time: "15:30",
      activity: "Speaker Session 3",
      duration: 90
    },
    {
      time: "17:00",
      activity: "Closing Ceremony",
      duration: 30
    }
  ]
};

// GET event details
router.get('/', (req, res) => {
  res.json(eventData);
});

// GET event schedule
router.get('/schedule', (req, res) => {
  res.json(eventData.schedule);
});

module.exports = router;
