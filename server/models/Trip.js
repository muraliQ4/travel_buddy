import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  from: {
    type: String,
    required: true
  },
  to: {
    type: String,
    required: true
  },
  fromData: {
    type: Object,
    required: true
  },
  toData: {
    type: Object,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  maxMembers: {
    type: Number,
    required: true,
    min: 2,
    max: 20
  },
  transport: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  distance: {
    type: String,
    required: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  creatorName: {
    type: String,
    required: true
  },
  members: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    joinedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['confirmed', 'pending', 'canceled'], default: 'confirmed' },
    seatCount: { type: Number, default: 1 },
    pickupPoint: { type: String, default: '' },
    dropPoint: { type: String, default: '' }
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Advanced Trip Features
  tripType: {
    type: String,
    enum: ['one-time', 'recurring', 'scheduled'],
    default: 'one-time'
  },
  recurringDetails: {
    frequency: { type: String, enum: ['', 'daily', 'weekly', 'monthly'], default: '' },
    days: [{ type: String }], // ['Monday', 'Wednesday', 'Friday']
    endDate: { type: Date }
  },
  
  // Multi-stop Route
  stops: [{
    location: { type: String, required: true },
    locationData: { type: Object },
    order: { type: Number, required: true },
    arrivalTime: { type: String, default: '' },
    passengers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  }],
  
  // Time & Scheduling
  departureTime: {
    type: String,
    default: '09:00'
  },
  estimatedArrivalTime: {
    type: String,
    default: ''
  },
  actualDepartureTime: {
    type: Date
  },
  actualArrivalTime: {
    type: Date
  },
  
  // GPS & Live Tracking
  liveTracking: {
    enabled: { type: Boolean, default: false },
    currentLocation: {
      lat: { type: Number },
      lon: { type: Number },
      lastUpdated: { type: Date }
    },
    estimatedTimeArrival: { type: String, default: '' },
    distanceRemaining: { type: String, default: '' },
    routeDeviation: { type: Boolean, default: false }
  },
  
  // Safety & Security
  safetyFeatures: {
    sosEnabled: { type: Boolean, default: true },
    emergencyContacts: [{
      name: { type: String },
      phone: { type: String }
    }],
    liveShareLink: { type: String, default: '' },
    safetyCheckpoints: [{
      location: { type: String },
      time: { type: Date },
      verified: { type: Boolean, default: false }
    }]
  },
  
  // Women-Only Ride Option
  womenOnly: {
    type: Boolean,
    default: false
  },
  
  // Preferences & Amenities
  preferences: {
    smoking: { type: String, enum: ['', 'allowed', 'not-allowed'], default: 'not-allowed' },
    music: { type: String, enum: ['', 'allowed', 'not-allowed', 'flexible'], default: 'flexible' },
    pets: { type: String, enum: ['', 'allowed', 'not-allowed'], default: 'not-allowed' },
    luggage: { type: String, enum: ['', 'small-only', 'medium', 'large'], default: 'medium' },
    ac: { type: Boolean, default: true },
    conversation: { type: String, enum: ['', 'quiet', 'moderate', 'chatty'], default: 'moderate' }
  },
  
  // Vehicle Details
  vehicleInfo: {
    type: { type: String, default: '' },
    make: { type: String, default: '' },
    model: { type: String, default: '' },
    color: { type: String, default: '' },
    licensePlate: { type: String, default: '' },
    amenities: {
      ac: { type: Boolean, default: false },
      bluetooth: { type: Boolean, default: false },
      charger: { type: Boolean, default: false },
      wifi: { type: Boolean, default: false },
      waterBottles: { type: Boolean, default: false }
    }
  },
  
  // Pricing & Payment
  pricing: {
    totalCost: { type: Number, default: 0 },
    perPersonCost: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' },
    includesFuel: { type: Boolean, default: true },
    includesToll: { type: Boolean, default: false },
    includesParking: { type: Boolean, default: false },
    splitMethod: { type: String, enum: ['equal', 'distance-based', 'custom'], default: 'equal' },
    advancePayment: { type: Number, default: 0 },
    advancePaymentRequired: { type: Boolean, default: false }
  },
  
  // Payment Tracking
  payments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'completed', 'refunded', 'failed'], default: 'pending' },
    method: { type: String, enum: ['cash', 'upi', 'card', 'wallet'], default: 'cash' },
    transactionId: { type: String, default: '' },
    paidAt: { type: Date },
    refundedAt: { type: Date },
    refundAmount: { type: Number, default: 0 }
  }],
  
  // Cancellation & Penalties
  cancellationPolicy: {
    freeCancellationHours: { type: Number, default: 24 }, // Hours before trip
    penaltyPercentage: { type: Number, default: 0 }, // 0-100%
    noShowPenalty: { type: Number, default: 100 } // Percentage
  },
  
  // Trip Status
  status: {
    type: String,
    enum: ['upcoming', 'in-progress', 'completed', 'canceled'],
    default: 'upcoming'
  },
  
  // Cancellations
  cancellations: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reason: { type: String, default: '' },
    canceledAt: { type: Date, default: Date.now },
    refundAmount: { type: Number, default: 0 },
    penaltyAmount: { type: Number, default: 0 },
    canceledBy: { type: String, enum: ['passenger', 'driver', 'admin'], default: 'passenger' }
  }],
  
  // Reviews & Ratings
  reviews: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '' },
    photos: [{ type: String }],
    verified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }],
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  
  // Insurance
  insurance: {
    covered: { type: Boolean, default: false },
    provider: { type: String, default: '' },
    policyNumber: { type: String, default: '' },
    coverageAmount: { type: Number, default: 0 }
  },
  
  // Environmental Impact
  environmental: {
    carbonFootprint: { type: Number, default: 0 }, // kg CO2
    carbonSaved: { type: Number, default: 0 }, // kg CO2 saved by carpooling
    treesEquivalent: { type: Number, default: 0 }
  },
  
  // Verification Requirements
  verificationRequired: {
    emailVerified: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false },
    identityVerified: { type: Boolean, default: false },
    minimumRating: { type: Number, default: 0 }
  },
  
  // Baggage/Cargo
  cargo: {
    allowsPackages: { type: Boolean, default: false },
    maxWeight: { type: Number, default: 0 }, // kg
    maxDimensions: { type: String, default: '' },
    packageDescription: { type: String, default: '' }
  },
  
  // Peak Hours & Dynamic Pricing
  dynamicPricing: {
    enabled: { type: Boolean, default: false },
    surgeMultiplier: { type: Number, default: 1.0 },
    isPeakHours: { type: Boolean, default: false }
  },
  
  // Auto-acceptance
  autoAccept: {
    type: Boolean,
    default: false
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

// Update timestamp on save
tripSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model('Trip', tripSchema);
