import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  period: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly', 'all-time'],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  
  // Trip Statistics
  tripStats: {
    totalTrips: { type: Number, default: 0 },
    asDriver: { type: Number, default: 0 },
    asPassenger: { type: Number, default: 0 },
    completedTrips: { type: Number, default: 0 },
    canceledTrips: { type: Number, default: 0 },
    totalDistance: { type: Number, default: 0 },
    averageDistance: { type: Number, default: 0 }
  },
  
  // Financial Statistics
  financialStats: {
    totalSpent: { type: Number, default: 0 },
    totalEarned: { type: Number, default: 0 },
    totalSaved: { type: Number, default: 0 },
    averageTripCost: { type: Number, default: 0 },
    walletBalance: { type: Number, default: 0 }
  },
  
  // Environmental Impact
  environmentalImpact: {
    co2Saved: { type: Number, default: 0 },
    treesEquivalent: { type: Number, default: 0 },
    fuelSaved: { type: Number, default: 0 }
  },
  
  // Social Stats
  socialStats: {
    uniqueTravelPartners: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    referralsMade: { type: Number, default: 0 }
  },
  
  // Frequent Routes
  topRoutes: [{
    from: { type: String },
    to: { type: String },
    count: { type: Number },
    totalDistance: { type: Number },
    averageCost: { type: Number }
  }],
  
  // Time Patterns
  timePatterns: {
    mostActiveDay: { type: String, default: '' },
    mostActiveHour: { type: Number, default: 0 },
    peakTravelMonths: [{ type: String }]
  },
  
  // Achievements
  achievements: [{
    type: { type: String },
    unlockedAt: { type: Date }
  }],
  
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
analyticsSchema.index({ user: 1, period: 1, startDate: -1 });

export default mongoose.model('Analytics', analyticsSchema);
