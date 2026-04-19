# 🚀 Developer Quick Reference - TravelBuddy A-Z Features

## 📦 Models Quick Reference

| Model | Purpose | Key Fields |
|-------|---------|------------|
| `User` | User profiles, verification, wallet | `behaviorScore`, `userType`, `wallet`, `rewards` |
| `Trip` | Trip details, pricing, safety | `pricing`, `safetyFeatures`, `preferences`, `womenOnly` |
| `HelpCenter` | FAQs | `question`, `answer`, `category` |
| `SupportTicket` | Support system | `subject`, `description`, `status` |
| `Insurance` | Trip insurance | `type`, `coverage`, `premium` |
| `PromoCode` | Discounts | `code`, `type`, `value`, `validUntil` |
| `SafetyAlert` | Route alerts | `type`, `severity`, `deviationDetails` |
| `NightSafety` | Night monitoring | `checkpoints`, `emergencyContacts` |
| `WeatherAlert` | Weather warnings | `alertType`, `severity`, `delayImpact` |
| `PickupZone` | Safe zones | `location`, `amenities`, `safetyRating` |
| `CheckIn` | QR check-in | `qrCode`, `status`, `method` |
| `TravelSummary` | Annual stats | `trips`, `distance`, `financial`, `environmental` |
| `KidsMode` | Family settings | `children`, `safetyPreferences`, `trustedDrivers` |
| `OfflineData` | Offline cache | `cachedTrips`, `offlineMaps` |

## 🛣️ Routes Quick Reference

### Authentication & Profile
```javascript
POST   /api/auth/register          // Register new user
POST   /api/auth/login             // Login
GET    /api/auth/profile           // Get profile
PUT    /api/auth/profile           // Update profile
```

### Trips & Booking
```javascript
GET    /api/trips                  // Get all trips
POST   /api/trips                  // Create trip
GET    /api/trips/:id              // Get trip details
PUT    /api/trips/:id              // Update trip
DELETE /api/trips/:id              // Delete trip
POST   /api/requests               // Book trip
```

### Help & Support
```javascript
GET    /api/help/faqs              // Get FAQs
POST   /api/help/faqs/:id/feedback // Mark helpful
POST   /api/help/tickets           // Create ticket
GET    /api/help/tickets           // Get my tickets
POST   /api/help/tickets/:id/response  // Add response
```

### Insurance
```javascript
GET    /api/insurance/options/:tripId  // Get options
POST   /api/insurance/purchase         // Purchase
GET    /api/insurance/my              // My insurances
POST   /api/insurance/:id/claim       // File claim
```

### Promo Codes
```javascript
GET    /api/promos/active          // Get active
POST   /api/promos/validate        // Validate code
POST   /api/promos/apply           // Apply code
GET    /api/promos/history         // My history
```

### Safety & Alerts
```javascript
POST   /api/safety/alerts          // Create alert
GET    /api/safety/alerts/trip/:id // Get alerts
PUT    /api/safety/alerts/:id/acknowledge  // Acknowledge
POST   /api/safety/night-safety    // Night mode
GET    /api/safety/night-safety/trip/:id  // Get status
```

### Weather
```javascript
GET    /api/weather/current        // Current weather
GET    /api/weather/forecast       // Forecast
POST   /api/weather/alerts         // Create alert
GET    /api/weather/alerts/trip/:id // Get alerts
```

### Pickup Zones
```javascript
GET    /api/pickup-zones           // Get all
GET    /api/pickup-zones/nearby   // Find nearby
POST   /api/pickup-zones           // Create zone
POST   /api/pickup-zones/:id/rate // Rate zone
```

### Check-in
```javascript
POST   /api/checkin/generate-qr   // Generate QR
POST   /api/checkin/checkin       // Check in
POST   /api/checkin/verify-qr     // Verify QR
GET    /api/checkin/trip/:id      // Trip check-ins
```

### Kids Mode
```javascript
GET    /api/kids-mode              // Get settings
PUT    /api/kids-mode/toggle       // Enable/disable
POST   /api/kids-mode/children     // Add child
PUT    /api/kids-mode/safety       // Update safety
POST   /api/kids-mode/trusted-drivers  // Add trusted
```

