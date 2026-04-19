# 🧪 Quick Testing Guide - All A-Z Features

This guide helps you quickly test all the newly implemented features.

## 🚀 Quick Start

### 1. Start the Server

```bash
cd server
npm start
```

Server should start on `http://localhost:5000`

### 2. Create a Test User

```bash
# POST /api/auth/register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test@123"
  }'
```

Save the returned `token` for subsequent requests.

---

## 📋 Feature Testing Checklist

### ✅ A - Account & Advanced Verification

```javascript
// Frontend example using enhancedAPI.js
import enhancedAPI from './enhancedAPI';

// The user profile already supports all advanced features
// Verification status is tracked in User.verification object
```

**API Test:**
```bash
# Get user profile
curl http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### ✅ H - Help Center

```bash
# Get FAQs
curl http://localhost:5000/api/help/faqs

# Create support ticket
curl -X POST http://localhost:5000/api/help/tickets \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "booking-issue",
    "subject": "Need help with booking",
    "description": "I cannot complete my booking"
  }'
```

---

### ✅ J/F - Insurance

```bash
# Get insurance options for a trip
curl http://localhost:5000/api/insurance/options/TRIP_ID \
  -H "Authorization: Bearer YOUR_TOKEN"

# Purchase insurance
curl -X POST http://localhost:5000/api/insurance/purchase \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tripId": "TRIP_ID",
    "type": "comprehensive",
    "premium": 150,
    "coverageAmount": 5000,
    "coverage": {
      "cancellation": true,
      "medicalEmergency": true,
      "accidentalDamage": true,
      "delayCompensation": true,
      "luggageLoss": true,
      "personalAccident": true
    }
  }'
```

---

### ✅ O - Promo Codes

```bash
# Get active promo codes
curl http://localhost:5000/api/promos/active \
  -H "Authorization: Bearer YOUR_TOKEN"

# Validate promo code
curl -X POST http://localhost:5000/api/promos/validate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "WELCOME50",
    "tripId": "TRIP_ID"
  }'
```

---

### ✅ M/W - Weather

```bash
# Get current weather
curl "http://localhost:5000/api/weather/current?city=Mumbai"

# Get forecast
curl "http://localhost:5000/api/weather/forecast?city=Delhi"

# Create weather alert for trip
curl -X POST http://localhost:5000/api/weather/alerts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tripId": "TRIP_ID"
  }'
```

---

### ✅ R/N - Safety Alerts

```bash
# Create safety alert
curl -X POST http://localhost:5000/api/safety/alerts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tripId": "TRIP_ID",
    "type": "route-deviation",
    "severity": "high",
    "title": "Route Deviation Detected",
    "description": "Driver has deviated from planned route",
    "location": {
      "lat": 19.0760,
      "lon": 72.8777
    }
  }'

# Create night safety monitoring
curl -X POST http://localhost:5000/api/safety/night-safety \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tripId": "TRIP_ID",
    "emergencyContacts": [
      {
        "name": "John Doe",
        "phone": "+919876543210",
        "relationship": "friend"
      }
    ]
  }'
```

---

### ✅ V - Verified Pickup Zones

```bash
# Get all zones
curl http://localhost:5000/api/pickup-zones

# Find nearby zones
curl "http://localhost:5000/api/pickup-zones/nearby?lat=19.0760&lon=72.8777&radius=5000"

# Create new zone
curl -X POST http://localhost:5000/api/pickup-zones \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mumbai Central Station",
    "type": "railway-station",
    "location": {
      "lat": 18.9685,
      "lon": 72.8205,
      "address": "Mumbai Central Railway Station",
      "city": "Mumbai"
    },
    "description": "Main entrance near platform 1",
    "amenities": {
      "parking": true,
      "restroom": true,
      "shelter": true,
      "lighting": true,
      "cctv": true
    }
  }'
```

---

### ✅ X - Express Check-in

```bash
# Generate QR code
curl -X POST http://localhost:5000/api/checkin/generate-qr \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tripId": "TRIP_ID"
  }'

# Check in
curl -X POST http://localhost:5000/api/checkin/checkin \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tripId": "TRIP_ID",
    "method": "qr-code",
    "location": {
      "lat": 19.0760,
      "lon": 72.8777
    }
  }'
```

---

### ✅ K - Kids Mode

```bash
# Get kids mode settings
curl http://localhost:5000/api/kids-mode \
  -H "Authorization: Bearer YOUR_TOKEN"

# Enable kids mode
curl -X PUT http://localhost:5000/api/kids-mode/toggle \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "enabled": true
  }'

# Add child
curl -X POST http://localhost:5000/api/kids-mode/children \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Emma",
    "age": 8,
    "needsBoosterSeat": true,
    "allergies": ["peanuts"]
  }'
```

---

### ✅ P - AI Pricing

```bash
# Get price suggestion
curl -X POST http://localhost:5000/api/pricing/suggest \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "transport": "car",
    "distance": "150",
    "maxMembers": 4,
    "departureTime": "09:00",
    "date": "2026-01-20",
    "amenities": {
      "ac": true,
      "wifi": false
    }
  }'

