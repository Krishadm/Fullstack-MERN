const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  type: {
    type: String,
    required: true,
    enum: ['apartment', 'house', 'villa', 'commercial', 'plot', 'pg'],
  },
  status: {
    type: String,
    required: true,
    enum: ['for_sale', 'for_rent'],
  },
  price: { type: Number, required: true, min: 1 },
  city: { type: String, required: true, trim: true },
  locality: { type: String, required: true, trim: true },
  address: { type: String, required: true },
  bedrooms: { type: Number, default: 0, min: 0 },
  bathrooms: { type: Number, default: 0, min: 0 },
  area: { type: Number, required: true, min: 1 },
  images: [{ type: String }],
  amenities: [{ type: String }],
  isFurnished: { type: Boolean, default: false },
  parkingAvailable: { type: Boolean, default: false },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  inquiryCount: { type: Number, default: 0 },
  isDeleted: { type: Boolean, default: false, index: true },
  deletedAt: { type: Date, default: null },
}, { timestamps: true });

// Auto-exclude soft-deleted docs from all find queries
propertySchema.pre(/^find/, function () {
  if (this.getFilter().isDeleted === undefined) {
    this.where({ isDeleted: false });
  }
});

// Indexes for scalable search & filtering on 50k+ records
propertySchema.index({ city: 1 });
propertySchema.index({ type: 1 });
propertySchema.index({ status: 1 });
propertySchema.index({ price: 1 });
propertySchema.index({ bedrooms: 1 });
propertySchema.index({ owner: 1 });
propertySchema.index({ createdAt: -1 });
// Compound indexes for common filter combos
propertySchema.index({ city: 1, status: 1, type: 1 });
propertySchema.index({ city: 1, price: 1 });
propertySchema.index({ status: 1, price: 1 });
// Text index for full-text search
propertySchema.index({ title: 'text', description: 'text', city: 'text', locality: 'text' });

module.exports = mongoose.model('Property', propertySchema);
