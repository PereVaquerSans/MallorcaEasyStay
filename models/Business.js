const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: {
    es: { type: String, default: '' },
    ca: { type: String, default: '' },
    en: { type: String, default: '' },
    de: { type: String, default: '' }
  },
  type: {
    type: String,
    required: true,
    enum: ['artisan', 'restaurant', 'market', 'farm', 'experience', 'accommodation']
  },
  city: { type: String, required: true },
  zone: {
    type: String,
    required: true,
    enum: ['north', 'south', 'east', 'west', 'center', 'tramuntana']
  },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  image: { type: String, default: '' },
  website: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Business', businessSchema);
