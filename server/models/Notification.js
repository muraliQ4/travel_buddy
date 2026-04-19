import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'trip_request',
      'trip_accepted',
      'trip_rejected',
      'trip_canceled',
      'trip_reminder',
      'trip_started',
      'trip_completed',
      'payment_received',
      'payment_pending',
      'refund_processed',
      'review_received',
      'message',
      'sos_alert',
      'verification_complete',
      'reward_earned',
      'subscription_expiring',
      'penalty_applied',
      'promotion',
      'safety_alert',
      'route_deviation'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  relatedTrip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip'
  },
  relatedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  read: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  actionUrl: {
    type: String,
    default: ''
  },
  expiresAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
notificationSchema.index({ user: 1, read: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

export default mongoose.model('Notification', notificationSchema);
