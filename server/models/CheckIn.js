import mongoose from 'mongoose';

// Express Check-in & QR Check-in (Feature X)
const checkInSchema = new mongoose.Schema({
  trip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  method: {
    type: String,
    enum: ['qr-code', 'manual', 'auto', 'location-based'],
    required: true
  },
  qrCode: {
    type: String,
    unique: true,
    sparse: true
  },
  location: {
    lat: { type: Number },
    lon: { type: Number },
    address: { type: String, default: '' }
  },
  checkInTime: {
    type: Date,
    default: Date.now
  },
  expectedTime: {
    type: Date
  },
  status: {
    type: String,
    enum: ['on-time', 'early', 'late', 'no-show'],
    default: 'on-time'
  },
  delay: {
    type: Number,
    default: 0 // minutes
  },
  verified: {
    type: Boolean,
    default: false
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: {
    type: String,
    default: ''
  },
  photo: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Generate QR code for trip
checkInSchema.statics.generateQRCode = function(tripId, userId) {
  return `TRAVELBUDDY-${tripId}-${userId}-${Date.now()}`;
};

export default mongoose.model('CheckIn', checkInSchema);
