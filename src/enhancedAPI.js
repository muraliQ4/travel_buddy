// Comprehensive API Service for All Features
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ======================
// HELP CENTER & SUPPORT (Feature H)
// ======================
export const helpAPI = {
  // Get all FAQs
  getFAQs: (category = null) => 
    axios.get(`${API_BASE_URL}/help/faqs`, { 
      params: { category },
      headers: getAuthHeaders() 
    }),
  
  // Mark FAQ as helpful
  markFAQHelpful: (faqId, helpful) =>
    axios.post(`${API_BASE_URL}/help/faqs/${faqId}/feedback`, 
      { helpful },
      { headers: getAuthHeaders() }
    ),
  
  // Create support ticket
  createTicket: (ticketData) =>
    axios.post(`${API_BASE_URL}/help/tickets`, ticketData, {
      headers: getAuthHeaders()
    }),
  
  // Get user's tickets
  getMyTickets: () =>
    axios.get(`${API_BASE_URL}/help/tickets`, {
      headers: getAuthHeaders()
    }),
  
  // Add response to ticket
  addTicketResponse: (ticketId, message) =>
    axios.post(`${API_BASE_URL}/help/tickets/${ticketId}/response`,
      { message },
      { headers: getAuthHeaders() }
    )
};

// ======================
// INSURANCE (Features F & J)
// ======================
export const insuranceAPI = {
  // Get insurance options for trip
  getOptions: (tripId) =>
    axios.get(`${API_BASE_URL}/insurance/options/${tripId}`, {
      headers: getAuthHeaders()
    }),
  
  // Purchase insurance
  purchase: (insuranceData) =>
    axios.post(`${API_BASE_URL}/insurance/purchase`, insuranceData, {
      headers: getAuthHeaders()
    }),
  
  // Get user's insurances
  getMyInsurances: () =>
    axios.get(`${API_BASE_URL}/insurance/my`, {
      headers: getAuthHeaders()
    }),
  
  // File insurance claim
  fileClaim: (insuranceId, claimData) =>
    axios.post(`${API_BASE_URL}/insurance/${insuranceId}/claim`, claimData, {
      headers: getAuthHeaders()
    })
};

// ======================
// PROMO CODES (Feature O)
// ======================
export const promoAPI = {
  // Get active promo codes
  getActive: () =>
    axios.get(`${API_BASE_URL}/promos/active`, {
      headers: getAuthHeaders()
    }),
  
  // Validate promo code
  validate: (code, tripId) =>
    axios.post(`${API_BASE_URL}/promos/validate`, 
      { code, tripId },
      { headers: getAuthHeaders() }
    ),
  
  // Apply promo code
  apply: (code, tripId) =>
    axios.post(`${API_BASE_URL}/promos/apply`,
      { code, tripId },
      { headers: getAuthHeaders() }
    ),
  
  // Get promo history
  getHistory: () =>
    axios.get(`${API_BASE_URL}/promos/history`, {
      headers: getAuthHeaders()
    })
};

// ======================
// SAFETY & ALERTS (Features R & N)
// ======================
export const safetyAPI = {
  // Create safety alert
  createAlert: (alertData) =>
    axios.post(`${API_BASE_URL}/safety/alerts`, alertData, {
      headers: getAuthHeaders()
    }),
  
  // Get alerts for trip
  getTripAlerts: (tripId) =>
    axios.get(`${API_BASE_URL}/safety/alerts/trip/${tripId}`, {
      headers: getAuthHeaders()
    }),
  
  // Acknowledge alert
  acknowledgeAlert: (alertId) =>
    axios.put(`${API_BASE_URL}/safety/alerts/${alertId}/acknowledge`, {}, {
      headers: getAuthHeaders()
    }),
  
  // Create night safety monitoring
  createNightSafety: (nightSafetyData) =>
    axios.post(`${API_BASE_URL}/safety/night-safety`, nightSafetyData, {
      headers: getAuthHeaders()
    }),
  
  // Get night safety status
  getNightSafetyStatus: (tripId) =>
    axios.get(`${API_BASE_URL}/safety/night-safety/trip/${tripId}`, {
      headers: getAuthHeaders()
    })
};

// ======================
// WEATHER (Features M & W)
// ======================
export const weatherAPI = {
  // Get current weather
  getCurrent: (lat, lon, city = null) =>
    axios.get(`${API_BASE_URL}/weather/current`, {
      params: { lat, lon, city }
    }),
  
  // Get weather forecast
  getForecast: (lat, lon, city = null) =>
    axios.get(`${API_BASE_URL}/weather/forecast`, {
      params: { lat, lon, city }
    }),
  
  // Create weather alert for trip
  createAlert: (tripId) =>
    axios.post(`${API_BASE_URL}/weather/alerts`,
      { tripId },
      { headers: getAuthHeaders() }
    ),
  
  // Get weather alerts for trip
  getTripAlerts: (tripId) =>
    axios.get(`${API_BASE_URL}/weather/alerts/trip/${tripId}`, {
      headers: getAuthHeaders()
    })
};

