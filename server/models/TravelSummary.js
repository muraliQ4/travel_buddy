import mongoose from 'mongoose';

// Yearly Travel Summary & Annual Stats (Feature Y)
const travelSummarySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  year: {
    type: Number,
    required: true
  },
  
  // Trip Statistics
  trips: {
    total: { type: Number, default: 0 },
    asDriver: { type: Number, default: 0 },
    asPassenger: { type: Number, default: 0 },
    completed: { type: Number, default: 0 },
    canceled: { type: Number, default: 0 },
    unique: { type: Number, default: 0 }
  },
  
  // Distance & Time
  distance: {
    total: { type: Number, default: 0 }, // km
    longest: { type: Number, default: 0 },
    average: { type: Number, default: 0 },
    byTransport: {
      car: { type: Number, default: 0 },
      bike: { type: Number, default: 0 },
      bus: { type: Number, default: 0 },
      train: { type: Number, default: 0 },
      flight: { type: Number, default: 0 },
      other: { type: Number, default: 0 }
    }
  },
  
  time: {
    totalHours: { type: Number, default: 0 },
    averageTripDuration: { type: Number, default: 0 }
  },
  
  // Financial Summary
  financial: {
    totalSpent: { type: Number, default: 0 },
    totalEarned: { type: Number, default: 0 },
    totalSaved: { type: Number, default: 0 },
    averageTripCost: { type: Number, default: 0 },
    cashbackEarned: { type: Number, default: 0 },
    rewardsValue: { type: Number, default: 0 }
  },
  
  // Environmental Impact
  environmental: {
    co2Saved: { type: Number, default: 0 }, // kg
    treesEquivalent: { type: Number, default: 0 },
    fuelSaved: { type: Number, default: 0 }, // liters
    rank: { type: String, enum: ['', 'Eco Warrior', 'Green Traveler', 'Earth Saver'], default: '' }
  },
  
  // Social Impact
  social: {
    travelersConnected: { type: Number, default: 0 },
    friendsMade: { type: Number, default: 0 },
    referralsMade: { type: Number, default: 0 },
    helpfulRatings: { type: Number, default: 0 }
  },
  
  // Top Destinations
  topDestinations: [{
    city: { type: String, required: true },
    visits: { type: Number, required: true },
    totalDistance: { type: Number, default: 0 }
  }],
  
  // Favorite Routes
  favoriteRoutes: [{
    from: { type: String, required: true },
    to: { type: String, required: true },
    count: { type: Number, required: true },
    averageCost: { type: Number, default: 0 }
  }],
  
  // Monthly Breakdown
  monthlyStats: [{
    month: { type: Number, required: true, min: 1, max: 12 },
    trips: { type: Number, default: 0 },
    distance: { type: Number, default: 0 },
    spent: { type: Number, default: 0 },
    saved: { type: Number, default: 0 }
  }],
  
  // Achievements & Badges
  achievements: [{
    name: { type: String, required: true },
    description: { type: String, default: '' },
    icon: { type: String, default: '' },
    earnedDate: { type: Date, required: true },
    category: { type: String, enum: ['trips', 'social', 'eco', 'safety', 'rewards'], default: 'trips' }
  }],
  
  // Ratings
  ratings: {
    averageReceived: { type: Number, default: 0 },
    totalReceived: { type: Number, default: 0 },
    averageGiven: { type: Number, default: 0 },
    totalGiven: { type: Number, default: 0 }
  },
  
  // Milestones
  milestones: [{
    type: { type: String, required: true },
    value: { type: Number, required: true },
    achievedDate: { type: Date, required: true },
    description: { type: String, default: '' }
  }],
  
  // Comparison with Previous Year
  yearOverYear: {
    tripsChange: { type: Number, default: 0 }, // percentage
    distanceChange: { type: Number, default: 0 },
    savingsChange: { type: Number, default: 0 },
    co2Change: { type: Number, default: 0 }
  },
  
  // Generated Report
  reportGenerated: {
    type: Boolean,
    default: false
  },
  reportUrl: {
    type: String,
    default: ''
  },
  generatedAt: {
    type: Date
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

// Create compound index for user and year
travelSummarySchema.index({ user: 1, year: 1 }, { unique: true });

export default mongoose.model('TravelSummary', travelSummarySchema);
