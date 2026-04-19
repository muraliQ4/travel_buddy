// API Service for external integrations
// This file handles all API calls to external services

const GEOAPIFY_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY || 'demo'; // Demo key for testing
const OPENWEATHER_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || 'demo';

// Geoapify API - Place Autocomplete
export const searchPlaces = async (query) => {
  if (!query || query.length < 2) return [];
  
  try {
    const response = await fetch(
      `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&filter=countrycode:in&limit=10&apiKey=${GEOAPIFY_KEY}`
    );
    
    if (!response.ok) throw new Error('Place search failed');
    
    const data = await response.json();
    
    // Transform Geoapify response to our format
    return data.features.map(feature => ({
      id: feature.properties.place_id || `${feature.properties.lat}-${feature.properties.lon}`,
      name: feature.properties.city || feature.properties.name || feature.properties.formatted,
      formatted: feature.properties.formatted,
      lat: feature.properties.lat,
      lon: feature.properties.lon,
      type: feature.properties.result_type || 'place',
      country: feature.properties.country,
      state: feature.properties.state,
      city: feature.properties.city
    }));
  } catch (error) {
    console.error('Error searching places:', error);
    return [];
  }
};

// OpenWeatherMap API - Current Weather
export const getWeather = async (lat, lon) => {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_KEY}`
    );
    
    if (!response.ok) {
      // Return null if API key is not activated (401) or other errors
      console.warn(`Weather API unavailable (${response.status}). This is normal if your API key was just created - it takes 10-15 minutes to activate.`);
      return null;
    }
    
    const data = await response.json();
    
    return {
      temp: Math.round(data.main.temp),
      feels_like: Math.round(data.main.feels_like),
      description: data.weather[0].description,
      humidity: data.main.humidity,
      wind_speed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
      icon: data.weather[0].icon,
      main: data.weather[0].main
    };
  } catch (error) {
    console.warn('Weather data temporarily unavailable');
    return null;
  }
};

// Transport booking URLs generator
export const getTransportBookingUrls = (from, to) => {
  const fromCity = from?.city || from?.name || '';
  const toCity = to?.city || to?.name || '';
  
  return {
    // Skyscanner for flights
    flights: `https://www.skyscanner.co.in/transport/flights/${fromCity.toLowerCase()}/${toCity.toLowerCase()}/`,
    
    // RedBus for buses
    buses: `https://www.redbus.in/bus-tickets/${fromCity.toLowerCase().replace(/\s+/g, '-')}-to-${toCity.toLowerCase().replace(/\s+/g, '-')}`,
    
    // IRCTC for trains (search page)
    trains: `https://www.irctc.co.in/nget/train-search`,
    
    // General rental search
    rentals: `https://www.google.com/search?q=bike+car+rental+${toCity}`,
    
    // Zoomcar for self-drive cars
    zoomcar: `https://www.zoomcar.com/${toCity.toLowerCase().replace(/\s+/g, '-')}`,
    
    // MakeMyTrip all-in-one
    makemytrip: `https://www.makemytrip.com/`,
    
    // Goibibo
    goibibo: `https://www.goibibo.com/`
  };
};

// Calculate actual road distance using Geoapify Routing API
export const calculateRoadDistance = async (lat1, lon1, lat2, lon2) => {
  try {
    const response = await fetch(
      `https://api.geoapify.com/v1/routing?waypoints=${lat1},${lon1}|${lat2},${lon2}&mode=drive&apiKey=${GEOAPIFY_KEY}`
    );
    
    if (!response.ok) {
      console.warn('Routing API failed, falling back to straight-line distance');
      return calculateStraightLineDistance(lat1, lon1, lat2, lon2);
    }
    
    const data = await response.json();
    
    if (data.features && data.features.length > 0 && data.features[0].properties) {
      // Return distance in kilometers (Geoapify returns meters)
      return data.features[0].properties.distance / 1000;
    }
    
    // Fallback to straight-line distance
    return calculateStraightLineDistance(lat1, lon1, lat2, lon2);
  } catch (error) {
    console.error('Error calculating road distance:', error);
    // Fallback to straight-line distance
    return calculateStraightLineDistance(lat1, lon1, lat2, lon2);
  }
};

// Calculate straight-line distance (Haversine formula) as fallback
export const calculateStraightLineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return distance;
};

// Main distance calculation function - uses road distance
export const calculateDistance = async (lat1, lon1, lat2, lon2) => {
  return await calculateRoadDistance(lat1, lon1, lat2, lon2);
};

// Get suggested transport modes based on distance
export const getSuggestedTransportModes = (distanceKm) => {
  const modes = [];
  
  if (distanceKm < 50) {
    modes.push({ type: 'taxi', icon: '🚖', label: 'Taxi/Cab', recommended: true });
    modes.push({ type: 'bus', icon: '🚌', label: 'Local Bus', recommended: false });
  } else if (distanceKm < 300) {
    modes.push({ type: 'bus', icon: '🚌', label: 'Bus', recommended: true });
    modes.push({ type: 'train', icon: '🚆', label: 'Train', recommended: false });
    modes.push({ type: 'taxi', icon: '🚖', label: 'Cab', recommended: false });
  } else if (distanceKm < 800) {
    modes.push({ type: 'train', icon: '🚆', label: 'Train', recommended: true });
    modes.push({ type: 'bus', icon: '🚌', label: 'Bus', recommended: true });
    modes.push({ type: 'flight', icon: '✈️', label: 'Flight', recommended: false });
  } else {
    modes.push({ type: 'flight', icon: '✈️', label: 'Flight', recommended: true });
    modes.push({ type: 'train', icon: '🚆', label: 'Train', recommended: true });
  }
  
  return modes;
};