// ======================
// PICKUP ZONES (Feature V)
// ======================
export const pickupZonesAPI = {
  // Get all verified zones
  getAll: (city = null, type = null) =>
    axios.get(`${API_BASE_URL}/pickup-zones`, {
      params: { city, type }
    }),
  
  // Find nearby zones
  findNearby: (lat, lon, radius = 5000) =>
    axios.get(`${API_BASE_URL}/pickup-zones/nearby`, {
      params: { lat, lon, radius }
    }),
  
  // Get zone by ID
  getById: (zoneId) =>
    axios.get(`${API_BASE_URL}/pickup-zones/${zoneId}`),
  
  // Create new zone
  create: (zoneData) =>
    axios.post(`${API_BASE_URL}/pickup-zones`, zoneData, {
      headers: getAuthHeaders()
    }),
  
  // Rate zone
  rate: (zoneId, rating, comment) =>
    axios.post(`${API_BASE_URL}/pickup-zones/${zoneId}/rate`,
      { rating, comment },
      { headers: getAuthHeaders() }
    ),
  
  // Mark zone as used
  markUsed: (zoneId) =>
    axios.post(`${API_BASE_URL}/pickup-zones/${zoneId}/use`, {}, {
      headers: getAuthHeaders()
    })
};

// ======================
// CHECK-IN (Feature X)
// ======================
export const checkinAPI = {
  // Generate QR code
  generateQR: (tripId) =>
    axios.post(`${API_BASE_URL}/checkin/generate-qr`,
      { tripId },
      { headers: getAuthHeaders() }
    ),
  
  // Check in to trip
  checkIn: (tripId, method, location = null, qrCode = null) =>
    axios.post(`${API_BASE_URL}/checkin/checkin`,
      { tripId, method, location, qrCode },
      { headers: getAuthHeaders() }
    ),
  
  // Verify QR code
  verifyQR: (qrCode, tripId) =>
    axios.post(`${API_BASE_URL}/checkin/verify-qr`,
      { qrCode, tripId },
      { headers: getAuthHeaders() }
    ),
  
  // Get trip check-ins
  getTripCheckIns: (tripId) =>
    axios.get(`${API_BASE_URL}/checkin/trip/${tripId}`, {
      headers: getAuthHeaders()
    }),
  
  // Get check-in history
  getHistory: () =>
    axios.get(`${API_BASE_URL}/checkin/history`, {
      headers: getAuthHeaders()
    })
};

// ======================
// TRAVEL SUMMARY (Feature Y)
// ======================
export const travelSummaryAPI = {
  // Generate summary
  generate: (year = null) =>
    axios.post(`${API_BASE_URL}/travel-summary/generate`,
      { year },
      { headers: getAuthHeaders() }
    ),
  
  // Get summary
  get: (year = null) =>
    axios.get(`${API_BASE_URL}/travel-summary`, {
      params: { year },
      headers: getAuthHeaders()
    }),
  
  // Get all years
  getYears: () =>
    axios.get(`${API_BASE_URL}/travel-summary/years`, {
      headers: getAuthHeaders()
    })
};

// ======================
// KIDS MODE (Feature K)
// ======================
export const kidsModeAPI = {
  // Get settings
  getSettings: () =>
    axios.get(`${API_BASE_URL}/kids-mode`, {
      headers: getAuthHeaders()
    }),
  
  // Toggle kids mode
  toggle: (enabled) =>
    axios.put(`${API_BASE_URL}/kids-mode/toggle`,
      { enabled },
      { headers: getAuthHeaders() }
    ),
  
  // Add family member
  addFamilyMember: (memberData) =>
    axios.post(`${API_BASE_URL}/kids-mode/family`, memberData, {
      headers: getAuthHeaders()
    }),
  
  // Add child
  addChild: (childData) =>
    axios.post(`${API_BASE_URL}/kids-mode/children`, childData, {
      headers: getAuthHeaders()
    }),
  
  // Update safety preferences
  updateSafety: (preferences) =>
    axios.put(`${API_BASE_URL}/kids-mode/safety`, preferences, {
      headers: getAuthHeaders()
    }),
  
  // Add trusted driver
  addTrustedDriver: (driverId, notes) =>
    axios.post(`${API_BASE_URL}/kids-mode/trusted-drivers`,
      { driverId, notes },
      { headers: getAuthHeaders() }
    ),
  
  // Remove trusted driver
  removeTrustedDriver: (driverId) =>
    axios.delete(`${API_BASE_URL}/kids-mode/trusted-drivers/${driverId}`, {
      headers: getAuthHeaders()
    })
};

// ======================
// AI PRICING (Feature P)
// ======================
export const pricingAPI = {
  // Get AI price suggestion
  getSuggestion: (tripDetails) =>
    axios.post(`${API_BASE_URL}/pricing/suggest`, tripDetails, {
      headers: getAuthHeaders()
    }),
  
  // Get dynamic pricing
  getDynamic: (tripId) =>
    axios.get(`${API_BASE_URL}/pricing/dynamic/${tripId}`, {
      headers: getAuthHeaders()
    }),
  
  // Compare prices for route
  compare: (from, to, date = null) =>
    axios.post(`${API_BASE_URL}/pricing/compare`,
      { from, to, date },
      { headers: getAuthHeaders() }
    ),
  
  // Get price history
  getHistory: (from, to) =>
    axios.get(`${API_BASE_URL}/pricing/history`, {
      params: { from, to },
      headers: getAuthHeaders()
    })
};

// Export all APIs
export default {
  help: helpAPI,
  insurance: insuranceAPI,
  promo: promoAPI,
  safety: safetyAPI,
  weather: weatherAPI,
  pickupZones: pickupZonesAPI,
  checkin: checkinAPI,
  travelSummary: travelSummaryAPI,
  kidsMode: kidsModeAPI,
  pricing: pricingAPI
};
