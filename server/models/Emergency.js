import mongoose from 'mongoose';

const emergencySchema = new mongoose.Schema({
  trip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: false  // Made optional for quick SOS without trip
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['sos', 'panic', 'medical', 'accident', 'harassment', 'vehicle_breakdown', 'other'],
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'high'
  },
  location: {
    lat: { type: Number, required: true },
    lon: { type: Number, required: true },
    address: { type: String, default: '' },
    lastUpdated: { type: Date, default: Date.now }
  },
  description: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['active', 'acknowledged', 'resolved', 'false_alarm'],
    default: 'active'
  },
  notifiedContacts: [{
    name: { type: String },
    phone: { type: String },
    notifiedAt: { type: Date, default: Date.now },
    acknowledged: { type: Boolean, default: false }
  }],
  audio: {
    recorded: { type: Boolean, default: false },
    url: { type: String, default: '' },
    duration: { type: Number, default: 0 }
  },
  video: {
    recorded: { type: Boolean, default: false },
    url: { type: String, default: '' },
    duration: { type: Number, default: 0 },
    thumbnail: { type: String, default: '' }
  },
  photos: [{
    url: { type: String },
    uploadedAt: { type: Date, default: Date.now }
  }],
  liveTracking: {
    active: { type: Boolean, default: false },
    startedAt: { type: Date },
    endedAt: { type: Date },
    locationUpdates: [{
      lat: Number,
      lon: Number,
      timestamp: { type: Date, default: Date.now },
      accuracy: Number,
      speed: Number
    }]
  },
  geofence: {
    enabled: { type: Boolean, default: false },
    radius: { type: Number, default: 500 }, // meters
    breached: { type: Boolean, default: false },
    breachedAt: { type: Date }
  },
  panicButton: {
    activated: { type: Boolean, default: false },
    countdown: { type: Number, default: 10 }, // seconds before trigger
    cancelled: { type: Boolean, default: false },
    activatedAt: { type: Date }
  },
  safeWord: {
    word: { type: String, default: '' },
    used: { type: Boolean, default: false },
    usedAt: { type: Date }
  },
  fakeCall: {
    scheduled: { type: Boolean, default: false },
    scheduledFor: { type: Date },
    executed: { type: Boolean, default: false },
    callerName: { type: String, default: 'Mom' },
    reason: { type: String, default: 'emergency' }
  },
  checkIn: {
    required: { type: Boolean, default: false },
    interval: { type: Number, default: 30 }, // minutes
    lastCheckIn: { type: Date },
    missedCheckIns: { type: Number, default: 0 },
    autoTriggerAfter: { type: Number, default: 2 } // missed check-ins before auto-trigger
  },
  nearbyFacilities: {
    hospitals: [{
      name: String,
      address: String,
      distance: Number,
      phone: String,
      emergencyServices: Boolean
    }],
    policeStations: [{
      name: String,
      address: String,
      distance: Number,
      phone: String
    }],
    safeSpaces: [{
      name: String,
      address: String,
      distance: Number,
      type: String // hotel, restaurant, gas_station
    }]
  },
  medicalInfo: {
    bloodType: { type: String, default: '' },
    allergies: [{ type: String }],
    medications: [{ type: String }],
    conditions: [{ type: String }],
    emergencyMedicalContact: {
      name: String,
      relationship: String,
      phone: String
    }
  },
  policeNotified: {
    type: Boolean,
    default: false
  },
  policeDetails: {
    stationName: { type: String, default: '' },
    officerName: { type: String, default: '' },
    caseNumber: { type: String, default: '' },
    notifiedAt: { type: Date },
    responseTime: { type: Number } // minutes
  },
  ambulanceNotified: {
    type: Boolean,
    default: false
  },
  ambulanceDetails: {
    hospitalName: { type: String, default: '' },
    ambulanceNumber: { type: String, default: '' },
    eta: { type: Number }, // minutes
    notifiedAt: { type: Date },
    arrivedAt: { type: Date }
  },
  incidentTimeline: [{
    timestamp: { type: Date, default: Date.now },
    event: { type: String },
    actor: { type: String }, // system, user, contact, police, ambulance
    details: { type: String }
  }],
  responseTeam: {
    assigned: { type: Boolean, default: false },
    teamId: { type: String, default: '' },
    members: [{
      name: String,
      role: String,
      phone: String
    }],
    assignedAt: { type: Date }
  },
  resolvedAt: {
    type: Date
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolution: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
emergencySchema.index({ trip: 1, status: 1 });
emergencySchema.index({ user: 1, createdAt: -1 });
emergencySchema.index({ status: 1, severity: -1 });

export default mongoose.model('Emergency', emergencySchema);
