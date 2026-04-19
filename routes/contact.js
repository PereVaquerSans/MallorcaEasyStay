const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');

// POST /api/contact — save contact message
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const contact = await Contact.create({ name, email, subject, message });
    res.status(201).json({ success: true, id: contact._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
