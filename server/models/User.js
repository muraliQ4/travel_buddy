import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  // Required fields
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  username: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  phone: {
    type: String,
    default: '',
    sparse: true
  },
  phoneVerified: {
    type: Boolean,
    default: false
  },
  phoneVerifiedAt: {
    type: Date,
    default: null
  },
  country: {
    type: String,
    default: ''
  },
  city: {
    type: String,
    default: ''
  },
  
  // Optional personal details
  profilePhoto: {
    type: String,
    default: ''
  },
  dateOfBirth: {
    type: String,
    default: ''
  },
  gender: {
    type: String,
    enum: ['', 'Male', 'Female', 'Other'],
    default: ''
  },
  nationality: {
    type: String,
    default: ''
  },
  
  // About
  bio: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  
  // Travel preferences
  interests: {
    type: String,
    default: ''
  },
  languages: {
    type: String,
    default: ''
  },
  travelStyle: {
    type: String,
    enum: ['', 'Budget', 'Comfort', 'Luxury', 'Adventure', 'Relaxed'],
    default: ''
  },
  travelerType: {
    type: String,
    enum: ['', 'Solo', 'Family', 'Friends', 'Business', 'Couple'],
    default: ''
  },
  preferredDestinations: {
    type: String,
    default: ''
  },
  budgetRange: {
    type: String,
    enum: ['', 'Budget (<$50/day)', 'Mid-range ($50-150/day)', 'Luxury ($150+/day)'],
    default: ''
  },
  preferredSeason: {
    type: String,
    default: ''
  },
  
  // Social links
  instagramHandle: {
    type: String,
    default: ''
  },
  facebookProfile: {
    type: String,
    default: ''
  },
  
  // Verification & Safety
  verification: {
    email: { type: Boolean, default: false },
    phone: { type: Boolean, default: false },
    identity: { 
      verified: { type: Boolean, default: false },
      documentType: { type: String, enum: ['', 'Aadhaar', 'PAN', 'Passport', 'DrivingLicense'], default: '' },
      documentNumber: { type: String, default: '' },
      verifiedAt: { type: Date }
    },
    selfie: { type: Boolean, default: false },
    backgroundCheck: { 
      verified: { type: Boolean, default: false },
      status: { type: String, enum: ['', 'pending', 'approved', 'rejected'], default: '' },
      verifiedAt: { type: Date }
    },
    trustedTraveler: { type: Boolean, default: false },
    verificationLevel: { type: Number, default: 0, min: 0, max: 5 } // 0-5 based on completed verifications
  },
  
  // Emergency Contacts
  emergencyContacts: [{
    name: { type: String, required: true },
    phone: { type: String, required: true },
    relationship: { type: String, default: '' },
    isPrimary: { type: Boolean, default: false }
  }],
  
  // Ratings & Reviews
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 },
    asDriver: { type: Number, default: 0 },
    asPassenger: { type: Number, default: 0 }
  },
  
  // Behavior Score & User Type (Feature U)
  userType: {
    type: String,
    enum: ['passenger', 'driver', 'both'],
    default: 'passenger'
  },
  behaviorScore: {
    score: { type: Number, default: 100, min: 0, max: 100 },
    reliability: { type: Number, default: 5, min: 0, max: 5 },
    punctuality: { type: Number, default: 5, min: 0, max: 5 },
    cleanliness: { type: Number, default: 5, min: 0, max: 5 },
    communication: { type: Number, default: 5, min: 0, max: 5 },
    lastUpdated: { type: Date, default: Date.now }
  },
  
  // Travel Stats
  travelStats: {
    completedTrips: { type: Number, default: 0 },
    canceledTrips: { type: Number, default: 0 },
    lateCancellations: { type: Number, default: 0 },
    noShows: { type: Number, default: 0 },
    totalDistance: { type: Number, default: 0 },
    totalCO2Saved: { type: Number, default: 0 },
    moneyShared: { type: Number, default: 0 },
    moneySaved: { type: Number, default: 0 }
  },
  
  // Wallet & Payments
  wallet: {
    balance: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' },
    transactions: [{
      type: { type: String, enum: ['credit', 'debit', 'refund', 'penalty', 'reward'], required: true },
      amount: { type: Number, required: true },
      description: { type: String, default: '' },
      tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip' },
      date: { type: Date, default: Date.now }
    }]
  },
  
  // Payment Methods
  paymentMethods: [{
    type: { type: String, enum: ['card', 'upi', 'netbanking', 'wallet'], required: true },
    provider: { type: String, default: '' }, // Paytm, PhonePe, GooglePay, etc.
    last4: { type: String, default: '' },
    isDefault: { type: Boolean, default: false },
    details: { type: mongoose.Schema.Types.Mixed }
  }],
  
  // Rewards & Loyalty
  rewards: {
    points: { type: Number, default: 0 },
    tier: { type: String, enum: ['Bronze', 'Silver', 'Gold', 'Platinum'], default: 'Bronze' },
    badges: [{
      name: { type: String, required: true },
      icon: { type: String, default: '' },
      earnedAt: { type: Date, default: Date.now },
      description: { type: String, default: '' }
    }],
    referralCode: { type: String, unique: true, sparse: true },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    referralCount: { type: Number, default: 0 }
  },
  
  // Subscription
  subscription: {
    plan: { type: String, enum: ['', 'basic', 'premium', 'enterprise'], default: '' },
    startDate: { type: Date },
    endDate: { type: Date },
    autoRenew: { type: Boolean, default: false },
    benefits: [{ type: String }]
  },
  
  // Preferences & Filters
  preferences: {
    smoking: { type: String, enum: ['', 'no-smoking', 'smoking-ok', 'no-preference'], default: '' },
    music: { type: String, enum: ['', 'no-music', 'music-ok', 'no-preference'], default: '' },
    pets: { type: String, enum: ['', 'no-pets', 'pets-ok', 'no-preference'], default: '' },
    chattiness: { type: String, enum: ['', 'quiet', 'moderate', 'chatty'], default: '' },
    ac: { type: Boolean, default: true },
    luggage: { type: String, enum: ['', 'small', 'medium', 'large'], default: '' },
    womenOnlyRides: { type: Boolean, default: false }, // Prefer women-only rides
    verifiedOnly: { type: Boolean, default: false }, // Only travel with verified users
    instantBooking: { type: Boolean, default: false } // Allow instant booking without approval
  },
  
  // Accessibility
  accessibility: {
    wheelchairAccessible: { type: Boolean, default: false },
    hearingImpaired: { type: Boolean, default: false },
    visuallyImpaired: { type: Boolean, default: false },
    specialNeeds: { type: String, default: '' }
  },
  
  // Vehicle Information (for drivers)
  vehicle: {
    hasVehicle: { type: Boolean, default: false },
    type: { type: String, enum: ['', 'car', 'bike', 'suv', 'van', 'bus'], default: '' },
    make: { type: String, default: '' },
    model: { type: String, default: '' },
    year: { type: Number },
    color: { type: String, default: '' },
    licensePlate: { type: String, default: '' },
    verified: { type: Boolean, default: false },
    documents: {
      rc: { verified: { type: Boolean, default: false }, expiryDate: { type: Date } },
      insurance: { verified: { type: Boolean, default: false }, expiryDate: { type: Date } },
      fitness: { verified: { type: Boolean, default: false }, expiryDate: { type: Date } },
      permit: { verified: { type: Boolean, default: false }, expiryDate: { type: Date } }
    },
    amenities: {
      ac: { type: Boolean, default: false },
      bluetooth: { type: Boolean, default: false },
      charger: { type: Boolean, default: false },
      wifi: { type: Boolean, default: false },
      waterBottles: { type: Boolean, default: false }
    },
    seatingCapacity: { type: Number, default: 4 }
  },
  
  // Driver specific
  driverProfile: {
    isDriver: { type: Boolean, default: false },
    license: {
      number: { type: String, default: '' },
      verified: { type: Boolean, default: false },
      expiryDate: { type: Date }
    },
    experienceYears: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    completedRides: { type: Number, default: 0 }
  },
  
  // Favorite & Blocked Users
  favoriteUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  // Frequent Routes
  frequentRoutes: [{
    from: { type: String, required: true },
    to: { type: String, required: true },
    count: { type: Number, default: 1 },
    lastTraveled: { type: Date, default: Date.now }
  }],
  
  // Account settings
  notificationPreferences: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    sms: { type: Boolean, default: true },
    tripUpdates: { type: Boolean, default: true },
    messages: { type: Boolean, default: true },
    promotions: { type: Boolean, default: true },
    rideReminders: { type: Boolean, default: true },
    paymentUpdates: { type: Boolean, default: true }
  },
  privacySettings: {
    showEmail: { type: Boolean, default: false },
    showPhone: { type: Boolean, default: false },
    showLocation: { type: Boolean, default: true },
    showVehicle: { type: Boolean, default: true },
    profileVisibility: { type: String, enum: ['public', 'members', 'private'], default: 'public' },
    shareLocationLive: { type: Boolean, default: true }
  },
  
  // Account Status
  accountStatus: {
    isActive: { type: Boolean, default: true },
    isSuspended: { type: Boolean, default: false },
    suspensionReason: { type: String, default: '' },
    warnings: { type: Number, default: 0 },
    lastActive: { type: Date, default: Date.now }
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('User', userSchema);
