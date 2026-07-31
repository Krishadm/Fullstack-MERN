const mongoose = require('mongoose');

const contactMessageSchema = new mongoose.Schema({
  name:    { type: String, required: true, trim: true },
  email:   { type: String, required: true, trim: true },
  phone:   { type: String, trim: true, default: '' },
  message: { type: String, required: true, trim: true, maxlength: 2000 },
}, { timestamps: true });

contactMessageSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ContactMessage', contactMessageSchema);
