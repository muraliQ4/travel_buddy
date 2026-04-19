import mongoose from 'mongoose';

const verificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['email', 'phone', 'identity', 'selfie', 'license', 'vehicle', 'background_check'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in_review', 'approved', 'rejected', 'expired'],
    default: 'pending'
  },
  documentType: {
    type: String,
    enum: ['', 'Aadhaar', 'PAN', 'Passport', 'DrivingLicense', 'VoterID', 'RC', 'Insurance', 'Fitness'],
    default: ''
  },
  documentNumber: {
    type: String,
    default: ''
  },
  documentImages: [{
    type: String
  }],
  selfieImage: {
    type: String,
    default: ''
  },
  verificationCode: {
    code: { type: String, default: '' },
    sentAt: { type: Date },
    expiresAt: { type: Date },
    attempts: { type: Number, default: 0 }
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: {
    type: Date
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  expiryDate: {
    type: Date
  },
  notes: {
    type: String,
    default: ''
  },
  rejectionReason: {
    type: String,
    default: ''
  },
  autoVerified: {
    type: Boolean,
    default: false
  },
  verificationProvider: {
    type: String,
    default: '' // e.g., "Aadhaar API", "DigiLocker", etc.
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
verificationSchema.index({ user: 1, type: 1, status: 1 });
verificationSchema.index({ status: 1, submittedAt: 1 });

export default mongoose.model('Verification', verificationSchema);
