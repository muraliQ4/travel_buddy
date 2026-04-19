import mongoose from 'mongoose';

// Journey Insurance & Flexible Insurance (Features F & J)
const insuranceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  trip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: true
  },
  type: {
    type: String,
    enum: ['cancellation', 'journey', 'comprehensive'],
    required: true
  },
  provider: {
    type: String,
    default: 'TravelBuddy Insurance'
  },
  policyNumber: {
    type: String,
    required: true,
    unique: true
  },
  coverage: {
    cancellation: { type: Boolean, default: false },
    medicalEmergency: { type: Boolean, default: false },
    accidentalDamage: { type: Boolean, default: false },
    delayCompensation: { type: Boolean, default: false },
    luggageLoss: { type: Boolean, default: false },
    personalAccident: { type: Boolean, default: false }
  },
  coverageAmount: {
    type: Number,
    required: true
  },
  premium: {
    type: Number,
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
  status: {
    type: String,
    enum: ['active', 'expired', 'claimed', 'canceled'],
    default: 'active'
  },
  claims: [{
    claimDate: { type: Date, default: Date.now },
    reason: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'paid'], default: 'pending' },
    documents: [{ type: String }],
    approvedAmount: { type: Number, default: 0 },
    paidAt: { type: Date },
    rejectionReason: { type: String, default: '' }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Insurance', insuranceSchema);
