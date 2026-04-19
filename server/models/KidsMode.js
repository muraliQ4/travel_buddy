import mongoose from 'mongoose';

// Kids Mode & Family-friendly Travel (Feature K)
const kidsModeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  enabled: {
    type: Boolean,
    default: false
  },
  
  // Family Members
  familyMembers: [{
    name: { type: String, required: true },
    relationship: { type: String, enum: ['child', 'spouse', 'parent', 'sibling', 'other'], required: true },
    age: { type: Number },
    dateOfBirth: { type: Date },
    specialNeeds: { type: String, default: '' },
    photo: { type: String, default: '' }
  }],
  
  // Kids Details
  children: [{
    name: { type: String, required: true },
    age: { type: Number, required: true },
    dateOfBirth: { type: Date },
    needsBoosterSeat: { type: Boolean, default: false },
    needsCarSeat: { type: Boolean, default: false },
    allergies: [{ type: String }],
    medicalConditions: [{ type: String }],
    favoriteActivities: [{ type: String }],
    emergencyContact: {
      name: { type: String, default: '' },
      phone: { type: String, default: '' },
      relationship: { type: String, default: '' }
    }
  }],
  
  // Safety Preferences
  safetyPreferences: {
    verifiedDriversOnly: { type: Boolean, default: true },
    femaleDriverPreferred: { type: Boolean, default: false },
    ratedDriversOnly: { type: Boolean, default: true },
    minimumRating: { type: Number, default: 4.0, min: 0, max: 5 },
    familyFriendlyDrivers: { type: Boolean, default: true },
    noSmokingRequired: { type: Boolean, default: true },
    quietRidePreferred: { type: Boolean, default: true }
  },
  
  // Vehicle Requirements
  vehicleRequirements: {
    childSeatRequired: { type: Boolean, default: false },
    childSeatType: { type: String, enum: ['', 'infant', 'toddler', 'booster'], default: '' },
    extraSpace: { type: Boolean, default: false },
    acRequired: { type: Boolean, default: true },
    minSeats: { type: Number, default: 4 }
  },
  
  // Entertainment Preferences
  entertainment: {
    musicAllowed: { type: Boolean, default: true },
    kidsMusic: { type: Boolean, default: false },
    videoAccess: { type: Boolean, default: false },
    gamesAllowed: { type: Boolean, default: false }
  },
  
  // Trusted Network
  trustedDrivers: [{
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    addedAt: { type: Date, default: Date.now },
    notes: { type: String, default: '' },
    trips: { type: Number, default: 0 }
  }],
  
  // Auto-share Trip with Family
  autoShareWith: [{
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    relationship: { type: String, default: '' }
  }],
  
  // Restrictions
  restrictions: {
    maxTripDuration: { type: Number, default: 180 }, // minutes
    allowedTimeStart: { type: String, default: '06:00' },
    allowedTimeEnd: { type: String, default: '20:00' },
    maxDistance: { type: Number, default: 50 }, // km
    allowedDays: [{ type: String }] // ['Monday', 'Tuesday', etc.]
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

export default mongoose.model('KidsMode', kidsModeSchema);
