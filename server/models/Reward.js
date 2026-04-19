import mongoose from 'mongoose';

const rewardSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'trip_completion',
      'referral',
      'review',
      'verification',
      'streak',
      'milestone',
      'promotion',
      'birthday',
      'anniversary',
      'eco_warrior',
      'social_share'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  points: {
    type: Number,
    default: 0
  },
  cashReward: {
    type: Number,
    default: 0
  },
  badge: {
    name: { type: String, default: '' },
    icon: { type: String, default: '' },
    tier: { type: String, enum: ['', 'bronze', 'silver', 'gold', 'platinum'], default: '' }
  },
  relatedTrip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip'
  },
  relatedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  expiresAt: {
    type: Date
  },
  redeemed: {
    type: Boolean,
    default: false
  },
  redeemedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
rewardSchema.index({ user: 1, redeemed: 1 });
rewardSchema.index({ expiresAt: 1 });

export default mongoose.model('Reward', rewardSchema);
