import express from 'express';
import axios from 'axios';
import WeatherAlert from '../models/Weather.js';
import Trip from '../models/Trip.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// OpenWeatherMap API (you'll need to add OPENWEATHER_API_KEY to .env)
const WEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || 'demo';
const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5';

// Get weather for a location
router.get('/current', async (req, res) => {
  try {
    const { lat, lon, city } = req.query;
    
    let weatherData;
    if (lat && lon) {
      const response = await axios.get(`${WEATHER_API_URL}/weather`, {
        params: {
          lat,
          lon,
          appid: WEATHER_API_KEY,
          units: 'metric'
        }
      });
      weatherData = response.data;
    } else if (city) {
      const response = await axios.get(`${WEATHER_API_URL}/weather`, {
        params: {
          q: city,
          appid: WEATHER_API_KEY,
          units: 'metric'
        }
      });
      weatherData = response.data;
    } else {
      return res.status(400).json({ error: 'Location parameters required' });
    }
    
    // Analyze weather and create alerts
    const alertType = analyzeWeatherCondition(weatherData);
    const severity = calculateSeverity(weatherData);
    
    res.json({
      location: {
        city: weatherData.name,
        country: weatherData.sys.country,
        lat: weatherData.coord.lat,
        lon: weatherData.coord.lon
      },
      weather: {
        main: weatherData.weather[0].main,
        description: weatherData.weather[0].description,
        icon: weatherData.weather[0].icon,
        temperature: weatherData.main.temp,
        feelsLike: weatherData.main.feels_like,
        humidity: weatherData.main.humidity,
        windSpeed: weatherData.wind.speed,
        visibility: weatherData.visibility
      },
      alert: {
        type: alertType,
        severity,
        hasAlert: severity !== 'none'
      }
    });
  } catch (error) {
    console.error('Weather API error:', error.message);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

// Get weather forecast
router.get('/forecast', async (req, res) => {
  try {
    const { lat, lon, city } = req.query;
    
    let forecastData;
    if (lat && lon) {
      const response = await axios.get(`${WEATHER_API_URL}/forecast`, {
        params: {
          lat,
          lon,
          appid: WEATHER_API_KEY,
          units: 'metric'
        }
      });
      forecastData = response.data;
    } else if (city) {
      const response = await axios.get(`${WEATHER_API_URL}/forecast`, {
        params: {
          q: city,
          appid: WEATHER_API_KEY,
          units: 'metric'
        }
      });
      forecastData = response.data;
    } else {
      return res.status(400).json({ error: 'Location parameters required' });
    }
    
    const forecast = forecastData.list.slice(0, 8).map(item => ({
      dateTime: new Date(item.dt * 1000),
      condition: item.weather[0].main,
      description: item.weather[0].description,
      temperature: item.main.temp,
      precipitation: item.rain ? item.rain['3h'] : 0,
      windSpeed: item.wind.speed
    }));
    
    res.json(forecast);
  } catch (error) {
    console.error('Weather forecast error:', error.message);
    res.status(500).json({ error: 'Failed to fetch weather forecast' });
  }
});

// Create weather alert for trip
router.post('/alerts', authMiddleware, async (req, res) => {
  try {
    const { tripId } = req.body;
    
    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    
    // Get weather for departure location
    const response = await axios.get(`${WEATHER_API_URL}/weather`, {
      params: {
        q: trip.from,
        appid: WEATHER_API_KEY,
        units: 'metric'
      }
    });
    
    const weatherData = response.data;
    const alertType = analyzeWeatherCondition(weatherData);
    const severity = calculateSeverity(weatherData);
    
    const alert = new WeatherAlert({
      trip: tripId,
      location: {
        lat: weatherData.coord.lat,
        lon: weatherData.coord.lon,
        city: weatherData.name,
        country: weatherData.sys.country
      },
      weatherCondition: {
        main: weatherData.weather[0].main,
        description: weatherData.weather[0].description,
        icon: weatherData.weather[0].icon,
        temperature: weatherData.main.temp,
        feelsLike: weatherData.main.feels_like,
        humidity: weatherData.main.humidity,
        windSpeed: weatherData.wind.speed,
        visibility: weatherData.visibility
      },
      alertType,
      severity,
      warningMessage: generateWarningMessage(alertType, severity),
      recommendations: generateRecommendations(alertType, severity),
      validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });
    
    // Calculate delay impact
    if (severity === 'severe' || severity === 'extreme') {
      alert.delayImpact.hasDelay = true;
      alert.delayImpact.estimatedDelay = severity === 'extreme' ? 60 : 30;
      alert.delayImpact.compensation.eligible = true;
      alert.delayImpact.compensation.amount = 100;
      alert.delayImpact.compensation.type = 'credits';
    }
    
    await alert.save();
    
    // Notify trip members
    const io = req.app.get('io');
    io.to(`trip_${tripId}`).emit('weather-alert', alert);
    
    res.json(alert);
  } catch (error) {
    console.error('Create weather alert error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get weather alerts for trip
router.get('/alerts/trip/:tripId', authMiddleware, async (req, res) => {
  try {
    const alerts = await WeatherAlert.find({
      trip: req.params.tripId,
      validUntil: { $gte: new Date() }
    }).sort({ createdAt: -1 });
    
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper functions
function analyzeWeatherCondition(weatherData) {
  const main = weatherData.weather[0].main.toLowerCase();
  const description = weatherData.weather[0].description.toLowerCase();
  
  if (description.includes('thunderstorm') || description.includes('storm')) {
    return 'storm';
  } else if (description.includes('heavy rain') || description.includes('extreme rain')) {
    return 'heavy-rain';
  } else if (main.includes('rain') || main.includes('drizzle')) {
    return 'rain';
  } else if (main.includes('snow')) {
    return 'snow';
  } else if (main.includes('fog') || main.includes('mist') || weatherData.visibility < 1000) {
    return 'fog';
  } else if (weatherData.main.temp > 40) {
    return 'heatwave';
  } else if (weatherData.main.temp < 5) {
    return 'cold-wave';
  }
  
  return 'none';
}

function calculateSeverity(weatherData) {
  const alertType = analyzeWeatherCondition(weatherData);
  const windSpeed = weatherData.wind.speed;
  const visibility = weatherData.visibility;
  
  if (alertType === 'storm' || (alertType === 'heavy-rain' && windSpeed > 15)) {
    return 'extreme';
  } else if (alertType === 'heavy-rain' || alertType === 'snow' || windSpeed > 20) {
    return 'severe';
  } else if (alertType === 'rain' || alertType === 'fog' || visibility < 2000) {
    return 'moderate';
  } else if (alertType !== 'none') {
    return 'low';
  }
  
  return 'none';
}

function generateWarningMessage(alertType, severity) {
  const messages = {
    'storm': 'Severe storm warning! Consider postponing your trip.',
    'heavy-rain': 'Heavy rainfall expected. Drive carefully and expect delays.',
    'rain': 'Rain expected during your journey. Plan accordingly.',
    'snow': 'Snow conditions may affect travel. Use caution.',
    'fog': 'Reduced visibility due to fog. Drive slowly.',
    'heatwave': 'Extreme heat warning. Stay hydrated.',
    'cold-wave': 'Cold weather advisory. Dress warmly.',
    'flood': 'Flood warning in the area. Avoid low-lying routes.'
  };
  
  return messages[alertType] || 'Weather conditions may affect your journey.';
}

function generateRecommendations(alertType, severity) {
  const recommendations = [];
  
  if (severity === 'extreme' || severity === 'severe') {
    recommendations.push('Consider rescheduling your trip');
    recommendations.push('Check road conditions before departure');
  }
  
  if (alertType === 'rain' || alertType === 'heavy-rain' || alertType === 'storm') {
    recommendations.push('Carry umbrellas and raincoats');
    recommendations.push('Allow extra travel time');
    recommendations.push('Keep emergency contacts handy');
  }
  
  if (alertType === 'fog') {
    recommendations.push('Use fog lights');
    recommendations.push('Maintain safe following distance');
    recommendations.push('Drive at reduced speed');
  }
  
  if (alertType === 'snow') {
    recommendations.push('Use snow chains if required');
    recommendations.push('Pack warm clothing');
    recommendations.push('Check for road closures');
  }
  
  return recommendations;
}

export default router;
