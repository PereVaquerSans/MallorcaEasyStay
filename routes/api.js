const express = require('express');
const router = express.Router();
const Business = require('../models/Business');

// Escape special regex characters to prevent ReDoS attacks
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// GET /api/businesses — list all, with optional filters
router.get('/businesses', async (req, res) => {
  try {
    const filter = {};
    if (req.query.city) filter.city = new RegExp(escapeRegex(req.query.city), 'i');
    if (req.query.zone) filter.zone = req.query.zone;
    if (req.query.type) filter.type = req.query.type;

    const businesses = await Business.find(filter).sort({ name: 1 });
    res.json(businesses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/businesses/:id — single business
router.get('/businesses/:id', async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);
    if (!business) return res.status(404).json({ error: 'Not found' });
    res.json(business);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
