import mongoose from 'mongoose';

// Route Deviation Alerts & Safety Alerts (Features R & N)
const safetyAlertSchema = new mongoose.Schema({
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
  type: {
    type: String,
    enum: ['route-deviation', 'night-mode', 'emergency', 'suspicious-activity', 'unsafe-location'],
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  location: {
    lat: { type: Number },
    lon: { type: Number },
    address: { type: String, default: '' }
  },
  deviationDetails: {
    expectedRoute: { type: String, default: '' },
    actualRoute: { type: String, default: '' },
    deviationDistance: { type: Number, default: 0 }, // km
    deviationTime: { type: Number, default: 0 } // minutes
  },
  status: {
    type: String,
    enum: ['active', 'acknowledged', 'resolved', 'false-alarm'],
    default: 'active'
  },
  notificationsSent: [{
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    method: { type: String, enum: ['push', 'sms', 'email', 'call'], required: true },
    sentAt: { type: Date, default: Date.now },
    acknowledged: { type: Boolean, default: false }
  }],
  actions: [{
    action: { type: String, required: true },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now },
    notes: { type: String, default: '' }
  }],
  resolvedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Night Safety Mode Monitoring (Feature N)
const nightSafetySchema = new mongoose.Schema({
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
  isNightTrip: {
    type: Boolean,
    default: false
  },
  nightStartTime: {
    type: String,
    default: '22:00'
  },
  nightEndTime: {
    type: String,
    default: '06:00'
  },
  monitoring: {
    enabled: { type: Boolean, default: true },
    frequency: { type: Number, default: 10 }, // minutes
    lastCheckIn: { type: Date },
    missedCheckIns: { type: Number, default: 0 },
    emergencyContacts: [{
      name: { type: String, required: true },
      phone: { type: String, required: true },
      notified: { type: Boolean, default: false },
      notifiedAt: { type: Date }
    }]
  },
  checkpoints: [{
    location: {
      lat: { type: Number, required: true },
      lon: { type: Number, required: true },
      address: { type: String, default: '' }
    },
    expectedTime: { type: Date, required: true },
    actualTime: { type: Date },
    status: { type: String, enum: ['pending', 'reached', 'missed', 'delayed'], default: 'pending' },
    delay: { type: Number, default: 0 } // minutes
  }],
  alerts: [{
    type: { type: String, enum: ['missed-checkpoint', 'route-deviation', 'long-stop', 'unusual-activity'], required: true },
    triggeredAt: { type: Date, default: Date.now },
    acknowledged: { type: Boolean, default: false }
  }],
  status: {
    type: String,
    enum: ['active', 'completed', 'emergency'],
    default: 'active'
  },
  completedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const SafetyAlert = mongoose.model('SafetyAlert', safetyAlertSchema);
const NightSafety = mongoose.model('NightSafety', nightSafetySchema);

export { SafetyAlert, NightSafety };
