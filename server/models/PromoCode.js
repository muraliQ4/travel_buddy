import mongoose from 'mongoose';

// Offers & Promo Codes (Feature O)
const promoCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['percentage', 'fixed', 'free-ride', 'cashback'],
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  minTripValue: {
    type: Number,
    default: 0
  },
  maxDiscount: {
    type: Number,
    default: 0
  },
  validFrom: {
    type: Date,
    required: true
  },
  validUntil: {
    type: Date,
    required: true
  },
  usageLimit: {
    type: Number,
    default: 1000
  },
  usedCount: {
    type: Number,
    default: 0
  },
  perUserLimit: {
    type: Number,
    default: 1
  },
  applicableFor: {
    type: String,
    enum: ['all', 'new-users', 'premium-users', 'specific-routes'],
    default: 'all'
  },
  specificRoutes: [{
    from: { type: String },
    to: { type: String }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  users: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    usedAt: { type: Date, default: Date.now },
    trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip' },
    discountAmount: { type: Number }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('PromoCode', promoCodeSchema);