### AI Pricing
```javascript
POST   /api/pricing/suggest        // Get suggestion
GET    /api/pricing/dynamic/:id    // Dynamic pricing
POST   /api/pricing/compare        // Compare prices
GET    /api/pricing/history        // Price history
```

### Travel Summary
```javascript
POST   /api/travel-summary/generate  // Generate
GET    /api/travel-summary           // Get summary
GET    /api/travel-summary/years     // Get years
```

## 💻 Code Snippets

### Create Trip with AI Pricing
```javascript
// 1. Get AI price suggestion
const priceData = await enhancedAPI.pricing.getSuggestion({
  transport: 'car',
  distance: '150',
  maxMembers: 4,
  departureTime: '09:00',
  date: '2026-01-20',
  amenities: { ac: true }
});

// 2. Create trip with suggested price
const trip = await tripsAPI.createTrip({
  title: 'Mumbai to Pune',
  from: 'Mumbai',
  to: 'Pune',
  distance: '150',
  transport: 'car',
  maxMembers: 4,
  date: '2026-01-20',
  departureTime: '09:00',
  pricing: {
    perPersonCost: priceData.suggestedPerPersonCost
  }
});
```

### Apply Promo Code
```javascript
// 1. Validate promo
const validation = await enhancedAPI.promo.validate('WELCOME50', tripId);
console.log(`Discount: ₹${validation.data.discount}`);

// 2. Apply promo
const result = await enhancedAPI.promo.apply('WELCOME50', tripId);
console.log(`Final price: ₹${result.data.finalPrice}`);
```

### Purchase Insurance
```javascript
// 1. Get options
const options = await enhancedAPI.insurance.getOptions(tripId);

// 2. Purchase
const insurance = await enhancedAPI.insurance.purchase({
  tripId,
  type: 'comprehensive',
  premium: options.data[2].premium,
  coverageAmount: options.data[2].coverageAmount,
  coverage: options.data[2].coverage
});
```

### Enable Kids Mode
```javascript
// 1. Enable kids mode
await enhancedAPI.kidsMode.toggle(true);

// 2. Add child
await enhancedAPI.kidsMode.addChild({
  name: 'Emma',
  age: 8,
  needsBoosterSeat: true,
  allergies: ['peanuts']
});

// 3. Update safety preferences
await enhancedAPI.kidsMode.updateSafety({
  verifiedDriversOnly: true,
  minimumRating: 4.5,
  noSmokingRequired: true
});
```

### Check Weather
```javascript
// Get weather for trip location
const weather = await enhancedAPI.weather.getCurrent(null, null, 'Mumbai');

if (weather.data.alert.hasAlert) {
  console.log(`Warning: ${weather.data.alert.type}`);
  // Create weather alert for trip
  await enhancedAPI.weather.createAlert(tripId);
}
```

### QR Check-in
```javascript
// Driver generates QR
const qr = await enhancedAPI.checkin.generateQR(tripId);
// Display qr.data.qrCode as QR code

// Passenger scans and checks in
await enhancedAPI.checkin.checkIn(
  tripId,
  'qr-code',
  { lat: 19.0760, lon: 72.8777 },
  scannedQRCode
);
```

## 🎨 UI Component Suggestions

### Price Suggestion Display
```jsx
<div className="price-suggestion">
  <h3>AI Suggested Price</h3>
  <div className="price-main">₹{price.suggestedPerPersonCost}</div>
  <div className="price-range">Range: {price.priceRange}</div>
  <div className="breakdown">
    <div>Base Fare: ₹{price.breakdown.baseFare}</div>
    <div>Fuel: ₹{price.breakdown.fuelCost}</div>
    <div>Toll: ₹{price.breakdown.tollCost}</div>
  </div>
</div>
```

