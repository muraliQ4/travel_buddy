import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
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
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  type: {
    type: String,
    enum: ['trip_payment', 'advance_payment', 'refund', 'penalty', 'reward', 'subscription'],
    required: true
  },
  method: {
    type: String,
    enum: ['cash', 'upi', 'card', 'netbanking', 'wallet', 'paytm', 'phonepe', 'googlepay'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'disputed'],
    default: 'pending'
  },
  transactionId: {
    type: String,
    default: ''
  },
  gatewayResponse: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  breakdown: {
    baseFare: { type: Number, default: 0 },
    toll: { type: Number, default: 0 },
    parking: { type: Number, default: 0 },
    fuel: { type: Number, default: 0 },
    serviceFee: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    surge: { type: Number, default: 0 }
  },
  refund: {
    requested: { type: Boolean, default: false },
    requestedAt: { type: Date },
    reason: { type: String, default: '' },
    status: { type: String, enum: ['', 'pending', 'approved', 'rejected', 'processed'], default: '' },
    amount: { type: Number, default: 0 },
    processedAt: { type: Date },
    refundMethod: { type: String, default: '' },
    refundTransactionId: { type: String, default: '' }
  },
  dispute: {
    raised: { type: Boolean, default: false },
    raisedAt: { type: Date },
    reason: { type: String, default: '' },
    status: { type: String, enum: ['', 'pending', 'resolved', 'rejected'], default: '' },
    resolvedAt: { type: Date },
    resolution: { type: String, default: '' }
  },
  receipt: {
    url: { type: String, default: '' },
    number: { type: String, default: '' }
  },
  paidAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Generate unique receipt number
paymentSchema.pre('save', function(next) {
  if (!this.receipt.number && this.status === 'completed') {
    this.receipt.number = `RCP${Date.now()}${Math.floor(Math.random() * 1000)}`;
  }
  next();
});

// Index for efficient queries
paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ trip: 1, status: 1 });

export default mongoose.model('Payment', paymentSchema);
