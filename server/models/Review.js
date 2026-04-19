import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  trip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: true
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewerName: {
    type: String,
    required: true
  },
  revieweeName: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['driver', 'passenger'],
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    default: ''
  },
  categories: {
    punctuality: { type: Number, min: 1, max: 5 },
    cleanliness: { type: Number, min: 1, max: 5 },
    communication: { type: Number, min: 1, max: 5 },
    safety: { type: Number, min: 1, max: 5 },
    friendliness: { type: Number, min: 1, max: 5 }
  },
  photos: [{
    type: String
  }],
  verified: {
    type: Boolean,
    default: false
  },
  helpful: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  reported: {
    isReported: { type: Boolean, default: false },
    reason: { type: String, default: '' },
    reportedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  response: {
    text: { type: String, default: '' },
    respondedAt: { type: Date }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
reviewSchema.index({ trip: 1, reviewer: 1 });
reviewSchema.index({ reviewee: 1, rating: -1 });

export default mongoose.model('Review', reviewSchema);