### Weather Alert Card
```jsx
{weather.alert.hasAlert && (
  <div className={`alert alert-${weather.alert.severity}`}>
    <div className="icon">⚠️</div>
    <div className="content">
      <h4>{weather.alert.type.toUpperCase()}</h4>
      <p>{weatherAlert.warningMessage}</p>
      <ul>
        {weatherAlert.recommendations.map(rec => (
          <li key={rec}>{rec}</li>
        ))}
      </ul>
    </div>
  </div>
)}
```

### Kids Mode Badge
```jsx
{trip.kidsModeFriendly && (
  <span className="badge kids-mode">
    👨‍👩‍👧‍👦 Kids Friendly
  </span>
)}
```

### Insurance Option Card
```jsx
<div className="insurance-option">
  <h3>{option.name}</h3>
  <p>{option.description}</p>
  <div className="price">₹{option.premium}</div>
  <div className="coverage">
    Coverage: ₹{option.coverageAmount}
  </div>
  <ul className="features">
    {Object.entries(option.coverage).map(([key, value]) => 
      value && <li key={key}>✓ {key}</li>
    )}
  </ul>
  <button onClick={() => purchaseInsurance(option)}>
    Purchase
  </button>
</div>
```

## 🔐 Authentication Example

```javascript
// Store token after login
const loginResponse = await authAPI.login(email, password);
localStorage.setItem('token', loginResponse.data.token);

// Use token in API calls (automatically handled by enhancedAPI.js)
const profile = await authAPI.getProfile();
```

## 📱 Socket.IO Events

```javascript
// Connect to socket
import socketService from './socketService';

// Join trip room
socketService.emit('join-trip', tripId);

// Listen for events
socketService.on('weather-alert', (alert) => {
  console.log('Weather alert:', alert);
  showNotification('Weather Warning', alert.warningMessage);
});

socketService.on('safety-alert', (alert) => {
  console.log('Safety alert:', alert);
  showNotification('Safety Alert', alert.title);
});

socketService.on('user-checked-in', (data) => {
  console.log('User checked in:', data);
  updateTripStatus();
});
```

## 🎯 Feature Flags

```javascript
// In your .env
FEATURE_INSURANCE_ENABLED=true
FEATURE_KIDS_MODE_ENABLED=true
FEATURE_WEATHER_ALERTS_ENABLED=true
FEATURE_AI_PRICING_ENABLED=true

// In your code
const FEATURES = {
  insurance: process.env.FEATURE_INSURANCE_ENABLED === 'true',
  kidsMode: process.env.FEATURE_KIDS_MODE_ENABLED === 'true',
  weather: process.env.FEATURE_WEATHER_ALERTS_ENABLED === 'true',
  aiPricing: process.env.FEATURE_AI_PRICING_ENABLED === 'true'
};

// Use in UI
{FEATURES.insurance && <InsuranceSection />}
{FEATURES.kidsMode && <KidsModeToggle />}
```

## 📊 Common Queries

### Get user's completed trips
```javascript
const completedTrips = await Trip.find({
  $or: [
    { creator: userId },
    { 'members.user': userId }
  ],
  status: 'completed'
});
```

### Calculate user behavior score
```javascript
// This is automatically calculated, but you can access it:
const user = await User.findById(userId);
const score = user.behaviorScore.score;
```

### Find trips with kids mode
```javascript
const kidsFriendlyTrips = await Trip.find({
  'preferences.smoking': 'not-allowed',
  'preferences.music': { $in: ['not-allowed', 'flexible'] }
});
```

## 🚨 Error Handling

```javascript
try {
  const result = await enhancedAPI.insurance.purchase(data);
  showSuccess('Insurance purchased successfully');
} catch (error) {
  if (error.response?.status === 401) {
    // Unauthorized - redirect to login
    redirectToLogin();
  } else if (error.response?.status === 404) {
    showError('Trip not found');
  } else {
    showError(error.response?.data?.error || 'Something went wrong');
  }
}
```

## 🎉 That's It!

All features are ready to use. Start building amazing UI components!

**Need more help?** Check:
- `COMPLETE_FEATURES_GUIDE.md` - Full API documentation
- `TESTING_GUIDE.md` - Testing examples
- `FEATURES_IMPLEMENTATION_SUMMARY.md` - Overview

---

**Happy Coding! 🚀**
