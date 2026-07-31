const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
  property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true, trim: true, maxlength: 1000 },
}, { timestamps: true });

// Prevent duplicate inquiries from same user on same property
inquirySchema.index({ property: 1, fromUser: 1 }, { unique: true });
inquirySchema.index({ fromUser: 1 });
inquirySchema.index({ property: 1 });

module.exports = mongoose.model('Inquiry', inquirySchema);
