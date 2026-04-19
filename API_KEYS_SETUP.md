# Quick Start - Get Your FREE API Keys

## Step 1: Geoapify (Place Search)

1. Visit: https://www.geoapify.com/
2. Click **"Sign Up"** (top right)
3. Create free account with your email
4. After login, click **"My Projects"** → **"API Keys"**
5. Copy the API key (starts with letters/numbers)

**Paste it in `.env` file:**
```
VITE_GEOAPIFY_API_KEY=paste_your_key_here
```

## Step 2: OpenWeatherMap (Weather)

1. Visit: https://openweathermap.org/api
2. Click **"Sign Up"** 
3. Choose **FREE tier** (no credit card needed)
4. Verify your email
5. Go to **"API keys"** tab in your profile
6. Copy the default API key
7. **Wait 10 minutes** for activation (important!)

**Paste it in `.env` file:**
```
VITE_OPENWEATHER_API_KEY=paste_your_key_here
```

## Step 3: Your Final `.env` File Should Look Like:

```env
VITE_GEOAPIFY_API_KEY=abc123xyz789example
VITE_OPENWEATHER_API_KEY=def456uvw101example
```

**⚠️ Important:**
- No quotes around the keys
- No spaces
- Make sure file is named exactly `.env` (with the dot at start)

## Step 4: Restart Your Dev Server

```powershell
# Press Ctrl+C to stop the server (if running)
# Then restart:
npm run dev
```

## ✅ Test It Works

1. Open http://localhost:5173
2. Login or sign up
3. Click **Search** tab (bottom nav)
4. Type "Mumbai" in the FROM field
   - You should see autocomplete suggestions pop up!
5. Type "Goa" in the TO field
   - More suggestions should appear!
6. Click "Search Transport Options"
   - You'll see weather data and distance!

## 🎉 You're All Set!

Your app now has:
- ✅ Real-time place search (Geoapify)
- ✅ Live weather data (OpenWeatherMap)
- ✅ Smart transport recommendations
- ✅ Direct booking links

## 🆓 Free Tier Limits

**Geoapify Free:**
- 3,000 requests per day
- More than enough for testing!

**OpenWeatherMap Free:**
- 60 calls per minute
- 1,000,000 calls per month
- Perfect for your app!

## ❓ Troubleshooting

**Problem:** Place search not working
- **Solution:** Check Geoapify key is copied correctly, no extra spaces

**Problem:** Weather showing "unavailable"
- **Solution:** Wait 10 minutes after creating OpenWeatherMap account (activation delay)

**Problem:** Changes not appearing
- **Solution:** Restart dev server (Ctrl+C, then `npm run dev`)

---

Need help? Check the main README.md file for detailed docs!
