import mongoose from 'mongoose';

// Offline Access & Trip Cache (Feature O)
const offlineDataSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Cached Trips
  cachedTrips: [{
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
    tripData: { type: mongoose.Schema.Types.Mixed, required: true },
    cachedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
    offline: { type: Boolean, default: true }
  }],
  
  // Offline Maps
  offlineMaps: [{
    region: { type: String, required: true },
    bounds: {
      north: { type: Number, required: true },
      south: { type: Number, required: true },
      east: { type: Number, required: true },
      west: { type: Number, required: true }
    },
    downloadedAt: { type: Date, default: Date.now },
    size: { type: Number, default: 0 }, // MB
    expiresAt: { type: Date, required: true }
  }],
  
  // Saved Routes
  savedRoutes: [{
    from: { type: String, required: true },
    to: { type: String, required: true },
    routeData: { type: mongoose.Schema.Types.Mixed },
    distance: { type: Number, default: 0 },
    duration: { type: Number, default: 0 },
    savedAt: { type: Date, default: Date.now }
  }],
  
  // Saved Contacts
  savedContacts: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userData: { type: mongoose.Schema.Types.Mixed },
    savedAt: { type: Date, default: Date.now }
  }],
  
  // Emergency Info (always available offline)
  emergencyInfo: {
    contacts: [{
      name: { type: String, required: true },
      phone: { type: String, required: true },
      relationship: { type: String, default: '' }
    }],
    medicalInfo: { type: String, default: '' },
    bloodType: { type: String, default: '' },
    allergies: [{ type: String }],
    medications: [{ type: String }]
  },
  
  // Sync Status
  syncStatus: {
    lastSyncAt: { type: Date, default: Date.now },
    pendingUploads: { type: Number, default: 0 },
    failedSyncs: { type: Number, default: 0 },
    nextSyncAt: { type: Date }
  },
  
  // Storage Usage
  storageUsage: {
    total: { type: Number, default: 0 }, // MB
    trips: { type: Number, default: 0 },
    maps: { type: Number, default: 0 },
    media: { type: Number, default: 0 },
    limit: { type: Number, default: 500 } // MB
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

export default mongoose.model('OfflineData', offlineDataSchema);