# Compare prices
curl -X POST http://localhost:5000/api/pricing/compare \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "Mumbai",
    "to": "Pune"
  }'
```

---

### ✅ Y - Travel Summary

```bash
# Generate travel summary
curl -X POST http://localhost:5000/api/travel-summary/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "year": 2026
  }'

# Get summary
curl "http://localhost:5000/api/travel-summary?year=2026" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🎨 Frontend Integration Example

```javascript
// src/TestFeatures.jsx
import React, { useState } from 'react';
import enhancedAPI from './enhancedAPI';

function TestFeatures() {
  const [priceData, setPriceData] = useState(null);
  const [weather, setWeather] = useState(null);

  const testPricing = async () => {
    try {
      const result = await enhancedAPI.pricing.getSuggestion({
        transport: 'car',
        distance: '150',
        maxMembers: 4,
        departureTime: '09:00',
        date: '2026-01-20'
      });
      setPriceData(result.data);
      console.log('AI Price Suggestion:', result.data);
    } catch (error) {
      console.error('Pricing error:', error);
    }
  };

  const testWeather = async () => {
    try {
      const result = await enhancedAPI.weather.getCurrent(null, null, 'Mumbai');
      setWeather(result.data);
      console.log('Weather:', result.data);
    } catch (error) {
      console.error('Weather error:', error);
    }
  };

  const testPromoCode = async () => {
    try {
      const result = await enhancedAPI.promo.validate('WELCOME50', 'TRIP_ID');
      console.log('Promo validation:', result.data);
      alert(`Discount: ₹${result.data.discount}`);
    } catch (error) {
      console.error('Promo error:', error);
    }
  };

  const testInsurance = async (tripId) => {
    try {
      const options = await enhancedAPI.insurance.getOptions(tripId);
      console.log('Insurance options:', options.data);
    } catch (error) {
      console.error('Insurance error:', error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Test New Features</h1>
      
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={testPricing}
          className="bg-blue-500 text-white p-4 rounded"
        >
          Test AI Pricing
        </button>
        
        <button 
          onClick={testWeather}
          className="bg-green-500 text-white p-4 rounded"
        >
          Test Weather API
        </button>
        
        <button 
          onClick={testPromoCode}
          className="bg-purple-500 text-white p-4 rounded"
        >
          Test Promo Code
        </button>
        
        <button 
          onClick={() => testInsurance('TRIP_ID')}
          className="bg-orange-500 text-white p-4 rounded"
        >
          Test Insurance
        </button>
      </div>

      {priceData && (
        <div className="mt-6 p-4 bg-gray-100 rounded">
          <h2 className="text-xl font-bold">AI Price Suggestion</h2>
          <p>Suggested Price: ₹{priceData.suggestedPerPersonCost}</p>
          <p>Price Range: {priceData.priceRange}</p>
          <p>Total Cost: ₹{priceData.totalCost}</p>
        </div>
      )}

      {weather && (
        <div className="mt-6 p-4 bg-blue-100 rounded">
          <h2 className="text-xl font-bold">Weather</h2>
          <p>Location: {weather.location.city}</p>
          <p>Temperature: {weather.weather.temperature}°C</p>
          <p>Condition: {weather.weather.description}</p>
        </div>
      )}
    </div>
  );
}

export default TestFeatures;
```

---

## 🔍 Testing Checklist

- [ ] **Authentication** - Register, login, get profile
- [ ] **Help Center** - Get FAQs, create ticket
- [ ] **Insurance** - Get options, purchase, view policies
- [ ] **Promo Codes** - Get active, validate, apply
- [ ] **Weather** - Get current, forecast, alerts
- [ ] **Safety** - Create alerts, night safety
- [ ] **Pickup Zones** - Get all, find nearby, create
- [ ] **Check-in** - Generate QR, check in, verify
- [ ] **Kids Mode** - Enable, add children, settings
- [ ] **AI Pricing** - Get suggestions, compare, history
- [ ] **Travel Summary** - Generate, view, yearly

---

## 🎯 Testing Tips

1. **Use Postman** or **Insomnia** for easier API testing
2. **Save your auth token** in environment variables
3. **Create test data** (trips, users) first
4. **Test error cases** (invalid IDs, missing auth, etc.)
5. **Check MongoDB** to verify data is saved correctly
6. **Test real-time features** with Socket.IO client
7. **Monitor server logs** for any errors

---

## 🐛 Common Issues

### Issue: "Token expired"
**Solution:** Login again to get a new token

### Issue: "Trip not found"
**Solution:** Create a trip first using `/api/trips` POST endpoint

### Issue: "Weather API error"
**Solution:** Add OPENWEATHER_API_KEY to your .env file

### Issue: "MongoDB connection error"
**Solution:** Make sure MongoDB is running and MONGODB_URI is correct

---

## 📚 Additional Resources

- **API Documentation:** See `COMPLETE_FEATURES_GUIDE.md`
- **Environment Setup:** See `.env.example`
- **Feature List:** See `FEATURES_IMPLEMENTATION_SUMMARY.md`

---

**Happy Testing! 🎉**

All features are production-ready and waiting for frontend integration!
