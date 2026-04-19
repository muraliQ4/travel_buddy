import mongoose from 'mongoose';

// Weather Alerts & Weather-based Delay Handling (Features M & W)
const weatherAlertSchema = new mongoose.Schema({
  trip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: true
  },
  location: {
    lat: { type: Number, required: true },
    lon: { type: Number, required: true },
    city: { type: String, required: true },
    state: { type: String, default: '' },
    country: { type: String, default: '' }
  },
  weatherCondition: {
    main: { type: String, required: true }, // Clear, Clouds, Rain, Snow, etc.
    description: { type: String, required: true },
    icon: { type: String, default: '' },
    temperature: { type: Number, required: true },
    feelsLike: { type: Number, default: 0 },
    humidity: { type: Number, default: 0 },
    windSpeed: { type: Number, default: 0 },
    visibility: { type: Number, default: 10000 } // meters
  },
  alertType: {
    type: String,
    enum: ['none', 'rain', 'heavy-rain', 'snow', 'storm', 'fog', 'heatwave', 'cold-wave', 'flood'],
    default: 'none'
  },
  severity: {
    type: String,
    enum: ['none', 'low', 'moderate', 'severe', 'extreme'],
    default: 'none'
  },
  warningMessage: {
    type: String,
    default: ''
  },
  recommendations: [{
    type: String
  }],
  delayImpact: {
    hasDelay: { type: Boolean, default: false },
    estimatedDelay: { type: Number, default: 0 }, // minutes
    compensation: {
      eligible: { type: Boolean, default: false },
      amount: { type: Number, default: 0 },
      type: { type: String, enum: ['', 'credits', 'refund', 'discount'], default: '' }
    }
  },
  forecast: [{
    dateTime: { type: Date, required: true },
    condition: { type: String, required: true },
    temperature: { type: Number, required: true },
    precipitation: { type: Number, default: 0 } // mm
  }],
  notified: {
    type: Boolean,
    default: false
  },
  notifiedAt: {
    type: Date
  },
  validUntil: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('WeatherAlert', weatherAlertSchema);
