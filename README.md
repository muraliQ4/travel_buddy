# FSD Travel - Complete Travel Planning App

A full-stack travel planning application with real-time place search, weather data, and integrated transport booking options.

## 🚀 Features

### ✅ Fully Functional with Real APIs
- **From/To Destination Search** - Real-time place autocomplete for Indian cities using Geoapify API
- **Live Weather Data** - Current weather conditions for both origin and destination (OpenWeatherMap API)
- **Distance Calculation** - Automatic distance calculation between locations
- **Smart Transport Suggestions** - Recommends best transport modes based on distance
- **Direct Booking Links** - One-click access to:
  - ✈️ Flights (Skyscanner)
  - 🚆 Trains (IRCTC)
  - 🚌 Buses (RedBus)
  - 🚖 Taxis (Uber, Ola)
  - 🏍️ Vehicle Rentals (Zoomcar)
  - 🎯 All-in-one platforms (MakeMyTrip, Goibibo)

### 🔐 User Features
- Email/Password Authentication
- Anonymous Sign-in for quick access
- User Profiles
- Trip Creation & Management
- Community Trip Feed

## 📋 Setup Instructions

### 1. Install Dependencies

```powershell
cd c:/murali/fsd_travel
npm install
```

### 2. Get Your FREE API Keys

#### Geoapify (Place Search/Autocomplete)
1. Go to https://www.geoapify.com/
2. Click "Sign Up" (free account)
3. After login, go to "API Keys" section
4. Copy your API key

#### OpenWeatherMap (Weather Data)
1. Go to https://openweathermap.org/api
2. Click "Sign Up" (free tier available)
3. After login, go to "API keys" tab
4. Copy your API key (may take 10 min to activate)

### 3. Configure API Keys

Edit the `.env` file in your project root:

```env
VITE_GEOAPIFY_API_KEY=your_geoapify_key_here
VITE_OPENWEATHER_API_KEY=your_openweather_key_here
```

**Example:**
```env
VITE_GEOAPIFY_API_KEY=abc123xyz789yourkeyhere
VITE_OPENWEATHER_API_KEY=def456uvw101yourkeyhere
```

### 4. Run the Development Server

```powershell
npm run dev
```

Open http://localhost:5173 in your browser.

## 🎯 How to Use

### Search for Transport

1. **Login/Sign Up** - Create an account or sign in anonymously
2. **Click Search Tab** - Bottom navigation (magnifying glass icon)
3. **Enter From Location** - Type your origin city (e.g., "Mumbai")
   - Autocomplete suggestions will appear
   - Select from the dropdown
4. **Enter To Location** - Type your destination (e.g., "Goa")
   - Select from suggestions
5. **Click "Search Transport Options"** - Get results!

### View Results

You'll see:
- **Journey Overview** - Distance, weather at both locations
- **Recommended Transport** - Based on distance:
  - < 50 km → Taxi/Local Bus
  - 50-300 km → Bus/Train
  - 300-800 km → Train/Bus/Flight
  - > 800 km → Flight/Train
- **Booking Buttons** - Direct links to booking platforms
- **Rentals** - Vehicle rental options at destination
- **All-in-One Platforms** - MakeMyTrip, Goibibo links

## 🔧 Tech Stack

- **Frontend:** React 18, Tailwind CSS, Vite
- **Backend:** Firebase (Auth + Firestore)
- **APIs:**
  - Geoapify - Place search & geocoding
  - OpenWeatherMap - Real-time weather
- **Transport Integration:**
  - Skyscanner (Flights)
  - IRCTC (Trains)
  - RedBus (Buses)
  - Uber, Ola (Taxis)
  - Zoomcar (Rentals)

## 📱 App Structure

```
src/
├── App.jsx              # Main app with all components
├── apiService.js        # API integration (Geoapify, OpenWeather)
├── mockApiData.js       # Legacy mock data (not used in production)
├── main.jsx            # React entry point
└── styles.css          # Tailwind styles
```

## 🌟 Key Features Explained

### Real-Time Place Search
- Type-ahead autocomplete
- Filters results to India only
- Shows city, state, formatted address
- Powered by Geoapify Geocoding API

### Live Weather Integration
- Current temperature & conditions
- "Feels like" temperature
- Humidity, wind speed
- Powered by OpenWeatherMap API

### Smart Distance-Based Recommendations
```javascript
< 50 km   → Taxi/Bus recommended
50-300 km → Bus/Train recommended
300-800 km → Train/Bus/Flight options
> 800 km  → Flight recommended, Train available
```

### Direct Booking Links
All transport buttons open official booking platforms:
- No middleman
- Real-time prices
- Trusted providers
- One-click redirect

## 🔒 Firebase Configuration (Optional)

If you want to enable Firebase features (user profiles, trips feed):

1. Create a Firebase project at https://console.firebase.google.com/
2. Get your Firebase config
3. Replace the placeholder in `App.jsx`:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

## 🐛 Troubleshooting

### API Keys Not Working?
- Check `.env` file has correct format (no quotes needed)
- Restart dev server after changing `.env`
- OpenWeatherMap keys take ~10 min to activate

### Place Search Not Showing Results?
- Check Geoapify API key is valid
- Open browser console (F12) to see errors
- Demo key works but has rate limits

### Weather Not Loading?
- Verify OpenWeatherMap key is activated
- Check browser console for API errors
- Free tier has 60 calls/minute limit

## 📦 Build for Production

```powershell
npm run build
npm run preview
```

## 🎨 Customization

### Change Theme Colors
Edit `tailwind.config.cjs`:
```javascript
theme: {
  extend: {
    colors: {
      primary: '#your-color',
    }
  }
}
```

### Add More Transport Options
Edit `src/apiService.js` → `getTransportBookingUrls()` function.

## 📝 License

MIT License - Feel free to use for personal or commercial projects

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

Having issues? Check:
1. All dependencies installed (`npm install`)
2. API keys configured in `.env`
3. Dev server running (`npm run dev`)
4. Browser console for errors (F12)

---

**Built with ❤️ for travelers by travelers**
