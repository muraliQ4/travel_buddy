import mongoose from 'mongoose';

// Verified Pickup Zones (Feature V)
const pickupZoneSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['metro-station', 'bus-station', 'airport', 'railway-station', 'mall', 'landmark', 'general'],
    required: true
  },
  location: {
    lat: { type: Number, required: true },
    lon: { type: Number, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, default: '' },
    pincode: { type: String, default: '' }
  },
  coordinates: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true // [longitude, latitude]
    }
  },
  description: {
    type: String,
    default: ''
  },
  directions: {
    type: String,
    default: ''
  },
  landmarks: [{
    type: String
  }],
  photos: [{
    type: String
  }],
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verified: {
    type: Boolean,
    default: false
  },
  safetyRating: {
    type: Number,
    default: 5,
    min: 0,
    max: 5
  },
  amenities: {
    parking: { type: Boolean, default: false },
    restroom: { type: Boolean, default: false },
    shelter: { type: Boolean, default: false },
    lighting: { type: Boolean, default: false },
    cctv: { type: Boolean, default: false },
    security: { type: Boolean, default: false },
    waitingArea: { type: Boolean, default: false }
  },
  operatingHours: {
    allDay: { type: Boolean, default: true },
    openTime: { type: String, default: '00:00' },
    closeTime: { type: String, default: '23:59' }
  },
  usageCount: {
    type: Number,
    default: 0
  },
  ratings: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '' },
    date: { type: Date, default: Date.now }
  }],
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reportedIssues: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    issue: { type: String, required: true },
    status: { type: String, enum: ['open', 'resolved', 'dismissed'], default: 'open' },
    reportedAt: { type: Date, default: Date.now }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create geospatial index for location-based queries
pickupZoneSchema.index({ coordinates: '2dsphere' });

export default mongoose.model('PickupZone', pickupZoneSchema);
