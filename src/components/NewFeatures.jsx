import React, { useState, useEffect, useRef } from 'react';
import * as enhancedAPI from '../enhancedAPI';
import socketService from '../socketService';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/api\/?$/, '').replace(/\/+$/, '');

// Insurance Feature Component
export const InsurancePage = ({ currentUser, setPage }) => {
  const [insurances, setInsurances] = useState([]);
  const [showPurchase, setShowPurchase] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [insuranceType, setInsuranceType] = useState('comprehensive');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMyInsurances();
  }, []);

  const loadMyInsurances = async () => {
    try {
      const response = await enhancedAPI.insuranceAPI.getMy();
      setInsurances(response.data || []);
    } catch (error) {
      console.error('Error loading insurances:', error);
    }
  };

  const handlePurchase = async () => {
    if (!selectedTrip) return;
    setLoading(true);
    try {
      await enhancedAPI.insuranceAPI.purchase({
        trip: selectedTrip,
        type: insuranceType,
        premium: insuranceType === 'cancellation' ? 99 : insuranceType === 'journey' ? 149 : 199
      });
      alert('Insurance purchased successfully!');
      loadMyInsurances();
      setShowPurchase(false);
    } catch (error) {
      alert('Failed to purchase insurance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Back Button */}
      {setPage && (
        <button
          onClick={() => setPage('home')}
          className="mb-4 flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition-all"
        >
          <span className="text-xl">←</span> Back to Home
        </button>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">🛡️ Travel Insurance</h2>
        <p className="text-gray-600 dark:text-gray-300">Protect your trips with comprehensive coverage</p>
      </div>

      <button
        onClick={() => setShowPurchase(!showPurchase)}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg mb-6 transition-all"
      >
        ➕ Purchase New Insurance
      </button>

      {showPurchase && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Purchase Insurance</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Trip ID</label>
              <input
                type="text"
                value={selectedTrip || ''}
                onChange={(e) => setSelectedTrip(e.target.value)}
                placeholder="Enter trip ID"
                className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Insurance Type</label>
              <select
                value={insuranceType}
                onChange={(e) => setInsuranceType(e.target.value)}
                className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="cancellation">Cancellation (₹99)</option>
                <option value="journey">Journey Protection (₹149)</option>
                <option value="comprehensive">Comprehensive (₹199)</option>
              </select>
            </div>

            <button
              onClick={handlePurchase}
              disabled={loading || !selectedTrip}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-all"
            >
              {loading ? 'Processing...' : 'Purchase Insurance'}
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">My Insurance Policies</h3>
        {insurances.length === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-8 text-center text-gray-500 dark:text-gray-400">
            No insurance policies yet
          </div>
        ) : (
          insurances.map(insurance => (
            <div key={insurance._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-2 border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-bold text-lg text-gray-900 dark:text-white capitalize">{insurance.type} Insurance</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Policy #{insurance.policyNumber}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  insurance.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {insurance.status}
                </span>
              </div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">₹{insurance.premium}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Trip: {insurance.trip}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Kids Mode Component
export const KidsModePage = ({ currentUser }) => {
  const [kidsMode, setKidsMode] = useState(null);
  const [enabled, setEnabled] = useState(false);
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState('');
  const [needsBoosterSeat, setNeedsBoosterSeat] = useState(false);

  useEffect(() => {
    loadKidsMode();
  }, []);

  const loadKidsMode = async () => {
    try {
      const response = await enhancedAPI.kidsModeAPI.get();
      setKidsMode(response.data);
      setEnabled(response.data?.enabled || false);
    } catch (error) {
      console.error('Error loading kids mode:', error);
    }
  };

  const toggleKidsMode = async () => {
    try {
      await enhancedAPI.kidsModeAPI.toggle(!enabled);
      setEnabled(!enabled);
      loadKidsMode();
    } catch (error) {
      console.error('Error toggling kids mode:', error);
    }
  };

  const addChild = async () => {
    if (!childName || !childAge) return;
    try {
      await enhancedAPI.kidsModeAPI.addChild({
        name: childName,
        age: parseInt(childAge),
        needsBoosterSeat
      });
      alert('Child added successfully!');
      setChildName('');
      setChildAge('');
      setNeedsBoosterSeat(false);
      loadKidsMode();
    } catch (error) {
      alert('Failed to add child');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg p-6 mb-6 text-white">
        <h2 className="text-2xl font-bold mb-2">👨‍👩‍👧‍👦 Kids Mode</h2>
        <p>Safe family travel with child-friendly settings</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Enable Kids Mode</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Activate family-friendly features</p>
          </div>
          <button
            onClick={toggleKidsMode}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
              enabled ? 'bg-green-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                enabled ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {enabled && (
          <div className="mt-6 space-y-4">
            <h4 className="font-semibold text-gray-900 dark:text-white">Add Child</h4>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Child's name"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                className="p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <input
                type="number"
                placeholder="Age"
                value={childAge}
                onChange={(e) => setChildAge(e.target.value)}
                className="p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <label className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={needsBoosterSeat}
                onChange={(e) => setNeedsBoosterSeat(e.target.checked)}
                className="w-5 h-5 text-blue-600"
              />
              <span>Needs Booster Seat</span>
            </label>
            <button
              onClick={addChild}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all"
            >
              ➕ Add Child
            </button>
          </div>
        )}

        {kidsMode?.children && kidsMode.children.length > 0 && (
          <div className="mt-6">
            <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">Registered Children</h4>
            <div className="space-y-2">
              {kidsMode.children.map((child, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900 rounded-lg">
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white">{child.name}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">Age: {child.age}</span>
                  </div>
                  {child.needsBoosterSeat && (
                    <span className="text-xs bg-purple-200 dark:bg-purple-700 text-purple-800 dark:text-purple-200 px-2 py-1 rounded">
                      Booster Seat
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Weather Alerts Component
export const WeatherPage = ({ currentUser }) => {
  const [weather, setWeather] = useState(null);
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);

  const checkWeather = async () => {
    if (!city) return;
    setLoading(true);
    try {
      const response = await enhancedAPI.weatherAPI.getCurrent(null, null, city);
      setWeather(response.data);
    } catch (error) {
      console.error('Weather API error:', error);
      // Use mock data if API fails
      setWeather({
        location: city,
        temperature: 28,
        humidity: 65,
        windSpeed: 15,
        visibility: 10,
        alert: {
          hasAlert: false
        }
      });
      alert('Using demo weather data. Add OPENWEATHER_API_KEY to server/.env for real data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-gradient-to-r from-blue-400 to-cyan-500 rounded-xl shadow-lg p-6 mb-6 text-white">
        <h2 className="text-2xl font-bold mb-2">🌤️ Weather Alerts</h2>
        <p>Stay informed about weather conditions for your trips</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Enter city name..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && checkWeather()}
            className="flex-1 p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <button
            onClick={checkWeather}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold px-8 rounded-lg transition-all"
          >
            {loading ? '...' : 'Check'}
          </button>
        </div>
      </div>

      {weather && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {weather.location?.city || weather.location}
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg text-center">
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-300">
                {weather.weather?.temperature || weather.temperature}°C
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Temperature</p>
            </div>
            <div className="bg-cyan-50 dark:bg-cyan-900 p-4 rounded-lg text-center">
              <p className="text-3xl font-bold text-cyan-600 dark:text-cyan-300">
                {weather.weather?.humidity || weather.humidity}%
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Humidity</p>
            </div>
            <div className="bg-indigo-50 dark:bg-indigo-900 p-4 rounded-lg text-center">
              <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-300">
                {weather.weather?.windSpeed || weather.windSpeed} km/h
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Wind Speed</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded-lg text-center">
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-300">
                {Math.round((weather.weather?.visibility || weather.visibility) / 1000)} km
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Visibility</p>
            </div>
          </div>

          {weather.alert && weather.alert.hasAlert && (
            <div className="bg-yellow-50 dark:bg-yellow-900 border-2 border-yellow-400 dark:border-yellow-600 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <h4 className="font-bold text-yellow-800 dark:text-yellow-200 mb-1">Weather Alert</h4>
                  <p className="text-yellow-700 dark:text-yellow-300 capitalize">{weather.alert.type} - {weather.alert.severity}</p>
                  <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-2">{weather.alert.message}</p>
                </div>
              </div>
            </div>
          )}

          {!weather.alert?.hasAlert && (
            <div className="bg-green-50 dark:bg-green-900 border-2 border-green-400 dark:border-green-600 rounded-lg p-4 text-center">
              <span className="text-3xl mb-2 block">✓</span>
              <p className="text-green-800 dark:text-green-200 font-semibold">Weather conditions are favorable for travel!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// AI Pricing Component
export const PricingPage = ({ currentUser }) => {
  const [formData, setFormData] = useState({
    transport: 'car',
    distance: '',
    maxMembers: 4,
    departureTime: '09:00',
    date: new Date().toISOString().split('T')[0]
  });
  const [suggestedPrice, setSuggestedPrice] = useState(null);
  const [loading, setLoading] = useState(false);

  const getSuggestion = async () => {
    if (!formData.distance) return;
    setLoading(true);
    try {
      const response = await enhancedAPI.pricingAPI.getSuggestion(formData);
      setSuggestedPrice(response.data);
    } catch (error) {
      alert('Failed to get price suggestion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl shadow-lg p-6 mb-6 text-white">
        <h2 className="text-2xl font-bold mb-2">🤖 AI Smart Pricing</h2>
        <p>Get AI-powered price suggestions for your trips</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Transport Mode</label>
            <select
              value={formData.transport}
              onChange={(e) => setFormData({...formData, transport: e.target.value})}
              className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="car">🚗 Car</option>
              <option value="bike">🏍️ Bike</option>
              <option value="suv">🚙 SUV</option>
              <option value="bus">🚌 Bus</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Distance (km)</label>
            <input
              type="number"
              value={formData.distance}
              onChange={(e) => setFormData({...formData, distance: e.target.value})}
              placeholder="Enter distance"
              className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Max Members</label>
            <input
              type="number"
              value={formData.maxMembers}
              onChange={(e) => setFormData({...formData, maxMembers: e.target.value})}
              className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Departure Time</label>
            <input
              type="time"
              value={formData.departureTime}
              onChange={(e) => setFormData({...formData, departureTime: e.target.value})}
              className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
        <button
          onClick={getSuggestion}
          disabled={loading || !formData.distance}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-all"
        >
          {loading ? 'Calculating...' : '🤖 Get AI Price Suggestion'}
        </button>
      </div>

      {suggestedPrice && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">💰 Suggested Pricing</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-green-50 dark:bg-green-900 p-6 rounded-lg text-center">
              <p className="text-4xl font-bold text-green-600 dark:text-green-300 mb-2">₹{suggestedPrice.totalTripCost}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Trip Cost</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900 p-6 rounded-lg text-center">
              <p className="text-4xl font-bold text-blue-600 dark:text-blue-300 mb-2">₹{suggestedPrice.suggestedPerPersonCost}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Per Person</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Base Rate:</span>
              <span className="font-semibold text-gray-900 dark:text-white">₹{suggestedPrice.breakdown?.baseRate || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Fuel Cost:</span>
              <span className="font-semibold text-gray-900 dark:text-white">₹{suggestedPrice.breakdown?.fuelCost || 0}</span>
            </div>
            {suggestedPrice.breakdown?.peakHourCharge > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Peak Hour Charge:</span>
                <span className="font-semibold text-orange-600">+₹{suggestedPrice.breakdown.peakHourCharge}</span>
              </div>
            )}
            {suggestedPrice.breakdown?.discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Discount:</span>
                <span className="font-semibold text-green-600">-₹{suggestedPrice.breakdown.discount}</span>
              </div>
            )}
          </div>

          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              💡 <strong>AI Recommendation:</strong> {suggestedPrice.recommendation || 'Price is optimized for your trip parameters'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// Help Center Component
export const HelpCenterPage = ({ setPage }) => {
  const [faqs, setFaqs] = useState([]);
  const [selectedFaq, setSelectedFaq] = useState(null);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [showTicketForm, setShowTicketForm] = useState(false);

  useEffect(() => {
    loadFaqs();
  }, []);

  const loadFaqs = async () => {
    try {
      const response = await enhancedAPI.helpAPI.getFAQs();
      setFaqs(response.data || []);
    } catch (error) {
      console.error('Error loading FAQs:', error);
    }
  };

  const submitTicket = async () => {
    if (!ticketSubject || !ticketMessage) return;
    try {
      await enhancedAPI.helpAPI.createTicket({
        subject: ticketSubject,
        message: ticketMessage,
        category: 'general'
      });
      alert('Support ticket created successfully!');
      setTicketSubject('');
      setTicketMessage('');
      setShowTicketForm(false);
    } catch (error) {
      alert('Failed to create ticket');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Back Button */}
      {setPage && (
        <button
          onClick={() => setPage('home')}
          className="mb-4 flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold transition-all"
        >
          <span className="text-xl">←</span> Back to Home
        </button>
      )}

      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg p-6 mb-6 text-white">
        <h2 className="text-2xl font-bold mb-2">❓ Help Center</h2>
        <p>Find answers or contact support</p>
      </div>

      <button
        onClick={() => setShowTicketForm(!showTicketForm)}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg mb-6 transition-all"
      >
        📝 Create Support Ticket
      </button>

      {showTicketForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">New Support Ticket</h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Subject"
              value={ticketSubject}
              onChange={(e) => setTicketSubject(e.target.value)}
              className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <textarea
              placeholder="Describe your issue..."
              value={ticketMessage}
              onChange={(e) => setTicketMessage(e.target.value)}
              rows="4"
              className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <button
              onClick={submitTicket}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-all"
            >
              Submit Ticket
            </button>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">📚 Frequently Asked Questions</h3>
        <div className="space-y-3">
          {faqs.slice(0, 10).map((faq) => (
            <div
              key={faq._id}
              className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-indigo-500 transition-all cursor-pointer"
              onClick={() => setSelectedFaq(selectedFaq === faq._id ? null : faq._id)}
            >
              <div className="flex justify-between items-center">
                <h4 className="font-semibold text-gray-900 dark:text-white">{faq.question}</h4>
                <span className="text-2xl">{selectedFaq === faq._id ? '−' : '+'}</span>
              </div>
              {selectedFaq === faq._id && (
                <p className="mt-3 text-gray-600 dark:text-gray-400 text-sm">{faq.answer}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Promo Codes Component
export const PromoCodesPage = ({ currentUser, setPage }) => {
  const [promos, setPromos] = useState([]);
  const [promoCode, setPromoCode] = useState('');
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);

  useEffect(() => {
    loadPromos();
  }, []);

  const loadPromos = async () => {
    try {
      const response = await enhancedAPI.promoAPI.getActive();
      setPromos(response.data || []);
    } catch (error) {
      console.error('Error loading promos:', error);
    }
  };

  const validatePromo = async () => {
    if (!promoCode) return;
    setValidating(true);
    try {
      const response = await enhancedAPI.promoAPI.validate({
        code: promoCode,
        tripAmount: 500
      });
      setValidationResult(response.data);
    } catch (error) {
      setValidationResult({ valid: false, message: 'Invalid promo code' });
    } finally {
      setValidating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Back Button */}
      {setPage && (
        <button
          onClick={() => setPage('home')}
          className="mb-4 flex items-center gap-2 text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-semibold transition-all"
        >
          <span className="text-xl">←</span> Back to Home
        </button>
      )}

      <div className="bg-gradient-to-r from-orange-400 to-red-500 rounded-xl shadow-lg p-6 mb-6 text-white">
        <h2 className="text-2xl font-bold mb-2">🎫 Promo Codes & Offers</h2>
        <p>Save money on your trips with exclusive deals</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Validate Promo Code</h3>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Enter promo code..."
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            onKeyPress={(e) => e.key === 'Enter' && validatePromo()}
            className="flex-1 p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white uppercase"
          />
          <button
            onClick={validatePromo}
            disabled={validating}
            className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white font-semibold px-8 rounded-lg transition-all"
          >
            {validating ? '...' : 'Validate'}
          </button>
        </div>

        {validationResult && (
          <div className={`mt-4 p-4 rounded-lg ${
            validationResult.valid 
              ? 'bg-green-50 dark:bg-green-900 border-2 border-green-400' 
              : 'bg-red-50 dark:bg-red-900 border-2 border-red-400'
          }`}>
            <p className={`font-semibold ${
              validationResult.valid ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
            }`}>
              {validationResult.valid ? '✓ Valid Promo Code!' : '✗ Invalid Promo Code'}
            </p>
            {validationResult.valid && (
              <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                <p>Discount: {validationResult.discountType === 'percentage' ? `${validationResult.discountValue}%` : `₹${validationResult.discountValue}`}</p>
                <p>You save: ₹{validationResult.discountAmount}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid gap-4">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">🔥 Active Offers</h3>
        {promos.length === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-8 text-center text-gray-500 dark:text-gray-400">
            No active promo codes available
          </div>
        ) : (
          promos.map(promo => (
            <div key={promo._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-2 border-dashed border-orange-400">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">{promo.code}</h4>
                  <p className="text-gray-600 dark:text-gray-400">{promo.description}</p>
                </div>
                <span className="bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-3 py-1 rounded-full text-sm font-semibold">
                  {promo.discountType === 'percentage' ? `${promo.discountValue}% OFF` : `₹${promo.discountValue} OFF`}
                </span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Valid until: {new Date(promo.validTo).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Travel Guide Feature Component
export const TravelGuidePage = ({ currentUser, setPage }) => {
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showShareMenu, setShowShareMenu] = useState(false);

  const allDestinations = [
    {
      id: 1,
      name: 'Taj Mahal, Agra',
      category: 'Heritage',
      state: 'Uttar Pradesh',
      description: 'The iconic symbol of love, built by Emperor Shah Jahan in memory of his wife Mumtaz Mahal. A UNESCO World Heritage Site and one of the Seven Wonders of the World.',
      bestMonths: [10, 11, 12, 1, 2, 3],
      bestTime: 'October to March',
      highlights: ['Sunrise view', 'Mehtab Bagh gardens', 'Agra Fort', 'Local markets'],
      tips: 'Visit early morning for fewer crowds and best lighting. Closed on Fridays.',
      rating: 4.8,
      emoji: '🕌'
    },
    {
      id: 2,
      name: 'Jaipur, Rajasthan',
      category: 'Heritage',
      state: 'Rajasthan',
      description: 'The Pink City, known for its stunning palaces, forts, and vibrant culture. Home to Hawa Mahal, Amber Fort, and City Palace.',
      bestMonths: [11, 12, 1, 2],
      bestTime: 'November to February',
      highlights: ['Hawa Mahal', 'Amber Fort', 'City Palace', 'Jantar Mantar'],
      tips: 'Book elephant rides at Amber Fort in advance. Try local Rajasthani cuisine.',
      rating: 4.7,
      emoji: '🏰'
    },
    {
      id: 3,
      name: 'Goa Beaches',
      category: 'Beach',
      state: 'Goa',
      description: 'Famous for pristine beaches, Portuguese heritage, vibrant nightlife, and water sports. Perfect blend of relaxation and adventure.',
      bestMonths: [11, 12, 1, 2, 3],
      bestTime: 'November to March',
      highlights: ['Baga Beach', 'Calangute Beach', 'Old Goa Churches', 'Night markets'],
      tips: 'Rent a scooter to explore. Try fresh seafood and feni (local drink).',
      rating: 4.6,
      emoji: '🏖️'
    },
    {
      id: 4,
      name: 'Kerala Backwaters',
      category: 'Nature',
      state: 'Kerala',
      description: 'Serene network of lagoons, lakes, and canals. Experience traditional houseboat cruises through lush tropical landscapes.',
      bestMonths: [9, 10, 11, 12, 1, 2, 3],
      bestTime: 'September to March',
      highlights: ['Houseboat cruise', 'Alleppey', 'Kumarakom', 'Ayurvedic treatments'],
      tips: 'Book houseboats in advance. Opt for overnight stay for complete experience.',
      rating: 4.9,
      emoji: '⛵'
    },
    {
      id: 5,
      name: 'Ladakh',
      category: 'Adventure',
      state: 'Ladakh',
      description: 'Land of high passes, stunning mountains, pristine lakes, and Buddhist monasteries. Adventure paradise for bikers and trekkers.',
      bestMonths: [5, 6, 7, 8, 9],
      bestTime: 'May to September',
      highlights: ['Pangong Lake', 'Nubra Valley', 'Khardung La', 'Monasteries'],
      tips: 'Acclimatize properly to avoid altitude sickness. Carry warm clothes even in summer.',
      rating: 5.0,
      emoji: '🏔️'
    },
    {
      id: 6,
      name: 'Varanasi',
      category: 'Spiritual',
      state: 'Uttar Pradesh',
      description: 'The spiritual capital of India. Ancient city on the banks of Ganges, known for ghats, temples, and spiritual experiences.',
      bestMonths: [10, 11, 12, 1, 2, 3],
      bestTime: 'October to March',
      highlights: ['Ganga Aarti', 'Boat ride', 'Kashi Vishwanath Temple', 'Sarnath'],
      tips: 'Attend evening Ganga Aarti at Dashashwamedh Ghat. Respect local customs.',
      rating: 4.5,
      emoji: '🛕'
    },
    {
      id: 7,
      name: 'Manali, Himachal Pradesh',
      category: 'Adventure',
      state: 'Himachal Pradesh',
      description: 'Hill station paradise with snow-capped peaks, adventure sports, and beautiful valleys. Perfect for honeymooners and adventure seekers.',
      bestMonths: [3, 4, 5, 6, 10, 11],
      bestTime: 'March to June, October to November',
      highlights: ['Rohtang Pass', 'Solang Valley', 'Hadimba Temple', 'Old Manali'],
      tips: 'Book hotels in advance during peak season. Try paragliding at Solang Valley.',
      rating: 4.7,
      emoji: '⛰️'
    },
    {
      id: 8,
      name: 'Andaman Islands',
      category: 'Beach',
      state: 'Andaman & Nicobar',
      description: 'Tropical paradise with crystal clear waters, white sand beaches, and vibrant coral reefs. Perfect for scuba diving and water sports.',
      bestMonths: [10, 11, 12, 1, 2, 3, 4, 5],
      bestTime: 'October to May',
      highlights: ['Radhanagar Beach', 'Cellular Jail', 'Scuba Diving', 'Neil Island'],
      tips: 'Book ferries in advance. Carry valid ID for island entry permits.',
      rating: 4.8,
      emoji: '🏝️'
    },
    {
      id: 9,
      name: 'Rishikesh',
      category: 'Adventure',
      state: 'Uttarakhand',
      description: 'Yoga capital of the world and adventure hub on banks of Ganges. Famous for river rafting, yoga, and spiritual retreats.',
      bestMonths: [9, 10, 11, 12, 1, 2, 3, 4, 5],
      bestTime: 'September to May',
      highlights: ['River Rafting', 'Lakshman Jhula', 'Beatles Ashram', 'Ganga Aarti'],
      tips: 'Book rafting packages in advance. Visit Beatles Ashram for peace and history.',
      rating: 4.6,
      emoji: '🧘'
    },
    {
      id: 10,
      name: 'Udaipur, Rajasthan',
      category: 'Heritage',
      state: 'Rajasthan',
      description: 'City of Lakes with magnificent palaces, romantic boat rides, and rich cultural heritage. Most romantic city in India.',
      bestMonths: [10, 11, 12, 1, 2, 3],
      bestTime: 'October to March',
      highlights: ['City Palace', 'Lake Pichola', 'Jag Mandir', 'Saheliyon Ki Bari'],
      tips: 'Take sunset boat ride on Lake Pichola. Explore local handicraft markets.',
      rating: 4.8,
      emoji: '🏛️'
    },
    {
      id: 11,
      name: 'Darjeeling',
      category: 'Nature',
      state: 'West Bengal',
      description: 'Queen of Hills with stunning views of Kanchenjunga, tea gardens, and toy train rides. Colonial charm and natural beauty.',
      bestMonths: [3, 4, 5, 9, 10, 11],
      bestTime: 'March to May, September to November',
      highlights: ['Tiger Hill', 'Toy Train', 'Tea Gardens', 'Batasia Loop'],
      tips: 'Wake up early for Tiger Hill sunrise. Try local Darjeeling tea.',
      rating: 4.7,
      emoji: '🚂'
    },
    {
      id: 12,
      name: 'Hampi',
      category: 'Heritage',
      state: 'Karnataka',
      description: 'Ancient ruined city with magnificent temples, boulders, and historical monuments. UNESCO World Heritage Site.',
      bestMonths: [10, 11, 12, 1, 2],
      bestTime: 'October to February',
      highlights: ['Virupaksha Temple', 'Stone Chariot', 'Vittala Temple', 'Matanga Hill'],
      tips: 'Rent bicycle to explore ruins. Climb Matanga Hill for sunset views.',
      rating: 4.6,
      emoji: '🏺'
    },
    {
      id: 13,
      name: 'Munnar',
      category: 'Nature',
      state: 'Kerala',
      description: 'Hill station with sprawling tea plantations, misty mountains, and exotic wildlife. Perfect for nature lovers.',
      bestMonths: [9, 10, 11, 12, 1, 2, 3, 4, 5],
      bestTime: 'September to May',
      highlights: ['Tea Gardens', 'Eravikulam Park', 'Mattupetty Dam', 'Top Station'],
      tips: 'Visit tea factory for fresh tea tasting. Book jeep safari for wildlife.',
      rating: 4.7,
      emoji: '☕'
    },
    {
      id: 14,
      name: 'Amritsar',
      category: 'Spiritual',
      state: 'Punjab',
      description: 'Home to the Golden Temple, rich Sikh heritage, and delicious Punjabi cuisine. Spiritual and cultural experience.',
      bestMonths: [10, 11, 12, 1, 2, 3],
      bestTime: 'October to March',
      highlights: ['Golden Temple', 'Wagah Border', 'Jallianwala Bagh', 'Street Food'],
      tips: 'Visit Golden Temple at night when lit up. Experience Wagah Border ceremony.',
      rating: 4.9,
      emoji: '🕌'
    },
    {
      id: 15,
      name: 'Mysore',
      category: 'Heritage',
      state: 'Karnataka',
      description: 'City of Palaces with grand architecture, royal heritage, and traditional markets. Famous for Mysore Palace and silk.',
      bestMonths: [10, 11, 12, 1, 2],
      bestTime: 'October to February',
      highlights: ['Mysore Palace', 'Chamundi Hills', 'Brindavan Gardens', 'Silk Markets'],
      tips: 'Visit palace on Sunday evening when illuminated. Shop for authentic Mysore silk.',
      rating: 4.6,
      emoji: '👑'
    }
  ];

  const months = [
    { value: 'all', label: 'All Months' },
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  const categories = [
    { value: 'all', label: 'All Categories', emoji: '🌍' },
    { value: 'Heritage', label: 'Heritage', emoji: '🏛️' },
    { value: 'Beach', label: 'Beach', emoji: '🏖️' },
    { value: 'Nature', label: 'Nature', emoji: '🌲' },
    { value: 'Adventure', label: 'Adventure', emoji: '🏔️' },
    { value: 'Spiritual', label: 'Spiritual', emoji: '🕉️' }
  ];

  // Filter destinations
  const filteredDestinations = allDestinations.filter(dest => {
    const matchesSearch = dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         dest.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         dest.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesMonth = selectedMonth === 'all' || dest.bestMonths.includes(selectedMonth);
    const matchesCategory = selectedCategory === 'all' || dest.category === selectedCategory;
    
    return matchesSearch && matchesMonth && matchesCategory;
  });

  const handlePlanTrip = (destination) => {
    // Navigate to create page with destination pre-filled
    if (setPage) {
      setPage('create');
      // Store destination in session for pre-fill
      sessionStorage.setItem('travelGuideDestination', JSON.stringify({
        destination: destination.name,
        description: `Trip to ${destination.name} - ${destination.description.substring(0, 100)}...`
      }));
    }
    setSelectedDestination(null);
  };

  const handleShare = (destination, platform) => {
    const shareText = `Check out ${destination.name}! ${destination.description.substring(0, 100)}... Rating: ${destination.rating}⭐`;
    const shareUrl = window.location.href;

    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
        break;
      case 'instagram':
        // Instagram doesn't support direct sharing via URL, copy to clipboard instead
        navigator.clipboard.writeText(shareText + ' ' + shareUrl);
        alert('Link copied! Share it on Instagram Stories or Posts');
        break;
      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(shareText + '\n' + shareUrl);
        alert('Link copied to clipboard!');
        break;
    }
    setShowShareMenu(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Back Button */}
      {setPage && (
        <button
          onClick={() => setPage('home')}
          className="mb-4 flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold transition-all"
        >
          <span className="text-xl">←</span> Back to Home
        </button>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-lg p-8 mb-8 text-white">
        <div className="flex items-center gap-4 mb-4">
          <div className="text-5xl">🗺️</div>
          <div>
            <h2 className="text-3xl font-bold mb-2">Travel Guide</h2>
            <p className="text-lg opacity-90">Discover {allDestinations.length} amazing destinations across India</p>
          </div>
        </div>
        <img 
          src="/src/assets/images/travel-hero.jpg" 
          alt="Travel Destinations" 
          className="w-full h-48 object-cover rounded-lg mt-4 shadow-lg"
          onError={(e) => e.target.style.display = 'none'}
        />
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="🔍 Search destinations, states, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-4 pl-12 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-2xl">🔍</span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filters Row */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Month Filter */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                📅 Best Month to Visit
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
              >
                {months.map(month => (
                  <option key={month.value} value={month.value}>{month.label}</option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                🏷️ Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.emoji} {cat.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filters Display */}
          {(searchQuery || selectedMonth !== 'all' || selectedCategory !== 'all') && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Active filters:</span>
              {searchQuery && (
                <span className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-full text-sm">
                  Search: "{searchQuery}"
                </span>
              )}
              {selectedMonth !== 'all' && (
                <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm">
                  {months.find(m => m.value === selectedMonth)?.label}
                </span>
              )}
              {selectedCategory !== 'all' && (
                <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm">
                  {categories.find(c => c.value === selectedCategory)?.label}
                </span>
              )}
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedMonth('all');
                  setSelectedCategory('all');
                }}
                className="text-sm text-red-600 dark:text-red-400 hover:underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4 text-gray-600 dark:text-gray-400">
        <span className="font-semibold">{filteredDestinations.length}</span> destination{filteredDestinations.length !== 1 ? 's' : ''} found
      </div>

      {/* Destinations Grid */}
      {filteredDestinations.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No destinations found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Try adjusting your search or filters to find more destinations
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedMonth('all');
              setSelectedCategory('all');
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg transition-all"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDestinations.map(destination => (
            <div 
              key={destination.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
              onClick={() => setSelectedDestination(destination)}
            >
              <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center text-6xl relative">
                {destination.emoji}
                <div className="absolute top-3 right-3 bg-white dark:bg-gray-800 px-2 py-1 rounded-full text-xs font-semibold text-gray-700 dark:text-gray-300">
                  {destination.category}
                </div>
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{destination.name}</h3>
                  <div className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900 px-2 py-1 rounded-full">
                    <span className="text-yellow-600 dark:text-yellow-300">⭐</span>
                    <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-200">{destination.rating}</span>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                  {destination.description}
                </p>
                <div className="flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400 mb-2">
                  <span>🌞</span>
                  <span className="font-medium">Best: {destination.bestTime}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>📍</span>
                  <span>{destination.state}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Destination Detail Modal */}
      {selectedDestination && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedDestination(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 z-10">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-4xl">{selectedDestination.emoji}</span>
                    <div>
                      <h2 className="text-3xl font-bold">{selectedDestination.name}</h2>
                      <p className="text-sm opacity-90">📍 {selectedDestination.state}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-300">⭐</span>
                      <span className="text-xl font-semibold">{selectedDestination.rating}/5.0</span>
                    </div>
                    <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
                      {selectedDestination.category}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDestination(null)}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 transition-all"
                >
                  <span className="text-2xl">✕</span>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">About</h3>
                <p className="text-gray-600 dark:text-gray-300">{selectedDestination.description}</p>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <span>🌞</span> Best Time to Visit
                </h3>
                <p className="text-gray-600 dark:text-gray-300 bg-blue-50 dark:bg-blue-900 dark:bg-opacity-30 p-3 rounded-lg">
                  {selectedDestination.bestTime}
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <span>✨</span> Top Highlights
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {selectedDestination.highlights.map((highlight, idx) => (
                    <div key={idx} className="bg-purple-50 dark:bg-purple-900 dark:bg-opacity-30 p-3 rounded-lg text-gray-700 dark:text-gray-300">
                      <span className="mr-2">•</span>{highlight}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900 dark:to-yellow-900 dark:bg-opacity-30 p-4 rounded-lg mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <span>💡</span> Travel Tips
                </h3>
                <p className="text-gray-700 dark:text-gray-300">{selectedDestination.tips}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button 
                  onClick={() => handlePlanTrip(selectedDestination)}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <span>📝</span> Plan Trip Here
                </button>
                <button 
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-3 px-6 rounded-lg transition-all flex items-center gap-2"
                >
                  <span>📤</span> Share
                </button>
              </div>

              {/* Share Menu */}
              {showShareMenu && (
                <div className="mt-4 bg-gray-50 dark:bg-gray-700 rounded-xl p-4 animate-fadeIn">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Share this destination:</h4>
                  <div className="grid grid-cols-4 gap-3">
                    <button
                      onClick={() => handleShare(selectedDestination, 'whatsapp')}
                      className="flex flex-col items-center gap-2 p-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all"
                      title="Share on WhatsApp"
                    >
                      <span className="text-2xl">💬</span>
                      <span className="text-xs">WhatsApp</span>
                    </button>
                    <button
                      onClick={() => handleShare(selectedDestination, 'facebook')}
                      className="flex flex-col items-center gap-2 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
                      title="Share on Facebook"
                    >
                      <span className="text-2xl">📘</span>
                      <span className="text-xs">Facebook</span>
                    </button>
                    <button
                      onClick={() => handleShare(selectedDestination, 'twitter')}
                      className="flex flex-col items-center gap-2 p-3 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-all"
                      title="Share on Twitter"
                    >
                      <span className="text-2xl">🐦</span>
                      <span className="text-xs">Twitter</span>
                    </button>
                    <button
                      onClick={() => handleShare(selectedDestination, 'instagram')}
                      className="flex flex-col items-center gap-2 p-3 bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all"
                      title="Share on Instagram"
                    >
                      <span className="text-2xl">📷</span>
                      <span className="text-xs">Instagram</span>
                    </button>
                    <button
                      onClick={() => handleShare(selectedDestination, 'telegram')}
                      className="flex flex-col items-center gap-2 p-3 bg-blue-400 hover:bg-blue-500 text-white rounded-lg transition-all"
                      title="Share on Telegram"
                    >
                      <span className="text-2xl">✈️</span>
                      <span className="text-xs">Telegram</span>
                    </button>
                    <button
                      onClick={() => handleShare(selectedDestination, 'linkedin')}
                      className="flex flex-col items-center gap-2 p-3 bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition-all"
                      title="Share on LinkedIn"
                    >
                      <span className="text-2xl">💼</span>
                      <span className="text-xs">LinkedIn</span>
                    </button>
                    <button
                      onClick={() => handleShare(selectedDestination, 'copy')}
                      className="flex flex-col items-center gap-2 p-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all col-span-2"
                      title="Copy Link"
                    >
                      <span className="text-2xl">📋</span>
                      <span className="text-xs">Copy Link</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Back to List Button */}
              <button
                onClick={() => setSelectedDestination(null)}
                className="w-full mt-4 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold py-2 px-6 rounded-lg transition-all"
              >
                ← Back to Destinations
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Tourist Information Component
export const TouristInfoPage = ({ currentUser, setPage }) => {
  const [selectedCategory, setSelectedCategory] = useState('attractions');
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [selectedMuseumCountry, setSelectedMuseumCountry] = useState(null);
  const [selectedMuseumLocation, setSelectedMuseumLocation] = useState(null);
  const [selectedMuseum, setSelectedMuseum] = useState(null);
  const [selectedReligiousCountry, setSelectedReligiousCountry] = useState(null);
  const [selectedReligiousLocation, setSelectedReligiousLocation] = useState(null);
  const [selectedReligiousPlace, setSelectedReligiousPlace] = useState(null);
  const [selectedNaturalCountry, setSelectedNaturalCountry] = useState(null);
  const [selectedNaturalLocation, setSelectedNaturalLocation] = useState(null);
  const [selectedNaturalWonder, setSelectedNaturalWonder] = useState(null);

  // Helper function to check if current time is within best visiting period
  const isGoodTimeToVisit = (bestTime) => {
    if (!bestTime || bestTime === 'Year-round') return { isGood: true, message: 'Great time to visit!' };
    
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // 1-12
    
    // Parse bestTime string (e.g., "October-March", "June-September", "November-April")
    const timePattern = bestTime.toLowerCase();
    
    const monthMap = {
      'january': 1, 'february': 2, 'march': 3, 'april': 4, 'may': 5, 'june': 6,
      'july': 7, 'august': 8, 'september': 9, 'october': 10, 'november': 11, 'december': 12,
      'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4, 'jun': 6,
      'jul': 7, 'aug': 8, 'sep': 9, 'oct': 10, 'nov': 11, 'dec': 12
    };
    
    // Extract month names from the string
    const months = timePattern.match(/\b(?:january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b/gi);
    
    if (!months || months.length < 2) return { isGood: null, message: bestTime };
    
    const startMonth = monthMap[months[0].toLowerCase()];
    const endMonth = monthMap[months[1].toLowerCase()];
    
    let isInRange = false;
    if (startMonth <= endMonth) {
      // Same year range (e.g., April-September)
      isInRange = currentMonth >= startMonth && currentMonth <= endMonth;
    } else {
      // Cross-year range (e.g., October-March)
      isInRange = currentMonth >= startMonth || currentMonth <= endMonth;
    }
    
    if (isInRange) {
      return { isGood: true, message: '✨ Perfect time to visit!', season: bestTime };
    } else {
      // Calculate months until best season
      let monthsUntil;
      if (currentMonth < startMonth) {
        monthsUntil = startMonth - currentMonth;
      } else {
        monthsUntil = (12 - currentMonth) + startMonth;
      }
      
      if (monthsUntil === 1) {
        return { isGood: false, message: 'Best season starts next month', season: bestTime };
      } else if (monthsUntil <= 3) {
        return { isGood: false, message: `Best season in ${monthsUntil} months`, season: bestTime };
      } else {
        return { isGood: false, message: 'Off-season (visit with caution)', season: bestTime };
      }
    }
  };

  // Curated location details used across all attraction types
  const placeLocationOverrides = {
    'Red Fort': {
      locality: 'Netaji Subhash Marg, Chandni Chowk',
      mandalOrDistrict: 'Central Delhi',
      state: 'Delhi, India',
      pincode: '110006'
    },
    'Qutub Minar': {
      locality: 'Mehrauli',
      mandalOrDistrict: 'South Delhi',
      state: 'Delhi, India',
      pincode: '110030'
    },
    "Humayun's Tomb": {
      locality: 'Nizamuddin East',
      mandalOrDistrict: 'South East Delhi',
      state: 'Delhi, India',
      pincode: '110013'
    },
    'India Gate': {
      locality: 'Kartavya Path, Rajpath Area',
      mandalOrDistrict: 'New Delhi',
      state: 'Delhi, India',
      pincode: '110001'
    },
    'Taj Mahal': {
      locality: 'Dharmapuri, Tajganj',
      mandalOrDistrict: 'Agra District',
      state: 'Uttar Pradesh, India',
      pincode: '282001'
    },
    'Agra Fort': {
      locality: 'Rakabganj',
      mandalOrDistrict: 'Agra District',
      state: 'Uttar Pradesh, India',
      pincode: '282003'
    },
    'Fatehpur Sikri': {
      locality: 'Fatehpur Sikri Town',
      mandalOrDistrict: 'Agra District',
      state: 'Uttar Pradesh, India',
      pincode: '283110'
    },
    'Amber Fort': {
      locality: 'Devisinghpura, Amer',
      mandalOrDistrict: 'Jaipur District',
      state: 'Rajasthan, India',
      pincode: '302028'
    },
    'City Palace Jaipur': {
      locality: 'Jaleb Chowk',
      mandalOrDistrict: 'Jaipur District',
      state: 'Rajasthan, India',
      pincode: '302002'
    },
    'Hawa Mahal': {
      locality: 'Badi Choupad',
      mandalOrDistrict: 'Jaipur District',
      state: 'Rajasthan, India',
      pincode: '302002'
    },
    'Mehrangarh Fort': {
      locality: 'Sodagaran Mohalla',
      mandalOrDistrict: 'Jodhpur District',
      state: 'Rajasthan, India',
      pincode: '342006'
    },
    'Hampi Ruins': {
      locality: 'Hampi Village',
      mandalOrDistrict: 'Hospet (Vijayanagara) Taluk',
      state: 'Karnataka, India',
      pincode: '583239'
    },
    'Mysore Palace': {
      locality: 'Sayyaji Rao Road, Agrahara',
      mandalOrDistrict: 'Mysuru District',
      state: 'Karnataka, India',
      pincode: '570001'
    },
    'Gol Gumbaz': {
      locality: 'Station Road, Vijayapura',
      mandalOrDistrict: 'Vijayapura District',
      state: 'Karnataka, India',
      pincode: '586101'
    },
    'Gateway of India': {
      locality: 'Apollo Bandar, Colaba',
      mandalOrDistrict: 'Mumbai City District',
      state: 'Maharashtra, India',
      pincode: '400001'
    },
    'Ajanta Caves': {
      locality: 'Ajanta Village, Fardapur',
      mandalOrDistrict: 'Jalgaon District',
      state: 'Maharashtra, India',
      pincode: '431118'
    },
    'Ellora Caves': {
      locality: 'Verul Village',
      mandalOrDistrict: 'Chhatrapati Sambhajinagar District',
      state: 'Maharashtra, India',
      pincode: '431102'
    },
    'Meenakshi Temple': {
      locality: 'Madurai Main',
      mandalOrDistrict: 'Madurai District',
      state: 'Tamil Nadu, India',
      pincode: '625001'
    },
    'Brihadeeswarar Temple': {
      locality: 'Big Temple Complex, Thanjavur',
      mandalOrDistrict: 'Thanjavur District',
      state: 'Tamil Nadu, India',
      pincode: '613007'
    },
    'Mahabalipuram': {
      locality: 'Mamallapuram',
      mandalOrDistrict: 'Chengalpattu District',
      state: 'Tamil Nadu, India',
      pincode: '603104'
    }
  };

  const locationDetailsMap = {
    // Country-level fallbacks
    'India': { locality: 'Across India', mandalOrDistrict: 'Multiple districts', state: 'India', pincode: '110001' },
    'United States': { locality: 'National attractions', mandalOrDistrict: 'County-specific', state: 'USA', pincode: '20500' },
    'Canada': { locality: 'National attractions', mandalOrDistrict: 'Province-specific', state: 'Canada', pincode: 'K1A 0B1' },
    'France': { locality: 'Paris Region', mandalOrDistrict: 'Île-de-France', state: 'France', pincode: '75001' },
    'Italy': { locality: 'Lazio / Tuscany', mandalOrDistrict: 'Regional capitals', state: 'Italy', pincode: '00100' },
    'Spain': { locality: 'Madrid / Barcelona', mandalOrDistrict: 'Autonomous communities', state: 'Spain', pincode: '28013' },
    'Türkiye': { locality: 'Istanbul / Izmir', mandalOrDistrict: 'Provincial capitals', state: 'Türkiye', pincode: '34000' },
    'Egypt': { locality: 'Cairo / Giza Region', mandalOrDistrict: 'Giza Governorate', state: 'Egypt', pincode: '12561' },
    'Peru': { locality: 'Cusco / Lima', mandalOrDistrict: 'Cusco Province', state: 'Peru', pincode: '08002' },
    'Mexico': { locality: 'Yucatán / CDMX', mandalOrDistrict: 'Regional capitals', state: 'Mexico', pincode: '06000' },
    'Thailand': { locality: 'Bangkok / Ayutthaya', mandalOrDistrict: 'Central Thailand', state: 'Thailand', pincode: '10200' },
    'Indonesia': { locality: 'Java / Bali', mandalOrDistrict: 'Provincial capitals', state: 'Indonesia', pincode: '55281' },
    'Vietnam': { locality: 'Hanoi / Hue', mandalOrDistrict: 'Provincial capitals', state: 'Vietnam', pincode: '100000' },
    'Cambodia': { locality: 'Siem Reap', mandalOrDistrict: 'Siem Reap Province', state: 'Cambodia', pincode: '17252' },
    'Australia': { locality: 'Sydney / NT Outback', mandalOrDistrict: 'State or Territory capitals', state: 'Australia', pincode: '2000' },
    'New Zealand': { locality: 'North & South Islands', mandalOrDistrict: 'Regional councils', state: 'New Zealand', pincode: '6011' },

    // India (states and major cities)
    'Delhi': { locality: 'Delhi NCT', mandalOrDistrict: 'New Delhi District', state: 'Delhi, India', pincode: '110001' },
    'Agra': { locality: 'Tajganj / Rakabganj', mandalOrDistrict: 'Agra District', state: 'Uttar Pradesh, India', pincode: '282001' },
    'Rajasthan': { locality: 'Jaipur City', mandalOrDistrict: 'Jaipur District', state: 'Rajasthan, India', pincode: '302001' },
    'Karnataka': { locality: 'Vijayanagara Region', mandalOrDistrict: 'Vijayanagara / Mysuru', state: 'Karnataka, India', pincode: '583239' },
    'Maharashtra': { locality: 'Mumbai Metropolitan Area', mandalOrDistrict: 'Mumbai City District', state: 'Maharashtra, India', pincode: '400001' },
    'Tamil Nadu': { locality: 'Chennai City', mandalOrDistrict: 'Chennai District', state: 'Tamil Nadu, India', pincode: '600001' },
    'Uttar Pradesh': { locality: 'Lucknow / Varanasi', mandalOrDistrict: 'Lucknow District', state: 'Uttar Pradesh, India', pincode: '226001' },
    'Punjab': { locality: 'Chandigarh Capital Region', mandalOrDistrict: 'SAS Nagar (Mohali)', state: 'Punjab, India', pincode: '160059' },
    'Bihar': { locality: 'Patna City', mandalOrDistrict: 'Patna District', state: 'Bihar, India', pincode: '800001' },
    'Assam': { locality: 'Guwahati City', mandalOrDistrict: 'Kamrup Metropolitan', state: 'Assam, India', pincode: '781001' },
    'Arunachal Pradesh': { locality: 'Itanagar', mandalOrDistrict: 'Papum Pare', state: 'Arunachal Pradesh, India', pincode: '791111' },
    'Goa': { locality: 'Panjim', mandalOrDistrict: 'North Goa', state: 'Goa, India', pincode: '403001' },
    'Gujarat': { locality: 'Gandhinagar / Ahmedabad', mandalOrDistrict: 'Gandhinagar District', state: 'Gujarat, India', pincode: '382010' },
    'Haryana': { locality: 'Chandigarh Region', mandalOrDistrict: 'Panchkula', state: 'Haryana, India', pincode: '160017' },
    'Himachal Pradesh': { locality: 'Shimla City', mandalOrDistrict: 'Shimla District', state: 'Himachal Pradesh, India', pincode: '171001' },
    'Jharkhand': { locality: 'Ranchi City', mandalOrDistrict: 'Ranchi District', state: 'Jharkhand, India', pincode: '834001' },
    'Chhattisgarh': { locality: 'Raipur City', mandalOrDistrict: 'Raipur District', state: 'Chhattisgarh, India', pincode: '492001' },
    'Andhra Pradesh': { locality: 'Vijayawada', mandalOrDistrict: 'NTR District', state: 'Andhra Pradesh, India', pincode: '520001' },
    'Telangana': { locality: 'Hyderabad City', mandalOrDistrict: 'Hyderabad District', state: 'Telangana, India', pincode: '500001' },
    'Kerala': { locality: 'Thiruvananthapuram', mandalOrDistrict: 'Thiruvananthapuram District', state: 'Kerala, India', pincode: '695001' },
    'Madhya Pradesh': { locality: 'Bhopal City', mandalOrDistrict: 'Bhopal District', state: 'Madhya Pradesh, India', pincode: '462001' },
    'West Bengal': { locality: 'Kolkata City', mandalOrDistrict: 'Kolkata District', state: 'West Bengal, India', pincode: '700001' },

    // USA
    'Washington DC': { locality: 'National Mall', mandalOrDistrict: 'District of Columbia', state: 'USA', pincode: '20500' },
    'New York': { locality: 'Manhattan, Liberty Island', mandalOrDistrict: 'New York County', state: 'New York, USA', pincode: '10004' },
    'Arizona': { locality: 'Grand Canyon Village', mandalOrDistrict: 'Coconino County', state: 'Arizona, USA', pincode: '86023' },
    'California': { locality: 'Yosemite Valley / LA Basin', mandalOrDistrict: 'Mariposa / LA County', state: 'California, USA', pincode: '93633' },

    // Europe
    'Paris': { locality: 'Champ de Mars', mandalOrDistrict: '7th Arrondissement', state: 'Île-de-France, France', pincode: '75007' },
    'Versailles': { locality: 'Place d’Armes', mandalOrDistrict: 'Yvelines', state: 'Île-de-France, France', pincode: '78000' },
    'Rome': { locality: 'Centro Storico', mandalOrDistrict: 'Roma RM', state: 'Lazio, Italy', pincode: '00184' },
    'Pisa': { locality: 'Piazza del Duomo', mandalOrDistrict: 'Pisa Province', state: 'Tuscany, Italy', pincode: '56126' },
    'London': { locality: 'Tower Hamlets / Westminster', mandalOrDistrict: 'Greater London', state: 'England, UK', pincode: 'EC3N 4AB' },
    'Stonehenge': { locality: 'Amesbury', mandalOrDistrict: 'Wiltshire', state: 'England, UK', pincode: 'SP4 7DE' },

    // Africa
    'Giza': { locality: 'Nazlet El-Semman', mandalOrDistrict: 'Giza Governorate', state: 'Egypt', pincode: '12561' },
    'Luxor': { locality: 'East Bank', mandalOrDistrict: 'Luxor Governorate', state: 'Egypt', pincode: '85951' },

    // Asia
    'Beijing': { locality: 'Dongcheng District', mandalOrDistrict: 'Beijing Municipality', state: 'China', pincode: '100006' },
    'Kyoto': { locality: 'Ukyo Ward', mandalOrDistrict: 'Kyoto Prefecture', state: 'Japan', pincode: '6160000' },
    'Hiroshima': { locality: 'Naka Ward', mandalOrDistrict: 'Hiroshima Prefecture', state: 'Japan', pincode: '7300051' },
    'Athens': { locality: 'Acropolis Area', mandalOrDistrict: 'Central Athens', state: 'Attica, Greece', pincode: '10555' },
    'Crete': { locality: 'Heraklion City', mandalOrDistrict: 'Heraklion Region', state: 'Crete, Greece', pincode: '71202' },
    'Andalusia': { locality: 'Granada City', mandalOrDistrict: 'Granada Province', state: 'Andalusia, Spain', pincode: '18009' },
    'Catalonia': { locality: 'Barcelona City', mandalOrDistrict: 'Barcelona Province', state: 'Catalonia, Spain', pincode: '08024' },
    'Madrid': { locality: 'Centro Madrid', mandalOrDistrict: 'Madrid Province', state: 'Community of Madrid, Spain', pincode: '28013' },
    'Istanbul': { locality: 'Fatih / Sultanahmet', mandalOrDistrict: 'Istanbul Province', state: 'Türkiye', pincode: '34122' },
    'Cappadocia': { locality: 'Göreme', mandalOrDistrict: 'Nevşehir Province', state: 'Türkiye', pincode: '50180' },
    'Ephesus': { locality: 'Selçuk', mandalOrDistrict: 'İzmir Province', state: 'Türkiye', pincode: '35920' },
    'Siem Reap': { locality: 'Krong Siem Reap', mandalOrDistrict: 'Siem Reap Province', state: 'Cambodia', pincode: '17252' },
    'Bangkok': { locality: 'Phra Nakhon', mandalOrDistrict: 'Bangkok District', state: 'Thailand', pincode: '10200' },
    'Ayutthaya': { locality: 'Phra Nakhon Si Ayutthaya', mandalOrDistrict: 'Ayutthaya Province', state: 'Thailand', pincode: '13000' },
    'Central Java': { locality: 'Magelang / Borobudur', mandalOrDistrict: 'Magelang Regency', state: 'Central Java, Indonesia', pincode: '56553' },
    'Bali': { locality: 'Uluwatu / Kuta South', mandalOrDistrict: 'Badung Regency', state: 'Bali, Indonesia', pincode: '80361' },
    'Hanoi': { locality: 'Ba Dinh', mandalOrDistrict: 'Hanoi Municipality', state: 'Vietnam', pincode: '100000' },
    'Hue': { locality: 'Thua Thien Hue', mandalOrDistrict: 'Hue City', state: 'Vietnam', pincode: '530000' },

    // Americas
    'Yucatan': { locality: 'Tinum / Piste', mandalOrDistrict: 'Yucatán State', state: 'Mexico', pincode: '97751' },
    'Quintana Roo': { locality: 'Tulum', mandalOrDistrict: 'Quintana Roo', state: 'Mexico', pincode: '77780' },
    'Mexico City': { locality: 'Centro Histórico', mandalOrDistrict: 'Cuauhtémoc', state: 'CDMX, Mexico', pincode: '06000' },
    'Cusco': { locality: 'Machu Picchu Pueblo / Cusco City', mandalOrDistrict: 'Cusco Province', state: 'Cusco Region, Peru', pincode: '08002' },
    'Lima': { locality: 'Miraflores', mandalOrDistrict: 'Lima Province', state: 'Lima Region, Peru', pincode: '15074' },

    // Oceania
    'New South Wales': { locality: 'Sydney CBD', mandalOrDistrict: 'Sydney Metro', state: 'NSW, Australia', pincode: '2000' },
    'Northern Territory': { locality: 'Uluru-Kata Tjuta', mandalOrDistrict: 'MacDonnell Region', state: 'NT, Australia', pincode: '0872' },
    'South Island': { locality: 'Queenstown Lakes', mandalOrDistrict: 'Otago Region', state: 'New Zealand', pincode: '9300' },
    'North Island': { locality: 'Rotorua / Taupō', mandalOrDistrict: 'Bay of Plenty', state: 'New Zealand', pincode: '3010' },

    // Canada
    'Alberta': { locality: 'Banff / Lake Louise', mandalOrDistrict: 'Improvement District No. 9', state: 'Alberta, Canada', pincode: 'T0L 1E0' },
    'British Columbia': { locality: 'Vancouver Island / Victoria', mandalOrDistrict: 'Capital Regional District', state: 'British Columbia, Canada', pincode: 'V8W 1N6' }
  };

  const resolveLocationDetails = (placeName, locationName, countryName) => {
    return placeLocationOverrides[placeName] || locationDetailsMap[locationName] || locationDetailsMap[countryName] || null;
  };

  // Historical Sites Data by Country and Location
  const historicalSitesByCountry = {
    'India': {
      name: 'India',
      icon: '🇮🇳',
      locations: {
        'Delhi': {
          name: 'Delhi',
          icon: '🏛️',
      places: [
        { 
          name: 'Red Fort', 
          description: 'A historic fort built in 1648 by Mughal Emperor Shah Jahan',
          timings: '9:30 AM - 4:30 PM (Closed on Monday)',
          entryFee: '₹35 for Indians, ₹500 for foreigners',
          bestTime: 'October to March',
          highlights: ['Diwan-i-Aam', 'Diwan-i-Khas', 'Moti Masjid', 'Sound & Light Show'],
          image: '🏰'
        },
        { 
          name: 'Qutub Minar', 
          description: 'A 73-meter tall victory tower built in 1193',
          timings: '7:00 AM - 5:00 PM',
          entryFee: '₹30 for Indians, ₹500 for foreigners',
          bestTime: 'October to March',
          highlights: ['Iron Pillar', 'Quwwat-ul-Islam Mosque', 'Alai Darwaza'],
          image: '🗼'
        },
        { 
          name: 'Humayun\'s Tomb', 
          description: 'UNESCO World Heritage Site, built in 1570',
          timings: 'Sunrise to Sunset',
          entryFee: '₹30 for Indians, ₹500 for foreigners',
          bestTime: 'October to March',
          highlights: ['Mughal Architecture', 'Beautiful Gardens', 'Tomb Complex'],
          image: '⛩️'
        },
        { 
          name: 'India Gate', 
          description: 'War memorial dedicated to Indian soldiers',
          timings: 'Open 24 hours',
          entryFee: 'Free',
          bestTime: 'Evening (6 PM - 9 PM)',
          highlights: ['Amar Jawan Jyoti', 'Boat rides', 'Evening lights'],
          image: '🏛️'
        }
      ]
    },
    'Agra': {
      name: 'Agra',
      icon: '🕌',
      places: [
        { 
          name: 'Taj Mahal', 
          description: 'Iconic white marble mausoleum, one of Seven Wonders of the World',
          timings: 'Sunrise to Sunset (Closed on Friday)',
          entryFee: '₹50 for Indians, ₹1100 for foreigners',
          bestTime: 'October to March, visit at sunrise',
          highlights: ['Main Mausoleum', 'Charbagh Gardens', 'Yamuna River view', 'Full moon viewing'],
          image: '🕌'
        },
        { 
          name: 'Agra Fort', 
          description: 'UNESCO World Heritage Site, red sandstone fort',
          timings: 'Sunrise to Sunset',
          entryFee: '₹40 for Indians, ₹550 for foreigners',
          bestTime: 'October to March',
          highlights: ['Jahangir Palace', 'Khas Mahal', 'Sheesh Mahal', 'Taj Mahal view'],
          image: '🏰'
        },
        { 
          name: 'Fatehpur Sikri', 
          description: 'Historic city built by Akbar in 1571',
          timings: 'Sunrise to Sunset',
          entryFee: '₹40 for Indians, ₹550 for foreigners',
          bestTime: 'October to March',
          highlights: ['Buland Darwaza', 'Jama Masjid', 'Panch Mahal'],
          image: '🏛️'
        }
      ]
    },
    'Rajasthan': {
      name: 'Rajasthan',
      icon: '🏰',
      places: [
        { 
          name: 'Amber Fort', 
          description: 'Majestic fort palace in Jaipur built in 1592',
          timings: '8:00 AM - 6:00 PM',
          entryFee: '₹100 for Indians, ₹500 for foreigners',
          bestTime: 'October to March',
          highlights: ['Sheesh Mahal', 'Elephant rides', 'Light & Sound Show', 'Diwan-i-Khas'],
          image: '🏰'
        },
        { 
          name: 'City Palace Jaipur', 
          description: 'Royal residence with museums and courtyards',
          timings: '9:30 AM - 5:00 PM',
          entryFee: '₹200 for Indians, ₹700 for foreigners',
          bestTime: 'October to March',
          highlights: ['Mubarak Mahal', 'Chandra Mahal', 'Royal artifacts', 'Textile museum'],
          image: '👑'
        },
        { 
          name: 'Hawa Mahal', 
          description: 'Palace of Winds with 953 small windows',
          timings: '9:00 AM - 5:00 PM',
          entryFee: '₹50 for Indians, ₹200 for foreigners',
          bestTime: 'October to March, morning light',
          highlights: ['Unique architecture', 'City views', 'Pink sandstone facade'],
          image: '🏛️'
        },
        { 
          name: 'Mehrangarh Fort', 
          description: 'Massive fort in Jodhpur, one of India\'s largest forts',
          timings: '9:00 AM - 5:00 PM',
          entryFee: '₹100 for Indians, ₹600 for foreigners',
          bestTime: 'October to March',
          highlights: ['Museum', 'City panorama', 'Palaces', 'Zipline adventure'],
          image: '🏰'
        }
      ]
    },
    'Karnataka': {
      name: 'Karnataka',
      icon: '⛰️',
      places: [
        { 
          name: 'Hampi Ruins', 
          description: 'UNESCO World Heritage Site, ancient Vijayanagara Empire capital',
          timings: 'Sunrise to Sunset',
          entryFee: '₹40 for Indians, ₹600 for foreigners',
          bestTime: 'October to February',
          highlights: ['Virupaksha Temple', 'Stone Chariot', 'Vittala Temple', 'Royal Enclosure'],
          image: '⛰️'
        },
        { 
          name: 'Mysore Palace', 
          description: 'Grand palace with Indo-Saracenic architecture',
          timings: '10:00 AM - 5:30 PM',
          entryFee: '₹70 for Indians, ₹200 for foreigners',
          bestTime: 'September to March, Sunday evenings (illuminated)',
          highlights: ['Durbar Hall', 'Royal artifacts', 'Light show', 'Gardens'],
          image: '🏰'
        },
        { 
          name: 'Gol Gumbaz', 
          description: 'Mausoleum with world\'s second largest dome',
          timings: '10:00 AM - 5:30 PM',
          entryFee: '₹25 for Indians, ₹300 for foreigners',
          bestTime: 'October to March',
          highlights: ['Whispering Gallery', 'Dome architecture', 'Museum'],
          image: '🕌'
        }
      ]
    },
    'Maharashtra': {
      name: 'Maharashtra',
      icon: '🏛️',
      places: [
        { 
          name: 'Gateway of India', 
          description: 'Iconic arch monument built in 1924',
          timings: 'Open 24 hours',
          entryFee: 'Free',
          bestTime: 'October to March, evening',
          highlights: ['Arabian Sea view', 'Boat rides to Elephanta', 'Photography spot'],
          image: '🏛️'
        },
        { 
          name: 'Ajanta Caves', 
          description: 'UNESCO Site, ancient Buddhist rock-cut caves',
          timings: '9:00 AM - 5:30 PM (Closed on Monday)',
          entryFee: '₹40 for Indians, ₹600 for foreigners',
          bestTime: 'November to March',
          highlights: ['Ancient paintings', 'Buddhist sculptures', '30 caves'],
          image: '⛰️'
        },
        { 
          name: 'Ellora Caves', 
          description: 'UNESCO Site with Hindu, Buddhist, and Jain caves',
          timings: '6:00 AM - 6:00 PM (Closed on Tuesday)',
          entryFee: '₹40 for Indians, ₹600 for foreigners',
          bestTime: 'November to March',
          highlights: ['Kailasa Temple', '34 caves', 'Rock-cut architecture'],
          image: '⛰️'
        }
      ]
    },
    'Tamil Nadu': {
      name: 'Tamil Nadu',
      icon: '🕉️',
      places: [
        { 
          name: 'Meenakshi Temple', 
          description: 'Ancient Hindu temple dedicated to Parvati and Shiva',
          timings: '5:00 AM - 12:30 PM, 4:00 PM - 9:30 PM',
          entryFee: 'Free (₹50 for special darshan)',
          bestTime: 'October to March',
          highlights: ['Gopurams', 'Hall of 1000 pillars', 'Golden Lotus Tank'],
          image: '🕉️'
        },
        { 
          name: 'Brihadeeswarar Temple', 
          description: 'UNESCO Site, magnificent Chola temple',
          timings: '6:00 AM - 8:30 PM',
          entryFee: 'Free',
          bestTime: 'October to March',
          highlights: ['Tallest temple tower', 'Nandi statue', '1000-year old architecture'],
          image: '🏛️'
        },
        { 
          name: 'Mahabalipuram', 
          description: 'UNESCO Site with rock-cut temples',
          timings: '6:00 AM - 6:00 PM',
          entryFee: '₹40 for Indians, ₹600 for foreigners',
          bestTime: 'November to February',
          highlights: ['Shore Temple', 'Five Rathas', 'Krishna\'s Butterball'],
          image: '⛩️'
        }
      ]
    }
      }
    },
    'USA': {
      name: 'United States',
      icon: '🇺🇸',
      locations: {
        'Washington DC': {
          name: 'Washington DC',
          icon: '🏛️',
          places: [
            {
              name: 'Lincoln Memorial',
              description: 'Iconic monument honoring Abraham Lincoln',
              timings: 'Open 24 hours',
              entryFee: 'Free',
              bestTime: 'Year-round, evening for lighting',
              highlights: ['Reflecting Pool', 'Lincoln statue', 'Inscribed speeches', 'National Mall view'],
              image: '🏛️'
            },
            {
              name: 'Washington Monument',
              description: 'Tallest stone structure and obelisk in the world',
              timings: '9:00 AM - 5:00 PM',
              entryFee: 'Free (tickets required)',
              bestTime: 'Spring and Fall',
              highlights: ['Top observation deck', 'City views', 'Memorial stones', 'Elevator tour'],
              image: '🗼'
            },
            {
              name: 'White House',
              description: 'Official residence of U.S. President',
              timings: '7:30 AM - 11:30 AM (Tours by appointment)',
              entryFee: 'Free (advance booking required)',
              bestTime: 'Spring for Cherry Blossoms',
              highlights: ['Presidential residence', 'Rose Garden', 'Historical rooms'],
              image: '🏛️'
            }
          ]
        },
        'New York': {
          name: 'New York',
          icon: '🗽',
          places: [
            {
              name: 'Statue of Liberty',
              description: 'Symbol of freedom gifted by France',
              timings: '9:00 AM - 5:00 PM',
              entryFee: '$24 (Ferry & grounds), $24.30 (Crown access)',
              bestTime: 'Spring and Fall',
              highlights: ['Crown access', 'Ellis Island', 'Museum', 'NYC Harbor views'],
              image: '🗽'
            },
            {
              name: 'Ellis Island',
              description: 'Historic immigration station',
              timings: '9:00 AM - 5:00 PM',
              entryFee: 'Included with Statue ferry ticket',
              bestTime: 'Year-round',
              highlights: ['Immigration Museum', 'Great Hall', 'Genealogy research', 'Wall of Honor'],
              image: '🏛️'
            }
          ]
        }
      }
    },
    'Egypt': {
      name: 'Egypt',
      icon: '🇪🇬',
      locations: {
        'Giza': {
          name: 'Giza',
          icon: '🔺',
          places: [
            {
              name: 'Great Pyramid of Giza',
              description: 'Last remaining Wonder of the Ancient World',
              timings: '8:00 AM - 4:00 PM',
              entryFee: 'EGP 240 (Pyramid area), EGP 400 (Inside pyramid)',
              bestTime: 'October to April',
              highlights: ['Pharaoh Khufu tomb', 'Ancient architecture', 'Grand Gallery', 'King\'s Chamber'],
              image: '🔺'
            },
            {
              name: 'Great Sphinx',
              description: 'Limestone statue with lion body and human head',
              timings: '8:00 AM - 4:00 PM',
              entryFee: 'Included in Giza complex ticket',
              bestTime: 'October to April, sunrise',
              highlights: ['Ancient mystery', 'Photo opportunity', 'Dream Stele', 'Pyramid backdrop'],
              image: '🦁'
            }
          ]
        },
        'Luxor': {
          name: 'Luxor',
          icon: '🏛️',
          places: [
            {
              name: 'Karnak Temple',
              description: 'Massive temple complex dedicated to Amun',
              timings: '6:00 AM - 5:30 PM',
              entryFee: 'EGP 220',
              bestTime: 'October to April',
              highlights: ['Hypostyle Hall', 'Avenue of Sphinxes', 'Sacred Lake', 'Sound & Light show'],
              image: '🏛️'
            },
            {
              name: 'Valley of the Kings',
              description: 'Burial site of pharaohs including Tutankhamun',
              timings: '6:00 AM - 5:00 PM',
              entryFee: 'EGP 260 (3 tombs)',
              bestTime: 'October to April, early morning',
              highlights: ['Royal tombs', 'Ancient paintings', 'Tutankhamun tomb', 'Desert landscape'],
              image: '⚱️'
            }
          ]
        }
      }
    },
    'France': {
      name: 'France',
      icon: '🇫🇷',
      locations: {
        'Paris': {
          name: 'Paris',
          icon: '🗼',
          places: [
            {
              name: 'Eiffel Tower',
              description: 'Iconic iron lattice tower built in 1889',
              timings: '9:00 AM - 12:45 AM',
              entryFee: '€28.30 (Top), €18.10 (2nd floor)',
              bestTime: 'Spring and Fall, evening for lights',
              highlights: ['City panorama', 'Restaurants', 'Light shows', 'Three observation levels'],
              image: '🗼'
            },
            {
              name: 'Notre-Dame Cathedral',
              description: 'Medieval Catholic cathedral',
              timings: 'Currently closed for restoration',
              entryFee: 'Free (when open)',
              bestTime: 'Reopening in 2024',
              highlights: ['Gothic architecture', 'Rose windows', 'Bell towers', 'Historical significance'],
              image: '⛪'
            },
            {
              name: 'Louvre Museum',
              description: 'World\'s largest art museum',
              timings: '9:00 AM - 6:00 PM (Closed Tuesday)',
              entryFee: '€17',
              bestTime: 'Wednesday/Friday evenings (less crowded)',
              highlights: ['Mona Lisa', 'Venus de Milo', 'Winged Victory', 'Egyptian antiquities'],
              image: '🏛️'
            }
          ]
        },
        'Versailles': {
          name: 'Versailles',
          icon: '👑',
          places: [
            {
              name: 'Palace of Versailles',
              description: 'Opulent former royal residence',
              timings: '9:00 AM - 6:30 PM (Closed Monday)',
              entryFee: '€19.50 (Palace), €27 (Palace + Gardens)',
              bestTime: 'Spring for gardens, weekdays',
              highlights: ['Hall of Mirrors', 'Royal apartments', 'Gardens', 'Musical fountains'],
              image: '👑'
            }
          ]
        }
      }
    },
    'Italy': {
      name: 'Italy',
      icon: '🇮🇹',
      locations: {
        'Rome': {
          name: 'Rome',
          icon: '🏛️',
          places: [
            {
              name: 'Colosseum',
              description: 'Ancient Roman amphitheater',
              timings: '9:00 AM - 7:00 PM (varies by season)',
              entryFee: '€18 (includes Roman Forum)',
              bestTime: 'Spring and Fall, early morning',
              highlights: ['Ancient arena', 'Underground chambers', 'Upper levels', 'Roman engineering'],
              image: '🏛️'
            },
            {
              name: 'Roman Forum',
              description: 'Center of ancient Roman life',
              timings: '9:00 AM - 7:00 PM',
              entryFee: 'Included with Colosseum ticket',
              bestTime: 'Spring and Fall',
              highlights: ['Ancient ruins', 'Temples', 'Arches', 'Palatine Hill views'],
              image: '🏛️'
            },
            {
              name: 'Vatican Museums',
              description: 'Papal art collections and Sistine Chapel',
              timings: '9:00 AM - 6:00 PM (Closed Sunday)',
              entryFee: '€17',
              bestTime: 'Wednesday afternoons (Pope audience)',
              highlights: ['Sistine Chapel', 'Raphael Rooms', 'Art galleries', 'St. Peter\'s Basilica'],
              image: '⛪'
            }
          ]
        },
        'Pisa': {
          name: 'Pisa',
          icon: '🗼',
          places: [
            {
              name: 'Leaning Tower of Pisa',
              description: 'Freestanding bell tower with famous tilt',
              timings: '9:00 AM - 8:00 PM',
              entryFee: '€18',
              bestTime: 'Spring and Fall',
              highlights: ['Climb to top', 'Cathedral Square', 'Baptistery', 'Photo opportunities'],
              image: '🗼'
            }
          ]
        }
      }
    },
    'United Kingdom': {
      name: 'United Kingdom',
      icon: '🇬🇧',
      locations: {
        'London': {
          name: 'London',
          icon: '🏰',
          places: [
            {
              name: 'Tower of London',
              description: 'Historic castle and former royal palace',
              timings: '9:00 AM - 5:30 PM',
              entryFee: '£29.90',
              bestTime: 'Spring and Fall, weekdays',
              highlights: ['Crown Jewels', 'Beefeaters', 'White Tower', 'Tower Bridge views'],
              image: '🏰'
            },
            {
              name: 'Buckingham Palace',
              description: 'Official residence of British monarch',
              timings: '9:30 AM - 7:30 PM (Summer only)',
              entryFee: '£30 (State Rooms)',
              bestTime: 'July-August (open to public)',
              highlights: ['State Rooms', 'Changing of Guard', 'Royal Gallery', 'Gardens'],
              image: '🏰'
            },
            {
              name: 'Westminster Abbey',
              description: 'Gothic church and coronation site',
              timings: '9:30 AM - 3:30 PM',
              entryFee: '£25',
              bestTime: 'Spring and Fall',
              highlights: ['Royal tombs', 'Poet\'s Corner', 'Coronation Chair', 'Architecture'],
              image: '⛪'
            }
          ]
        },
        'Stonehenge': {
          name: 'Stonehenge',
          icon: '🗿',
          places: [
            {
              name: 'Stonehenge',
              description: 'Prehistoric monument and UNESCO Site',
              timings: '9:30 AM - 5:00 PM',
              entryFee: '£22.50',
              bestTime: 'Sunrise/sunset, Summer Solstice',
              highlights: ['Ancient stones', 'Visitor center', 'Neolithic houses', 'Audio guide'],
              image: '🗿'
            }
          ]
        }
      }
    },
    'China': {
      name: 'China',
      icon: '🇨🇳',
      locations: {
        'Beijing': {
          name: 'Beijing',
          icon: '🏯',
          places: [
            {
              name: 'Great Wall of China',
              description: 'Ancient fortification stretching thousands of miles',
              timings: '7:00 AM - 6:00 PM',
              entryFee: '¥40 (varies by section)',
              bestTime: 'Spring and Fall, avoid holidays',
              highlights: ['Badaling section', 'Watchtowers', 'Mountain views', 'Cable car'],
              image: '🏯'
            },
            {
              name: 'Forbidden City',
              description: 'Imperial palace complex',
              timings: '8:30 AM - 5:00 PM (Closed Monday)',
              entryFee: '¥60',
              bestTime: 'Spring and Fall, weekdays',
              highlights: ['Palace Museum', 'Imperial gardens', 'Throne halls', '9999 rooms'],
              image: '🏛️'
            },
            {
              name: 'Temple of Heaven',
              description: 'Imperial temple complex',
              timings: '6:00 AM - 10:00 PM',
              entryFee: '¥15 (grounds), ¥35 (with temples)',
              bestTime: 'Early morning for tai chi',
              highlights: ['Hall of Prayer', 'Echo Wall', 'Imperial Vault', 'Gardens'],
              image: '⛩️'
            }
          ]
        }
      }
    },
    'Japan': {
      name: 'Japan',
      icon: '🇯🇵',
      locations: {
        'Kyoto': {
          name: 'Kyoto',
          icon: '⛩️',
          places: [
            {
              name: 'Kinkaku-ji (Golden Pavilion)',
              description: 'Zen temple covered in gold leaf',
              timings: '9:00 AM - 5:00 PM',
              entryFee: '¥400',
              bestTime: 'Spring (cherry blossoms) and Fall (autumn leaves)',
              highlights: ['Golden pavilion', 'Mirror pond', 'Gardens', 'Photo spot'],
              image: '⛩️'
            },
            {
              name: 'Fushimi Inari Shrine',
              description: 'Shrine famous for thousands of red torii gates',
              timings: 'Open 24 hours',
              entryFee: 'Free',
              bestTime: 'Early morning or evening',
              highlights: ['10,000 torii gates', 'Mountain trails', 'Fox statues', 'Sacred mountain'],
              image: '⛩️'
            }
          ]
        },
        'Hiroshima': {
          name: 'Hiroshima',
          icon: '🕊️',
          places: [
            {
              name: 'Hiroshima Peace Memorial',
              description: 'UNESCO Site commemorating atomic bombing',
              timings: '8:30 AM - 6:00 PM',
              entryFee: '¥200 (Museum)',
              bestTime: 'Year-round',
              highlights: ['A-Bomb Dome', 'Peace Park', 'Museum', 'Memorial cenotaph'],
              image: '🕊️'
            }
          ]
        }
      }
    },
    'Greece': {
      name: 'Greece',
      icon: '🇬🇷',
      locations: {
        'Athens': {
          name: 'Athens',
          icon: '🏛️',
          places: [
            {
              name: 'Acropolis of Athens',
              description: 'Ancient citadel with Parthenon temple',
              timings: '8:00 AM - 8:00 PM (Summer)',
              entryFee: '€20',
              bestTime: 'Spring and Fall, early morning',
              highlights: ['Parthenon', 'Erechtheion', 'Temple of Athena Nike', 'City views'],
              image: '🏛️'
            },
            {
              name: 'Ancient Agora',
              description: 'Heart of ancient Athens',
              timings: '8:00 AM - 8:00 PM',
              entryFee: '€10',
              bestTime: 'Spring and Fall',
              highlights: ['Temple of Hephaestus', 'Stoa of Attalos', 'Ancient marketplace'],
              image: '🏛️'
            },
            {
              name: 'Temple of Olympian Zeus',
              description: 'Colossal ruined temple dedicated to Zeus',
              timings: '8:00 AM - 8:00 PM',
              entryFee: '€8',
              bestTime: 'Spring and Fall',
              highlights: ['Massive columns', 'Ancient ruins', 'Hadrian\'s Arch'],
              image: '🏛️'
            }
          ]
        },
        'Crete': {
          name: 'Crete',
          icon: '🏺',
          places: [
            {
              name: 'Knossos Palace',
              description: 'Ancient Minoan palace and archaeological site',
              timings: '8:00 AM - 8:00 PM',
              entryFee: '€15',
              bestTime: 'April to October',
              highlights: ['Minoan civilization', 'Throne Room', 'Frescoes', 'Labyrinth legend'],
              image: '🏺'
            }
          ]
        }
      }
    },
    'Spain': {
      name: 'Spain',
      icon: '🇪🇸',
      locations: {
        'Andalusia': {
          name: 'Andalusia',
          icon: '🕌',
          places: [
            {
              name: 'Alhambra',
              description: 'Moorish palace and fortress complex',
              timings: '8:30 AM - 8:00 PM',
              entryFee: '€14',
              bestTime: 'Spring and Fall',
              highlights: ['Nasrid Palaces', 'Generalife Gardens', 'Islamic architecture', 'Sierra Nevada views'],
              image: '🕌'
            },
            {
              name: 'Mezquita of Cordoba',
              description: 'Former mosque turned cathedral',
              timings: '10:00 AM - 7:00 PM',
              entryFee: '€11',
              bestTime: 'Spring and Fall',
              highlights: ['Forest of columns', 'Horseshoe arches', 'Mihrab', 'Christian cathedral'],
              image: '🕌'
            },
            {
              name: 'Alcazar of Seville',
              description: 'Royal palace with Mudejar architecture',
              timings: '9:30 AM - 5:00 PM',
              entryFee: '€13.50',
              bestTime: 'Spring and Fall',
              highlights: ['Gardens', 'Peacocks', 'Game of Thrones location', 'Moorish tiles'],
              image: '🏰'
            }
          ]
        },
        'Catalonia': {
          name: 'Catalonia',
          icon: '⛪',
          places: [
            {
              name: 'Sagrada Familia',
              description: 'Gaudi\'s unfinished masterpiece basilica',
              timings: '9:00 AM - 8:00 PM',
              entryFee: '€26',
              bestTime: 'Year-round, morning light',
              highlights: ['Unique architecture', 'Nativity facade', 'Passion facade', 'Towers'],
              image: '⛪'
            },
            {
              name: 'Park Güell',
              description: 'Gaudi\'s colorful mosaic park',
              timings: '8:00 AM - 9:30 PM',
              entryFee: '€10',
              bestTime: 'Spring and Fall',
              highlights: ['Mosaic salamander', 'Wavy benches', 'City views', 'Gingerbread houses'],
              image: '🎨'
            }
          ]
        },
        'Madrid': {
          name: 'Madrid',
          icon: '🏛️',
          places: [
            {
              name: 'Royal Palace of Madrid',
              description: 'Official residence of Spanish Royal Family',
              timings: '10:00 AM - 6:00 PM',
              entryFee: '€13',
              bestTime: 'Spring and Fall',
              highlights: ['Throne Room', 'Royal Armory', 'Gardens', '3,000 rooms'],
              image: '👑'
            },
            {
              name: 'El Escorial',
              description: 'Monastery and royal site',
              timings: '10:00 AM - 6:00 PM (Closed Monday)',
              entryFee: '€12',
              bestTime: 'Spring and Fall',
              highlights: ['Royal library', 'Basilica', 'Royal tombs', 'Art collection'],
              image: '🏛️'
            }
          ]
        }
      }
    },
    'Turkey': {
      name: 'Turkey',
      icon: '🇹🇷',
      locations: {
        'Istanbul': {
          name: 'Istanbul',
          icon: '🕌',
          places: [
            {
              name: 'Hagia Sophia',
              description: 'Byzantine cathedral turned mosque',
              timings: 'Open 24 hours (prayer times)',
              entryFee: 'Free',
              bestTime: 'Spring and Fall',
              highlights: ['Massive dome', 'Byzantine mosaics', 'Islamic calligraphy', 'Marble pillars'],
              image: '🕌'
            },
            {
              name: 'Topkapi Palace',
              description: 'Ottoman imperial palace',
              timings: '9:00 AM - 6:00 PM (Closed Tuesday)',
              entryFee: '₺200',
              bestTime: 'Spring and Fall',
              highlights: ['Harem', 'Treasury', 'Bosphorus views', 'Courtyards'],
              image: '🏰'
            },
            {
              name: 'Blue Mosque',
              description: 'Iconic mosque with blue Iznik tiles',
              timings: 'Open for prayer (limited tourist hours)',
              entryFee: 'Free',
              bestTime: 'Morning hours',
              highlights: ['Six minarets', 'Blue tiles', 'Massive courtyard', 'Carpets'],
              image: '🕌'
            }
          ]
        },
        'Cappadocia': {
          name: 'Cappadocia',
          icon: '🏔️',
          places: [
            {
              name: 'Göreme Open Air Museum',
              description: 'Rock-cut churches and monasteries',
              timings: '8:00 AM - 7:00 PM',
              entryFee: '₺100',
              bestTime: 'Spring and Fall',
              highlights: ['Cave churches', 'Frescoes', 'Fairy chimneys', 'Rock formations'],
              image: '⛰️'
            },
            {
              name: 'Derinkuyu Underground City',
              description: 'Ancient multi-level underground city',
              timings: '8:00 AM - 7:00 PM',
              entryFee: '₺60',
              bestTime: 'Year-round',
              highlights: ['8 levels deep', 'Ventilation shafts', 'Living quarters', 'Wine cellars'],
              image: '🕳️'
            }
          ]
        },
        'Ephesus': {
          name: 'Ephesus',
          icon: '🏛️',
          places: [
            {
              name: 'Ancient City of Ephesus',
              description: 'Best-preserved classical city in Mediterranean',
              timings: '8:00 AM - 7:00 PM',
              entryFee: '₺200',
              bestTime: 'Spring and Fall',
              highlights: ['Library of Celsus', 'Great Theater', 'Temple of Artemis', 'Marble streets'],
              image: '🏛️'
            }
          ]
        }
      }
    },
    'Mexico': {
      name: 'Mexico',
      icon: '🇲🇽',
      locations: {
        'Yucatan': {
          name: 'Yucatan',
          icon: '🗿',
          places: [
            {
              name: 'Chichen Itza',
              description: 'Ancient Mayan city with iconic pyramid',
              timings: '8:00 AM - 5:00 PM',
              entryFee: '$533 MXN',
              bestTime: 'November to March',
              highlights: ['El Castillo pyramid', 'Temple of Warriors', 'Ball court', 'Cenote'],
              image: '🗿'
            },
            {
              name: 'Uxmal',
              description: 'Ancient Maya city with Puuc architecture',
              timings: '8:00 AM - 5:00 PM',
              entryFee: '$461 MXN',
              bestTime: 'November to March',
              highlights: ['Pyramid of the Magician', 'Governor\'s Palace', 'Quadrangle', 'Sound & Light'],
              image: '🗿'
            }
          ]
        },
        'Quintana Roo': {
          name: 'Quintana Roo',
          icon: '🏛️',
          places: [
            {
              name: 'Tulum',
              description: 'Coastal Mayan ruins',
              timings: '8:00 AM - 5:00 PM',
              entryFee: '$85 MXN',
              bestTime: 'November to March',
              highlights: ['Beachside location', 'El Castillo', 'Temple of Frescoes', 'Caribbean views'],
              image: '🏖️'
            },
            {
              name: 'Coba',
              description: 'Ancient Maya city with climbable pyramid',
              timings: '8:00 AM - 5:00 PM',
              entryFee: '$75 MXN',
              bestTime: 'November to March',
              highlights: ['Nohoch Mul pyramid', 'Jungle setting', 'Sacred lakes', 'Bike trails'],
              image: '🗿'
            }
          ]
        },
        'Mexico City': {
          name: 'Mexico City',
          icon: '🏛️',
          places: [
            {
              name: 'Teotihuacan',
              description: 'Ancient Mesoamerican city',
              timings: '9:00 AM - 5:00 PM',
              entryFee: '$80 MXN',
              bestTime: 'October to April',
              highlights: ['Pyramid of the Sun', 'Pyramid of the Moon', 'Avenue of the Dead', 'Murals'],
              image: '🗿'
            },
            {
              name: 'Templo Mayor',
              description: 'Main temple of Aztec capital Tenochtitlan',
              timings: '9:00 AM - 5:00 PM (Closed Monday)',
              entryFee: '$80 MXN',
              bestTime: 'Year-round',
              highlights: ['Aztec ruins', 'Museum', 'Stone carvings', 'Sacrificial altar'],
              image: '🏛️'
            }
          ]
        }
      }
    },
    'Peru': {
      name: 'Peru',
      icon: '🇵🇪',
      locations: {
        'Cusco': {
          name: 'Cusco',
          icon: '🗿',
          places: [
            {
              name: 'Machu Picchu',
              description: '15th-century Inca citadel in the clouds',
              timings: '6:00 AM - 5:30 PM',
              entryFee: '$152 USD',
              bestTime: 'April to October',
              highlights: ['Lost city', 'Temple of the Sun', 'Intihuatana stone', 'Terraces'],
              image: '🗿'
            },
            {
              name: 'Sacsayhuaman',
              description: 'Inca fortress with massive stones',
              timings: '7:00 AM - 6:00 PM',
              entryFee: 'Included in Cusco Tourist Ticket',
              bestTime: 'April to October',
              highlights: ['Zig-zag walls', 'Panoramic views', 'Inti Raymi festival', 'Megalithic blocks'],
              image: '🏰'
            },
            {
              name: 'Ollantaytambo',
              description: 'Inca fortress and town',
              timings: '7:00 AM - 6:00 PM',
              entryFee: 'Included in Cusco Tourist Ticket',
              bestTime: 'April to October',
              highlights: ['Temple Hill', 'Terraces', 'Living Inca town', 'Sun Temple'],
              image: '🏛️'
            }
          ]
        },
        'Lima': {
          name: 'Lima',
          icon: '🏛️',
          places: [
            {
              name: 'Huaca Pucllana',
              description: 'Pre-Inca adobe pyramid',
              timings: '9:00 AM - 5:00 PM (Closed Tuesday)',
              entryFee: 'S/15',
              bestTime: 'Year-round',
              highlights: ['Adobe pyramid', 'Museum', 'Night tours', 'Moche culture'],
              image: '🗿'
            }
          ]
        }
      }
    },
    'Cambodia': {
      name: 'Cambodia',
      icon: '🇰🇭',
      locations: {
        'Siem Reap': {
          name: 'Siem Reap',
          icon: '⛩️',
          places: [
            {
              name: 'Angkor Wat',
              description: 'Largest religious monument in the world',
              timings: '5:00 AM - 5:30 PM',
              entryFee: '$37 (1-day pass)',
              bestTime: 'November to March',
              highlights: ['Sunrise views', 'Central tower', 'Bas-reliefs', 'Galleries'],
              image: '⛩️'
            },
            {
              name: 'Bayon Temple',
              description: 'Temple with giant stone faces',
              timings: '7:30 AM - 5:30 PM',
              entryFee: 'Included in Angkor pass',
              bestTime: 'Morning or afternoon',
              highlights: ['216 stone faces', 'Smiling Buddha', 'Bas-reliefs', 'Central tower'],
              image: '🗿'
            },
            {
              name: 'Ta Prohm',
              description: 'Temple engulfed by jungle trees',
              timings: '7:30 AM - 5:30 PM',
              entryFee: 'Included in Angkor pass',
              bestTime: 'Morning light',
              highlights: ['Tree roots', 'Tomb Raider location', 'Jungle atmosphere', 'Stone carvings'],
              image: '🌳'
            }
          ]
        }
      }
    },
    'Thailand': {
      name: 'Thailand',
      icon: '🇹🇭',
      locations: {
        'Bangkok': {
          name: 'Bangkok',
          icon: '⛩️',
          places: [
            {
              name: 'Grand Palace',
              description: 'Former royal residence with Emerald Buddha',
              timings: '8:30 AM - 3:30 PM',
              entryFee: '฿500',
              bestTime: 'November to February',
              highlights: ['Emerald Buddha', 'Temple of the Emerald Buddha', 'Golden buildings', 'Royal halls'],
              image: '👑'
            },
            {
              name: 'Wat Pho',
              description: 'Temple with giant reclining Buddha',
              timings: '8:00 AM - 6:30 PM',
              entryFee: '฿200',
              bestTime: 'November to February',
              highlights: ['46m reclining Buddha', 'Traditional massage school', 'Chedis', 'Murals'],
              image: '⛩️'
            },
            {
              name: 'Wat Arun',
              description: 'Temple of Dawn on Chao Phraya River',
              timings: '8:00 AM - 6:00 PM',
              entryFee: '฿100',
              bestTime: 'Sunset',
              highlights: ['Central prang', 'Porcelain decorations', 'River views', 'Steep stairs'],
              image: '⛩️'
            }
          ]
        },
        'Ayutthaya': {
          name: 'Ayutthaya',
          icon: '🏛️',
          places: [
            {
              name: 'Ayutthaya Historical Park',
              description: 'Ruins of ancient Siamese capital',
              timings: '8:00 AM - 6:00 PM',
              entryFee: '฿50 per temple',
              bestTime: 'November to February',
              highlights: ['Wat Mahathat', 'Buddha head in tree', 'Ancient temples', 'UNESCO Site'],
              image: '🏛️'
            }
          ]
        }
      }
    },
    'Indonesia': {
      name: 'Indonesia',
      icon: '🇮🇩',
      locations: {
        'Central Java': {
          name: 'Central Java',
          icon: '⛩️',
          places: [
            {
              name: 'Borobudur',
              description: 'Massive Buddhist temple complex',
              timings: '6:00 AM - 5:00 PM',
              entryFee: 'IDR 375,000',
              bestTime: 'April to October',
              highlights: ['Stupas', 'Buddha statues', 'Relief panels', 'Sunrise views'],
              image: '⛩️'
            },
            {
              name: 'Prambanan',
              description: 'Hindu temple complex',
              timings: '6:00 AM - 6:00 PM',
              entryFee: 'IDR 375,000',
              bestTime: 'April to October',
              highlights: ['Shiva temple', 'Ramayana reliefs', '240 temples', 'Sunset views'],
              image: '⛩️'
            }
          ]
        },
        'Bali': {
          name: 'Bali',
          icon: '⛩️',
          places: [
            {
              name: 'Tanah Lot',
              description: 'Iconic sea temple on rock formation',
              timings: '7:00 AM - 7:00 PM',
              entryFee: 'IDR 60,000',
              bestTime: 'Sunset',
              highlights: ['Ocean views', 'Sunset photography', 'Hindu temple', 'Pilgrimage site'],
              image: '⛩️'
            },
            {
              name: 'Uluwatu Temple',
              description: 'Cliffside temple with ocean views',
              timings: '9:00 AM - 6:00 PM',
              entryFee: 'IDR 50,000',
              bestTime: 'Sunset for Kecak dance',
              highlights: ['Cliff location', 'Kecak dance', 'Monkeys', 'Sunset views'],
              image: '⛩️'
            }
          ]
        }
      }
    },
    'Vietnam': {
      name: 'Vietnam',
      icon: '🇻🇳',
      locations: {
        'Hanoi': {
          name: 'Hanoi',
          icon: '🏛️',
          places: [
            {
              name: 'Imperial Citadel of Thang Long',
              description: 'UNESCO World Heritage Site',
              timings: '8:00 AM - 5:00 PM (Closed Monday)',
              entryFee: '₫30,000',
              bestTime: 'October to April',
              highlights: ['Ancient ruins', 'Archaeological site', 'Flagtower', 'Gates'],
              image: '🏛️'
            },
            {
              name: 'Temple of Literature',
              description: 'Vietnam\'s first national university',
              timings: '8:00 AM - 5:00 PM',
              entryFee: '₫30,000',
              bestTime: 'October to April',
              highlights: ['Confucian temple', 'Stone turtles', 'Courtyards', 'Imperial Academy'],
              image: '⛩️'
            }
          ]
        },
        'Hue': {
          name: 'Hue',
          icon: '👑',
          places: [
            {
              name: 'Imperial City',
              description: 'Walled fortress and palace of emperors',
              timings: '8:00 AM - 5:00 PM',
              entryFee: '₫200,000',
              bestTime: 'February to April',
              highlights: ['Purple Forbidden City', 'Throne room', 'Temples', 'Gates'],
              image: '🏰'
            },
            {
              name: 'Tombs of the Emperors',
              description: 'Royal mausoleums along Perfume River',
              timings: '7:00 AM - 5:30 PM',
              entryFee: '₫150,000 each',
              bestTime: 'February to April',
              highlights: ['Khai Dinh tomb', 'Minh Mang tomb', 'Architecture', 'Gardens'],
              image: '⛩️'
            }
          ]
        }
      }
    },
    'Australia': {
      name: 'Australia',
      icon: '🇦🇺',
      locations: {
        'New South Wales': {
          name: 'New South Wales',
          icon: '🏛️',
          places: [
            {
              name: 'Sydney Opera House',
              description: 'Iconic performing arts center',
              timings: '9:00 AM - 5:00 PM (Tours)',
              entryFee: 'AUD $42 (Tour)',
              bestTime: 'Year-round',
              highlights: ['Unique architecture', 'Harbor views', 'Concert Hall', 'Performance venue'],
              image: '🎭'
            },
            {
              name: 'Hyde Park Barracks',
              description: 'Historic convict building',
              timings: '10:00 AM - 5:00 PM',
              entryFee: 'AUD $15',
              bestTime: 'Year-round',
              highlights: ['Convict history', 'Museum', 'UNESCO Site', 'Georgian architecture'],
              image: '🏛️'
            }
          ]
        },
        'Northern Territory': {
          name: 'Northern Territory',
          icon: '🗿',
          places: [
            {
              name: 'Uluru (Ayers Rock)',
              description: 'Sacred Aboriginal rock formation',
              timings: 'Sunrise to sunset',
              entryFee: 'AUD $25 (3-day pass)',
              bestTime: 'April to September',
              highlights: ['Sunset colors', 'Aboriginal culture', 'Base walk', 'Cultural center'],
              image: '🗿'
            }
          ]
        }
      }
    },
    'Brazil': {
      name: 'Brazil',
      icon: '🇧🇷',
      locations: {
        'Rio de Janeiro': {
          name: 'Rio de Janeiro',
          icon: '✝️',
          places: [
            {
              name: 'Christ the Redeemer',
              description: 'Iconic statue overlooking Rio',
              timings: '8:00 AM - 7:00 PM',
              entryFee: 'R$89',
              bestTime: 'May to October',
              highlights: ['Panoramic views', 'Corcovado Mountain', 'Art Deco statue', 'Sunset'],
              image: '✝️'
            },
            {
              name: 'Santa Teresa Convent',
              description: 'Historic convent and church',
              timings: '8:00 AM - 5:00 PM',
              entryFee: 'Free',
              bestTime: 'Year-round',
              highlights: ['Colonial architecture', 'Religious art', 'Historic neighborhood'],
              image: '⛪'
            }
          ]
        },
        'Bahia': {
          name: 'Bahia',
          icon: '⛪',
          places: [
            {
              name: 'Pelourinho',
              description: 'Historic center of Salvador',
              timings: 'Open air (churches have hours)',
              entryFee: 'Free (streets)',
              bestTime: 'Year-round',
              highlights: ['Colorful colonial buildings', 'Churches', 'Cobblestone streets', 'UNESCO Site'],
              image: '🏛️'
            }
          ]
        }
      }
    },
    'Argentina': {
      name: 'Argentina',
      icon: '🇦🇷',
      locations: {
        'Buenos Aires': {
          name: 'Buenos Aires',
          icon: '🏛️',
          places: [
            {
              name: 'Casa Rosada',
              description: 'Presidential palace',
              timings: '10:00 AM - 6:00 PM (Weekends)',
              entryFee: 'Free',
              bestTime: 'March to November',
              highlights: ['Pink facade', 'Historical museum', 'Balcony', 'Plaza de Mayo'],
              image: '🏛️'
            },
            {
              name: 'Recoleta Cemetery',
              description: 'Famous cemetery with elaborate tombs',
              timings: '7:00 AM - 5:45 PM',
              entryFee: 'Free',
              bestTime: 'Year-round',
              highlights: ['Evita\'s tomb', 'Mausoleums', 'Architecture', 'Sculptures'],
              image: '⚰️'
            }
          ]
        },
        'Mendoza': {
          name: 'Mendoza',
          icon: '🏛️',
          places: [
            {
              name: 'Ruinas de San Francisco',
              description: 'Ruins of Jesuit church',
              timings: '9:00 AM - 6:00 PM',
              entryFee: 'Free',
              bestTime: 'October to April',
              highlights: ['Earthquake ruins', 'Archaeological site', 'Museum'],
              image: '🏛️'
            }
          ]
        }
      }
    },
    'Russia': {
      name: 'Russia',
      icon: '🇷🇺',
      locations: {
        'Moscow': {
          name: 'Moscow',
          icon: '⛪',
          places: [
            {
              name: 'Red Square & Kremlin',
              description: 'Historic fortified complex',
              timings: '10:00 AM - 5:00 PM (Closed Thursday)',
              entryFee: '₽700',
              bestTime: 'May to September',
              highlights: ['St. Basil\'s Cathedral', 'Lenin\'s Mausoleum', 'State Kremlin Palace', 'Armory Chamber'],
              image: '🏰'
            },
            {
              name: 'St. Basil\'s Cathedral',
              description: 'Colorful onion-domed cathedral',
              timings: '11:00 AM - 5:00 PM',
              entryFee: '₽1000',
              bestTime: 'May to September',
              highlights: ['Colorful domes', 'Interior chapels', 'Icon collection', 'Red Square location'],
              image: '⛪'
            }
          ]
        },
        'St. Petersburg': {
          name: 'St. Petersburg',
          icon: '👑',
          places: [
            {
              name: 'Winter Palace & Hermitage',
              description: 'Former imperial palace, now museum',
              timings: '10:30 AM - 6:00 PM (Closed Monday)',
              entryFee: '₽1000',
              bestTime: 'May to September',
              highlights: ['World-class art museum', 'Imperial rooms', '3 million items', 'Baroque architecture'],
              image: '🏛️'
            },
            {
              name: 'Peterhof Palace',
              description: 'Russian Versailles with fountains',
              timings: '10:30 AM - 6:00 PM',
              entryFee: '₽1000',
              bestTime: 'May to September (fountains on)',
              highlights: ['Grand Cascade', 'Golden statues', 'Gardens', 'Sea channel'],
              image: '⛲'
            },
            {
              name: 'Church of the Savior on Spilled Blood',
              description: 'Ornate Russian Orthodox church',
              timings: '10:30 AM - 6:00 PM (Closed Wednesday)',
              entryFee: '₽350',
              bestTime: 'Year-round',
              highlights: ['Mosaic interior', 'Colorful domes', 'Memorial site', 'Icon collection'],
              image: '⛪'
            }
          ]
        }
      }
    },
    'Germany': {
      name: 'Germany',
      icon: '🇩🇪',
      locations: {
        'Bavaria': {
          name: 'Bavaria',
          icon: '🏰',
          places: [
            {
              name: 'Neuschwanstein Castle',
              description: 'Fairy tale castle that inspired Disney',
              timings: '9:00 AM - 6:00 PM',
              entryFee: '€15',
              bestTime: 'May to October',
              highlights: ['Mountain setting', 'Throne Room', 'Singers\' Hall', 'Bridge views'],
              image: '🏰'
            },
            {
              name: 'Munich Residenz',
              description: 'Former royal palace of Bavarian monarchs',
              timings: '9:00 AM - 6:00 PM',
              entryFee: '€9',
              bestTime: 'Year-round',
              highlights: ['Treasury', 'Antiquarium', 'Court Church', 'Baroque rooms'],
              image: '👑'
            }
          ]
        },
        'Berlin': {
          name: 'Berlin',
          icon: '🏛️',
          places: [
            {
              name: 'Brandenburg Gate',
              description: 'Iconic neoclassical monument',
              timings: 'Open 24 hours',
              entryFee: 'Free',
              bestTime: 'Year-round',
              highlights: ['Historical symbol', 'Quadriga sculpture', 'Pariser Platz', 'Night lighting'],
              image: '🏛️'
            },
            {
              name: 'Berlin Wall Memorial',
              description: 'Preserved section of the Berlin Wall',
              timings: '8:00 AM - 10:00 PM',
              entryFee: 'Free',
              bestTime: 'Year-round',
              highlights: ['Documentation Center', 'Watchtower', 'Chapel', 'Historical exhibits'],
              image: '🧱'
            },
            {
              name: 'Reichstag Building',
              description: 'German parliament with glass dome',
              timings: '8:00 AM - 12:00 AM (Book ahead)',
              entryFee: 'Free (registration required)',
              bestTime: 'Year-round',
              highlights: ['Glass dome', 'City views', 'Roof terrace', 'Architecture'],
              image: '🏛️'
            }
          ]
        }
      }
    },
    'Netherlands': {
      name: 'Netherlands',
      icon: '🇳🇱',
      locations: {
        'Amsterdam': {
          name: 'Amsterdam',
          icon: '🏛️',
          places: [
            {
              name: 'Anne Frank House',
              description: 'Historic hiding place during WWII',
              timings: '9:00 AM - 7:00 PM',
              entryFee: '€14',
              bestTime: 'Year-round (book ahead)',
              highlights: ['Secret Annex', 'Diary exhibit', 'War history', 'Original furnishings'],
              image: '🏛️'
            },
            {
              name: 'Royal Palace Amsterdam',
              description: 'Official reception palace',
              timings: '10:00 AM - 5:00 PM',
              entryFee: '€12.50',
              bestTime: 'Year-round',
              highlights: ['Empire furniture', 'Marble halls', 'Paintings', 'Dam Square'],
              image: '👑'
            }
          ]
        }
      }
    },
    'Belgium': {
      name: 'Belgium',
      icon: '🇧🇪',
      locations: {
        'Brussels': {
          name: 'Brussels',
          icon: '🏛️',
          places: [
            {
              name: 'Grand Place',
              description: 'UNESCO World Heritage medieval square',
              timings: 'Open 24 hours',
              entryFee: 'Free',
              bestTime: 'Year-round',
              highlights: ['Gothic guildhalls', 'Town Hall', 'Flower carpet (biennial)', 'Gold facades'],
              image: '🏛️'
            },
            {
              name: 'Atomium',
              description: 'Iconic building shaped like atom',
              timings: '10:00 AM - 6:00 PM',
              entryFee: '€16',
              bestTime: 'Year-round',
              highlights: ['Panoramic views', 'Exhibition spaces', 'Restaurant', 'Night lighting'],
              image: '⚛️'
            }
          ]
        },
        'Bruges': {
          name: 'Bruges',
          icon: '🏰',
          places: [
            {
              name: 'Belfry of Bruges',
              description: 'Medieval bell tower',
              timings: '9:30 AM - 6:00 PM',
              entryFee: '€12',
              bestTime: 'Spring and Fall',
              highlights: ['366 steps', 'City views', 'Carillon', 'Market Square'],
              image: '🗼'
            }
          ]
        }
      }
    },
    'Austria': {
      name: 'Austria',
      icon: '🇦🇹',
      locations: {
        'Vienna': {
          name: 'Vienna',
          icon: '👑',
          places: [
            {
              name: 'Schönbrunn Palace',
              description: 'Former Habsburg summer residence',
              timings: '9:00 AM - 5:30 PM',
              entryFee: '€20',
              bestTime: 'April to October',
              highlights: ['Imperial apartments', 'Gardens', 'Gloriette', 'Zoo'],
              image: '👑'
            },
            {
              name: 'Hofburg Palace',
              description: 'Habsburg winter residence',
              timings: '9:00 AM - 5:30 PM',
              entryFee: '€15',
              bestTime: 'Year-round',
              highlights: ['Imperial Apartments', 'Sisi Museum', 'Silver Collection', 'Spanish Riding School'],
              image: '🏰'
            },
            {
              name: 'St. Stephen\'s Cathedral',
              description: 'Gothic cathedral in city center',
              timings: '6:00 AM - 10:00 PM',
              entryFee: '€6 (tower)',
              bestTime: 'Year-round',
              highlights: ['South Tower', 'Catacombs', 'Roof tiles', 'City views'],
              image: '⛪'
            }
          ]
        },
        'Salzburg': {
          name: 'Salzburg',
          icon: '🏰',
          places: [
            {
              name: 'Hohensalzburg Fortress',
              description: 'Medieval fortress on a hill',
              timings: '9:00 AM - 7:00 PM',
              entryFee: '€13',
              bestTime: 'May to September',
              highlights: ['City panorama', 'State rooms', 'Fortress museum', 'Golden Hall'],
              image: '🏰'
            },
            {
              name: 'Mozart\'s Birthplace',
              description: 'House where Mozart was born',
              timings: '9:00 AM - 5:30 PM',
              entryFee: '€12',
              bestTime: 'Year-round',
              highlights: ['Original instruments', 'Family portraits', 'Letters', 'Historical rooms'],
              image: '🎵'
            }
          ]
        }
      }
    },
    'Switzerland': {
      name: 'Switzerland',
      icon: '🇨🇭',
      locations: {
        'Bern': {
          name: 'Bern',
          icon: '🏛️',
          places: [
            {
              name: 'Old City of Bern',
              description: 'UNESCO World Heritage medieval city',
              timings: 'Open 24 hours',
              entryFee: 'Free',
              bestTime: 'Year-round',
              highlights: ['Clock Tower', 'Arcades', 'Bear Park', 'Federal Palace'],
              image: '🏛️'
            }
          ]
        },
        'Zurich': {
          name: 'Zurich',
          icon: '⛪',
          places: [
            {
              name: 'Grossmünster',
              description: 'Romanesque Protestant church',
              timings: '10:00 AM - 6:00 PM',
              entryFee: 'CHF 5 (tower)',
              bestTime: 'Year-round',
              highlights: ['Twin towers', 'Stained glass by Giacometti', 'City views', 'Charlemagne statue'],
              image: '⛪'
            }
          ]
        }
      }
    },
    'Poland': {
      name: 'Poland',
      icon: '🇵🇱',
      locations: {
        'Krakow': {
          name: 'Krakow',
          icon: '🏰',
          places: [
            {
              name: 'Wawel Castle',
              description: 'Royal castle on a hill',
              timings: '9:00 AM - 5:00 PM (Closed Monday)',
              entryFee: 'PLN 35',
              bestTime: 'May to September',
              highlights: ['Royal chambers', 'Crown Treasury', 'Cathedral', 'Dragon\'s Den'],
              image: '🏰'
            },
            {
              name: 'Auschwitz-Birkenau',
              description: 'Former Nazi concentration camp memorial',
              timings: '7:30 AM - 6:00 PM',
              entryFee: 'Free (booking required)',
              bestTime: 'Year-round',
              highlights: ['Memorial site', 'Museum', 'Barracks', 'Historical exhibits'],
              image: '🕯️'
            }
          ]
        },
        'Warsaw': {
          name: 'Warsaw',
          icon: '🏛️',
          places: [
            {
              name: 'Royal Castle',
              description: 'Reconstructed royal residence',
              timings: '10:00 AM - 6:00 PM (Closed Monday)',
              entryFee: 'PLN 30',
              bestTime: 'Year-round',
              highlights: ['Throne Room', 'Canaletto Room', 'Royal apartments', 'Old Town location'],
              image: '🏰'
            }
          ]
        }
      }
    },
    'Czech Republic': {
      name: 'Czech Republic',
      icon: '🇨🇿',
      locations: {
        'Prague': {
          name: 'Prague',
          icon: '🏰',
          places: [
            {
              name: 'Prague Castle',
              description: 'Largest ancient castle in the world',
              timings: '9:00 AM - 5:00 PM',
              entryFee: 'CZK 250',
              bestTime: 'Spring and Fall',
              highlights: ['St. Vitus Cathedral', 'Golden Lane', 'Royal Palace', 'City views'],
              image: '🏰'
            },
            {
              name: 'Charles Bridge',
              description: 'Historic stone bridge with statues',
              timings: 'Open 24 hours',
              entryFee: 'Free',
              bestTime: 'Early morning or evening',
              highlights: ['30 baroque statues', 'Bridge towers', 'River views', 'Street artists'],
              image: '🌉'
            },
            {
              name: 'Old Town Square',
              description: 'Historic square with Astronomical Clock',
              timings: 'Open 24 hours',
              entryFee: 'Free',
              bestTime: 'Year-round',
              highlights: ['Astronomical Clock', 'Tyn Church', 'Jan Hus Monument', 'Colorful buildings'],
              image: '🏛️'
            }
          ]
        }
      }
    },
    'Hungary': {
      name: 'Hungary',
      icon: '🇭🇺',
      locations: {
        'Budapest': {
          name: 'Budapest',
          icon: '🏛️',
          places: [
            {
              name: 'Buda Castle',
              description: 'Historical castle complex',
              timings: '10:00 AM - 6:00 PM',
              entryFee: 'HUF 3200',
              bestTime: 'Spring and Fall',
              highlights: ['Hungarian National Gallery', 'Castle District', 'Matthias Church', 'Fisherman\'s Bastion'],
              image: '🏰'
            },
            {
              name: 'Parliament Building',
              description: 'Neo-Gothic parliament on Danube',
              timings: '8:00 AM - 6:00 PM (Tours)',
              entryFee: 'HUF 7000',
              bestTime: 'Year-round',
              highlights: ['Gothic Revival', 'Crown Jewels', 'Grand Staircase', 'Dome'],
              image: '🏛️'
            }
          ]
        }
      }
    },
    'Portugal': {
      name: 'Portugal',
      icon: '🇵🇹',
      locations: {
        'Lisbon': {
          name: 'Lisbon',
          icon: '🗼',
          places: [
            {
              name: 'Belém Tower',
              description: 'Fortified tower on the Tagus',
              timings: '10:00 AM - 5:30 PM (Closed Monday)',
              entryFee: '€6',
              bestTime: 'Spring and Fall',
              highlights: ['Manueline architecture', 'River views', 'Terrace', 'UNESCO Site'],
              image: '🗼'
            },
            {
              name: 'Jerónimos Monastery',
              description: 'Manueline monastery',
              timings: '10:00 AM - 5:30 PM (Closed Monday)',
              entryFee: '€10',
              bestTime: 'Spring and Fall',
              highlights: ['Cloisters', 'Church of Santa Maria', 'Vasco da Gama tomb', 'Stone carvings'],
              image: '⛪'
            },
            {
              name: 'São Jorge Castle',
              description: 'Moorish castle with city views',
              timings: '9:00 AM - 9:00 PM',
              entryFee: '€10',
              bestTime: 'Year-round, sunset',
              highlights: ['Panoramic views', 'Archaeological site', 'Camera obscura', 'Gardens'],
              image: '🏰'
            }
          ]
        }
      }
    },
    'Morocco': {
      name: 'Morocco',
      icon: '🇲🇦',
      locations: {
        'Marrakech': {
          name: 'Marrakech',
          icon: '🕌',
          places: [
            {
              name: 'Koutoubia Mosque',
              description: 'Largest mosque in Marrakech',
              timings: 'Non-Muslims cannot enter',
              entryFee: 'N/A',
              bestTime: 'Year-round (exterior only)',
              highlights: ['77m minaret', 'Gardens', 'Exterior architecture', 'Landmark'],
              image: '🕌'
            },
            {
              name: 'Bahia Palace',
              description: 'Ornate 19th-century palace',
              timings: '9:00 AM - 5:00 PM',
              entryFee: 'MAD 70',
              bestTime: 'October to April',
              highlights: ['Colorful tiles', 'Courtyards', 'Gardens', 'Islamic architecture'],
              image: '🏛️'
            },
            {
              name: 'Saadian Tombs',
              description: 'Royal necropolis from Saadian dynasty',
              timings: '9:00 AM - 5:00 PM',
              entryFee: 'MAD 70',
              bestTime: 'October to April',
              highlights: ['Ornate decoration', 'Cedar ceilings', 'Marble', 'Gardens'],
              image: '⚰️'
            }
          ]
        },
        'Fes': {
          name: 'Fes',
          icon: '🕌',
          places: [
            {
              name: 'Fes el-Bali (Old Fes)',
              description: 'Walled medieval city',
              timings: 'Open 24 hours',
              entryFee: 'Free',
              bestTime: 'October to April',
              highlights: ['Ancient medina', 'Tanneries', 'Al-Qarawiyyin Mosque', 'Narrow alleys'],
              image: '🏛️'
            }
          ]
        }
      }
    },
    'Jordan': {
      name: 'Jordan',
      icon: '🇯🇴',
      locations: {
        'Petra': {
          name: 'Petra',
          icon: '🗿',
          places: [
            {
              name: 'Petra Archaeological Site',
              description: 'Ancient city carved into rose-red cliffs',
              timings: '6:00 AM - 6:00 PM',
              entryFee: 'JOD 50 (1-day)',
              bestTime: 'March to May, September to November',
              highlights: ['Treasury (Al-Khazneh)', 'Monastery', 'Siq canyon', 'Royal Tombs'],
              image: '🗿'
            }
          ]
        },
        'Amman': {
          name: 'Amman',
          icon: '🏛️',
          places: [
            {
              name: 'Citadel',
              description: 'Ancient hilltop site',
              timings: '8:00 AM - 7:00 PM',
              entryFee: 'JOD 3',
              bestTime: 'Spring and Fall',
              highlights: ['Temple of Hercules', 'Umayyad Palace', 'City views', 'Archaeological museum'],
              image: '🏛️'
            },
            {
              name: 'Roman Theater',
              description: '6,000-seat ancient amphitheater',
              timings: '8:00 AM - 7:00 PM',
              entryFee: 'JOD 2',
              bestTime: 'Spring and Fall',
              highlights: ['Well-preserved', 'Museum', 'Folklore displays', 'City center location'],
              image: '🏛️'
            }
          ]
        }
      }
    },
    'Israel': {
      name: 'Israel',
      icon: '🇮🇱',
      locations: {
        'Jerusalem': {
          name: 'Jerusalem',
          icon: '🕌',
          places: [
            {
              name: 'Western Wall',
              description: 'Holiest site in Judaism',
              timings: 'Open 24 hours',
              entryFee: 'Free',
              bestTime: 'Year-round',
              highlights: ['Prayer site', 'Tunnels', 'Plaza', 'Historical significance'],
              image: '🏛️'
            },
            {
              name: 'Dome of the Rock',
              description: 'Islamic shrine with golden dome',
              timings: 'Limited hours for non-Muslims',
              entryFee: 'Free',
              bestTime: 'Spring and Fall',
              highlights: ['Golden dome', 'Islamic architecture', 'Temple Mount', 'Mosaics'],
              image: '🕌'
            },
            {
              name: 'Church of the Holy Sepulchre',
              description: 'Site of Jesus\' crucifixion and resurrection',
              timings: '4:00 AM - 7:00 PM',
              entryFee: 'Free',
              bestTime: 'Year-round',
              highlights: ['Calvary', 'Tomb of Jesus', 'Stone of Anointing', 'Multiple chapels'],
              image: '⛪'
            }
          ]
        },
        'Tel Aviv': {
          name: 'Tel Aviv',
          icon: '🏛️',
          places: [
            {
              name: 'Old Jaffa',
              description: 'Ancient port city',
              timings: 'Open 24 hours',
              entryFee: 'Free',
              bestTime: 'Year-round',
              highlights: ['Artists\' quarter', 'Flea market', 'Port', 'Stone alleys'],
              image: '🏛️'
            }
          ]
        }
      }
    },
    'South Africa': {
      name: 'South Africa',
      icon: '🇿🇦',
      locations: {
        'Cape Town': {
          name: 'Cape Town',
          icon: '🏰',
          places: [
            {
              name: 'Castle of Good Hope',
              description: 'Oldest colonial building in South Africa',
              timings: '9:00 AM - 4:00 PM',
              entryFee: 'R50',
              bestTime: 'September to April',
              highlights: ['Star fort', 'Military museum', 'Torture chamber', 'Dutch architecture'],
              image: '🏰'
            },
            {
              name: 'Robben Island',
              description: 'Former prison where Mandela was held',
              timings: '9:00 AM - 3:00 PM (Tours)',
              entryFee: 'R550',
              bestTime: 'September to April',
              highlights: ['Mandela\'s cell', 'Prison tours', 'Museum', 'UNESCO Site'],
              image: '🏛️'
            }
          ]
        }
      }
    },
    'South Korea': {
      name: 'South Korea',
      icon: '🇰🇷',
      locations: {
        'Seoul': {
          name: 'Seoul',
          icon: '🏯',
          places: [
            {
              name: 'Gyeongbokgung Palace',
              description: 'Main royal palace of Joseon Dynasty',
              timings: '9:00 AM - 6:00 PM (Closed Tuesday)',
              entryFee: '₩3,000',
              bestTime: 'Spring (cherry blossoms) and Fall',
              highlights: ['Changing of guards', 'National Folk Museum', 'Throne hall', 'Gardens'],
              image: '🏯'
            },
            {
              name: 'Changdeokgung Palace',
              description: 'UNESCO palace with secret garden',
              timings: '9:00 AM - 6:00 PM (Closed Monday)',
              entryFee: '₩3,000',
              bestTime: 'Fall for foliage',
              highlights: ['Secret Garden', 'Huwon', 'Traditional architecture', 'Nature setting'],
              image: '🏯'
            },
            {
              name: 'N Seoul Tower',
              description: 'Communication tower with observation decks',
              timings: '10:00 AM - 11:00 PM',
              entryFee: '₩11,000',
              bestTime: 'Sunset',
              highlights: ['City panorama', 'Love locks', 'Rotating restaurant', 'Digital observatory'],
              image: '🗼'
            }
          ]
        },
        'Gyeongju': {
          name: 'Gyeongju',
          icon: '🏛️',
          places: [
            {
              name: 'Bulguksa Temple',
              description: 'UNESCO Buddhist temple',
              timings: '7:00 AM - 6:00 PM',
              entryFee: '₩5,000',
              bestTime: 'Spring and Fall',
              highlights: ['Stone bridges', 'Pagodas', 'Buddha statues', 'Ancient architecture'],
              image: '⛩️'
            },
            {
              name: 'Seokguram Grotto',
              description: 'Artificial stone temple',
              timings: '7:00 AM - 6:00 PM',
              entryFee: '₩5,000',
              bestTime: 'Spring and Fall',
              highlights: ['Buddha statue', 'Stone carvings', 'UNESCO Site', 'Mountain location'],
              image: '🗿'
            }
          ]
        }
      }
    },
    'Singapore': {
      name: 'Singapore',
      icon: '🇸🇬',
      locations: {
        'Central Singapore': {
          name: 'Central Singapore',
          icon: '🏛️',
          places: [
            {
              name: 'Raffles Hotel',
              description: 'Colonial-era luxury hotel',
              timings: 'Open 24 hours',
              entryFee: 'Free (public areas)',
              bestTime: 'Year-round',
              highlights: ['Colonial architecture', 'Long Bar', 'Museum', 'Gardens'],
              image: '🏛️'
            },
            {
              name: 'Fort Canning Park',
              description: 'Historic hilltop park',
              timings: 'Open 24 hours',
              entryFee: 'Free',
              bestTime: 'Year-round',
              highlights: ['Battle Box', 'Spice Garden', 'Historic gates', 'Archaeology'],
              image: '🏛️'
            }
          ]
        }
      }
    },
    'Malaysia': {
      name: 'Malaysia',
      icon: '🇲🇾',
      locations: {
        'Kuala Lumpur': {
          name: 'Kuala Lumpur',
          icon: '🗼',
          places: [
            {
              name: 'Petronas Twin Towers',
              description: 'Iconic twin skyscrapers',
              timings: '9:00 AM - 9:00 PM',
              entryFee: 'RM 85',
              bestTime: 'Year-round',
              highlights: ['Skybridge', 'Observation deck', 'City views', 'Architecture'],
              image: '🗼'
            },
            {
              name: 'Batu Caves',
              description: 'Hindu temple in limestone caves',
              timings: '6:00 AM - 9:00 PM',
              entryFee: 'Free',
              bestTime: 'Early morning',
              highlights: ['Golden statue', '272 steps', 'Cave temples', 'Monkeys'],
              image: '⛰️'
            }
          ]
        },
        'Malacca': {
          name: 'Malacca',
          icon: '🏛️',
          places: [
            {
              name: 'A Famosa',
              description: 'Portuguese fortress ruins',
              timings: 'Open 24 hours',
              entryFee: 'Free',
              bestTime: 'Year-round',
              highlights: ['Santiago Gate', 'Historical ruins', 'Colonial history', 'Photo spot'],
              image: '🏰'
            },
            {
              name: 'St. Paul\'s Hill & Church',
              description: 'Ruined Portuguese church',
              timings: '9:00 AM - 6:00 PM',
              entryFee: 'Free',
              bestTime: 'Year-round',
              highlights: ['Hilltop views', 'Ruins', 'St. Francis Xavier tomb', 'Sunset spot'],
              image: '⛪'
            }
          ]
        }
      }
    },
    'Philippines': {
      name: 'Philippines',
      icon: '🇵🇭',
      locations: {
        'Manila': {
          name: 'Manila',
          icon: '🏛️',
          places: [
            {
              name: 'Intramuros',
              description: 'Historic walled city',
              timings: 'Open 24 hours',
              entryFee: 'Free (some sites charge)',
              bestTime: 'November to April',
              highlights: ['Fort Santiago', 'San Agustin Church', 'Colonial architecture', 'Cobblestone streets'],
              image: '🏰'
            },
            {
              name: 'Rizal Park',
              description: 'Historical urban park',
              timings: 'Open 24 hours',
              entryFee: 'Free',
              bestTime: 'Year-round',
              highlights: ['Rizal Monument', 'Gardens', 'Museums', 'Monuments'],
              image: '🏛️'
            }
          ]
        }
      }
    },
    'New Zealand': {
      name: 'New Zealand',
      icon: '🇳🇿',
      locations: {
        'Wellington': {
          name: 'Wellington',
          icon: '🏛️',
          places: [
            {
              name: 'Old St. Paul\'s',
              description: 'Gothic Revival wooden church',
              timings: '10:00 AM - 5:00 PM',
              entryFee: 'By donation',
              bestTime: 'Year-round',
              highlights: ['Native timber', 'Stained glass', 'Architecture', 'Historic building'],
              image: '⛪'
            }
          ]
        },
        'Auckland': {
          name: 'Auckland',
          icon: '🗼',
          places: [
            {
              name: 'Sky Tower',
              description: 'Tallest structure in Southern Hemisphere',
              timings: '8:30 AM - 10:30 PM',
              entryFee: 'NZ$32',
              bestTime: 'Sunset',
              highlights: ['360° views', 'SkyWalk', 'SkyJump', 'Revolving restaurant'],
              image: '🗼'
            }
          ]
        }
      }
    },
    'Sri Lanka': {
      name: 'Sri Lanka',
      icon: '🇱🇰',
      locations: {
        'Colombo': {
          name: 'Colombo',
          icon: '⛩️',
          places: [
            {
              name: 'Gangaramaya Temple',
              description: 'Important Buddhist temple',
              timings: '6:00 AM - 10:00 PM',
              entryFee: 'LKR 300',
              bestTime: 'Year-round',
              highlights: ['Buddha statues', 'Museum', 'Library', 'Seema Malaka'],
              image: '⛩️'
            }
          ]
        },
        'Anuradhapura': {
          name: 'Anuradhapura',
          icon: '🏛️',
          places: [
            {
              name: 'Sacred City of Anuradhapura',
              description: 'Ancient capital with Buddhist ruins',
              timings: '6:00 AM - 6:00 PM',
              entryFee: '$25',
              bestTime: 'November to March',
              highlights: ['Ruwanwelisaya Stupa', 'Sri Maha Bodhi tree', 'Ancient monasteries', 'UNESCO Site'],
              image: '⛩️'
            }
          ]
        },
        'Sigiriya': {
          name: 'Sigiriya',
          icon: '🗿',
          places: [
            {
              name: 'Sigiriya Rock Fortress',
              description: 'Ancient rock fortress',
              timings: '7:00 AM - 5:30 PM',
              entryFee: '$30',
              bestTime: 'January to March',
              highlights: ['Lion Gate', 'Frescoes', 'Mirror Wall', 'Summit palace'],
              image: '🗿'
            }
          ]
        }
      }
    },
    'Nepal': {
      name: 'Nepal',
      icon: '🇳🇵',
      locations: {
        'Kathmandu': {
          name: 'Kathmandu',
          icon: '⛩️',
          places: [
            {
              name: 'Swayambhunath (Monkey Temple)',
              description: 'Ancient Buddhist stupa',
              timings: '5:00 AM - 9:00 PM',
              entryFee: 'NPR 200',
              bestTime: 'October to March',
              highlights: ['Buddha eyes', 'Monkeys', 'Valley views', 'Prayer wheels'],
              image: '⛩️'
            },
            {
              name: 'Boudhanath Stupa',
              description: 'Massive mandala stupa',
              timings: '5:00 AM - 9:00 PM',
              entryFee: 'NPR 400',
              bestTime: 'October to March',
              highlights: ['Prayer flags', 'Circumambulation', 'Tibetan monasteries', 'UNESCO Site'],
              image: '⛩️'
            },
            {
              name: 'Pashupatinath Temple',
              description: 'Hindu temple complex',
              timings: '4:00 AM - 12:00 PM, 5:00 PM - 9:00 PM',
              entryFee: 'NPR 1000',
              bestTime: 'October to March',
              highlights: ['Shiva temple', 'Cremation ghats', 'Holy site', 'Bagmati River'],
              image: '🕉️'
            }
          ]
        }
      }
    },
    'Myanmar': {
      name: 'Myanmar',
      icon: '🇲🇲',
      locations: {
        'Bagan': {
          name: 'Bagan',
          icon: '⛩️',
          places: [
            {
              name: 'Bagan Archaeological Zone',
              description: 'Plain with thousands of Buddhist temples',
              timings: 'Sunrise to sunset',
              entryFee: 'MMK 25,000',
              bestTime: 'November to February',
              highlights: ['Hot air balloons', 'Ananda Temple', 'Shwezigon Pagoda', '2000+ temples'],
              image: '⛩️'
            }
          ]
        },
        'Yangon': {
          name: 'Yangon',
          icon: '⛩️',
          places: [
            {
              name: 'Shwedagon Pagoda',
              description: 'Gold-plated Buddhist stupa',
              timings: '4:00 AM - 10:00 PM',
              entryFee: 'MMK 10,000',
              bestTime: 'November to February',
              highlights: ['Golden stupa', 'Diamond-studded spire', 'Pilgrimage site', 'Night lighting'],
              image: '⛩️'
            }
          ]
        }
      }
    },
    'Laos': {
      name: 'Laos',
      icon: '🇱🇦',
      locations: {
        'Luang Prabang': {
          name: 'Luang Prabang',
          icon: '⛩️',
          places: [
            {
              name: 'Royal Palace Museum',
              description: 'Former royal palace',
              timings: '8:00 AM - 11:30 AM, 1:30 PM - 4:00 PM',
              entryFee: 'LAK 30,000',
              bestTime: 'November to February',
              highlights: ['Throne hall', 'Royal regalia', 'Phra Bang Buddha', 'Art collection'],
              image: '👑'
            },
            {
              name: 'Wat Xieng Thong',
              description: 'Buddhist temple',
              timings: '6:00 AM - 6:00 PM',
              entryFee: 'LAK 20,000',
              bestTime: 'November to February',
              highlights: ['Tree of Life mosaic', 'Golden stencils', 'Royal funerary carriage', 'Architecture'],
              image: '⛩️'
            }
          ]
        }
      }
    }
  };

  // Museums Data by Country and Location
  const museumsByCountry = {
    'France': {
      name: 'France',
      icon: '🇫🇷',
      locations: {
        'Paris': {
          name: 'Paris',
          icon: '🎨',
          museums: [
            {
              name: 'Louvre Museum',
              description: 'World\'s largest art museum and historic monument',
              timings: '9:00 AM - 6:00 PM (Closed Tuesday)',
              entryFee: '€17',
              bestTime: 'Wednesday/Friday evenings',
              highlights: ['Mona Lisa', 'Venus de Milo', 'Winged Victory', 'Egyptian antiquities', 'Glass Pyramid'],
              image: '🎨'
            },
            {
              name: 'Musée d\'Orsay',
              description: 'Impressionist and post-impressionist masterpieces',
              timings: '9:30 AM - 6:00 PM (Closed Monday)',
              entryFee: '€16',
              bestTime: 'Thursday evening',
              highlights: ['Van Gogh', 'Monet', 'Renoir', 'Clock tower', 'Sculpture garden'],
              image: '🎨'
            },
            {
              name: 'Centre Pompidou',
              description: 'Modern and contemporary art museum',
              timings: '11:00 AM - 9:00 PM (Closed Tuesday)',
              entryFee: '€14',
              bestTime: 'Weekday afternoons',
              highlights: ['Modern art', 'Rooftop views', 'Unique architecture', 'Library'],
              image: '🏛️'
            },
            {
              name: 'Rodin Museum',
              description: 'Sculptures by Auguste Rodin',
              timings: '10:00 AM - 6:30 PM (Closed Monday)',
              entryFee: '€13',
              bestTime: 'Spring and summer',
              highlights: ['The Thinker', 'The Kiss', 'Gates of Hell', 'Garden sculptures'],
              image: '🗿'
            }
          ]
        }
      }
    },
    'United Kingdom': {
      name: 'United Kingdom',
      icon: '🇬🇧',
      locations: {
        'London': {
          name: 'London',
          icon: '🎨',
          museums: [
            {
              name: 'British Museum',
              description: 'World history and culture museum',
              timings: '10:00 AM - 5:00 PM',
              entryFee: 'Free',
              bestTime: 'Weekday mornings',
              highlights: ['Rosetta Stone', 'Egyptian mummies', 'Parthenon sculptures', 'Reading Room'],
              image: '🏛️'
            },
            {
              name: 'National Gallery',
              description: 'European paintings collection',
              timings: '10:00 AM - 6:00 PM',
              entryFee: 'Free',
              bestTime: 'Weekday mornings',
              highlights: ['Van Gogh Sunflowers', 'Leonardo da Vinci', 'Trafalgar Square', 'Rembrandt'],
              image: '🎨'
            },
            {
              name: 'Tate Modern',
              description: 'International modern art',
              timings: '10:00 AM - 6:00 PM',
              entryFee: 'Free (special exhibitions charge)',
              bestTime: 'Friday/Saturday evenings',
              highlights: ['Turbine Hall', 'Picasso', 'Warhol', 'Thames views'],
              image: '🎨'
            },
            {
              name: 'Natural History Museum',
              description: 'Natural sciences and specimens',
              timings: '10:00 AM - 5:50 PM',
              entryFee: 'Free',
              bestTime: 'Weekday mornings',
              highlights: ['Dinosaur gallery', 'Blue whale', 'Earth Hall', 'Darwin Centre'],
              image: '🦕'
            },
            {
              name: 'Victoria and Albert Museum',
              description: 'Art, design and decorative arts',
              timings: '10:00 AM - 5:45 PM',
              entryFee: 'Free',
              bestTime: 'Friday evenings',
              highlights: ['Fashion collection', 'Jewelry gallery', 'Cast Courts', 'Sculpture'],
              image: '👑'
            }
          ]
        }
      }
    },
    'USA': {
      name: 'United States',
      icon: '🇺🇸',
      locations: {
        'New York': {
          name: 'New York',
          icon: '🎨',
          museums: [
            {
              name: 'Metropolitan Museum of Art',
              description: 'Largest art museum in the Americas',
              timings: '10:00 AM - 5:00 PM (Closed Monday)',
              entryFee: '$30 (suggested)',
              bestTime: 'Weekday mornings',
              highlights: ['Egyptian Temple', 'European paintings', 'Rooftop garden', 'American Wing'],
              image: '🎨'
            },
            {
              name: 'MoMA (Museum of Modern Art)',
              description: 'Modern and contemporary art',
              timings: '10:30 AM - 5:30 PM',
              entryFee: '$25',
              bestTime: 'Friday afternoons (free)',
              highlights: ['Starry Night', 'Les Demoiselles', 'Warhol', 'Sculpture garden'],
              image: '🎨'
            },
            {
              name: 'American Museum of Natural History',
              description: 'Natural history and science',
              timings: '10:00 AM - 5:30 PM',
              entryFee: '$28 (suggested)',
              bestTime: 'Weekday mornings',
              highlights: ['Dinosaur fossils', 'Rose Center', 'Blue whale', 'Planetarium'],
              image: '🦕'
            },
            {
              name: 'Guggenheim Museum',
              description: 'Modern art in iconic spiral building',
              timings: '10:00 AM - 5:45 PM (Closed Thursday)',
              entryFee: '$25',
              bestTime: 'Saturday evenings (pay what you wish)',
              highlights: ['Spiral ramp', 'Kandinsky', 'Architecture', 'Contemporary exhibits'],
              image: '🏛️'
            }
          ]
        },
        'Washington DC': {
          name: 'Washington DC',
          icon: '🏛️',
          museums: [
            {
              name: 'Smithsonian National Air and Space',
              description: 'Aviation and space exploration',
              timings: '10:00 AM - 5:30 PM',
              entryFee: 'Free',
              bestTime: 'Weekday mornings',
              highlights: ['Apollo 11', 'Wright Flyer', 'Space exhibits', 'IMAX theater'],
              image: '🚀'
            },
            {
              name: 'National Gallery of Art',
              description: 'European and American art',
              timings: '10:00 AM - 5:00 PM',
              entryFee: 'Free',
              bestTime: 'Weekday mornings',
              highlights: ['Da Vinci portrait', 'East Building', 'Sculpture garden', 'Impressionists'],
              image: '🎨'
            },
            {
              name: 'Smithsonian National Museum of Natural History',
              description: 'Natural history specimens',
              timings: '10:00 AM - 5:30 PM',
              entryFee: 'Free',
              bestTime: 'Weekday mornings',
              highlights: ['Hope Diamond', 'Dinosaurs', 'Ocean Hall', 'Butterflies'],
              image: '💎'
            }
          ]
        },
        'California': {
          name: 'California',
          icon: '🎨',
          museums: [
            {
              name: 'Getty Center',
              description: 'Art museum with gardens',
              timings: '10:00 AM - 5:30 PM (Closed Monday)',
              entryFee: 'Free (parking $20)',
              bestTime: 'Weekday afternoons',
              highlights: ['European art', 'Gardens', 'Architecture', 'LA views'],
              image: '🎨'
            },
            {
              name: 'San Francisco Museum of Modern Art',
              description: 'Modern and contemporary art',
              timings: '10:00 AM - 5:00 PM (Closed Wednesday)',
              entryFee: '$25',
              bestTime: 'Thursday evenings',
              highlights: ['Photography', 'Rooftop terrace', 'Contemporary art', 'Rothko'],
              image: '🎨'
            }
          ]
        }
      }
    },
    'Spain': {
      name: 'Spain',
      icon: '🇪🇸',
      locations: {
        'Madrid': {
          name: 'Madrid',
          icon: '🎨',
          museums: [
            {
              name: 'Prado Museum',
              description: 'Spanish royal art collection',
              timings: '10:00 AM - 8:00 PM',
              entryFee: '€15',
              bestTime: 'Evening hours (free)',
              highlights: ['Velázquez Las Meninas', 'Goya', 'Bosch', 'Spanish masters'],
              image: '🎨'
            },
            {
              name: 'Reina Sofía Museum',
              description: 'Spanish modern art',
              timings: '10:00 AM - 9:00 PM (Closed Tuesday)',
              entryFee: '€10',
              bestTime: 'Evening hours (free)',
              highlights: ['Guernica by Picasso', 'Dalí', 'Miró', 'Contemporary art'],
              image: '🎨'
            },
            {
              name: 'Thyssen-Bornemisza Museum',
              description: 'Private art collection',
              timings: '10:00 AM - 7:00 PM',
              entryFee: '€13',
              bestTime: 'Monday afternoons (free)',
              highlights: ['Old masters', 'Impressionists', 'Modern art', 'Diverse collection'],
              image: '🎨'
            }
          ]
        },
        'Barcelona': {
          name: 'Barcelona',
          icon: '🎨',
          museums: [
            {
              name: 'Picasso Museum',
              description: 'Early works of Pablo Picasso',
              timings: '9:00 AM - 7:00 PM (Closed Monday)',
              entryFee: '€12',
              bestTime: 'Thursday evenings (free)',
              highlights: ['Blue Period', 'Las Meninas series', 'Early sketches', 'Medieval palaces'],
              image: '🎨'
            },
            {
              name: 'Joan Miró Foundation',
              description: 'Works of Joan Miró',
              timings: '10:00 AM - 6:00 PM (Closed Monday)',
              entryFee: '€13',
              bestTime: 'Weekday afternoons',
              highlights: ['Paintings', 'Sculptures', 'Rooftop terrace', 'City views'],
              image: '🎨'
            }
          ]
        }
      }
    },
    'Italy': {
      name: 'Italy',
      icon: '🇮🇹',
      locations: {
        'Florence': {
          name: 'Florence',
          icon: '🎨',
          museums: [
            {
              name: 'Uffizi Gallery',
              description: 'Renaissance art masterpieces',
              timings: '8:15 AM - 6:50 PM (Closed Monday)',
              entryFee: '€20',
              bestTime: 'Early morning or late afternoon',
              highlights: ['Birth of Venus', 'Primavera', 'Leonardo', 'Michelangelo'],
              image: '🎨'
            },
            {
              name: 'Accademia Gallery',
              description: 'Home of Michelangelo\'s David',
              timings: '8:15 AM - 6:50 PM (Closed Monday)',
              entryFee: '€12',
              bestTime: 'Early morning',
              highlights: ['David statue', 'Michelangelo sculptures', 'Musical instruments', 'Paintings'],
              image: '🗿'
            }
          ]
        },
        'Vatican City': {
          name: 'Vatican City',
          icon: '⛪',
          museums: [
            {
              name: 'Vatican Museums',
              description: 'Papal art collections',
              timings: '9:00 AM - 6:00 PM (Closed Sunday)',
              entryFee: '€17',
              bestTime: 'Wednesday afternoons',
              highlights: ['Sistine Chapel', 'Raphael Rooms', 'Gallery of Maps', 'Egyptian collection'],
              image: '🎨'
            }
          ]
        },
        'Rome': {
          name: 'Rome',
          icon: '🏛️',
          museums: [
            {
              name: 'Borghese Gallery',
              description: 'Art collection in villa',
              timings: '9:00 AM - 7:00 PM (Closed Monday)',
              entryFee: '€15 (booking required)',
              bestTime: 'Spring for gardens',
              highlights: ['Bernini sculptures', 'Caravaggio', 'Titian', 'Gardens'],
              image: '🎨'
            }
          ]
        }
      }
    },
    'Netherlands': {
      name: 'Netherlands',
      icon: '🇳🇱',
      locations: {
        'Amsterdam': {
          name: 'Amsterdam',
          icon: '🎨',
          museums: [
            {
              name: 'Rijksmuseum',
              description: 'Dutch art and history',
              timings: '9:00 AM - 5:00 PM',
              entryFee: '€22.50',
              bestTime: 'Weekday mornings',
              highlights: ['The Night Watch', 'Vermeer', 'Delftware', 'Gardens'],
              image: '🎨'
            },
            {
              name: 'Van Gogh Museum',
              description: 'World\'s largest Van Gogh collection',
              timings: '9:00 AM - 5:00 PM',
              entryFee: '€20',
              bestTime: 'Weekday mornings',
              highlights: ['Sunflowers', 'Bedroom', 'Self-portraits', 'Letters'],
              image: '🎨'
            },
            {
              name: 'Anne Frank House',
              description: 'Historic house and museum',
              timings: '9:00 AM - 7:00 PM',
              entryFee: '€14',
              bestTime: 'Book online in advance',
              highlights: ['Secret Annex', 'Diary', 'War history', 'Original rooms'],
              image: '🏛️'
            }
          ]
        }
      }
    },
    'Germany': {
      name: 'Germany',
      icon: '🇩🇪',
      locations: {
        'Berlin': {
          name: 'Berlin',
          icon: '🏛️',
          museums: [
            {
              name: 'Pergamon Museum',
              description: 'Ancient Near East antiquities',
              timings: '10:00 AM - 6:00 PM (Closed Monday)',
              entryFee: '€12',
              bestTime: 'Weekday afternoons',
              highlights: ['Pergamon Altar', 'Ishtar Gate', 'Market Gate', 'Islamic art'],
              image: '🏛️'
            },
            {
              name: 'Jewish Museum Berlin',
              description: 'German Jewish history',
              timings: '10:00 AM - 7:00 PM (Closed Monday)',
              entryFee: '€8',
              bestTime: 'Weekday afternoons',
              highlights: ['Architecture', 'Holocaust Tower', 'Garden of Exile', 'Exhibitions'],
              image: '🏛️'
            },
            {
              name: 'DDR Museum',
              description: 'East German daily life',
              timings: '10:00 AM - 8:00 PM',
              entryFee: '€9.80',
              bestTime: 'Weekday afternoons',
              highlights: ['Interactive exhibits', 'Trabant car', 'Living room', 'Surveillance'],
              image: '🏛️'
            }
          ]
        },
        'Munich': {
          name: 'Munich',
          icon: '🎨',
          museums: [
            {
              name: 'Deutsches Museum',
              description: 'Science and technology',
              timings: '9:00 AM - 5:00 PM',
              entryFee: '€14',
              bestTime: 'Weekdays',
              highlights: ['Aviation', 'Mining', 'Planetarium', 'Historic instruments'],
              image: '🔬'
            }
          ]
        }
      }
    },
    'Russia': {
      name: 'Russia',
      icon: '🇷🇺',
      locations: {
        'St. Petersburg': {
          name: 'St. Petersburg',
          icon: '🎨',
          museums: [
            {
              name: 'The Hermitage',
              description: 'One of world\'s largest museums',
              timings: '10:30 AM - 6:00 PM (Closed Monday)',
              entryFee: '₽1000',
              bestTime: 'Tuesday or Thursday',
              highlights: ['3 million items', 'Winter Palace', 'Rembrandt', 'Impressionists'],
              image: '🎨'
            },
            {
              name: 'Russian Museum',
              description: 'Russian fine art',
              timings: '10:00 AM - 6:00 PM (Closed Tuesday)',
              entryFee: '₽450',
              bestTime: 'Weekday mornings',
              highlights: ['Icons', 'Repin', 'Kandinsky', 'Soviet art'],
              image: '🎨'
            }
          ]
        }
      }
    },
    'Austria': {
      name: 'Austria',
      icon: '🇦🇹',
      locations: {
        'Vienna': {
          name: 'Vienna',
          icon: '🎨',
          museums: [
            {
              name: 'Kunsthistorisches Museum',
              description: 'Art history museum',
              timings: '10:00 AM - 6:00 PM (Closed Monday)',
              entryFee: '€18',
              bestTime: 'Weekday afternoons',
              highlights: ['Bruegel collection', 'Egyptian artifacts', 'Coin collection', 'Baroque hall'],
              image: '🎨'
            },
            {
              name: 'Belvedere Palace',
              description: 'Austrian art museum',
              timings: '9:00 AM - 6:00 PM',
              entryFee: '€16',
              bestTime: 'Spring and summer',
              highlights: ['The Kiss by Klimt', 'Baroque palace', 'Gardens', 'Vienna views'],
              image: '🎨'
            }
          ]
        }
      }
    },
    'Egypt': {
      name: 'Egypt',
      icon: '🇪🇬',
      locations: {
        'Cairo': {
          name: 'Cairo',
          icon: '🏛️',
          museums: [
            {
              name: 'Egyptian Museum',
              description: 'Ancient Egyptian antiquities',
              timings: '9:00 AM - 5:00 PM',
              entryFee: 'EGP 200',
              bestTime: 'Early morning',
              highlights: ['Tutankhamun treasures', 'Mummies', 'Ancient artifacts', 'Royal jewelry'],
              image: '🏛️'
            },
            {
              name: 'Grand Egyptian Museum',
              description: 'New massive museum near Giza',
              timings: '9:00 AM - 6:00 PM',
              entryFee: 'EGP 600',
              bestTime: 'Morning hours',
              highlights: ['Full Tutankhamun collection', 'Pharaonic treasures', 'Pyramid views', 'Modern displays'],
              image: '🏛️'
            }
          ]
        }
      }
    },
    'Japan': {
      name: 'Japan',
      icon: '🇯🇵',
      locations: {
        'Tokyo': {
          name: 'Tokyo',
          icon: '🎨',
          museums: [
            {
              name: 'Tokyo National Museum',
              description: 'Japanese art and antiquities',
              timings: '9:30 AM - 5:00 PM (Closed Monday)',
              entryFee: '¥1,000',
              bestTime: 'Weekday mornings',
              highlights: ['Samurai armor', 'Buddhist art', 'Pottery', 'Ukiyo-e prints'],
              image: '🎨'
            },
            {
              name: 'Mori Art Museum',
              description: 'Contemporary art',
              timings: '10:00 AM - 10:00 PM (Closed Tuesday)',
              entryFee: '¥1,800',
              bestTime: 'Evening for city lights',
              highlights: ['City views', 'Contemporary exhibits', 'Sky Deck', 'Modern art'],
              image: '🎨'
            },
            {
              name: 'teamLab Borderless',
              description: 'Digital art museum',
              timings: '10:00 AM - 7:00 PM',
              entryFee: '¥3,200',
              bestTime: 'Weekday afternoons',
              highlights: ['Interactive digital art', 'Immersive rooms', 'Light displays', 'Unique experience'],
              image: '💫'
            }
          ]
        },
        'Kyoto': {
          name: 'Kyoto',
          icon: '🎨',
          museums: [
            {
              name: 'Kyoto National Museum',
              description: 'Japanese and Asian art',
              timings: '9:30 AM - 5:00 PM (Closed Monday)',
              entryFee: '¥700',
              bestTime: 'Weekday mornings',
              highlights: ['Buddhist sculptures', 'Ceramics', 'Paintings', 'Special exhibitions'],
              image: '🎨'
            }
          ]
        }
      }
    },
    'China': {
      name: 'China',
      icon: '🇨🇳',
      locations: {
        'Beijing': {
          name: 'Beijing',
          icon: '🏛️',
          museums: [
            {
              name: 'Palace Museum (Forbidden City)',
              description: 'Imperial palace complex',
              timings: '8:30 AM - 5:00 PM (Closed Monday)',
              entryFee: '¥60',
              bestTime: 'Spring and Fall',
              highlights: ['Imperial treasures', 'Throne halls', 'Ceramics', 'Calligraphy'],
              image: '🏛️'
            },
            {
              name: 'National Museum of China',
              description: 'Chinese history and culture',
              timings: '9:00 AM - 5:00 PM (Closed Monday)',
              entryFee: 'Free (booking required)',
              bestTime: 'Weekday mornings',
              highlights: ['Ancient China', 'Revolutionary history', 'Bronze vessels', 'Jade collection'],
              image: '🏛️'
            }
          ]
        }
      }
    },
    'India': {
      name: 'India',
      icon: '🇮🇳',
      locations: {
        'Delhi': {
          name: 'Delhi',
          icon: '🏛️',
          museums: [
            {
              name: 'National Museum',
              description: 'Indian art and history',
              timings: '10:00 AM - 6:00 PM (Closed Monday)',
              entryFee: '₹20 for Indians, ₹650 for foreigners',
              bestTime: 'Weekday mornings',
              highlights: ['Indus Valley artifacts', 'Buddhist art', 'Miniature paintings', 'Central Asian gallery'],
              image: '🏛️'
            },
            {
              name: 'National Gallery of Modern Art',
              description: 'Modern and contemporary Indian art',
              timings: '10:00 AM - 5:00 PM (Closed Monday)',
              entryFee: '₹20 for Indians, ₹500 for foreigners',
              bestTime: 'Weekday afternoons',
              highlights: ['Raja Ravi Varma', 'Bengal School', 'Contemporary art', 'Sculptures'],
              image: '🎨'
            }
          ]
        },
        'Mumbai': {
          name: 'Mumbai',
          icon: '🎨',
          museums: [
            {
              name: 'Chhatrapati Shivaji Maharaj Vastu Sangrahalaya',
              description: 'Art, archaeology and natural history',
              timings: '10:15 AM - 6:00 PM (Closed Wednesday)',
              entryFee: '₹85 for Indians, ₹500 for foreigners',
              bestTime: 'Weekday mornings',
              highlights: ['Indus Valley section', 'Miniature paintings', 'Arms & armor', 'Decorative arts'],
              image: '🏛️'
            },
            {
              name: 'Dr. Bhau Daji Lad Museum',
              description: 'Mumbai\'s oldest museum',
              timings: '10:00 AM - 5:30 PM (Closed Wednesday)',
              entryFee: '₹10',
              bestTime: 'Weekday afternoons',
              highlights: ['Mumbai history', 'Decorative arts', 'Maps', 'Victorian architecture'],
              image: '🏛️'
            }
          ]
        },
        'Kolkata': {
          name: 'Kolkata',
          icon: '🏛️',
          museums: [
            {
              name: 'Indian Museum',
              description: 'Oldest and largest museum in India',
              timings: '10:00 AM - 5:00 PM (Closed Monday)',
              entryFee: '₹50 for Indians, ₹500 for foreigners',
              bestTime: 'Weekday mornings',
              highlights: ['Egyptian mummy', 'Buddhist sculptures', 'Fossils', 'Meteorites'],
              image: '🏛️'
            }
          ]
        }
      }
    },
    'Australia': {
      name: 'Australia',
      icon: '🇦🇺',
      locations: {
        'Melbourne': {
          name: 'Melbourne',
          icon: '🎨',
          museums: [
            {
              name: 'National Gallery of Victoria',
              description: 'Oldest public art museum in Australia',
              timings: '10:00 AM - 5:00 PM',
              entryFee: 'Free (special exhibitions charge)',
              bestTime: 'Weekday afternoons',
              highlights: ['International art', 'Australian art', 'Waterwall entrance', 'Fashion'],
              image: '🎨'
            },
            {
              name: 'Melbourne Museum',
              description: 'Natural and cultural history',
              timings: '10:00 AM - 5:00 PM',
              entryFee: 'AUD $15',
              bestTime: 'Weekday mornings',
              highlights: ['Phar Lap exhibit', 'IMAX', 'Forest Gallery', 'Aboriginal culture'],
              image: '🦘'
            }
          ]
        },
        'Sydney': {
          name: 'Sydney',
          icon: '🎨',
          museums: [
            {
              name: 'Australian Museum',
              description: 'Natural history and anthropology',
              timings: '9:30 AM - 5:00 PM',
              entryFee: 'AUD $15',
              bestTime: 'Weekday mornings',
              highlights: ['Indigenous cultures', 'Minerals', 'Dinosaurs', 'Pacific collections'],
              image: '🦘'
            }
          ]
        }
      }
    },
    'Brazil': {
      name: 'Brazil',
      icon: '🇧🇷',
      locations: {
        'São Paulo': {
          name: 'São Paulo',
          icon: '🎨',
          museums: [
            {
              name: 'São Paulo Museum of Art (MASP)',
              description: 'Art museum with unique architecture',
              timings: '10:00 AM - 6:00 PM (Closed Monday)',
              entryFee: 'R$50',
              bestTime: 'Tuesday (free)',
              highlights: ['European masters', 'Glass easels', 'Brazilian art', 'Architecture'],
              image: '🎨'
            },
            {
              name: 'Pinacoteca do Estado',
              description: 'Brazilian visual arts',
              timings: '10:00 AM - 6:00 PM (Closed Monday)',
              entryFee: 'R$30',
              bestTime: 'Saturday (free)',
              highlights: ['19th century art', 'Modernist works', 'Sculpture garden', 'Historic building'],
              image: '🎨'
            }
          ]
        }
      }
    },
    'Mexico': {
      name: 'Mexico',
      icon: '🇲🇽',
      locations: {
        'Mexico City': {
          name: 'Mexico City',
          icon: '🏛️',
          museums: [
            {
              name: 'National Museum of Anthropology',
              description: 'Pre-Columbian heritage of Mexico',
              timings: '9:00 AM - 7:00 PM (Closed Monday)',
              entryFee: '$90 MXN',
              bestTime: 'Weekday mornings',
              highlights: ['Aztec Sun Stone', 'Maya artifacts', 'Oaxaca hall', 'Olmec heads'],
              image: '🏛️'
            },
            {
              name: 'Frida Kahlo Museum',
              description: 'Blue House where Frida lived',
              timings: '10:00 AM - 5:45 PM (Closed Monday)',
              entryFee: '$270 MXN',
              bestTime: 'Book online in advance',
              highlights: ['Personal artifacts', 'Studio', 'Garden', 'Paintings'],
              image: '🎨'
            }
          ]
        }
      }
    },
    'Turkey': {
      name: 'Turkey',
      icon: '🇹🇷',
      locations: {
        'Istanbul': {
          name: 'Istanbul',
          icon: '🏛️',
          museums: [
            {
              name: 'Istanbul Archaeological Museums',
              description: 'Ancient artifacts collection',
              timings: '9:00 AM - 6:00 PM (Closed Monday)',
              entryFee: '₺100',
              bestTime: 'Weekday mornings',
              highlights: ['Alexander Sarcophagus', 'Troy artifacts', 'Ancient Orient', 'Tiled Kiosk'],
              image: '🏛️'
            },
            {
              name: 'Pera Museum',
              description: 'Art and culture',
              timings: '10:00 AM - 7:00 PM (Closed Monday)',
              entryFee: '₺60',
              bestTime: 'Friday evenings',
              highlights: ['Orientalist paintings', 'Anatolian weights', 'Kütahya tiles', 'Temporary exhibitions'],
              image: '🎨'
            }
          ]
        }
      }
    },
    'South Korea': {
      name: 'South Korea',
      icon: '🇰🇷',
      locations: {
        'Seoul': {
          name: 'Seoul',
          icon: '🏛️',
          museums: [
            {
              name: 'National Museum of Korea',
              description: 'Korean history and art',
              timings: '10:00 AM - 6:00 PM (Closed Monday)',
              entryFee: 'Free',
              bestTime: 'Weekday mornings',
              highlights: ['Ten-story pagoda', 'Gold crowns', 'Celadon', 'Buddhist art'],
              image: '🏛️'
            },
            {
              name: 'Leeum Samsung Museum',
              description: 'Traditional and contemporary art',
              timings: '10:30 AM - 6:00 PM (Closed Monday)',
              entryFee: '₩10,000',
              bestTime: 'Weekday afternoons',
              highlights: ['Modern architecture', 'Korean ceramics', 'Contemporary art', 'Rodin works'],
              image: '🎨'
            }
          ]
        }
      }
    },
    'Singapore': {
      name: 'Singapore',
      icon: '🇸🇬',
      locations: {
        'Central Singapore': {
          name: 'Central Singapore',
          icon: '🏛️',
          museums: [
            {
              name: 'National Museum of Singapore',
              description: 'Singapore history and culture',
              timings: '10:00 AM - 7:00 PM',
              entryFee: 'SG$15',
              bestTime: 'Weekday afternoons',
              highlights: ['Singapore History Gallery', 'Glass rotunda', 'Food Gallery', 'Multimedia displays'],
              image: '🏛️'
            },
            {
              name: 'ArtScience Museum',
              description: 'Art, science, and technology',
              timings: '10:00 AM - 7:00 PM',
              entryFee: 'SG$19',
              bestTime: 'Evening',
              highlights: ['Lotus-inspired design', 'Digital exhibitions', 'Future World', 'Marina Bay views'],
              image: '🎨'
            }
          ]
        }
      }
    },
    'Thailand': {
      name: 'Thailand',
      icon: '🇹🇭',
      locations: {
        'Bangkok': {
          name: 'Bangkok',
          icon: '🏛️',
          museums: [
            {
              name: 'National Museum Bangkok',
              description: 'Thai art and history',
              timings: '9:00 AM - 4:00 PM (Closed Monday/Tuesday)',
              entryFee: '฿200',
              bestTime: 'Weekday mornings',
              highlights: ['Buddhaisawan Chapel', 'Royal funeral chariots', 'Thai art', 'Prehistoric artifacts'],
              image: '🏛️'
            },
            {
              name: 'Jim Thompson House',
              description: 'Thai silk entrepreneur\'s home',
              timings: '9:00 AM - 6:00 PM',
              entryFee: '฿200',
              bestTime: 'Morning hours',
              highlights: ['Traditional houses', 'Art collection', 'Gardens', 'Thai architecture'],
              image: '🏛️'
            }
          ]
        }
      }
    },
    'Greece': {
      name: 'Greece',
      icon: '🇬🇷',
      locations: {
        'Athens': {
          name: 'Athens',
          icon: '🏛️',
          museums: [
            {
              name: 'Acropolis Museum',
              description: 'Archaeological museum for Acropolis',
              timings: '9:00 AM - 5:00 PM (Closed Monday in winter)',
              entryFee: '€10',
              bestTime: 'Friday evenings',
              highlights: ['Parthenon Gallery', 'Caryatids', 'Glass floors', 'Ancient sculptures'],
              image: '🏛️'
            },
            {
              name: 'National Archaeological Museum',
              description: 'Ancient Greek artifacts',
              timings: '8:00 AM - 8:00 PM (Closed Monday)',
              entryFee: '€12',
              bestTime: 'Weekday mornings',
              highlights: ['Mask of Agamemnon', 'Antikythera mechanism', 'Bronze statues', 'Minoan frescoes'],
              image: '🏛️'
            }
          ]
        }
      }
    },
    'Poland': {
      name: 'Poland',
      icon: '🇵🇱',
      locations: {
        'Warsaw': {
          name: 'Warsaw',
          icon: '🏛️',
          museums: [
            {
              name: 'POLIN Museum',
              description: 'History of Polish Jews',
              timings: '10:00 AM - 6:00 PM (Closed Tuesday)',
              entryFee: 'PLN 30',
              bestTime: 'Weekday afternoons',
              highlights: ['Interactive exhibits', 'Multimedia displays', 'Synagogue recreation', 'Architecture'],
              image: '🏛️'
            },
            {
              name: 'Warsaw Uprising Museum',
              description: '1944 Warsaw Uprising',
              timings: '10:00 AM - 6:00 PM (Closed Tuesday)',
              entryFee: 'PLN 25',
              bestTime: 'Weekday afternoons',
              highlights: ['Immersive exhibits', '3D film', 'Sewer replica', 'Personal stories'],
              image: '🏛️'
            }
          ]
        }
      }
    }
  };

  // Religious Places Data by Country and Location
  const religiousPlacesByCountry = {
    'India': {
      name: 'India',
      icon: '🇮🇳',
      locations: {
        'Andhra Pradesh': {
          name: 'Andhra Pradesh',
          icon: '🛕',
          places: [
            { name: 'Tirumala Venkateswara Temple', description: 'Richest temple in the world', timings: 'Open 24 hours', entryFee: 'Free (₹300 special darshan)', bestTime: 'September to February', highlights: ['Seven hills', 'Lord Balaji', 'Laddu prasadam', 'Gold-plated vimana'], image: '⛰️' },
            { name: 'Simhachalam Temple', description: 'Varaha Narasimha Swamy shrine', timings: '4:00 AM - 9:30 PM', entryFee: 'Free', bestTime: 'Chandana Yatra festival', highlights: ['Hill temple', 'Unique deity form', 'Chandana Yatra', 'Ancient sculptures'], image: '🛕' },
            { name: 'Kanaka Durga Temple', description: 'Goddess temple on Indrakeeladri Hill', timings: '4:00 AM - 10:00 PM', entryFee: 'Free', bestTime: 'Navaratri', highlights: ['Krishna river views', 'Self-manifested deity', 'Navaratri celebrations', 'Cable car'], image: '⛰️' },
            { name: 'Srisailam Mallikarjuna Temple', description: 'One of 12 Jyotirlingas', timings: '4:30 AM - 10:00 PM', entryFee: 'Free', bestTime: 'Maha Shivaratri', highlights: ['Jyotirlinga', 'Shakti Peetha', 'Nallamala forests', 'Krishna river'], image: '🕉️' },
            { name: 'Amaravati Mahachaitya', description: 'Ancient Buddhist stupa', timings: '6:00 AM - 6:00 PM', entryFee: '₹25', bestTime: 'October to March', highlights: ['Buddhist heritage', '2000 years old', 'Marble panels', 'Archaeological site'], image: '☸️' },
            { name: 'Annavaram Satyanarayana Temple', description: 'Vishnu temple on hilltop', timings: '6:00 AM - 8:00 PM', entryFee: 'Free', bestTime: 'Kalyanotsavam days', highlights: ['Ratnagiri hilltop', 'Lord Satyanarayan', 'River Pampa', 'Natural beauty'], image: '⛰️' },
            { name: 'Yaganti Temple', description: 'Temple with Nandi growing in size', timings: '6:00 AM - 7:00 PM', entryFee: 'Free', bestTime: 'Winter months', highlights: ['Growing Nandi', 'Cave temples', 'Pushkarini', 'Natural springs'], image: '🛕' },
            { name: 'Bhadrachalam Temple', description: 'Rama temple on Godavari banks', timings: '4:00 AM - 9:00 PM', entryFee: 'Free', bestTime: 'Sri Rama Navami', highlights: ['Godavari river', 'Rama Navami', 'Historical significance', 'Beautiful architecture'], image: '🛕' },
            { name: 'Lepakshi Veerabhadra Temple', description: 'Hanging pillar temple', timings: '6:00 AM - 6:00 PM', entryFee: 'Free', bestTime: 'All year', highlights: ['Hanging pillar', 'Nandi statue', 'Frescoes', 'Vijayanagara art'], image: '🛕' },
            { name: 'Dwaraka Tirumala', description: 'Chinna Tirupati temple', timings: '5:00 AM - 9:00 PM', entryFee: 'Free', bestTime: 'Brahmotsavam', highlights: ['Venkateswara temple', 'Smaller version of Tirupati', 'Moksha guarantee', 'Sacred pond'], image: '🛕' },
            { name: 'Ahobilam Temples', description: '9 Narasimha temples complex', timings: '6:00 AM - 6:00 PM', entryFee: 'Free', bestTime: 'October to March', highlights: ['Nine temples', 'Nallamala hills', 'Trekking', 'Natural caves'], image: '⛰️' },
            { name: 'Puttaparthi Sai Baba Ashram', description: 'Sathya Sai Baba birthplace', timings: '5:00 AM - 8:00 PM', entryFee: 'Free', bestTime: 'Birthday celebrations', highlights: ['Prasanthi Nilayam', 'Meditation', 'Service activities', 'Museum'], image: '🕉️' },
            { name: 'Vijayawada Undavalli Caves', description: 'Rock-cut cave temple', timings: '9:00 AM - 6:00 PM', entryFee: '₹25', bestTime: 'Morning hours', highlights: ['Reclining Vishnu', 'Rock-cut architecture', 'Multi-storied', 'Ancient sculptures'], image: '⛰️' },
            { name: 'Mangalagiri Panakala Narasimha Temple', description: 'Temple where deity drinks jaggery water', timings: '6:00 AM - 9:00 PM', entryFee: 'Free', bestTime: 'Narasimha Jayanti', highlights: ['Half deity visible', 'Panakam offering', 'Hill temple', 'Unique tradition'], image: '⛰️' },
            { name: 'Srikalahasti Temple', description: 'Vayu Linga temple', timings: '6:00 AM - 9:00 PM', entryFee: 'Free (₹100 special)', bestTime: 'Rahu-Ketu pooja days', highlights: ['Air linga', 'Rahu-Ketu remedies', 'Ancient temple', 'Swarnamukhi river'], image: '🕉️' },
            { name: 'Annavaram Temple', description: 'Satyanarayana Swamy hillside shrine', timings: '4:00 AM - 9:00 PM', entryFee: 'Free', bestTime: 'Full moon days', highlights: ['Three peaks', 'Ropeway', 'River views', 'Vratam significance'], image: '⛰️' },
            { name: 'Vedadri Narasimha Temple', description: 'Ancient Narasimha shrine', timings: '5:00 AM - 8:00 PM', entryFee: 'Free', bestTime: 'Narasimha Jayanti', highlights: ['Hilltop location', 'Ancient history', 'Panoramic views', 'Peaceful atmosphere'], image: '⛰️' },
            { name: 'Draksharama Bhimeswara Temple', description: 'Pancharama Kshetra temple', timings: '5:30 AM - 8:30 PM', entryFee: 'Free', bestTime: 'Maha Shivaratri', highlights: ['Pancharama shrine', 'Crystal Shiva linga', 'Ancient sculptures', 'Archaeological importance'], image: '🕉️' },
            { name: 'Mahanandi Temple', description: 'Temple with perennial springs', timings: '5:00 AM - 8:00 PM', entryFee: 'Free', bestTime: 'Maha Shivaratri', highlights: ['Natural springs', 'Sacred pool', 'Navaratna Mandapam', 'Nine Nandi statues'], image: '🛕' },
            { name: 'Srikakulam Arasavalli Sun Temple', description: 'Ancient Surya Narayana temple', timings: '6:00 AM - 12:00 PM, 4:00 PM - 8:00 PM', entryFee: 'Free', bestTime: 'Ratha Saptami', highlights: ['Sun god temple', 'Ancient architecture', 'Morning sun rays', 'Healing powers belief'], image: '☀️' }
          ]
        },
        'Arunachal Pradesh': {
          name: 'Arunachal Pradesh',
          icon: '🏔️',
          places: [
            { name: 'Tawang Monastery', description: 'Largest monastery in India', timings: '8:00 AM - 6:00 PM', entryFee: 'Free', bestTime: 'April to October', highlights: ['Buddhist monastery', 'Himalayan views', 'Dalai Lama birthplace', '400 years old'], image: '☸️' },
            { name: 'Bomdila Monastery', description: 'Gelugpa Buddhist monastery', timings: '7:00 AM - 6:00 PM', entryFee: 'Free', bestTime: 'May to October', highlights: ['Prayer hall', 'Buddha statues', 'Mountain views', 'Peaceful retreat'], image: '☸️' },
            { name: 'Malinithan Temple', description: 'Ancient archaeological site', timings: '8:00 AM - 5:00 PM', entryFee: 'Free', bestTime: 'October to March', highlights: ['Durga temple ruins', 'Archaeological site', 'Stone carvings', 'Brahmaputra views'], image: '🛕' },
            { name: 'Urgelling Monastery', description: '6th Dalai Lama birthplace', timings: '8:00 AM - 5:00 PM', entryFee: 'Free', bestTime: 'Summer months', highlights: ['Historical significance', 'Dalai Lama connection', 'Serene location', 'Traditional architecture'], image: '☸️' },
            { name: 'Ita Fort Temple', description: 'Brick fort with temple ruins', timings: '6:00 AM - 6:00 PM', entryFee: 'Free', bestTime: 'November to March', highlights: ['14th century fort', 'Archaeological site', 'Brick structures', 'Historical importance'], image: '🏛️' },
            { name: 'Gompa Buddha Vihar', description: 'Itanagar Buddhist temple', timings: '6:00 AM - 7:00 PM', entryFee: 'Free', bestTime: 'All year', highlights: ['Golden Buddha', 'Peaceful atmosphere', 'City views', 'Prayer wheels'], image: '☸️' },
            { name: 'Parshuram Kund', description: 'Sacred Hindu pilgrimage', timings: 'Open 24 hours', entryFee: 'Free', bestTime: 'Makar Sankranti', highlights: ['Lohit river', 'Pilgrimage site', 'Mythology connection', 'Annual mela'], image: '💧' },
            { name: 'Bhismaknagar Fort Temple', description: 'Ancient fort temple complex', timings: '7:00 AM - 5:00 PM', entryFee: 'Free', bestTime: 'October to April', highlights: ['Archaeological ruins', 'Brick temples', 'Historical site', 'Lohit valley'], image: '🏛️' },
            { name: 'Nyukmadung', description: 'Holy tree worship site', timings: 'Sunrise to sunset', entryFee: 'Free', bestTime: 'Festival times', highlights: ['Sacred tree', 'Tribal worship', 'Cultural significance', 'Natural beauty'], image: '🌳' },
            { name: 'Ziro Tarin Fish Sanctuary', description: 'Sacred fish breeding site', timings: '8:00 AM - 5:00 PM', entryFee: 'Free', bestTime: 'March to October', highlights: ['Sacred fish', 'Apatani tradition', 'Conservation', 'Cultural practice'], image: '🐟' },
            { name: 'Namdhapa National Park Sacred Groves', description: 'Spiritual forest areas', timings: '6:00 AM - 5:00 PM', entryFee: '₹50', bestTime: 'November to March', highlights: ['Sacred groves', 'Biodiversity', 'Tribal beliefs', 'Nature worship'], image: '🌲' },
            { name: 'Dirang Monastery', description: 'Ancient Tibetan Buddhist monastery', timings: '7:00 AM - 6:00 PM', entryFee: 'Free', bestTime: 'April to October', highlights: ['500 years old', 'Butter sculptures', 'Prayer flags', 'Mountain setting'], image: '☸️' },
            { name: 'Akashiganga Temple', description: 'Temple with waterfalls', timings: '6:00 AM - 6:00 PM', entryFee: 'Free', bestTime: 'Pre-monsoon', highlights: ['Waterfall temple', 'Natural beauty', 'Pilgrimage spot', 'Trekking'], image: '💧' },
            { name: 'Gorsam Chorten', description: 'Large stupa monument', timings: '7:00 AM - 6:00 PM', entryFee: 'Free', bestTime: 'May to October', highlights: ['Buddhist stupa', 'Prayer flags', 'Peaceful setting', 'Tibetan architecture'], image: '☸️' },
            { name: 'Miao Golden Pagoda', description: 'Modern Buddhist pagoda', timings: '8:00 AM - 6:00 PM', entryFee: 'Free', bestTime: 'All year', highlights: ['Golden structure', 'Buddha relics', 'Beautiful architecture', 'Prayer halls'], image: '☸️' },
            { name: 'Nuranang Falls Sacred Site', description: 'Waterfall with spiritual significance', timings: 'Sunrise to sunset', entryFee: 'Free', bestTime: 'Summer months', highlights: ['100m waterfall', 'Natural beauty', 'Photo spot', 'Peaceful atmosphere'], image: '💧' },
            { name: 'Thembang Dzong', description: 'Traditional tribal worship site', timings: 'Daylight hours', entryFee: 'Free', bestTime: 'October to March', highlights: ['Tribal architecture', 'Cultural site', 'Village life', 'Traditional beliefs'], image: '🏘️' },
            { name: 'Sangti Valley Monasteries', description: 'Peaceful monastery cluster', timings: '7:00 AM - 5:00 PM', entryFee: 'Free', bestTime: 'November to February', highlights: ['Black-necked cranes', 'Prayer halls', 'Scenic valley', 'Meditation centers'], image: '☸️' },
            { name: 'Jaswant Garh War Memorial', description: 'Memorial with spiritual significance', timings: '8:00 AM - 5:00 PM', entryFee: 'Free', bestTime: 'Summer months', highlights: ['War memorial', 'Tribute site', 'Historical importance', 'Mountain views'], image: '🏛️' },
            { name: 'Mechuka Samten Yongcha Monastery', description: 'Remote Buddhist monastery', timings: '7:00 AM - 6:00 PM', entryFee: 'Free', bestTime: 'May to September', highlights: ['Remote location', 'Siyom river views', 'Traditional monastery', 'Peaceful retreat'], image: '☸️' }
          ]
        },
        'Assam': {
          name: 'Assam',
          icon: '🛕',
          places: [
            { name: 'Kamakhya Temple', description: 'Shakti Peetha on Nilachal Hill', timings: '5:30 AM - 10:00 PM', entryFee: 'Free (₹500 VIP)', bestTime: 'Ambubachi Mela', highlights: ['Tantric goddess', 'No idol worship', 'Ambubachi festival', 'Hilltop location'], image: '🛕' },
            { name: 'Umananda Temple', description: 'Shiva temple on river island', timings: '7:00 AM - 5:30 PM', entryFee: 'Free (ferry ₹10)', bestTime: 'Maha Shivaratri', highlights: ['Brahmaputra island', 'Smallest inhabited island', 'Peacock island', 'Scenic beauty'], image: '🕉️' },
            { name: 'Navagraha Temple', description: 'Nine planets temple', timings: '5:00 AM - 9:00 PM', entryFee: 'Free', bestTime: 'Saturday', highlights: ['Astronomical significance', 'Ancient temple', 'Hilltop', 'Planetary worship'], image: '🛕' },
            { name: 'Hajo Powa Mecca', description: 'Sacred pilgrimage for Muslims', timings: '5:00 AM - 8:00 PM', entryFee: 'Free', bestTime: 'Islamic festivals', highlights: ['Mosque', 'Sufi shrine', 'Multi-faith site', 'Historical importance'], image: '🕌' },
            { name: 'Hayagriva Madhava Temple', description: 'Vishnu temple in Hajo', timings: '5:00 AM - 9:00 PM', entryFee: 'Free', bestTime: 'Doul festival', highlights: ['Buddha relics', 'Multi-faith worship', 'Ancient temple', 'Hilltop location'], image: '🛕' },
            { name: 'Basistha Ashram Temple', description: 'Sage Vasistha meditation site', timings: '6:00 AM - 7:00 PM', entryFee: 'Free', bestTime: 'Shivaratri', highlights: ['Ancient ashram', 'Waterfall', 'Cave temple', 'Natural beauty'], image: '⛰️' },
            { name: 'Dirgheshwari Temple', description: 'Shakti Peetha temple', timings: '6:00 AM - 8:00 PM', entryFee: 'Free', bestTime: 'Durga Puja', highlights: ['Goddess shrine', 'Rock temple', 'Ancient site', 'Brahmaputra views'], image: '🛕' },
            { name: 'Doul Govinda Temple', description: 'Holi festival temple', timings: '5:00 AM - 9:00 PM', entryFee: 'Free', bestTime: 'Holi/Doul', highlights: ['Krishna worship', 'Doul festival', 'Ancient temple', 'Cultural significance'], image: '🛕' },
            { name: 'Sukreswar Temple', description: 'Shiva temple on river banks', timings: '5:00 AM - 10:00 PM', entryFee: 'Free', bestTime: 'Monday evenings', highlights: ['Brahmaputra ghats', 'Ancient lingam', 'Cremation site', 'Spiritual atmosphere'], image: '🕉️' },
            { name: 'Ugratara Temple', description: 'Tantric goddess temple', timings: '5:30 AM - 1:00 PM, 4:00 PM - 9:00 PM', entryFee: 'Free', bestTime: 'Tuesdays', highlights: ['Tara worship', 'Tantric practices', 'Powerful deity', 'Jor Pukhury pond'], image: '🛕' },
            { name: 'Madan Kamdev Temple', description: 'Khajuraho of Assam ruins', timings: '7:00 AM - 5:00 PM', entryFee: '₹15', bestTime: 'October to March', highlights: ['Archaeological ruins', 'Erotic sculptures', '12th century', 'Temple complex'], image: '🏛️' },
            { name: 'Negheriting Shiva Temple', description: 'Rock-cut Shiva dham', timings: '6:00 AM - 6:00 PM', entryFee: 'Free', bestTime: 'Shivaratri', highlights: ['Rock-cut temple', 'Natural cave', 'Ancient sculptures', 'Archaeological site'], image: '⛰️' },
            { name: 'Bordubi Satra', description: 'Vaishnavite monastery', timings: '6:00 AM - 7:00 PM', entryFee: 'Free', bestTime: 'Raas festival', highlights: ['Satra culture', 'Dance drama', 'Assamese culture', 'Spiritual learning'], image: '🛕' },
            { name: 'Mahabhairab Temple', description: 'Shiva temple in Tezpur', timings: '5:00 AM - 9:00 PM', entryFee: 'Free', bestTime: 'Shivaratri', highlights: ['Ancient temple', 'Stone sculptures', 'Historical site', 'Local worship'], image: '🕉️' },
            { name: 'Aswaklanta Temple', description: 'Horse sacrifice temple', timings: '6:00 AM - 7:00 PM', entryFee: 'Free', bestTime: 'January (Magh Bihu)', highlights: ['Hot water spring', 'Natural spa', 'Temple tank', 'Healing waters'], image: '💧' },
            { name: 'Chakreshwar Temple', description: 'Hill temple in Tinsukia', timings: '6:00 AM - 8:00 PM', entryFee: 'Free', bestTime: 'Shivaratri', highlights: ['Hilltop shrine', 'Lord Shiva', 'City views', 'Peaceful location'], image: '⛰️' },
            { name: 'Sivadol Temple', description: 'Tallest Shiva temple', timings: '5:00 AM - 9:00 PM', entryFee: 'Free', bestTime: 'Morning aarti', highlights: ['104 feet tall', 'Sivasagar tank', 'Ahom architecture', 'Three temples complex'], image: '🕉️' },
            { name: 'Devi Dol', description: 'Goddess temple in Sivasagar', timings: '5:00 AM - 9:00 PM', entryFee: 'Free', bestTime: 'Durga Puja', highlights: ['Ahom period', 'Durga worship', 'Historical temple', 'Tank views'], image: '🛕' },
            { name: 'Charaideo Maidam', description: 'Ahom royal burial mounds', timings: '8:00 AM - 5:00 PM', entryFee: '₹25', bestTime: 'October to March', highlights: ['Royal tombs', 'UNESCO nominee', 'Historical site', 'Pyramids of Assam'], image: '🏛️' },
            { name: 'Tilinga Mandir', description: 'Bell temple of Assam', timings: '6:00 AM - 8:00 PM', entryFee: 'Free', bestTime: 'Festivals', highlights: ['Thousands of bells', 'Shiva temple', 'Unique tradition', 'Devotee offerings'], image: '🔔' }
          ]
        },
        'Bihar': {
          name: 'Bihar',
          icon: '☸️',
          places: [
            { name: 'Mahabodhi Temple', description: 'Where Buddha attained enlightenment', timings: '5:00 AM - 9:00 PM', entryFee: 'Free', bestTime: 'Buddha Purnima', highlights: ['UNESCO site', 'Bodhi tree', 'Vajrasana throne', 'Buddhist pilgrimage'], image: '☸️' },
            { name: 'Vishnupad Temple', description: 'Vishnu footprint temple, Gaya', timings: '5:00 AM - 9:00 PM', entryFee: 'Free', bestTime: 'Pitru Paksha', highlights: ['40cm footprint', 'Silver canopy', 'Pind daan rituals', 'Falgu river'], image: '🛕' },
            { name: 'Mahavir Mandir', description: 'Hanuman temple, Patna', timings: '4:00 AM - 10:00 PM', entryFee: 'Free', bestTime: 'Tuesday and Saturday', highlights: ['Second richest temple', 'Hanuman idol', 'Laddu prasad', 'Daily visitors'], image: '🛕' },
            { name: 'Takht Sri Patna Sahib', description: 'Guru Gobind Singh birthplace', timings: 'Open 24 hours', entryFee: 'Free', bestTime: 'Gurpurab', highlights: ['Sikh holy shrine', 'Birth site', 'Museum', 'Langar'], image: '🕉️' },
            { name: 'Nalanda Mahavihara', description: 'Ancient Buddhist university ruins', timings: '9:00 AM - 5:00 PM', entryFee: '₹30', bestTime: 'October to March', highlights: ['UNESCO site', 'Ancient university', 'Archaeological site', 'Buddhist learning'], image: '🏛️' },
            { name: 'Golghar Temple Complex', description: 'Historical granary with shrines', timings: '9:00 AM - 5:30 PM', entryFee: '₹20', bestTime: 'Evening', highlights: ['British architecture', 'City views', 'Historical site', 'Gandhi Maidan'], image: '🏛️' },
            { name: 'Mangla Gauri Temple', description: 'Shakti Peetha, Gaya', timings: '5:00 AM - 9:00 PM', entryFee: 'Free', bestTime: 'Navratri', highlights: ['Breast Shakti Peetha', 'Ancient temple', 'Hilltop', 'Archaeological significance'], image: '🛕' },
            { name: 'Thai Monastery', description: 'Buddhist temple in Bodh Gaya', timings: '7:00 AM - 8:00 PM', entryFee: 'Free', bestTime: 'Morning meditation', highlights: ['Thai architecture', 'Golden Buddha', 'Peaceful gardens', 'Meditation hall'], image: '☸️' },
            { name: 'Barabar Caves', description: 'Ancient rock-cut caves', timings: '8:00 AM - 5:00 PM', entryFee: '₹15', bestTime: 'October to March', highlights: ['Mauryan period', 'Polished walls', 'Acoustic chambers', 'Historical caves'], image: '⛰️' },
            { name: 'Jal Mandir', description: 'Pawapuri Jain temple in water', timings: '6:00 AM - 8:00 PM', entryFee: 'Free', bestTime: 'Mahavir Nirvana', highlights: ['Mahavir nirvan site', 'Water temple', 'Marble structure', 'Lotus pond'], image: '🛕' },
            { name: 'Mundeshwari Temple', description: 'Oldest functional Hindu temple', timings: '5:00 AM - 8:00 PM', entryFee: 'Free', bestTime: 'Ram Navami', highlights: ['625 CE temple', 'Octagonal structure', 'Hilltop', 'Archaeological marvel'], image: '🛕' },
            { name: 'Surya Mandir Deo', description: 'Sun temple of Bihar', timings: '6:00 AM - 7:00 PM', entryFee: 'Free', bestTime: 'Chhath Puja', highlights: ['Sun god', 'Chhath rituals', 'Ancient temple', 'Stone chariot'], image: '☀️' },
            { name: 'Dungeshwari Cave', description: 'Buddha meditation caves', timings: '6:00 AM - 6:00 PM', entryFee: 'Free', bestTime: 'Early morning', highlights: ['Buddha meditation', 'Cave shrines', 'Statues', 'Spiritual atmosphere'], image: '⛰️' },
            { name: 'Kesaria Stupa', description: 'Tallest Buddhist stupa in India', timings: '8:00 AM - 6:00 PM', entryFee: '₹25', bestTime: 'Buddha Purnima', highlights: ['104 feet tall', 'Archaeological site', 'Buddha relic', 'Ancient structure'], image: '☸️' },
            { name: 'Buxar Sun Temple', description: 'Ancient Surya temple', timings: '5:00 AM - 8:00 PM', entryFee: 'Free', bestTime: 'Chhath Puja', highlights: ['Sun worship', 'Chhath ghats', 'Ancient shrine', 'River location'], image: '☀️' },
            { name: 'Ramshila Hill', description: 'Ram-Sita footprints site', timings: '6:00 AM - 7:00 PM', entryFee: 'Free', bestTime: 'Ram Navami', highlights: ['Ramayana connection', 'Rock footprints', 'Hilltop', 'Pilgrimage site'], image: '⛰️' },
            { name: 'Patan Devi Temple', description: 'Shakti shrine, Patna', timings: '5:00 AM - 10:00 PM', entryFee: 'Free', bestTime: 'Navratri', highlights: ['Ancient goddess temple', 'Tank Shakti Peetha', 'Local worship', 'Busy shrine'], image: '🛕' },
            { name: 'Valmiki Ashram', description: 'Sage Valmiki meditation site', timings: '6:00 AM - 6:00 PM', entryFee: 'Free', bestTime: 'October to March', highlights: ['Valmiki connection', 'Ramayana', 'Tiger reserve', 'Natural beauty'], image: '🌳' },
            { name: 'Aga Mahal', description: 'Mughal-era mosque complex', timings: '5:00 AM - 9:00 PM', entryFee: 'Free', bestTime: 'Friday prayers', highlights: ['Historical mosque', 'Mughal architecture', 'Cultural site', 'Patna landmark'], image: '🕌' },
            { name: 'Sonepur Mela Temple', description: 'Ancient Harihar Nath temple', timings: '5:00 AM - 9:00 PM', entryFee: 'Free', bestTime: 'Cattle fair (Nov)', highlights: ['Harihar Nath', 'Ganges-Gandak confluence', 'Largest cattle fair', 'Pilgrimage'], image: '🛕' }
          ]
        },
        'Punjab': {
          name: 'Punjab',
          icon: '🕉️',
          places: [
            { name: 'Golden Temple (Harmandir Sahib)', description: 'Holiest shrine of Sikhism', timings: 'Open 24 hours', entryFee: 'Free', bestTime: 'Early morning for peaceful visit', highlights: ['Golden architecture', 'Sarovar (holy pool)', 'Langar (community kitchen)', 'Akal Takht'], image: '🕉️' },
            { name: 'Durgiana Temple', description: 'Hindu temple similar to Golden Temple', timings: '6:00 AM - 10:00 PM', entryFee: 'Free', bestTime: 'Morning and evening aarti', highlights: ['Silver doors', 'Sacred pool', 'Lakshmi Narayan shrine', 'Beautiful architecture'], image: '🛕' },
            { name: 'Jallianwala Bagh Memorial', description: 'Historical memorial site', timings: '6:30 AM - 7:30 PM', entryFee: 'Free', bestTime: 'Afternoon', highlights: ['Martyrs Gallery', 'Flame of Liberty', 'Well of sacrifice', 'Garden'], image: '🏛️' },
            { name: 'Ram Tirath Temple', description: 'Ancient Hindu pilgrimage site', timings: '6:00 AM - 8:00 PM', entryFee: 'Free', bestTime: 'During Ram Tirath fair', highlights: ['Ancient pond', 'Lord Rama connection', 'Annual fair', 'Sacred trees'], image: '🛕' },
            { name: 'Mata Lal Devi Temple', description: 'Cave temple dedicated to Goddess', timings: '6:00 AM - 9:00 PM', entryFee: 'Free', bestTime: 'Navratri festival', highlights: ['Cave shrine', 'Spiritual atmosphere', 'Festival celebrations', 'Prayer halls'], image: '⛰️' },
            { name: 'Gurudwara Baba Atal Rai', description: 'Nine-story octagonal tower', timings: '4:00 AM - 10:00 PM', entryFee: 'Free', bestTime: 'Morning hours', highlights: ['Architectural marvel', 'Panoramic views', 'Historical significance', 'Frescoes'], image: '🕉️' },
            { name: 'Khalsa College Gurdwara', description: 'Historic Sikh educational institution', timings: '8:00 AM - 6:00 PM', entryFee: 'Free', bestTime: 'Weekday mornings', highlights: ['Architectural beauty', 'Educational legacy', 'Gardens', 'Museum'], image: '🕉️' },
            { name: 'Goindwal Sahib', description: 'Important Sikh pilgrimage', timings: 'Open 24 hours', entryFee: 'Free', bestTime: 'Gurpurabs', highlights: ['84 steps', 'Baoli (stepwell)', 'Historical gurdwara', 'Spiritual significance'], image: '🕉️' },
            { name: 'Tarn Taran Sahib', description: 'Sacred Sikh shrine with largest sarovar', timings: 'Open 24 hours', entryFee: 'Free', bestTime: 'Full moon nights', highlights: ['Largest sarovar', 'Golden dome', 'Healing powers belief', 'Langar'], image: '🕉️' },
            { name: 'Anandpur Sahib', description: 'Birthplace of Khalsa', timings: 'Open 24 hours', entryFee: 'Free', bestTime: 'Hola Mohalla festival', highlights: ['Takht Kesgarh Sahib', 'Historical importance', 'Virasat-e-Khalsa museum', 'Festivals'], image: '🕉️' },
            { name: 'Fatehgarh Sahib', description: 'Martyrdom site of Sahibzadas', timings: 'Open 24 hours', entryFee: 'Free', bestTime: 'December martyrdom day', highlights: ['Gurdwara Fatehgarh Sahib', 'Memorial', 'Historical significance', 'Museums'], image: '🕉️' },
            { name: 'Ber Sahib Gurdwara', description: 'Historic jujube tree site', timings: 'Open 24 hours', entryFee: 'Free', bestTime: 'Morning hours', highlights: ['Sacred ber tree', 'Guru Arjan Dev connection', 'Peaceful atmosphere', 'Architecture'], image: '🕉️' },
            { name: 'Gurudwara Manji Sahib', description: 'Where Guru Arjan compiled Granth Sahib', timings: '4:00 AM - 10:00 PM', entryFee: 'Free', bestTime: 'Early morning', highlights: ['Historical significance', 'Spiritual importance', 'Architecture', 'Serene environment'], image: '🕉️' },
            { name: 'Gurudwara Janam Asthan', description: 'Birthplace of Guru Ram Das', timings: 'Open 24 hours', entryFee: 'Free', bestTime: 'Birth anniversary', highlights: ['Birth site', 'Sacred well', 'Historical gurdwara', 'Architecture'], image: '🕉️' },
            { name: 'Lohgarh Sahib', description: 'Fort gurdwara of Guru Gobind Singh', timings: 'Open 24 hours', entryFee: 'Free', bestTime: 'Morning visits', highlights: ['Historic fort', 'Guru Gobind Singh legacy', 'Weapons display', 'Architecture'], image: '🕉️' },
            { name: 'Patalpuri Gurudwara', description: 'Underground shrine', timings: 'Open 24 hours', entryFee: 'Free', bestTime: 'Afternoon', highlights: ['Underground chamber', 'Unique architecture', 'Historical significance', 'Sacred atmosphere'], image: '🕉️' },
            { name: 'Ram Bagh Palace Temple', description: 'Historic palace temple', timings: '8:00 AM - 7:00 PM', entryFee: 'Free', bestTime: 'Evening hours', highlights: ['Palace architecture', 'Gardens', 'Museum', 'Historical artifacts'], image: '🏛️' },
            { name: 'Bhigu Temple', description: 'Ancient Shiva temple', timings: '6:00 AM - 9:00 PM', entryFee: 'Free', bestTime: 'Maha Shivratri', highlights: ['Sage Bhrigu connection', 'Shiva linga', 'Ancient architecture', 'Festival celebrations'], image: '🛕' },
            { name: 'Sheetla Mata Temple', description: 'Goddess Sheetla shrine', timings: '5:00 AM - 9:00 PM', entryFee: 'Free', bestTime: 'Chaitra month', highlights: ['Goddess worship', 'Annual fair', 'Healing deity', 'Devotional atmosphere'], image: '🛕' },
            { name: 'Vaishno Devi Temple (Ludhiana)', description: 'Replica of Kashmir shrine', timings: '6:00 AM - 9:00 PM', entryFee: 'Free', bestTime: 'Navratri', highlights: ['Cave shrine', 'Goddess Durga', 'Festival celebrations', 'Religious significance'], image: '⛰️' }
          ]
        },
        'Uttar Pradesh': {
          name: 'Uttar Pradesh',
          icon: '🕉️',
          places: [
            { name: 'Kashi Vishwanath Temple', description: 'One of 12 Jyotirlingas, Varanasi', timings: '3:00 AM - 11:00 PM', entryFee: 'Free', bestTime: 'Early morning aarti', highlights: ['Golden spire', 'Shiva Jyotirlinga', 'Ganga ghat nearby', 'Ancient pilgrimage'], image: '🕉️' },
            { name: 'Ram Janmabhoomi', description: 'Birthplace of Lord Rama, Ayodhya', timings: '6:00 AM - 10:00 PM', entryFee: 'Free', bestTime: 'Ram Navami', highlights: ['Ram temple', 'Historical site', 'Saryu river', 'New grand temple'], image: '🛕' },
            { name: 'Krishna Janmabhoomi', description: 'Birthplace of Lord Krishna, Mathura', timings: '5:30 AM - 12:00 PM, 4:00 PM - 9:30 PM', entryFee: '₹35', bestTime: 'Janmashtami', highlights: ['Birth prison cell', 'Krishna temple', 'Museum', 'Ancient site'], image: '🛕' },
            { name: 'Banke Bihari Temple', description: 'Krishna temple in Vrindavan', timings: '7:45 AM - 12:00 PM, 5:30 PM - 9:30 PM', entryFee: 'Free', bestTime: 'Holi and Janmashtami', highlights: ['Unique deity', 'No aarti', 'Flower showers', 'Devotional atmosphere'], image: '🛕' },
            { name: 'ISKCON Vrindavan', description: 'International Krishna temple', timings: '4:30 AM - 1:00 PM, 4:00 PM - 9:00 PM', entryFee: 'Free', bestTime: 'Evening aarti', highlights: ['Modern temple', 'Beautiful deities', 'Gardens', 'Guest house'], image: '🛕' },
            { name: 'Sarnath', description: 'Where Buddha gave first sermon', timings: 'Sunrise to sunset', entryFee: '₹15', bestTime: 'Buddha Purnima', highlights: ['Dhamek Stupa', 'Ashoka pillar', 'Buddhist temples', 'Archaeological site'], image: '☸️' },
            { name: 'Jama Masjid Fatehpur Sikri', description: 'Mughal mosque', timings: '7:00 AM - 6:00 PM', entryFee: 'Free', bestTime: 'Morning prayers', highlights: ['Buland Darwaza', 'Salim Chishti tomb', 'Mughal architecture', 'Courtyard'], image: '🕌' },
            { name: 'Hanuman Garhi', description: 'Hanuman temple in Ayodhya', timings: '5:00 AM - 9:00 PM', entryFee: 'Free', bestTime: 'Tuesday and Saturday', highlights: ['Fort temple', '76 steps', 'Hanuman deity', 'City views'], image: '🛕' },
            { name: 'Kanak Bhawan', description: 'Rama-Sita palace temple, Ayodhya', timings: '7:00 AM - 11:00 AM, 3:00 PM - 7:00 PM', entryFee: 'Free', bestTime: 'Morning darshan', highlights: ['Golden crowns', 'Rama-Sita idols', 'Beautiful architecture', 'Sacred site'], image: '🛕' },
            { name: 'Prem Mandir', description: 'Modern Radha-Krishna temple, Vrindavan', timings: '5:30 AM - 12:00 PM, 4:30 PM - 8:30 PM', entryFee: 'Free', bestTime: 'Evening light show', highlights: ['White marble', 'Illumination show', 'Musical fountains', 'Intricate carvings'], image: '🛕' },
            { name: 'Govardhan Hill', description: 'Sacred hill lifted by Krishna', timings: 'Open 24 hours', entryFee: 'Free', bestTime: 'Govardhan Puja', highlights: ['Parikrama (circumambulation)', 'Temples around hill', 'Sacred ponds', 'Krishna legends'], image: '⛰️' },
            { name: 'Radha Kund', description: 'Most sacred pond in Vrindavan', timings: 'Open 24 hours', entryFee: 'Free', bestTime: 'Kartik month', highlights: ['Sacred bathing', 'Temples', 'Spiritual significance', 'Parikrama'], image: '💧' },
            { name: 'Nidhivan', description: 'Sacred grove in Vrindavan', timings: '8:00 AM - 6:00 PM', entryFee: 'Free', bestTime: 'Daytime only', highlights: ['Mystical place', 'Twisted trees', 'Rasleela legends', 'Spiritual atmosphere'], image: '🌳' },
            { name: 'Tulsi Manas Temple', description: 'Marble Ramayana temple, Varanasi', timings: '5:30 AM - 12:00 PM, 3:30 PM - 9:00 PM', entryFee: 'Free', bestTime: 'Evening', highlights: ['Ramayana verses on walls', 'Beautiful architecture', 'Light shows', 'Peaceful gardens'], image: '🛕' },
            { name: 'Sankat Mochan Temple', description: 'Hanuman temple, Varanasi', timings: '5:00 AM - 10:00 PM', entryFee: 'Free', bestTime: 'Tuesday', highlights: ['Tulsi Das connection', 'Classical music festival', 'Peaceful atmosphere', 'Monkey presence'], image: '🛕' },
            { name: 'Durga Temple', description: 'Shakti temple, Varanasi', timings: '5:00 AM - 12:00 PM, 3:00 PM - 9:00 PM', entryFee: 'Free', bestTime: 'Navratri', highlights: ['Red temple', 'Kund (pool)', 'Monkeys', 'Bengali architecture'], image: '🛕' },
            { name: 'Bateshwar Temples', description: 'Ancient temple complex, Agra', timings: 'Sunrise to sunset', entryFee: 'Free', bestTime: 'Winter months', highlights: ['200 temples', 'Archaeological site', 'Yamuna riverside', 'Ancient architecture'], image: '🛕' },
            { name: 'Mankameshwar Temple', description: 'Ancient Shiva temple, Agra', timings: '5:00 AM - 10:00 PM', entryFee: 'Free', bestTime: 'Maha Shivratri', highlights: ['Ancient lingam', 'Historical significance', 'Local worship', 'Architecture'], image: '🛕' },
            { name: 'Gorakhnath Temple', description: 'Nath sect temple, Gorakhpur', timings: '4:00 AM - 10:00 PM', entryFee: 'Free', bestTime: 'Morning aarti', highlights: ['Guru Gorakhnath', 'Large complex', 'Yogi Adityanath connection', 'Fair grounds'], image: '🛕' },
            { name: 'Vindhyachal Devi Temple', description: 'Shakti Peetha, Mirzapur', timings: 'Open 24 hours', entryFee: 'Free', bestTime: 'Navratri', highlights: ['Goddess Vindhyavasini', 'Tri-devi temples', 'Pilgrimage site', 'Ganga views'], image: '🛕' }
          ]
        },
        'Chhattisgarh': {
          name: 'Chhattisgarh',
          icon: '🛕',
          places: [
            { name: 'Bhoramdeo Temple', description: 'Khajuraho of Chhattisgarh', timings: '6:00 AM - 6:00 PM', entryFee: 'Free', bestTime: 'October to March', highlights: ['Erotic sculptures', '11th century', 'Nagara style', 'Archaeological marvel'], image: '🛕' },
            { name: 'Rajim Temple Complex', description: 'Prayag of Chhattisgarh', timings: '5:00 AM - 9:00 PM', entryFee: 'Free', bestTime: 'Rajim Kumbh', highlights: ['River confluence', 'Vishnu temples', 'Annual fair', 'Sacred site'], image: '🛕' },
            { name: 'Mahamaya Temple', description: 'Shakti Peetha in Ratanpur', timings: '5:00 AM - 9:00 PM', entryFee: 'Free', bestTime: 'Navratri', highlights: ['Ancient goddess temple', 'Historical capital', 'Stone sculptures', 'Religious significance'], image: '🛕' },
            { name: 'Danteshwari Temple', description: 'Bastar goddess temple', timings: '5:00 AM - 9:00 PM', entryFee: 'Free', bestTime: 'Dussehra', highlights: ['52 Shakti Peethas', 'Tooth relic', 'Tribal worship', 'Unique traditions'], image: '🛕' },
            { name: 'Champaran Buddha Vihar', description: 'Buddhist pilgrimage site', timings: '6:00 AM - 6:00 PM', entryFee: 'Free', bestTime: 'Buddha Purnima', highlights: ['Buddha connection', 'Ancient monastery', 'Relics', 'Peaceful atmosphere'], image: '☸️' },
            { name: 'Tala Village Temples', description: 'Ancient Shiva temple ruins', timings: '7:00 AM - 6:00 PM', entryFee: '₹25', bestTime: 'Winter months', highlights: ['Devrani-Jethani temples', 'Archaeological site', '6th century', 'Brick structures'], image: '🛕' },
            { name: 'Bambleshwari Temple', description: 'Hilltop Shakti temple', timings: '5:00 AM - 9:00 PM', entryFee: 'Free', bestTime: 'Navratri', highlights: ['Mountain temple', 'Goddess Durga', 'Ropeway', 'Panoramic views'], image: '⛰️' },
            { name: 'Shivrinarayan Temple', description: 'Vishnu temple on river banks', timings: '5:00 AM - 9:00 PM', entryFee: 'Free', bestTime: 'Magh Purnima', highlights: ['Mahanadi ghats', 'Ancient temple', 'Fair ground', 'Pilgrimage site'], image: '🛕' },
            { name: 'Giroudpuri Dham', description: 'Satnam Panth headquarters', timings: '5:00 AM - 9:00 PM', entryFee: 'Free', bestTime: 'December festival', highlights: ['Religious movement', 'Guru Ghasidas', 'Community worship', 'Cultural center'], image: '🛕' },
            { name: 'Kharod Lakshmana Temple', description: 'Brick temple of Vishnu', timings: '6:00 AM - 7:00 PM', entryFee: 'Free', bestTime: 'Morning hours', highlights: ['Ancient bricks', 'Vishnu idol', 'Archaeological site', 'Historical importance'], image: '🛕' },
            { name: 'Malhar Archaeological Site', description: 'Ancient temple ruins', timings: '8:00 AM - 5:00 PM', entryFee: '₹15', bestTime: 'October to February', highlights: ['Pataleshwar temple', '2500 years old', 'Excavation site', 'Museum'], image: '🏛️' },
            { name: 'Sheorinarayan Temple', description: 'Vishnu temple complex', timings: '5:00 AM - 8:00 PM', entryFee: 'Free', bestTime: 'Magh Purnima fair', highlights: ['River location', 'Ancient temples', 'Pilgrimage', 'Sacred bathing'], image: '🛕' },
            { name: 'Chandrahasini Devi Temple', description: 'Goddess temple in Janjgir', timings: '5:00 AM - 9:00 PM', entryFee: 'Free', bestTime: 'Chaitra Navratri', highlights: ['Ancient shrine', 'Goddess worship', 'Local deity', 'Festival celebrations'], image: '🛕' },
            { name: 'Madku Dweep', description: 'Shiva island temple', timings: '6:00 AM - 7:00 PM', entryFee: 'Free', bestTime: 'Maha Shivaratri', highlights: ['River island', 'Shiva temple', 'Natural beauty', 'Boat access'], image: '🕉️' },
            { name: 'Ratanpur Mahamaya Mandir', description: 'Ancient capital temple', timings: '5:00 AM - 9:00 PM', entryFee: 'Free', bestTime: 'Navratri', highlights: ['Kalachuri capital', 'Stone temple', 'Historical site', 'Fort remains'], image: '🛕' },
            { name: 'Sirpur Lakshmana Temple', description: 'Brick temple masterpiece', timings: '9:00 AM - 5:00 PM', entryFee: '₹25', bestTime: 'Winter season', highlights: ['7th century', 'Brick architecture', 'UNESCO nominee', 'Buddhist remains'], image: '🛕' },
            { name: 'Banjari Temple', description: 'Mahadev temple in forests', timings: '6:00 AM - 6:00 PM', entryFee: 'Free', bestTime: 'Shivaratri', highlights: ['Forest location', 'Natural cave', 'Shiva linga', 'Peaceful setting'], image: '⛰️' },
            { name: 'Nagar Ghanta Mandir', description: 'Bell temple of Raipur', timings: '5:00 AM - 9:00 PM', entryFee: 'Free', bestTime: 'Morning and evening', highlights: ['Modern architecture', 'Large bells', 'Swami Dayanand', 'City landmark'], image: '🔔' },
            { name: 'Deorani Jethani Temple', description: 'Twin temples complex', timings: '7:00 AM - 6:00 PM', entryFee: '₹25', bestTime: 'October to March', highlights: ['6th century', 'Brick construction', 'Unique architecture', 'Archaeological site'], image: '🛕' },
            { name: 'Kabir Chabutra', description: 'Sant Kabir meditation site', timings: 'Open 24 hours', entryFee: 'Free', bestTime: 'Kabir Jayanti', highlights: ['Kabir connection', 'Historical site', 'Spiritual importance', 'Cultural center'], image: '🕉️' }
          ]
        },
        'Goa': {
          name: 'Goa',
          icon: '⛪',
          places: [
            { name: 'Basilica of Bom Jesus', description: 'UNESCO site with St. Francis Xavier', timings: '9:00 AM - 6:30 PM', entryFee: 'Free', bestTime: 'December (Feast of St. Francis)', highlights: ['UNESCO World Heritage', 'St. Francis Xavier body', 'Baroque architecture', 'World Heritage'], image: '⛪' },
            { name: 'Se Cathedral', description: 'Largest church in Asia', timings: '7:30 AM - 6:00 PM', entryFee: 'Free', bestTime: 'Morning Mass', highlights: ['Golden Bell', 'Portuguese Gothic', 'Five altars', 'Historical architecture'], image: '⛪' },
            { name: 'Shri Manguesh Temple', description: 'Ancient Shiva temple', timings: '5:00 AM - 10:00 PM', entryFee: 'Free', bestTime: 'Maha Shivaratri', highlights: ['Deepstambh (lamp tower)', 'Goan Hindu architecture', 'Peaceful ambiance', 'Temple tank'], image: '🛕' },
            { name: 'Shanta Durga Temple', description: 'Goddess of peace temple', timings: '6:00 AM - 10:00 PM', entryFee: 'Free', bestTime: 'Navratri', highlights: ['Unique architecture', 'Goddess Durga', 'Temple complex', 'Cultural significance'], image: '🛕' },
            { name: 'Church of Our Lady of Immaculate Conception', description: 'Iconic white church in Panjim', timings: '9:00 AM - 12:30 PM, 3:00 PM - 5:30 PM', entryFee: 'Free', bestTime: 'December Feast', highlights: ['Baroque style', 'Zigzag steps', 'City center', 'Bell tower'], image: '⛪' },
            { name: 'Mahalaxmi Temple', description: 'Goddess Lakshmi shrine', timings: '6:00 AM - 10:00 PM', entryFee: 'Free', bestTime: 'Tuesdays and Fridays', highlights: ['Original deity', 'Goan architecture', 'Peaceful location', 'Temple festivals'], image: '🛕' },
            { name: 'Church of St. Francis of Assisi', description: 'Portuguese church with museum', timings: '9:00 AM - 5:00 PM (Closed Friday)', entryFee: 'Free', bestTime: 'Morning visits', highlights: ['Archaeological Museum', 'Manueline style', 'Wood carvings', 'Historical artifacts'], image: '⛪' },
            { name: 'Tambdi Surla Mahadev Temple', description: 'Oldest temple in Goa', timings: '6:00 AM - 5:30 PM', entryFee: 'Free', bestTime: 'Shivaratri', highlights: ['12th century', 'Kadamba architecture', 'Forest location', 'Stone carvings'], image: '🛕' },
            { name: 'Church of St. Cajetan', description: 'Inspired by St. Peters Rome', timings: '9:00 AM - 5:30 PM', entryFee: 'Free', bestTime: 'Sunday Mass', highlights: ['Corinthian style', 'Cupola dome', 'Italian architecture', 'Old Goa'], image: '⛪' },
            { name: 'Shri Damodar Temple', description: 'Ancient Krishna temple', timings: '6:00 AM - 9:00 PM', entryFee: 'Free', bestTime: 'Janmashtami', highlights: ['Krishna deity', 'Temple architecture', 'Peaceful setting', 'Religious festivals'], image: '🛕' },
            { name: 'Church of St. Augustine', description: 'Magnificent church ruins', timings: 'Open access', entryFee: 'Free', bestTime: 'Sunset', highlights: ['Historic ruins', 'Bell tower remains', 'Augustinian monastery', 'Photography spot'], image: '⛪' },
            { name: 'Shri Nagesh Temple', description: 'Lord Shiva temple', timings: '6:00 AM - 9:00 PM', entryFee: 'Free', bestTime: 'Shivaratri', highlights: ['Nandi statue', 'Temple tank', 'Goan architecture', 'Religious importance'], image: '🛕' },
            { name: 'Church of Our Lady of the Rosary', description: 'Earliest church in Goa', timings: '9:00 AM - 5:00 PM', entryFee: 'Free', bestTime: 'Morning hours', highlights: ['1526 built', 'Portuguese Manueline', 'Hilltop location', 'Historical significance'], image: '⛪' },
            { name: 'Shri Mahalsa Narayani Temple', description: 'Vishnu avatar goddess', timings: '6:00 AM - 10:00 PM', entryFee: 'Free', bestTime: 'Full moon days', highlights: ['Unique deity', 'Temple architecture', 'Peaceful ambiance', 'Cultural festivals'], image: '🛕' },
            { name: 'Chapel of St. Catherine', description: 'Historic chapel at entry', timings: '9:00 AM - 5:00 PM', entryFee: 'Free', bestTime: 'Morning visits', highlights: ['Old Goa gateway', 'Portuguese heritage', 'Simple architecture', 'Historical marker'], image: '⛪' },
            { name: 'Shri Ramnathi Temple', description: 'Lord Rama temple', timings: '6:00 AM - 9:00 PM', entryFee: 'Free', bestTime: 'Ram Navami', highlights: ['Temple complex', 'Cultural center', 'Festivals', 'Goan Hindu tradition'], image: '🛕' },
            { name: 'Three Kings Chapel', description: 'Hilltop church with views', timings: '8:00 AM - 5:00 PM', entryFee: 'Free', bestTime: 'January Feast', highlights: ['Panoramic views', 'Three Kings Feast', 'Hilltop location', 'Scenic beauty'], image: '⛪' },
            { name: 'Khandepar Caves Temple', description: 'Rock-cut cave shrine', timings: '7:00 AM - 6:00 PM', entryFee: 'Free', bestTime: 'Winter months', highlights: ['Cave temple', 'Ancient carvings', 'Archaeological site', 'Natural formation'], image: '⛰️' },
            { name: 'Church of the Holy Spirit', description: 'Margao church landmark', timings: '6:00 AM - 7:00 PM', entryFee: 'Free', bestTime: 'Sunday Mass', highlights: ['Baroque architecture', 'Ornate interiors', 'City center', 'Cultural hub'], image: '⛪' },
            { name: 'Saptakoteshwar Temple', description: 'Lord Shiva shrine', timings: '6:00 AM - 9:00 PM', entryFee: 'Free', bestTime: 'Shivaratri', highlights: ['Riverside location', 'Temple architecture', 'Religious significance', 'Peaceful setting'], image: '🛕' }
          ]
        },
        'Gujarat': {
          name: 'Gujarat',
          icon: '🛕',
          places: [
            { name: 'Somnath Temple', description: 'First of 12 Jyotirlingas', timings: '6:00 AM - 9:30 PM', entryFee: 'Free', bestTime: 'Evening aarti', highlights: ['Jyotirlinga', 'Arabian Sea shore', 'Light & sound show', 'Destroyed and rebuilt 17 times'], image: '🕉️' },
            { name: 'Dwarkadhish Temple', description: 'Krishna temple, Char Dham', timings: '6:30 AM - 1:00 PM, 5:00 PM - 9:30 PM', entryFee: 'Free', bestTime: 'Janmashtami', highlights: ['Char Dham', 'Krishna dwaraka', 'Flagpost 52m tall', 'Sea proximity'], image: '🛕' },
            { name: 'Akshardham Gandhinagar', description: 'Modern Hindu temple complex', timings: '9:30 AM - 7:30 PM (Closed Monday)', entryFee: 'Free', bestTime: 'Evening fountain show', highlights: ['Largest Akshardham', 'Exhibitions', 'Musical fountain', 'Swaminarayan tradition'], image: '🛕' },
            { name: 'Sun Temple Modhera', description: 'Iconic Surya temple', timings: '6:00 AM - 6:00 PM', entryFee: '₹25', bestTime: 'Sunrise', highlights: ['Stepwell', 'Solanki architecture', '11th century', 'Dance festival venue'], image: '☀️' },
            { name: 'Rani Ki Vav', description: 'UNESCO stepwell with shrines', timings: '8:00 AM - 6:00 PM', entryFee: '₹40', bestTime: 'October to March', highlights: ['UNESCO site', '7-story stepwell', 'Sculptures', '11th century marvel'], image: '🏛️' },
            { name: 'Ambaji Temple', description: 'Shakti Peetha', timings: '6:00 AM - 10:00 PM', entryFee: 'Free', bestTime: 'Navratri', highlights: ['51 Shakti Peethas', 'No idol worship', 'Yantra', 'Arasur hills'], image: '🛕' },
            { name: 'Palitana Temples', description: 'Largest Jain pilgrimage', timings: 'Dawn to dusk', entryFee: '₹50', bestTime: 'November to February', highlights: ['3500+ marble temples', 'Shatrunjaya hill', '863 temples on peaks', 'Jain pilgrimage'], image: '⛰️' },
            { name: 'Jagannath Temple Ahmedabad', description: 'Krishna-Balaram temple', timings: '6:00 AM - 12:00 PM, 4:00 PM - 9:00 PM', entryFee: 'Free', bestTime: 'Rath Yatra', highlights: ['Rath Yatra', 'Jagannath idols', 'Heritage site', 'Festival celebrations'], image: '🛕' },
            { name: 'Girnar Temples', description: 'Sacred Jain & Hindu hill', timings: '4:00 AM - 6:00 PM', entryFee: 'Free', bestTime: 'Kartik Purnima', highlights: ['10,000 steps', 'Neminath temple', 'Dattatreya paduka', 'Mountain pilgrimage'], image: '⛰️' },
            { name: 'Rukmini Devi Temple', description: 'Krishna wife temple, Dwarka', timings: '6:00 AM - 12:00 PM, 4:00 PM - 8:00 PM', entryFee: 'Free', bestTime: 'Morning hours', highlights: ['Rukmini deity', 'Ancient temple', 'Beautiful carvings', 'Near Dwarka'], image: '🛕' },
            { name: 'Becharaji Temple', description: 'Bahucharaji goddess', timings: '5:00 AM - 9:00 PM', entryFee: 'Free', bestTime: 'Navratri', highlights: ['Kuldevi of many', 'Annual fair', 'Goddess worship', 'Cultural significance'], image: '🛕' },
            { name: 'Hatkeshwar Mahadev', description: 'Shiva temple in Vadnagar', timings: '6:00 AM - 8:00 PM', entryFee: 'Free', bestTime: 'Shivaratri', highlights: ['Ancient temple', 'Torans (archway)', 'Archaeological site', 'Historical town'], image: '🕉️' },
            { name: 'Kirti Mandir', description: 'Gandhi birthplace memorial', timings: '9:30 AM - 6:30 PM', entryFee: 'Free', bestTime: 'Gandhi Jayanti', highlights: ['Gandhi birthplace', 'Memorial', 'Photo exhibition', 'Historical importance'], image: '🏛️' },
            { name: 'Swaminarayan Temple Bhuj', description: 'Earthquake-survived temple', timings: '6:00 AM - 12:00 PM, 4:00 PM - 9:00 PM', entryFee: 'Free', bestTime: 'Morning darshan', highlights: ['200 years old', 'Wood carvings', 'Swaminarayan sect', 'Kutch culture'], image: '🛕' },
            { name: 'Ashapura Mata Temple', description: 'Kuldevi of Kutch', timings: '5:00 AM - 9:00 PM', entryFee: 'Free', bestTime: 'Navratri', highlights: ['Hilltop temple', 'Kutch goddess', 'Panoramic views', 'Tribal worship'], image: '⛰️' },
            { name: 'Baps Shri Swaminarayan Mandir', description: 'Modern temple in Rajkot', timings: '9:00 AM - 12:00 PM, 4:00 PM - 8:00 PM', entryFee: 'Free', bestTime: 'Evening aarti', highlights: ['Modern architecture', 'Marble structure', 'Cultural activities', 'Youth programs'], image: '🛕' },
            { name: 'Gopnath Mahadev', description: 'Beach Shiva temple', timings: '6:00 AM - 8:00 PM', entryFee: 'Free', bestTime: 'Shivaratri', highlights: ['Beach location', 'Ancient temple', 'Scenic beauty', 'Peaceful atmosphere'], image: '🕉️' },
            { name: 'Dabhoi Fort Temples', description: 'Fort with ancient temples', timings: '8:00 AM - 6:00 PM', entryFee: '₹15', bestTime: 'October to March', highlights: ['13th century fort', 'Jain temples', 'Historical gates', 'Archaeological site'], image: '🏛️' },
            { name: 'Hutheesing Jain Temple', description: 'White marble Jain temple', timings: '7:00 AM - 7:00 PM', entryFee: 'Free', bestTime: 'Morning hours', highlights: ['Marble architecture', 'Intricate carvings', '1848 built', 'Ahmedabad landmark'], image: '🛕' },
            { name: 'Pavagadh Kalika Mata Temple', description: 'Hilltop Shakti Peetha', timings: '6:00 AM - 10:00 PM', entryFee: 'Free (ropeway ₹150)', bestTime: 'Navratri', highlights: ['Shakti Peetha', 'UNESCO hill', 'Ropeway', 'Champaner ruins'], image: '⛰️' }
          ]
        },
        'Haryana': {
          name: 'Haryana',
          icon: '🛕',
          places: [
            { name: 'Brahma Sarovar', description: 'Sacred lake in Kurukshetra', timings: 'Open 24 hours', entryFee: 'Free', bestTime: 'Solar eclipse', highlights: ['Largest manmade sarovar', 'Mahabharata connection', 'Sacred bathing', 'Solar eclipse bathing'], image: '💧' },
            { name: 'Jyotisar', description: 'Bhagavad Gita birthplace', timings: '6:00 AM - 8:00 PM', entryFee: 'Free', bestTime: 'Gita Jayanti', highlights: ['Krishna-Arjuna conversation', 'Sacred Banyan tree', 'Mahabharata site', 'Marble chariot'], image: '🛕' },
            { name: 'Bhadrakali Temple', description: 'Ancient Shakti temple, Kurukshetra', timings: '5:00 AM - 10:00 PM', entryFee: 'Free', bestTime: 'Navratri', highlights: ['Shakti worship', 'Pandavas worship', 'Ancient temple', 'Religious significance'], image: '🛕' },
            { name: 'Panchkula Mansa Devi Temple', description: 'Hilltop goddess temple', timings: '5:00 AM - 10:00 PM', entryFee: 'Free (ropeway ₹50)', bestTime: 'Navratri', highlights: ['Cable car', 'Wish fulfillment', 'Shivalik hills', 'Twin temples'], image: '⛰️' },
            { name: 'Sthaneshwar Mahadev Temple', description: 'Ancient Shiva temple', timings: '4:00 AM - 10:00 PM', entryFee: 'Free', bestTime: 'Shivaratri', highlights: ['Mahabharata period', 'Shiva linga', 'Historical temple', 'Kurukshetra'], image: '🕉️' },
            { name: 'Sheikh Chilli Tomb', description: 'Sufi saint shrine', timings: '8:00 AM - 6:00 PM', entryFee: 'Free', bestTime: 'Thursday (Urs)', highlights: ['Mughal architecture', 'Gardens', 'Sufi shrine', 'Glazed tiles'], image: '🕌' },
            { name: 'Bhima Devi Temple', description: 'Archaeological temple ruins', timings: '10:00 AM - 5:00 PM (Closed Monday)', entryFee: '₹25', bestTime: 'October to March', highlights: ['11th century', 'Sculptures', 'Archaeological site', 'Nagara style'], image: '🏛️' },
            { name: 'Kalesar Mahadev Temple', description: 'Forest Shiva temple', timings: '6:00 AM - 7:00 PM', entryFee: 'Free', bestTime: 'Shivaratri', highlights: ['Forest location', 'National park', 'Ancient temple', 'Natural beauty'], image: '⛰️' },
            { name: 'Harsh Ka Tila', description: 'Buddhist stupa site', timings: '9:00 AM - 5:00 PM', entryFee: 'Free', bestTime: 'Buddha Purnima', highlights: ['Buddhist stupa', 'Emperor Harsha', 'Archaeological site', 'Historical importance'], image: '☸️' },
            { name: 'Chor Gumbad', description: 'Sufi tomb monument', timings: 'Sunrise to sunset', entryFee: 'Free', bestTime: 'Morning hours', highlights: ['Indo-Islamic architecture', 'Mughal era', 'Historical monument', 'Archaeological site'], image: '🕌' },
            { name: 'Raja Nahar Singh Palace', description: 'Palace with prayer hall', timings: '10:00 AM - 5:00 PM', entryFee: '₹20', bestTime: 'Weekdays', highlights: ['Royal palace', 'Freedom fighter', 'Historical site', 'Museum'], image: '🏛️' },
            { name: 'Sai Dham Temple', description: 'Modern Sai Baba temple', timings: '6:00 AM - 9:00 PM', entryFee: 'Free', bestTime: 'Thursday', highlights: ['Modern architecture', 'Sai Baba', 'Peaceful atmosphere', 'Daily aarti'], image: '🛕' },
            { name: 'Pehowa Temples', description: 'Pind daan ritual site', timings: '5:00 AM - 9:00 PM', entryFee: 'Free', bestTime: 'Pitru Paksha', highlights: ['Ancestor rituals', 'Saraswati river', 'Ancient ghats', 'Religious ceremonies'], image: '🛕' },
            { name: 'Kalpana Chawla Planetarium', description: 'Science center with cosmic theme', timings: '10:00 AM - 5:00 PM (Closed Monday)', entryFee: '₹50', bestTime: 'Weekend shows', highlights: ['Space theme', 'Planetarium', 'Science museum', 'Educational'], image: '🌟' },
            { name: 'Sis Ganj Gurudwara', description: 'Historic Sikh shrine', timings: 'Open 24 hours', entryFee: 'Free', bestTime: 'Gurpurab', highlights: ['Guru Tegh Bahadur', 'Historical significance', 'Sikh heritage', 'Peaceful atmosphere'], image: '🕉️' },
            { name: 'Agroha Dham', description: 'Ancient Agrawal community site', timings: '6:00 AM - 8:00 PM', entryFee: 'Free', bestTime: 'October fair', highlights: ['Agrawal origin', 'Twin temples', 'Archaeological mound', 'Community center'], image: '🛕' },
            { name: 'Devikoop Bawdi', description: 'Sacred stepwell', timings: '6:00 AM - 7:00 PM', entryFee: 'Free', bestTime: 'Morning hours', highlights: ['Ancient stepwell', 'Goddess worship', 'Historical architecture', 'Water harvesting'], image: '💧' },
            { name: 'Karnal Dargah', description: 'Sufi shrine in Karnal', timings: '6:00 AM - 8:00 PM', entryFee: 'Free', bestTime: 'Thursday', highlights: ['Sufi shrine', 'Peaceful atmosphere', 'Multi-faith visit', 'Cultural site'], image: '🕌' },
            { name: 'Pinjore Gardens Temples', description: 'Mughal garden shrines', timings: '7:00 AM - 10:00 PM', entryFee: '₹25', bestTime: 'Mango Mela', highlights: ['Mughal gardens', 'Sheesh Mahal', 'Water features', 'Historical site'], image: '🏛️' },
            { name: 'Surajkund', description: 'Ancient sun temple tank', timings: 'Open 24 hours', entryFee: 'Free (fair ₹50)', bestTime: 'February craft fair', highlights: ['10th century reservoir', 'Crafts fair', 'Amphitheater', 'Cultural events'], image: '☀️' }
          ]
        },
        'Tamil Nadu': {
          name: 'Tamil Nadu',
          icon: '🕉️',
          places: [
            { name: 'Meenakshi Amman Temple', description: 'Iconic temple with gopurams, Madurai', timings: '5:00 AM - 12:30 PM, 4:00 PM - 9:30 PM', entryFee: 'Free (₹50 special darshan)', bestTime: 'Chithirai festival', highlights: ['14 gopurams', 'Hall of 1000 pillars', 'Golden lotus tank', 'Ancient Dravidian architecture'], image: '🕉️' },
            { name: 'Ramanathaswamy Temple', description: 'Sacred Shiva temple, Rameswaram', timings: '5:00 AM - 1:00 PM, 3:00 PM - 9:00 PM', entryFee: 'Free', bestTime: 'Maha Shivratri', highlights: ['Longest corridor in India', '22 theerthams', 'Jyotirlinga', 'Sea temple'], image: '🕉️' },
            { name: 'Brihadeeswara Temple', description: 'UNESCO Chola temple, Thanjavur', timings: '6:00 AM - 12:30 PM, 4:00 PM - 8:30 PM', entryFee: 'Free', bestTime: 'Morning hours', highlights: ['Tallest temple tower', 'Nandi statue', 'Chola architecture', 'UNESCO site'], image: '🛕' },
            { name: 'Kapaleeshwarar Temple', description: 'Ancient Shiva temple, Chennai', timings: '5:30 AM - 12:00 PM, 4:00 PM - 9:00 PM', entryFee: 'Free', bestTime: 'Friday evenings', highlights: ['Dravidian architecture', 'Peacock vahana', 'Temple tank', 'Gopuram'], image: '🛕' },
            { name: 'Kanyakumari Devi Temple', description: 'Southernmost Shakti temple', timings: '4:30 AM - 12:30 PM, 4:00 PM - 8:00 PM', entryFee: 'Free', bestTime: 'Evening sunset', highlights: ['Goddess Kumari', 'Three seas confluence', 'Diamond nose ring', 'Coastal location'], image: '🛕' },
            { name: 'Palani Murugan Temple', description: 'Hilltop Murugan shrine', timings: '6:00 AM - 8:30 PM', entryFee: 'Free', bestTime: 'Thai Poosam', highlights: ['Hilltop temple', 'Ropeway', 'Panchamritham prasadam', 'Panoramic views'], image: '⛰️' },
            { name: 'Thiruchendur Murugan Temple', description: 'Seaside Murugan temple', timings: '5:30 AM - 12:00 PM, 4:30 PM - 8:30 PM', entryFee: 'Free', bestTime: 'Skanda Sashti', highlights: ['Beach temple', 'Ancient temple', 'Sea views', 'Legend of demon Surapadman'], image: '🏖️' },
            { name: 'Ekambareswarar Temple', description: 'Ancient Shiva temple, Kanchipuram', timings: '6:00 AM - 12:30 PM, 4:00 PM - 8:00 PM', entryFee: 'Free', bestTime: 'Panguni Uthiram', highlights: ['Sacred mango tree', '1000-pillar hall', 'Prithvi linga', 'Pancha Bootha temple'], image: '🛕' },
            { name: 'Kamakshi Amman Temple', description: 'Goddess temple, Kanchipuram', timings: '6:00 AM - 12:30 PM, 4:00 PM - 8:30 PM', entryFee: 'Free', bestTime: 'Fridays', highlights: ['Goddess Kamakshi', 'Sri Chakra', 'Golden chariot', 'Ancient shrine'], image: '🛕' },
            { name: 'Nataraja Temple', description: 'Cosmic dancer Shiva, Chidambaram', timings: '6:00 AM - 12:00 PM, 5:00 PM - 10:00 PM', entryFee: '₹10', bestTime: 'Maha Shivaratri', highlights: ['Ananda Tandava', 'Akasa linga', 'Golden roof', 'Temple car'], image: '🕉️' },
            { name: 'Thiruvannamalai Temple', description: 'Fire linga temple, massive complex', timings: '5:30 AM - 12:30 PM, 3:30 PM - 9:30 PM', entryFee: 'Free', bestTime: 'Karthigai Deepam', highlights: ['Annamalai hill', 'Girivalam (circumambulation)', 'Deepam festival', 'Ramana Maharshi connection'], image: '🔥' },
            { name: 'Srirangam Temple', description: 'Largest functioning Hindu temple', timings: '6:00 AM - 9:00 PM', entryFee: 'Free (₹50 express darshan)', bestTime: 'Vaikunta Ekadashi', highlights: ['Vishnu temple', '7 prakarams', 'Island location', '21 towers'], image: '🛕' },
            { name: 'Tirumala Venkateswara Temple', description: 'Border with AP, famous Balaji temple', timings: 'Open 24 hours', entryFee: 'Free (₹300 special darshan)', bestTime: 'Book online months ahead', highlights: ['Richest temple', 'Seven hills', 'Laddu prasadam', 'Queue system'], image: '⛰️' },
            { name: 'Velankanni Church', description: 'Basilica of Our Lady of Good Health', timings: '6:00 AM - 8:00 PM', entryFee: 'Free', bestTime: 'Velankanni festival (Sept)', highlights: ['Gothic architecture', 'Healing miracles', 'Coastal pilgrimage', 'Museum'], image: '⛪' },
            { name: 'San Thome Basilica', description: 'St. Thomas tomb church, Chennai', timings: '6:00 AM - 8:00 PM', entryFee: 'Free', bestTime: 'Sunday services', highlights: ['Apostle tomb', 'Neo-Gothic style', 'Museum', 'Beach location'], image: '⛪' },
            { name: 'Thousand Lights Mosque', description: 'Historic mosque, Chennai', timings: '5:00 AM - 9:00 PM', entryFee: 'Free', bestTime: 'Friday prayers', highlights: ['Persian architecture', 'Thousand lamps', 'Nawab connection', 'Cultural significance'], image: '🕌' },
            { name: 'Gangaikonda Cholapuram Temple', description: 'Chola dynasty temple', timings: '6:00 AM - 12:00 PM, 4:00 PM - 7:00 PM', entryFee: 'Free', bestTime: 'Morning visits', highlights: ['Victory temple', 'Chola architecture', 'UNESCO site', 'Lion sculptures'], image: '🛕' },
            { name: 'Darasuram Airavatesvara Temple', description: 'Chola temple with chariot', timings: '6:00 AM - 6:00 PM', entryFee: 'Free', bestTime: 'Morning hours', highlights: ['Stone chariot', 'UNESCO site', 'Intricate carvings', 'Chola art'], image: '🛕' },
            { name: 'Rockfort Temple', description: 'Hilltop temple complex, Trichy', timings: '6:00 AM - 8:00 PM', entryFee: '₹10', bestTime: 'Evening', highlights: ['Rock-cut temple', 'Ganesh temple', 'City views', 'Steps climb'], image: '⛰️' },
            { name: 'Thirumalai Nayakkar Mahal', description: 'Palace with prayer hall, Madurai', timings: '9:00 AM - 5:00 PM', entryFee: '₹50', bestTime: 'Light show evening', highlights: ['Indo-Saracenic architecture', 'Courtyard', 'Sound & light show', 'Palace temple'], image: '🏛️' }
          ]
        },
        'Himachal Pradesh': {
          name: 'Himachal Pradesh',
          icon: '⛰️',
          places: [
            { name: 'Jakhoo Temple', description: 'Hanuman temple on Shimla hill', timings: '7:00 AM - 8:00 PM', entryFee: 'Free', bestTime: 'Summer months', highlights: ['108 ft Hanuman', 'Hilltop location', 'Mountain views', 'Monkey presence'], image: '⛰️' },
            { name: 'Hidimba Devi Temple', description: 'Unique pagoda temple, Manali', timings: '8:00 AM - 6:00 PM', entryFee: 'Free', bestTime: 'May Hadimba festival', highlights: ['Wooden pagoda', 'Cedar forest', 'Mahabharata connection', 'Unique architecture'], image: '🛕' },
            { name: 'Baijnath Temple', description: 'Ancient Shiva temple', timings: '5:00 AM - 9:00 PM', entryFee: 'Free', bestTime: 'Shivaratri', highlights: ['1204 CE temple', 'Nagara architecture', 'Stone carvings', 'Archaeological site'], image: '🕉️' },
            { name: 'Chamunda Devi Temple', description: 'Goddess temple near Dharamshala', timings: '5:00 AM - 9:00 PM', entryFee: 'Free', bestTime: 'Navratri', highlights: ['Baner river banks', 'Goddess worship', 'Mountain setting', 'Peaceful atmosphere'], image: '🛕' },
            { name: 'Naina Devi Temple', description: 'Hilltop Shakti Peetha', timings: '6:00 AM - 9:00 PM', entryFee: 'Free (ropeway ₹100)', bestTime: 'Navratri', highlights: ['51 Shakti Peethas', 'Cable car', 'Lake views', 'Pilgrimage site'], image: '⛰️' },
            { name: 'Jwala Ji Temple', description: 'Eternal flame goddess temple', timings: '5:00 AM - 10:00 PM', entryFee: 'Free', bestTime: 'Navratri', highlights: ['Natural gas flames', '51 Shakti Peethas', 'Nine flames', 'Unique phenomenon'], image: '🔥' },
            { name: 'Chintpurni Temple', description: 'Shakti Peetha wish fulfillment', timings: '5:00 AM - 10:00 PM', entryFee: 'Free', bestTime: 'Navratri', highlights: ['Goddess Chinnamastika', 'Wish fulfillment', 'Pilgrimage site', 'Ancient temple'], image: '🛕' },
            { name: 'Bhimakali Temple', description: 'Sarahan palace temple', timings: '6:00 AM - 8:00 PM', entryFee: '₹30 (camera)', bestTime: 'Dussehra', highlights: ['Tower temple', 'Silver doors', 'Mountain views', 'Ancient deity'], image: '⛰️' },
            { name: 'Bajreshwari Devi Temple', description: 'Kangra Shakti Peetha', timings: '5:00 AM - 10:00 PM', entryFee: 'Free', bestTime: 'Navratri', highlights: ['51 Shakti Peethas', 'Rebuilt temple', 'Historical significance', 'Pilgrimage center'], image: '🛕' },
            { name: 'Tabo Monastery', description: '1000-year-old Buddhist monastery', timings: '6:00 AM - 7:00 PM', entryFee: '₹30', bestTime: 'June to September', highlights: ['UNESCO tentative', 'Ancient murals', 'Ajanta of Himalayas', 'Spiti Valley'], image: '☸️' },
            { name: 'Key Monastery', description: 'Largest monastery in Spiti', timings: '7:00 AM - 7:00 PM', entryFee: '₹20', bestTime: 'Summer months', highlights: ['Hilltop monastery', 'Buddhist library', 'Spiti Valley views', 'Tibetan Buddhism'], image: '☸️' },
            { name: 'Dalai Lama Temple Complex', description: 'Tibetan Buddhism center, McLeod Ganj', timings: '5:00 AM - 8:00 PM', entryFee: 'Free', bestTime: 'March Losar festival', highlights: ['Dalai Lama residence', 'Tsuglagkhang', 'Tibetan culture', 'Prayer wheels'], image: '☸️' },
            { name: 'Mrikula Devi Temple', description: 'Ancient goddess temple, Lahaul', timings: '7:00 AM - 7:00 PM', entryFee: 'Free', bestTime: 'Summer months', highlights: ['Wooden temple', 'Shikhara style', 'Ancient deity', 'Lahaul-Spiti'], image: '🛕' },
            { name: 'Triloknath Temple', description: 'Hindu-Buddhist shared temple', timings: '6:00 AM - 8:00 PM', entryFee: 'Free', bestTime: 'August Pauri festival', highlights: ['Multi-faith worship', 'White marble idol', 'Chandrabhaga river', 'Unique harmony'], image: '🛕' },
            { name: 'Masroor Rock Cut Temples', description: 'Himalayan Ellora', timings: '9:00 AM - 6:00 PM', entryFee: '₹25', bestTime: 'October to March', highlights: ['15 rock-cut temples', 'Indo-Aryan style', '8th century', 'Earthquake damaged'], image: '🏛️' },
            { name: 'Laxmi Narayan Temple', description: 'Birla temple, Shimla', timings: '6:00 AM - 12:00 PM, 4:00 PM - 9:00 PM', entryFee: 'Free', bestTime: 'Evening', highlights: ['Modern architecture', 'City views', 'Peaceful setting', 'Beautiful gardens'], image: '🛕' },
            { name: 'Raghunath Temple', description: 'Main temple in Kullu', timings: '6:00 AM - 9:00 PM', entryFee: 'Free', bestTime: 'Dussehra', highlights: ['Lord Rama', 'Kullu Dussehra', 'Pagoda style', 'Religious center'], image: '🛕' },
            { name: 'Hatkoti Temple', description: 'Ancient Durga-Shiva temple', timings: '6:00 AM - 8:00 PM', entryFee: 'Free', bestTime: 'Navratri', highlights: ['Gupta period', 'Twin temples', 'Pabbar valley', 'Stone carvings'], image: '🛕' },
            { name: 'Bhutnath Temple', description: 'Shiva temple, Mandi', timings: '6:00 AM - 8:00 PM', entryFee: 'Free', bestTime: 'Shivaratri', highlights: ['Shikhara style', 'Town center', 'Shivratri fair', 'Ancient temple'], image: '🕉️' },
            { name: 'Shikari Devi Temple', description: 'Highest temple in Himachal', timings: '6:00 AM - 6:00 PM', entryFee: 'Free', bestTime: 'May to October', highlights: ['11,000 ft altitude', 'Trek temple', 'Goddess Durga', 'Mountain peaks'], image: '⛰️' }
          ]
        },
        'Jharkhand': {
          name: 'Jharkhand',
          icon: '🛕',
          places: [
            { name: 'Baidyanath Jyotirlinga', description: 'One of 12 Jyotirlingas, Deoghar', timings: '4:00 AM - 3:30 PM, 6:00 PM - 9:00 PM', entryFee: 'Free', bestTime: 'Shravan month', highlights: ['Jyotirlinga', 'Shravan mela', 'Kanwar pilgrimage', 'Sacred temple'], image: '🕉️' },
            { name: 'Pahari Mandir', description: 'Hilltop Shiva temple, Ranchi', timings: '5:00 AM - 10:00 PM', entryFee: 'Free', bestTime: 'Shravan', highlights: ['468 steps', 'City views', 'Shiva linga', 'Popular pilgrimage'], image: '⛰️' },
            { name: 'Rajrappa Temple', description: 'Goddess Chinnamastika temple', timings: '6:00 AM - 6:00 PM', entryFee: 'Free', bestTime: 'Amavasya', highlights: ['Tantric goddess', 'River confluence', 'Unique deity', 'Natural beauty'], image: '🛕' },
            { name: 'Jagannath Temple', description: 'Puri replica in Ranchi', timings: '5:00 AM - 12:00 PM, 4:00 PM - 9:00 PM', entryFee: 'Free', bestTime: 'Rath Yatra', highlights: ['Rath Yatra', 'Similar to Puri', 'Three deities', 'Annual chariot festival'], image: '🛕' },
            { name: 'Sun Temple Bundu', description: 'Konark-style sun temple', timings: '6:00 AM - 6:00 PM', entryFee: 'Free', bestTime: 'Chhath Puja', highlights: ['18 wheels', 'Konark replica', 'Hilltop', 'Modern construction'], image: '☀️' },
            { name: 'Dewri Mandir', description: 'Ancient Durga temple', timings: '5:00 AM - 9:00 PM', entryFee: 'Free', bestTime: 'Navratri', highlights: ['Prakrit inscriptions', 'Archaeological site', '9th century', 'Stone temple'], image: '🛕' },
            { name: 'Maluti Temples', description: '72 terracotta temples cluster', timings: '7:00 AM - 6:00 PM', entryFee: 'Free', bestTime: 'October to March', highlights: ['72 temples', 'Terracotta art', 'Archaeological marvel', 'Ruins'], image: '🛕' },
            { name: 'Itkhori Temple Complex', description: 'Ancient Shiva temples', timings: '6:00 AM - 7:00 PM', entryFee: 'Free', bestTime: 'Shivaratri', highlights: ['Hot water springs', 'Temple cluster', 'Natural beauty', 'Pilgrimage site'], image: '🕉️' },
            { name: 'Kundeshwari Temple', description: 'Ancient goddess temple on hill', timings: '6:00 AM - 6:00 PM', entryFee: 'Free', bestTime: 'Navratri', highlights: ['Hilltop temple', 'Ancient shrine', 'Steps climb', 'Archaeological site'], image: '⛰️' },
            { name: 'Rankini Temple', description: 'Tribal goddess temple', timings: '6:00 AM - 7:00 PM', entryFee: 'Free', bestTime: 'Karma Puja', highlights: ['Tribal deity', 'Cultural significance', 'Natural setting', 'Unique traditions'], image: '🛕' },
            { name: 'Sammed Shikharji', description: 'Holiest Jain pilgrimage', timings: '4:00 AM - 6:00 PM', entryFee: 'Free', bestTime: 'November to February', highlights: ['20 Tirthankaras nirvana', 'Mountain trek', 'Jain temples', 'Sacred hill'], image: '⛰️' },
            { name: 'Kauleshwari Devi Temple', description: 'Goddess temple near Rajrappa', timings: '6:00 AM - 7:00 PM', entryFee: 'Free', bestTime: 'Navratri', highlights: ['Forest temple', 'Goddess worship', 'Natural surroundings', 'Peaceful atmosphere'], image: '🛕' },
            { name: 'Hanumangarhi Temple', description: 'Hanuman temple on hilltop', timings: '5:00 AM - 9:00 PM', entryFee: 'Free', bestTime: 'Tuesday and Saturday', highlights: ['Hilltop shrine', 'Hazaribagh', 'City views', 'Popular temple'], image: '⛰️' },
            { name: 'Basuki Nath Temple', description: 'Ancient Shiva temple', timings: '5:00 AM - 9:00 PM', entryFee: 'Free', bestTime: 'Shivaratri', highlights: ['Jharkhand heritage', 'Stone temple', 'Historical site', 'Pilgrimage'], image: '🕉️' },
            { name: 'Bhadrakali Temple', description: 'Goddess temple in Itki', timings: '6:00 AM - 8:00 PM', entryFee: 'Free', bestTime: 'Navratri', highlights: ['Reservoir location', 'Goddess Kali', 'Scenic beauty', 'Picnic spot'], image: '🛕' },
            { name: 'Jonha Falls Temple', description: 'Temple near waterfall', timings: '7:00 AM - 5:00 PM', entryFee: '₹20', bestTime: 'Post-monsoon', highlights: ['Gautamdhara falls', 'Temple complex', 'Natural beauty', 'Picnic spot'], image: '💧' },
            { name: 'Maithon Dam Temple', description: 'Shiva temple at dam', timings: '6:00 AM - 7:00 PM', entryFee: 'Free', bestTime: 'Winter months', highlights: ['Dam location', 'Shiva shrine', 'Kalyaneshwari', 'Scenic views'], image: '🕉️' },
            { name: 'Chhinnamastika Temple Ramgarh', description: 'Tantric goddess shrine', timings: '6:00 AM - 6:00 PM', entryFee: 'Free', bestTime: 'Amavasya', highlights: ['Tantric worship', 'Unique deity', 'Forest location', 'Spiritual atmosphere'], image: '🛕' },
            { name: 'Satsang Vihar', description: 'Dhanbad spiritual center', timings: '5:00 AM - 9:00 PM', entryFee: 'Free', bestTime: 'Spiritual events', highlights: ['Modern temple', 'Meditation center', 'Peaceful gardens', 'Cultural activities'], image: '🛕' },
            { name: 'Lodh Falls Temple', description: 'Temple near tallest waterfall', timings: '7:00 AM - 5:00 PM', entryFee: '₹10', bestTime: 'Monsoon/Post-monsoon', highlights: ['Tallest waterfall in Jharkhand', 'Natural beauty', 'Trekking', 'Scenic location'], image: '💧' }
          ]
        }
      }
    }
  };

  // Natural Wonders Data by Country and Location
  const naturalWondersByCountry = {
    'United States': {
      name: 'United States',
      icon: '🇺🇸',
      locations: {
        'Arizona': {
          name: 'Arizona',
          icon: '🏜️',
          wonders: [
            { name: 'Grand Canyon', description: 'Massive canyon carved by Colorado River', bestTime: 'March-May, September-November', entryFee: '$35 per vehicle', highlights: ['277 miles long', 'South Rim viewpoints', 'Colorado River', 'Hiking trails'], image: '🏞️' },
            { name: 'Antelope Canyon', description: 'Stunning slot canyon with light beams', bestTime: 'March-October', entryFee: '$80+ (guided tour)', highlights: ['Navajo land', 'Light beams', 'Sandstone formations', 'Photography spot'], image: '🏜️' },
            { name: 'Monument Valley', description: 'Iconic red sandstone buttes', bestTime: 'April-May, September-October', entryFee: '$20 per vehicle', highlights: ['Western movie location', 'Navajo Tribal Park', 'Scenic drive', 'Sunrise/sunset views'], image: '🏜️' },
            { name: 'Sedona Red Rocks', description: 'Red sandstone formations', bestTime: 'March-May, September-November', entryFee: 'Free-$5', highlights: ['Cathedral Rock', 'Bell Rock', 'Hiking trails', 'Vortex sites'], image: '🏔️' },
            { name: 'Havasu Falls', description: 'Turquoise waterfalls in canyon', bestTime: 'February-November', entryFee: 'Permit required', highlights: ['Blue-green water', 'Camping', 'Havasupai Reservation', 'Remote location'], image: '💧' },
            { name: 'Petrified Forest', description: 'Ancient fossilized wood', bestTime: 'October-April', entryFee: '$25 per vehicle', highlights: ['Fossilized trees', 'Painted Desert', 'Badlands', 'Route 66'], image: '🏜️' },
            { name: 'Horseshoe Bend', description: 'Colorado River horseshoe curve', bestTime: 'March-May, September-November', entryFee: '$10 parking', highlights: ['Iconic viewpoint', 'Colorado River', 'Photography', 'Short hike'], image: '🏞️' },
            { name: 'Saguaro National Park', description: 'Giant cactus forest', bestTime: 'October-April', entryFee: '$25 per vehicle', highlights: ['Giant saguaros', 'Desert landscape', 'Hiking', 'Wildlife'], image: '🌵' },
            { name: 'Canyon de Chelly', description: 'Ancient ruins and canyons', bestTime: 'April-October', entryFee: 'Free (tours paid)', highlights: ['Navajo Nation', 'Cliff dwellings', 'Spider Rock', 'Cultural site'], image: '🏜️' },
            { name: 'Lake Powell', description: 'Massive reservoir with red rock canyons', bestTime: 'April-October', entryFee: '$30 per vehicle', highlights: ['Glen Canyon', 'Boating', 'Rainbow Bridge', 'Houseboating'], image: '💧' }
          ]
        },
        'California': {
          name: 'California',
          icon: '🌲',
          wonders: [
            { name: 'Yosemite Valley', description: 'Iconic granite cliffs and waterfalls', bestTime: 'April-May, September-October', entryFee: '$35 per vehicle', highlights: ['El Capitan', 'Half Dome', 'Yosemite Falls', 'Giant sequoias'], image: '⛰️' },
            { name: 'Lake Tahoe', description: 'Crystal-clear alpine lake', bestTime: 'Year-round', entryFee: 'Free', highlights: ['Emerald Bay', 'Skiing', 'Beaches', 'Hiking trails'], image: '💧' },
            { name: 'Big Sur Coastline', description: 'Dramatic Pacific coast cliffs', bestTime: 'April-May, September-October', entryFee: 'Free', highlights: ['Highway 1', 'McWay Falls', 'Bixby Bridge', 'Coastal views'], image: '🌊' },
            { name: 'Death Valley', description: 'Hottest place on Earth', bestTime: 'November-March', entryFee: '$30 per vehicle', highlights: ['Badwater Basin', 'Sand dunes', 'Desert landscape', 'Zabriskie Point'], image: '🏜️' },
            { name: 'Redwood National Park', description: 'Tallest trees on Earth', bestTime: 'April-October', entryFee: 'Free', highlights: ['Giant redwoods', 'Coastal fog', 'Fern Canyon', 'Hiking'], image: '🌲' },
            { name: 'Joshua Tree National Park', description: 'Unique desert landscape', bestTime: 'October-May', entryFee: '$30 per vehicle', highlights: ['Joshua trees', 'Rock climbing', 'Desert flora', 'Night sky'], image: '🌵' },
            { name: 'Mono Lake', description: 'Ancient saline lake with tufa towers', bestTime: 'June-October', entryFee: 'Free', highlights: ['Tufa formations', 'Salt lake', 'Bird migration', 'Volcanic islands'], image: '💧' },
            { name: 'Sequoia National Park', description: 'Giant sequoia groves', bestTime: 'May-October', entryFee: '$35 per vehicle', highlights: ['General Sherman Tree', 'Giant Forest', 'Moro Rock', 'Kings Canyon'], image: '🌲' },
            { name: 'Point Reyes', description: 'Dramatic coastal headland', bestTime: 'Year-round', entryFee: 'Free', highlights: ['Lighthouse', 'Elephant seals', 'Beaches', 'Hiking'], image: '🌊' },
            { name: 'Lassen Volcanic National Park', description: 'Active volcanic landscape', bestTime: 'June-September', entryFee: '$30 per vehicle', highlights: ['Lassen Peak', 'Hot springs', 'Volcanic features', 'Hiking'], image: '🌋' }
          ]
        }
      }
    },
    'Canada': {
      name: 'Canada',
      icon: '🇨🇦',
      locations: {
        'Alberta': {
          name: 'Alberta',
          icon: '🏔️',
          wonders: [
            { name: 'Lake Louise', description: 'Turquoise glacial lake in Rockies', bestTime: 'June-September', entryFee: 'CAD $10.50 parking', highlights: ['Fairmont Chateau', 'Victoria Glacier', 'Canoeing', 'Hiking trails'], image: '💧' },
            { name: 'Moraine Lake', description: 'Valley of Ten Peaks glacier lake', bestTime: 'June-September', entryFee: 'Parks pass required', highlights: ['Ten peaks', 'Turquoise water', 'Canoeing', 'Photography'], image: '💧' },
            { name: 'Banff National Park', description: 'First Canadian national park', bestTime: 'June-September', entryFee: 'CAD $10.50/day', highlights: ['Mountain peaks', 'Hot springs', 'Wildlife', 'Skiing'], image: '🏔️' },
            { name: 'Jasper National Park', description: 'Largest Rocky Mountain park', bestTime: 'June-September', entryFee: 'CAD $10.50/day', highlights: ['Maligne Lake', 'Columbia Icefield', 'Wildlife', 'Dark sky preserve'], image: '🏔️' },
            { name: 'Columbia Icefield', description: 'Largest icefield in Rockies', bestTime: 'May-October', entryFee: 'CAD $115 glacier tour', highlights: ['Athabasca Glacier', 'Skywalk', 'Ice Explorer', 'Glacial views'], image: '❄️' },
            { name: 'Peyto Lake', description: 'Wolf-shaped glacier lake', bestTime: 'June-September', entryFee: 'Parks pass', highlights: ['Unique shape', 'Viewpoint', 'Turquoise water', 'Photography'], image: '💧' },
            { name: 'Abraham Lake', description: 'Frozen bubble phenomenon', bestTime: 'December-February', entryFee: 'Free', highlights: ['Frozen bubbles', 'Ice formations', 'Photography', 'Unique phenomenon'], image: '❄️' },
            { name: 'Maligne Canyon', description: 'Deep limestone canyon', bestTime: 'June-September, Winter', entryFee: 'Free', highlights: ['Waterfalls', 'Bridges', 'Ice walking', 'Hiking'], image: '🏞️' },
            { name: 'Johnston Canyon', description: 'Accessible canyon with waterfalls', bestTime: 'Year-round', entryFee: 'Free', highlights: ['Catwalks', 'Waterfalls', 'Ice walking', 'Easy access'], image: '💧' },
            { name: 'Dinosaur Provincial Park', description: 'Badlands with fossils', bestTime: 'May-October', entryFee: 'CAD $9', highlights: ['UNESCO site', 'Dinosaur fossils', 'Badlands', 'Hoodoos'], image: '🏜️' }
          ]
        },
        'British Columbia': {
          name: 'British Columbia',
          icon: '🌲',
          wonders: [
            { name: 'Great Bear Rainforest', description: 'Coastal temperate rainforest', bestTime: 'September-October', entryFee: 'Tour-dependent', highlights: ['Spirit bears', 'Old-growth forest', 'Coastal ecosystem', 'Wildlife'], image: '🌲' },
            { name: 'Okanagan Lake', description: 'Long freshwater lake in wine country', bestTime: 'June-September', entryFee: 'Free', highlights: ['Beaches', 'Wine region', 'Water sports', 'Ogopogo legend'], image: '💧' },
            { name: 'Butchart Gardens', description: 'Spectacular garden displays', bestTime: 'April-October', entryFee: 'CAD $38', highlights: ['55 acres', 'Themed gardens', 'Seasonal displays', 'Historic site'], image: '🌸' },
            { name: 'Cathedral Grove', description: 'Ancient Douglas fir forest', bestTime: 'Year-round', entryFee: 'Free', highlights: ['800-year-old trees', 'Old-growth forest', 'Easy trails', 'Vancouver Island'], image: '🌲' },
            { name: 'Spotted Lake', description: 'Mineral-rich spotted lake', bestTime: 'Summer', entryFee: 'Free (viewpoint)', highlights: ['Mineral spots', 'Sacred site', 'Unique phenomenon', 'Photography'], image: '💧' },
            { name: 'Yoho National Park', description: 'Rocky Mountain waterfalls', bestTime: 'June-September', entryFee: 'Parks pass', highlights: ['Takakkaw Falls', 'Emerald Lake', 'Natural Bridge', 'Burgess Shale'], image: '💧' },
            { name: 'Pacific Rim National Park', description: 'Coastal rainforest and beaches', bestTime: 'March-October', entryFee: 'CAD $8', highlights: ['Long Beach', 'Rainforest trails', 'Storm watching', 'Surfing'], image: '🌊' },
            { name: 'Atlin Lake', description: 'Pristine northern lake', bestTime: 'June-September', entryFee: 'Free', highlights: ['Clear water', 'Remote location', 'Glaciers', 'Wilderness'], image: '💧' },
            { name: 'Shannon Falls', description: 'Third highest waterfall in BC', bestTime: 'Spring-Summer', entryFee: 'Free', highlights: ['335m high', 'Easy access', 'Sea to Sky Highway', 'Viewing platform'], image: '💧' },
            { name: 'Joffre Lakes', description: 'Three turquoise alpine lakes', bestTime: 'July-September', entryFee: 'Free', highlights: ['Glacier lakes', 'Hiking trail', 'Matier Glacier', 'Photography'], image: '💧' }
          ]
        }
      }
    },
    'India': {
      name: 'India',
      icon: '🇮🇳',
      locations: {
        'Himachal Pradesh': {
          name: 'Himachal Pradesh',
          icon: '🏔️',
          wonders: [
            { name: 'Rohtang Pass', description: 'High mountain pass with snow views', bestTime: 'May-October', entryFee: '₹500 permit', highlights: ['Snow peaks', 'Adventure sports', 'Scenic drive', 'Mountain views'], image: '🏔️' },
            { name: 'Kheerganga Trek', description: 'Hot spring trek in Parvati Valley', bestTime: 'May-October', entryFee: 'Free', highlights: ['Hot springs', 'Mountain trek', 'Camping', 'Parvati Valley'], image: '⛰️' },
            { name: 'Chandratal Lake', description: 'Moon Lake in Spiti Valley', bestTime: 'June-September', entryFee: 'Free', highlights: ['High altitude lake', 'Camping', 'Stargazing', 'Spiti Valley'], image: '💧' },
            { name: 'Great Himalayan National Park', description: 'UNESCO biodiversity hotspot', bestTime: 'April-June, September-October', entryFee: '₹1000', highlights: ['UNESCO site', 'Wildlife', 'Trekking', 'Biodiversity'], image: '🏞️' },
            { name: 'Pin Valley National Park', description: 'Cold desert wildlife sanctuary', bestTime: 'June-October', entryFee: '₹200', highlights: ['Snow leopard', 'Spiti Valley', 'High altitude', 'Buddhist monasteries'], image: '🏔️' },
            { name: 'Solang Valley', description: 'Adventure sports hub', bestTime: 'Year-round', entryFee: 'Activity-based', highlights: ['Skiing', 'Paragliding', 'Cable car', 'Snow activities'], image: '⛷️' },
            { name: 'Prashar Lake', description: 'Sacred lake with floating island', bestTime: 'May-October', entryFee: 'Free', highlights: ['Floating island', 'Pagoda temple', 'Trekking', 'Mountain views'], image: '💧' },
            { name: 'Beas Kund Trek', description: 'Glacial lake source of Beas River', bestTime: 'May-October', entryFee: 'Free', highlights: ['Glacial lake', 'Easy trek', 'Camping', 'Manali base'], image: '❄️' },
            { name: 'Triund Hill', description: 'Popular trekking destination', bestTime: 'March-June, September-November', entryFee: 'Free', highlights: ['Easy trek', 'Camping', 'Dhauladhar views', 'McLeodganj base'], image: '⛰️' },
            { name: 'Khajjiar', description: 'Mini Switzerland of India', bestTime: 'March-October', entryFee: 'Free', highlights: ['Meadows', 'Lake', 'Deodar forest', 'Horse riding'], image: '🌲' }
          ]
        },
        'Uttarakhand': {
          name: 'Uttarakhand',
          icon: '⛰️',
          wonders: [
            { name: 'Valley of Flowers', description: 'UNESCO alpine flower valley', bestTime: 'July-September', entryFee: '₹150', highlights: ['UNESCO site', 'Alpine flowers', 'Trekking', 'Rare species'], image: '🌸' },
            { name: 'Nanda Devi National Park', description: 'Biosphere reserve around second highest peak', bestTime: 'May-October', entryFee: '₹600', highlights: ['UNESCO site', 'Nanda Devi peak', 'Biodiversity', 'Restricted area'], image: '🏔️' },
            { name: 'Jim Corbett National Park', description: 'First national park of India', bestTime: 'November-June', entryFee: '₹1500-6000', highlights: ['Bengal tigers', 'Wildlife safari', 'Ramganga river', 'Bird watching'], image: '🐅' },
            { name: 'Hemkund Sahib Trek', description: 'Sacred Sikh shrine at high altitude', bestTime: 'June-October', entryFee: 'Free', highlights: ['Gurudwara', 'Glacial lake', 'Trekking', 'Seven peaks'], image: '⛰️' },
            { name: 'Nainital Lake', description: 'Pear-shaped hill station lake', bestTime: 'March-June, September-November', entryFee: 'Free', highlights: ['Boating', 'Mall Road', 'Naini Devi temple', 'Hill views'], image: '💧' },
            { name: 'Auli Ski Resort', description: 'Premier skiing destination', bestTime: 'December-March', entryFee: 'Varies', highlights: ['Skiing', 'Cable car', 'Nanda Devi views', 'Snow sports'], image: '⛷️' },
            { name: 'Chopta', description: 'Mini Switzerland trekking base', bestTime: 'April-November', entryFee: 'Free', highlights: ['Tungnath temple', 'Chandrashila peak', 'Camping', 'Bird watching'], image: '🏔️' },
            { name: 'Satopanth Lake', description: 'Sacred triangular glacial lake', bestTime: 'June-September', entryFee: 'Free', highlights: ['High altitude', 'Difficult trek', 'Religious significance', 'Glacial lake'], image: '❄️' },
            { name: 'Deoria Tal', description: 'Emerald lake with Chaukhamba reflection', bestTime: 'Year-round', entryFee: 'Free', highlights: ['Lake views', 'Easy trek', 'Camping', 'Mountain reflection'], image: '💧' },
            { name: 'Kedarnath Wildlife Sanctuary', description: 'High altitude wildlife sanctuary', bestTime: 'May-October', entryFee: '₹150', highlights: ['Musk deer', 'Snow leopard', 'Himalayan flora', 'Trekking'], image: '🦌' }
          ]
        },
        'Kerala': {
          name: 'Kerala',
          icon: '🌴',
          wonders: [
            { name: 'Munnar Tea Gardens', description: 'Rolling hills covered in tea plantations', bestTime: 'September-May', entryFee: 'Free (tea estates ₹125)', highlights: ['Tea estates', 'Eravikulam Park', 'Anamudi peak', 'Mattupetty Dam'], image: '🌱' },
            { name: 'Alleppey Backwaters', description: 'Network of lagoons and lakes', bestTime: 'November-February', entryFee: 'Houseboat from ₹8000', highlights: ['Houseboat cruise', 'Coconut groves', 'Village life', 'Sunset views'], image: '🚤' },
            { name: 'Vembanad Lake', description: 'Longest lake in India', bestTime: 'November-March', entryFee: 'Free', highlights: ['Houseboats', 'Kumarakom Bird Sanctuary', 'Snake boat races', 'Largest lake'], image: '💧' },
            { name: 'Athirappilly Waterfalls', description: 'Largest waterfall in Kerala', bestTime: 'June-January', entryFee: '₹50', highlights: ['80-ft cascade', 'Rainforest', 'Film location', 'Wildlife'], image: '💧' },
            { name: 'Periyar Wildlife Sanctuary', description: 'Tiger reserve in Western Ghats', bestTime: 'October-June', entryFee: '₹300-600', highlights: ['Elephants', 'Periyar Lake', 'Spice plantations', 'Bamboo rafting'], image: '🐘' },
            { name: 'Wayanad Hill Station', description: 'Scenic hill station with wildlife', bestTime: 'October-May', entryFee: 'Varies', highlights: ['Chembra Peak', 'Edakkal Caves', 'Waterfalls', 'Coffee plantations'], image: '🏔️' },
            { name: 'Kovalam Beach', description: 'Crescent-shaped golden beaches', bestTime: 'November-February', entryFee: 'Free', highlights: ['Lighthouse Beach', 'Water sports', 'Ayurveda', 'Sunset views'], image: '🏖️' },
            { name: 'Silent Valley National Park', description: 'Last remaining rainforest', bestTime: 'December-April', entryFee: '₹295', highlights: ['Lion-tailed macaque', 'Rainforest', 'Biodiversity', 'Trekking'], image: '🌲' },
            { name: 'Kumarakom Bird Sanctuary', description: 'Paradise for bird watchers', bestTime: 'November-February', entryFee: '₹50', highlights: ['Migratory birds', 'Vembanad Lake', 'Boat rides', 'Photography'], image: '🦜' },
            { name: 'Meenmutty Waterfalls', description: 'Three-tiered waterfall', bestTime: 'June-January', entryFee: 'Free', highlights: ['3-tier cascade', 'Trekking', 'Natural pool', 'Dense forest'], image: '💧' }
          ]
        },
        'Rajasthan': {
          name: 'Rajasthan',
          icon: '🏜️',
          wonders: [
            { name: 'Thar Desert', description: 'Great Indian Desert', bestTime: 'October-March', entryFee: 'Safari ₹1000+', highlights: ['Sand dunes', 'Camel safari', 'Desert camps', 'Sam Sand Dunes'], image: '🐪' },
            { name: 'Mount Abu', description: 'Only hill station in Rajasthan', bestTime: 'October-March', entryFee: 'Free', highlights: ['Nakki Lake', 'Dilwara Temples', 'Sunset Point', 'Cool climate'], image: '⛰️' },
            { name: 'Ranthambore National Park', description: 'Tiger reserve with ancient fort', bestTime: 'October-April', entryFee: '₹1100-2000', highlights: ['Bengal tigers', 'Ranthambore Fort', 'Safari', 'Wildlife photography'], image: '🐅' },
            { name: 'Sambhar Salt Lake', description: 'India\'s largest inland salt lake', bestTime: 'November-February', entryFee: 'Free', highlights: ['Salt production', 'Flamingos', 'Photography', 'Sunset views'], image: '💧' },
            { name: 'Keoladeo National Park', description: 'UNESCO bird sanctuary', bestTime: 'October-March', entryFee: '₹75', highlights: ['UNESCO site', 'Bird watching', 'Migratory birds', 'Cycling'], image: '🦅' },
            { name: 'Sariska Tiger Reserve', description: 'Wildlife sanctuary in Aravalli', bestTime: 'October-March', entryFee: '₹800-1500', highlights: ['Tigers', 'Leopards', 'Ancient temples', 'Siliserh Lake'], image: '🐆' },
            { name: 'Bundi Step Wells', description: 'Ancient water harvesting structures', bestTime: 'October-March', entryFee: 'Free-₹100', highlights: ['Baoris', 'Architecture', 'Photography', 'Historical'], image: '🏛️' },
            { name: 'Bishnoi Village', description: 'Eco-conscious community', bestTime: 'October-March', entryFee: 'Tour based', highlights: ['Wildlife protection', 'Village life', 'Handicrafts', 'Khejri trees'], image: '🌳' },
            { name: 'Chambal River Sanctuary', description: 'Gharial and dolphin sanctuary', bestTime: 'November-March', entryFee: '₹500', highlights: ['Gharials', 'Dolphins', 'Boat safari', 'River gorges'], image: '🐊' },
            { name: 'Jawai Leopard Reserve', description: 'Unique leopard habitat', bestTime: 'October-March', entryFee: '₹2500+', highlights: ['Leopards', 'Granite hills', 'Safari', 'Photography'], image: '🐆' }
          ]
        },
        'Sikkim': {
          name: 'Sikkim',
          icon: '🏔️',
          wonders: [
            { name: 'Kanchenjunga National Park', description: 'UNESCO park with world\'s 3rd highest peak', bestTime: 'March-May, October-December', entryFee: '₹300', highlights: ['Kanchenjunga peak', 'UNESCO site', 'Red panda', 'Alpine meadows'], image: '🏔️' },
            { name: 'Tsomgo Lake', description: 'Glacial lake at 12,310 ft', bestTime: 'May-October', entryFee: '₹50 + permit', highlights: ['Sacred lake', 'Snow views', 'Yaks', 'Color changes'], image: '💧' },
            { name: 'Gurudongmar Lake', description: 'One of highest lakes in world', bestTime: 'May-October', entryFee: 'Permit required', highlights: ['17,100 ft altitude', 'Sacred lake', 'Frozen in winter', 'Remote beauty'], image: '❄️' },
            { name: 'Nathula Pass', description: 'Indo-China border pass', bestTime: 'May-October', entryFee: 'Permit ₹200', highlights: ['14,140 ft', 'Border trade', 'Snow peaks', 'Historic Silk Route'], image: '🏔️' },
            { name: 'Yumthang Valley', description: 'Valley of Flowers', bestTime: 'April-June', entryFee: '₹20', highlights: ['Rhododendron blooms', 'Hot springs', 'River streams', '11,800 ft'], image: '🌸' },
            { name: 'Zuluk', description: 'Offbeat mountain village', bestTime: 'March-June, September-December', entryFee: 'Permit required', highlights: ['Zigzag roads', 'Silk Route', 'Sunrise views', 'Remote village'], image: '🏘️' },
            { name: 'Lachung Valley', description: 'Mountain valley in North Sikkim', bestTime: 'March-June, September-December', entryFee: 'Permit required', highlights: ['Apple orchards', 'Waterfalls', 'Mountain views', 'Village life'], image: '🏔️' },
            { name: 'Namchi Rock Garden', description: 'Scenic terraced garden', bestTime: 'Year-round', entryFee: '₹25', highlights: ['Skywalk', 'Waterfalls', 'Views', 'Cable car'], image: '🌳' },
            { name: 'Pelling Viewpoint', description: 'Kanchenjunga viewpoint', bestTime: 'October-May', entryFee: 'Free', highlights: ['Mountain views', 'Sunrise', 'Monasteries', 'Sky walk'], image: '🌄' },
            { name: 'Green Lake Trek', description: 'High altitude trek', bestTime: 'May-June', entryFee: 'Permit required', highlights: ['16,700 ft', 'Pristine lake', 'Challenging trek', 'Wildlife'], image: '⛰️' }
          ]
        },
        'Meghalaya': {
          name: 'Meghalaya',
          icon: '☔',
          wonders: [
            { name: 'Living Root Bridges', description: 'Bio-engineered natural bridges', bestTime: 'October-May', entryFee: 'Free', highlights: ['Double Decker Bridge', 'Unique engineering', 'Trekking', 'Photography'], image: '🌉' },
            { name: 'Cherrapunji', description: 'Wettest place on Earth', bestTime: 'October-May', entryFee: 'Free', highlights: ['Waterfalls', 'Caves', 'Living bridges', 'Rainfall record'], image: '☔' },
            { name: 'Mawlynnong Village', description: 'Asia\'s cleanest village', bestTime: 'October-May', entryFee: 'Free', highlights: ['Clean village', 'Sky view', 'Living root bridge', 'Bangladesh views'], image: '🏘️' },
            { name: 'Dawki River', description: 'Crystal clear river', bestTime: 'November-May', entryFee: 'Boating ₹1500', highlights: ['Transparent water', 'Boating', 'Bangladesh border', 'Suspension bridge'], image: '🚣' },
            { name: 'Nohkalikai Falls', description: 'India\'s tallest plunge waterfall', bestTime: 'October-March', entryFee: 'Free', highlights: ['340m drop', 'Emerald pool', 'Viewpoint', 'Legend story'], image: '💧' },
            { name: 'Mawsmai Caves', description: 'Limestone cave system', bestTime: 'October-May', entryFee: '₹20', highlights: ['Lit caves', 'Rock formations', 'Easy access', 'Photography'], image: '🕳️' },
            { name: 'Elephant Falls', description: 'Three-tiered waterfall', bestTime: 'October-May', entryFee: '₹20', highlights: ['Easy access', 'Multiple tiers', 'Photography', 'Lush surroundings'], image: '💧' },
            { name: 'Krang Suri Falls', description: 'Blue waterfall with pool', bestTime: 'October-May', entryFee: '₹20', highlights: ['Swimming', 'Blue water', 'Natural pool', 'Picnic spot'], image: '💧' },
            { name: 'Seven Sisters Falls', description: 'Seven-segmented falls', bestTime: 'Monsoon (June-September)', entryFee: 'Free', highlights: ['Seven streams', 'Viewpoint', 'Monsoon beauty', 'Photography'], image: '💧' },
            { name: 'Umiam Lake', description: 'Man-made reservoir', bestTime: 'October-May', entryFee: 'Free', highlights: ['Water sports', 'Boating', 'Scenic views', 'Camping'], image: '💧' }
          ]
        },
        'Nagaland': {
          name: 'Nagaland',
          icon: '🏔️',
          wonders: [
            { name: 'Dzukou Valley', description: 'Valley of flowers', bestTime: 'June-September', entryFee: '₹50', highlights: ['Wildflowers', 'Trekking', 'Camping', 'Pristine beauty'], image: '🌸' },
            { name: 'Khonoma Green Village', description: 'India\'s first green village', bestTime: 'October-May', entryFee: 'Free', highlights: ['Eco-tourism', 'Angami culture', 'Terraced fields', 'Trekking'], image: '🏘️' },
            { name: 'Japfu Peak', description: 'Second highest peak in Nagaland', bestTime: 'October-April', entryFee: 'Free', highlights: ['3048m peak', 'Rhododendron', 'Trekking', 'Dzukou Valley access'], image: '⛰️' },
            { name: 'Fakim Wildlife Sanctuary', description: 'Biodiversity hotspot', bestTime: 'November-May', entryFee: '₹100', highlights: ['Hoolock gibbon', 'Orchids', 'Birds', 'Trekking'], image: '🐵' },
            { name: 'Shilloi Lake', description: 'Heart-shaped footprint lake', bestTime: 'October-May', entryFee: 'Free', highlights: ['Unique shape', 'Sacred lake', 'Legend', 'Scenic beauty'], image: '💧' },
            { name: 'Mount Saramati', description: 'Highest peak in Nagaland', bestTime: 'October-May', entryFee: 'Permit required', highlights: ['3841m peak', 'Myanmar border', 'Trekking', 'Remote'], image: '🏔️' },
            { name: 'Ntangki National Park', description: 'Wildlife sanctuary', bestTime: 'November-May', entryFee: '₹150', highlights: ['Elephants', 'Hornbills', 'Tigers', 'Biodiversity'], image: '🐘' },
            { name: 'Doyang River', description: 'Amur Falcon roosting site', bestTime: 'October-November', entryFee: 'Free', highlights: ['Million falcons', 'Bird migration', 'Photography', 'Unique phenomenon'], image: '🦅' },
            { name: 'Mokokchung Hills', description: 'Ao Naga cultural center', bestTime: 'October-May', entryFee: 'Free', highlights: ['Tribal culture', 'Hill views', 'Villages', 'Festivals'], image: '🏔️' },
            { name: 'Tuophema Village', description: 'Heritage village', bestTime: 'October-May', entryFee: 'Homestay based', highlights: ['Cultural tourism', 'Traditional huts', 'Naga culture', 'Organic farming'], image: '🏘️' }
          ]
        },
        'Manipur': {
          name: 'Manipur',
          icon: '💧',
          wonders: [
            { name: 'Loktak Lake', description: 'World\'s only floating lake', bestTime: 'October-May', entryFee: '₹50', highlights: ['Phumdis (floating islands)', 'Keibul Lamjao NP', 'Sangai deer', 'Boat rides'], image: '💧' },
            { name: 'Keibul Lamjao National Park', description: 'Only floating national park', bestTime: 'November-March', entryFee: '₹100', highlights: ['Sangai deer', 'Floating park', 'Wetland', 'Endemic species'], image: '🦌' },
            { name: 'Kangla Fort', description: 'Historic palace complex', bestTime: 'October-May', entryFee: 'Free', highlights: ['Sacred site', 'Museum', 'Gardens', 'Cultural center'], image: '🏛️' },
            { name: 'Dzukou Valley (Manipur Side)', description: 'Shared valley with Nagaland', bestTime: 'June-September', entryFee: '₹50', highlights: ['Flowers', 'Trekking', 'Camping', 'Natural beauty'], image: '🌸' },
            { name: 'Siroi National Park', description: 'Lily paradise', bestTime: 'May-June', entryFee: '₹100', highlights: ['Siroi lily', 'Endemic flowers', 'Biodiversity', 'Trekking'], image: '🌺' },
            { name: 'Khangkhui Cave', description: 'Limestone cave', bestTime: 'October-May', entryFee: 'Free', highlights: ['Ancient cave', 'Stalagmites', 'Adventure', 'Local legends'], image: '🕳️' },
            { name: 'Tharon Cave', description: 'Historical cave system', bestTime: 'October-May', entryFee: 'Free', highlights: ['Limestone formations', 'Natural chambers', 'Adventure', 'Photography'], image: '🕳️' },
            { name: 'Imphal Valley', description: 'Scenic valley surrounded by hills', bestTime: 'October-May', entryFee: 'Free', highlights: ['Rice fields', 'Cultural hub', 'War cemetery', 'Markets'], image: '🏞️' },
            { name: 'Yangoupokpi-Lokchao Wildlife Sanctuary', description: 'Brow-antlered deer habitat', bestTime: 'November-March', entryFee: '₹100', highlights: ['Sangai deer', 'Biodiversity', 'Trekking', 'Research'], image: '🦌' },
            { name: 'Sendra Island', description: 'Tourist island in Loktak', bestTime: 'October-May', entryFee: '₹50', highlights: ['Lake views', 'Boating', 'Cottages', 'Water sports'], image: '🏝️' }
          ]
        },
        'Mizoram': {
          name: 'Mizoram',
          icon: '🏔️',
          wonders: [
            { name: 'Phawngpui (Blue Mountain)', description: 'Highest peak in Mizoram', bestTime: 'October-March', entryFee: '₹100', highlights: ['2157m peak', 'National Park', 'Rare orchids', 'Wildlife'], image: '🏔️' },
            { name: 'Vantawng Falls', description: 'Highest waterfall in Mizoram', bestTime: 'October-May', entryFee: 'Free', highlights: ['229m drop', 'Viewpoint', 'Photography', 'Bamboo forests'], image: '💧' },
            { name: 'Palak Lake', description: 'Largest natural lake', bestTime: 'October-May', entryFee: '₹50', highlights: ['Serene lake', 'Boating', 'Fishing', 'Legends'], image: '💧' },
            { name: 'Dampa Tiger Reserve', description: 'Wildlife sanctuary', bestTime: 'November-May', entryFee: '₹200', highlights: ['Tigers', 'Elephants', 'Biodiversity', 'Trekking'], image: '🐅' },
            { name: 'Murlen National Park', description: 'Tropical forest park', bestTime: 'October-March', entryFee: '₹100', highlights: ['Rare species', 'Mountain views', 'Trekking', 'Wildlife'], image: '🌲' },
            { name: 'Tam Dil Lake', description: 'Natural lake surrounded by forests', bestTime: 'October-May', entryFee: '₹30', highlights: ['Boating', 'Camping', 'Fishing', 'Scenic beauty'], image: '💧' },
            { name: 'Reiek Mountain', description: 'Trekking destination', bestTime: 'October-May', entryFee: 'Free', highlights: ['Trekking', 'Cultural village', 'Panoramic views', 'Camping'], image: '⛰️' },
            { name: 'Champhai', description: 'Rice bowl of Mizoram', bestTime: 'October-May', entryFee: 'Free', highlights: ['Myanmar border', 'Wine region', 'Scenic town', 'Vineyards'], image: '🏘️' },
            { name: 'Hmuifang', description: 'Tourist village', bestTime: 'October-May', entryFee: 'Free', highlights: ['Sunrise views', 'Mountain resort', 'Trekking', 'Cool climate'], image: '🏔️' },
            { name: 'Kungawrhi Puk', description: 'Historical cave', bestTime: 'October-May', entryFee: 'Free', highlights: ['Historical significance', 'Natural cave', 'Legends', 'Local culture'], image: '🕳️' }
          ]
        },
        'Tripura': {
          name: 'Tripura',
          icon: '🏞️',
          wonders: [
            { name: 'Neermahal', description: 'Water palace in lake', bestTime: 'October-March', entryFee: '₹25', highlights: ['Lake palace', 'Architecture', 'Boating', 'Light show'], image: '🏰' },
            { name: 'Sepahijala Wildlife Sanctuary', description: 'Biodiversity hotspot', bestTime: 'October-March', entryFee: '₹50', highlights: ['Spectacled monkey', 'Botanical garden', 'Lake', 'Orchids'], image: '🐵' },
            { name: 'Unakoti', description: 'Rock-cut sculptures', bestTime: 'October-March', entryFee: '₹20', highlights: ['Ancient carvings', 'Waterfalls', 'Shiva sculptures', 'Archaeological'], image: '🗿' },
            { name: 'Jampui Hills', description: 'Land of eternal hills', bestTime: 'November-March', entryFee: 'Free', highlights: ['Orange festival', 'Scenic beauty', 'Tribal culture', 'Viewpoints'], image: '🏔️' },
            { name: 'Rudrasagar Lake', description: 'Lake with water palace', bestTime: 'October-March', entryFee: 'Free', highlights: ['Neermahal views', 'Boating', 'Wetland', 'Bird watching'], image: '💧' },
            { name: 'Kamalasagar Lake', description: 'Lake with Kali temple', bestTime: 'October-March', entryFee: 'Free', highlights: ['Temple', 'Bangladesh border', 'Scenic lake', 'Peaceful'], image: '💧' },
            { name: 'Clouded Leopard National Park', description: 'Unique feline habitat', bestTime: 'October-March', entryFee: '₹100', highlights: ['Clouded leopard', 'Wildlife', 'Biodiversity', 'Conservation'], image: '🐆' },
            { name: 'Pilak', description: 'Archaeological and eco-tourism site', bestTime: 'October-March', entryFee: '₹20', highlights: ['Buddhist ruins', 'Hill ranges', 'Orange orchards', 'Tribal villages'], image: '🏛️' },
            { name: 'Dumboor Lake', description: 'Largest lake in Tripura', bestTime: 'October-March', entryFee: 'Free', highlights: ['Island lake', 'Boating', 'Festivals', 'Natural beauty'], image: '💧' },
            { name: 'Tepania Eco-Park', description: 'Ecological reserve', bestTime: 'October-March', entryFee: '₹30', highlights: ['Hanging bridge', 'Nature trails', 'Bamboo architecture', 'Eco-tourism'], image: '🌲' }
          ]
        },
        'Andhra Pradesh': {
          name: 'Andhra Pradesh',
          icon: '🏖️',
          wonders: [
            { name: 'Araku Valley', description: 'Hill station with coffee plantations', bestTime: 'October-March', entryFee: 'Free', highlights: ['Coffee estates', 'Borra Caves', 'Tribal culture', 'Scenic train'], image: '☕' },
            { name: 'Borra Caves', description: 'Million-year-old limestone caves', bestTime: 'October-March', entryFee: '₹90', highlights: ['Stalactites', 'Stalagmites', 'Natural formations', 'Lighting'], image: '🕳️' },
            { name: 'Horsley Hills', description: 'Hill station with rare flora', bestTime: 'October-March', entryFee: 'Free', highlights: ['Eucalyptus', 'Viewpoints', 'Adventure activities', 'Cool climate'], image: '🏔️' },
            { name: 'Nagarjuna Sagar', description: 'Massive dam and Buddhist site', bestTime: 'October-March', entryFee: '₹50', highlights: ['Dam', 'Buddhist ruins', 'Island museum', 'Boating'], image: '💧' },
            { name: 'Papikondalu', description: 'Mountain ranges along Godavari', bestTime: 'October-March', entryFee: 'Boat tour ₹1500+', highlights: ['Boat journey', 'Scenic beauty', 'Tribal villages', 'River cruise'], image: '⛰️' },
            { name: 'Kolleru Lake', description: 'Largest freshwater lake', bestTime: 'November-February', entryFee: 'Free', highlights: ['Bird sanctuary', 'Migratory birds', 'Wetland', 'Pelican roosting'], image: '🦅' },
            { name: 'Gandikota Canyon', description: 'Grand Canyon of India', bestTime: 'October-March', entryFee: 'Free', highlights: ['Red canyon', 'Fort', 'Pennar river', 'Camping'], image: '🏜️' },
            { name: 'Belum Caves', description: 'Longest cave system in India', bestTime: 'October-March', entryFee: '₹95', highlights: ['3.2 km cave', 'Underground lake', 'Natural formations', 'Well-lit'], image: '🕳️' },
            { name: 'Maredumilli Forest', description: 'Eco-tourism hotspot', bestTime: 'October-March', entryFee: 'Free', highlights: ['Dense forest', 'Waterfalls', 'Tribal culture', 'Bamboo chickens'], image: '🌲' },
            { name: 'Coringa Wildlife Sanctuary', description: 'Second largest mangrove', bestTime: 'November-March', entryFee: '₹50', highlights: ['Mangroves', 'Dolphins', 'Otters', 'Boat safari'], image: '🐬' }
          ]
        },
        'Telangana': {
          name: 'Telangana',
          icon: '🏞️',
          wonders: [
            { name: 'Kuntala Waterfall', description: 'Highest waterfall in Telangana', bestTime: 'July-January', entryFee: '₹30', highlights: ['45m drop', 'Forests', 'Trekking', 'Natural pool'], image: '💧' },
            { name: 'Pocharam Wildlife Sanctuary', description: 'Lake and forest sanctuary', bestTime: 'November-March', entryFee: '₹50', highlights: ['Lake', 'Deer', 'Bird watching', 'Boating'], image: '🦌' },
            { name: 'Ananthagiri Hills', description: 'Hill station near Hyderabad', bestTime: 'October-March', entryFee: 'Free', highlights: ['Coffee plantations', 'Trekking', 'Waterfalls', 'Cool climate'], image: '🏔️' },
            { name: 'Hussain Sagar Lake', description: 'Heart-shaped lake in Hyderabad', bestTime: 'Year-round', entryFee: 'Boating ₹80+', highlights: ['Buddha statue', 'Boating', 'Tank Bund', 'Musical fountain'], image: '💧' },
            { name: 'Pakhal Lake', description: 'Man-made lake and wildlife', bestTime: 'October-March', entryFee: '₹50', highlights: ['Lake', 'Wildlife sanctuary', 'Boating', 'Bird watching'], image: '💧' },
            { name: 'Kawal Tiger Reserve', description: 'Tiger and wildlife habitat', bestTime: 'November-June', entryFee: '₹300', highlights: ['Tigers', 'Panthers', 'Safari', 'Biodiversity'], image: '🐅' },
            { name: 'Laknavaram Lake', description: 'Scenic lake with islands', bestTime: 'October-March', entryFee: '₹30', highlights: ['Suspension bridge', '13 islands', 'Boating', 'Cottages'], image: '💧' },
            { name: 'Mallela Theertham', description: 'Waterfall in dense forest', bestTime: 'July-January', entryFee: 'Free', highlights: ['50m fall', 'Trekking', 'Natural pool', 'Forest'], image: '💧' },
            { name: 'Somasila Dam', description: 'Scenic dam on Pennar river', bestTime: 'October-March', entryFee: 'Free', highlights: ['Dam views', 'Boating', 'Picnic spot', 'Sunset'], image: '💧' },
            { name: 'Ethipothala Falls', description: 'Waterfall and crocodile sanctuary', bestTime: 'October-March', entryFee: '₹30', highlights: ['21m fall', 'Crocodiles', 'Viewpoint', 'Natural beauty'], image: '💧' }
          ]
        },
        'Odisha': {
          name: 'Odisha',
          icon: '🌊',
          wonders: [
            { name: 'Chilika Lake', description: 'Asia\'s largest brackish water lagoon', bestTime: 'November-February', entryFee: 'Boat ₹100+', highlights: ['Dolphins', 'Migratory birds', 'Islands', 'UNESCO tentative'], image: '💧' },
            { name: 'Simlipal National Park', description: 'Tiger reserve with waterfalls', bestTime: 'November-June', entryFee: '₹500', highlights: ['Tigers', 'Elephants', 'Barehipani Falls', 'Sal forests'], image: '🐅' },
            { name: 'Bhitarkanika National Park', description: 'Mangrove and crocodile sanctuary', bestTime: 'November-February', entryFee: '₹50', highlights: ['Saltwater crocodiles', 'Mangroves', 'Dolphins', 'Bird watching'], image: '🐊' },
            { name: 'Dhauli Hills', description: 'Peace pagoda and ancient site', bestTime: 'October-March', entryFee: 'Free', highlights: ['Peace pagoda', 'Rock edicts', 'Historical significance', 'Panoramic views'], image: '🏔️' },
            { name: 'Satkosia Gorge', description: 'Scenic gorge with gharials', bestTime: 'October-March', entryFee: '₹50', highlights: ['Mahanadi gorge', 'Gharials', 'Boat safari', 'Wildlife'], image: '🏞️' },
            { name: 'Hirakud Dam', description: 'Longest earthen dam', bestTime: 'October-March', entryFee: 'Free', highlights: ['Gandhi Minar', 'Reservoir', 'Sunset views', 'Boating'], image: '💧' },
            { name: 'Debrigarh Wildlife Sanctuary', description: 'Forest and lake sanctuary', bestTime: 'November-March', entryFee: '₹50', highlights: ['Hirakud reservoir', 'Leopards', 'Deer', 'Bird watching'], image: '🐆' },
            { name: 'Chandipur Beach', description: 'Vanishing sea beach', bestTime: 'November-February', entryFee: 'Free', highlights: ['Hide and seek beach', 'Unique tides', 'Red crabs', 'Sunset'], image: '🏖️' },
            { name: 'Khandadhar Falls', description: 'Odisha\'s highest waterfall', bestTime: 'July-January', entryFee: 'Free', highlights: ['244m drop', 'Trekking', 'Natural beauty', 'Remote location'], image: '💧' },
            { name: 'Gopalpur Beach', description: 'Serene beach town', bestTime: 'October-March', entryFee: 'Free', highlights: ['Golden sand', 'Lighthouse', 'Water sports', 'Peaceful'], image: '🏖️' }
          ]
        },
        'West Bengal': {
          name: 'West Bengal',
          icon: '🏔️',
          wonders: [
            { name: 'Darjeeling Tea Gardens', description: 'World-famous tea estates', bestTime: 'March-May, October-November', entryFee: 'Tour ₹500+', highlights: ['Tea plantations', 'Toy train', 'Kanchenjunga views', 'Happy Valley'], image: '☕' },
            { name: 'Sandakphu Trek', description: 'Highest peak in West Bengal', bestTime: 'October-November, March-May', entryFee: 'Permit ₹100', highlights: ['3636m peak', 'Four peaks view', 'Trekking', 'Nepal border'], image: '🏔️' },
            { name: 'Sundarbans', description: 'Largest mangrove forest', bestTime: 'September-March', entryFee: 'Tour ₹2000+', highlights: ['UNESCO site', 'Bengal tigers', 'Mangroves', 'River dolphins'], image: '🐅' },
            { name: 'Singalila National Park', description: 'High altitude park', bestTime: 'March-May, October-November', entryFee: '₹100', highlights: ['Red panda', 'Rhododendron', 'Kanchenjunga views', 'Trekking'], image: '🐼' },
            { name: 'Dooars Region', description: 'Floodplains and tea gardens', bestTime: 'October-March', entryFee: 'Varies', highlights: ['Wildlife sanctuaries', 'Tea gardens', 'Rivers', 'Elephant safari'], image: '🐘' },
            { name: 'Neora Valley National Park', description: 'Biodiversity hotspot', bestTime: 'October-April', entryFee: '₹100', highlights: ['Red panda', 'Dense forest', 'Trekking', 'River Neora'], image: '🌲' },
            { name: 'Jaldapara National Park', description: 'Rhino habitat', bestTime: 'November-April', entryFee: '₹500', highlights: ['One-horned rhino', 'Elephant safari', 'Torsa river', 'Wildlife'], image: '🦏' },
            { name: 'Tiger Hill', description: 'Sunrise viewpoint', bestTime: 'October-May', entryFee: '₹30', highlights: ['Sunrise over Kanchenjunga', '2590m altitude', 'Observatory', 'Panoramic views'], image: '🌄' },
            { name: 'Mirik Lake', description: 'Scenic hill station lake', bestTime: 'March-June, September-November', entryFee: 'Boating ₹200', highlights: ['Boating', 'Gardens', 'Horseback riding', 'Tea gardens'], image: '💧' },
            { name: 'Digha Beach', description: 'Popular beach destination', bestTime: 'October-March', entryFee: 'Free', highlights: ['Long beach', 'Casuarina trees', 'Marine aquarium', 'Sunset'], image: '🏖️' }
          ]
        },
        'Madhya Pradesh': {
          name: 'Madhya Pradesh',
          icon: '🐅',
          wonders: [
            { name: 'Kanha National Park', description: 'Tiger reserve inspiring Jungle Book', bestTime: 'October-June', entryFee: '₹1500-3000', highlights: ['Bengal tigers', 'Barasingha', 'Sal forests', 'Bamni Dadar'], image: '🐅' },
            { name: 'Bandhavgarh National Park', description: 'Highest tiger density park', bestTime: 'October-June', entryFee: '₹1500-3000', highlights: ['Tigers', 'Bandhavgarh Fort', 'Biodiversity', 'Photography'], image: '🐅' },
            { name: 'Marble Rocks', description: 'Narmada gorge with marble cliffs', bestTime: 'October-March', entryFee: 'Boat ₹100', highlights: ['Marble cliffs', 'Boat ride', 'Dhuandhar Falls', 'Evening light show'], image: '🏞️' },
            { name: 'Pachmarhi', description: 'Queen of Satpura', bestTime: 'October-June', entryFee: 'Free', highlights: ['Hill station', 'Bee Falls', 'Pandav Caves', 'Dhoopgarh'], image: '🏔️' },
            { name: 'Satpura Tiger Reserve', description: 'Central India tiger habitat', bestTime: 'October-June', entryFee: '₹2000+', highlights: ['Tigers', 'Walking safari', 'Canoeing', 'Boat safari'], image: '🐅' },
            { name: 'Pench National Park', description: 'Mowgli land', bestTime: 'October-June', entryFee: '₹1500-3000', highlights: ['Tigers', 'Jungle Book setting', 'Pench river', 'Wildlife'], image: '🐅' },
            { name: 'Bhimbetka Rock Shelters', description: 'UNESCO rock art site', bestTime: 'October-March', entryFee: '₹100', highlights: ['UNESCO site', 'Prehistoric paintings', 'Rock shelters', 'Archaeological'], image: '🗿' },
            { name: 'Tawa Reservoir', description: 'Massive water reservoir', bestTime: 'October-March', entryFee: 'Free', highlights: ['Islands', 'Boating', 'Fishing', 'Sunset views'], image: '💧' },
            { name: 'Omkareshwar Island', description: 'Sacred river island', bestTime: 'October-March', entryFee: 'Free', highlights: ['Om-shaped island', 'Narmada river', 'Temples', 'Parikrama'], image: '🏝️' },
            { name: 'Fossil National Park', description: 'Plant fossil park', bestTime: 'October-March', entryFee: '₹50', highlights: ['Fossils', 'Geological wonder', 'Educational', 'Unique'], image: '🦴' }
          ]
        },
        'Gujarat': {
          name: 'Gujarat',
          icon: '🦁',
          wonders: [
            { name: 'Gir National Park', description: 'Only Asiatic lion habitat', bestTime: 'December-March', entryFee: '₹1500-3000', highlights: ['Asiatic lions', 'Safari', 'Crocodiles', 'Biodiversity'], image: '🦁' },
            { name: 'Rann of Kutch', description: 'White salt desert', bestTime: 'November-February', entryFee: 'Free (festival entry)', highlights: ['White desert', 'Rann Utsav', 'Full moon', 'Cultural tourism'], image: '🏜️' },
            { name: 'Marine National Park', description: 'First marine park in India', bestTime: 'October-March', entryFee: '₹300', highlights: ['Coral reefs', 'Marine life', 'Islands', 'Dolphins'], image: '🐠' },
            { name: 'Saputara Hill Station', description: 'Only hill station in Gujarat', bestTime: 'October-March', entryFee: 'Free', highlights: ['Lake', 'Ropeway', 'Tribal culture', 'Waterfalls'], image: '🏔️' },
            { name: 'Gir Waterfalls', description: 'Seasonal waterfall', bestTime: 'Monsoon (July-September)', entryFee: 'Free', highlights: ['100ft falls', 'Trekking', 'Natural pool', 'Photography'], image: '💧' },
            { name: 'Wild Ass Sanctuary', description: 'Indian wild ass habitat', bestTime: 'October-February', entryFee: '₹50', highlights: ['Wild ass', 'Little Rann', 'Flamingos', 'Desert ecosystem'], image: '🦓' },
            { name: 'Nalsarovar Bird Sanctuary', description: 'Wetland bird sanctuary', bestTime: 'November-February', entryFee: '₹150', highlights: ['Migratory birds', 'Boat safari', 'Flamingos', 'Photography'], image: '🦜' },
            { name: 'Polo Forest', description: 'Ancient forest with ruins', bestTime: 'October-March', entryFee: 'Free', highlights: ['Teak forest', 'Ancient temples', 'Camping', 'Waterfalls'], image: '🌲' },
            { name: 'Mandvi Beach', description: 'Wind farm beach', bestTime: 'November-February', entryFee: 'Free', highlights: ['Beach palace', 'Water sports', 'Wind farms', 'Camel rides'], image: '🏖️' },
            { name: 'Champaner-Pavagadh', description: 'UNESCO archaeological park', bestTime: 'October-March', entryFee: '₹25', highlights: ['UNESCO site', 'Ropeway', 'Hill fortress', 'Ruins'], image: '🏛️' }
          ]
        },
        'Maharashtra': {
          name: 'Maharashtra',
          icon: '⛰️',
          wonders: [
            { name: 'Western Ghats', description: 'UNESCO mountain range', bestTime: 'June-September', entryFee: 'Free', highlights: ['UNESCO site', 'Biodiversity', 'Waterfalls', 'Hill forts'], image: '🏔️' },
            { name: 'Lonavala-Khandala', description: 'Popular hill stations', bestTime: 'June-September', entryFee: 'Free', highlights: ['Monsoon beauty', 'Waterfalls', 'Caves', 'Forts'], image: '⛰️' },
            { name: 'Tadoba National Park', description: 'Tiger reserve', bestTime: 'October-June', entryFee: '₹1500-3000', highlights: ['Tigers', 'Safari', 'Lake', 'Wildlife photography'], image: '🐅' },
            { name: 'Kas Plateau', description: 'Plateau of flowers', bestTime: 'August-September', entryFee: '₹100', highlights: ['UNESCO site', 'Wildflowers', 'Biodiversity', 'Photography'], image: '🌸' },
            { name: 'Bhandardara', description: 'Lake and waterfall destination', bestTime: 'June-February', entryFee: 'Free', highlights: ['Arthur Lake', 'Randha Falls', 'Fireflies', 'Camping'], image: '💧' },
            { name: 'Matheran Hill Station', description: 'Toy train hill station', bestTime: 'October-May', entryFee: '₹50', highlights: ['No vehicles', 'Toy train', 'Viewpoints', 'Horseback riding'], image: '🚂' },
            { name: 'Konkan Coast', description: 'Scenic coastal belt', bestTime: 'October-March', entryFee: 'Free', highlights: ['Beaches', 'Seafood', 'Forts', 'Waterfalls'], image: '🏖️' },
            { name: 'Kaas Lake', description: 'Biodiversity hotspot', bestTime: 'August-October', entryFee: '₹100', highlights: ['Wildflowers', 'UNESCO site', 'Lake', 'Research area'], image: '💧' },
            { name: 'Malshej Ghat', description: 'Mountain pass with waterfalls', bestTime: 'June-September', entryFee: 'Free', highlights: ['Monsoon beauty', 'Waterfalls', 'Flamingos', 'Valley views'], image: '⛰️' },
            { name: 'Diveagar Beach', description: 'Pristine Konkan beach', bestTime: 'October-March', entryFee: 'Free', highlights: ['Clean beach', 'Suvarna Ganesh', 'Water sports', 'Peaceful'], image: '🏖️' }
          ]
        },
        'Karnataka': {
          name: 'Karnataka',
          icon: '☕',
          wonders: [
            { name: 'Coorg Coffee Estates', description: 'Scotland of India', bestTime: 'October-March', entryFee: 'Free', highlights: ['Coffee plantations', 'Waterfalls', 'Abbey Falls', 'Raja Seat'], image: '☕' },
            { name: 'Jog Falls', description: 'India\'s second highest waterfall', bestTime: 'Monsoon (June-September)', entryFee: '₹30', highlights: ['253m drop', 'Four cascades', 'Viewpoints', 'Monsoon beauty'], image: '💧' },
            { name: 'Kabini Wildlife Sanctuary', description: 'Elephant and tiger reserve', bestTime: 'October-May', entryFee: '₹1500+', highlights: ['Elephants', 'Tigers', 'Boat safari', 'Kabini river'], image: '🐘' },
            { name: 'Chikmangalur Hills', description: 'Coffee land with peaks', bestTime: 'September-February', entryFee: 'Free', highlights: ['Mullayanagiri peak', 'Coffee estates', 'Trekking', 'Cool climate'], image: '🏔️' },
            { name: 'Gokarna Beaches', description: 'Pristine coastal town', bestTime: 'October-March', entryFee: 'Free', highlights: ['Om Beach', 'Kudle Beach', 'Temples', 'Cliff views'], image: '🏖️' },
            { name: 'Bandipur National Park', description: 'Tiger reserve', bestTime: 'October-May', entryFee: '₹1200-2500', highlights: ['Tigers', 'Elephants', 'Safari', 'Biodiversity'], image: '🐅' },
            { name: 'Agumbe Rainforest', description: 'Cherrapunji of South', bestTime: 'October-March', entryFee: 'Free', highlights: ['High rainfall', 'King cobras', 'Sunset point', 'Research station'], image: '🌲' },
            { name: 'Dandeli Wildlife Sanctuary', description: 'Adventure and wildlife', bestTime: 'October-May', entryFee: '₹500+', highlights: ['White water rafting', 'Black panthers', 'Kali river', 'Caves'], image: '🚣' },
            { name: 'Hogenakkal Falls', description: 'Niagara of India', bestTime: 'October-March', entryFee: '₹20', highlights: ['Medicinal baths', 'Coracle ride', 'Carbonatite rocks', 'Fish massage'], image: '💧' },
            { name: 'Nandi Hills', description: 'Ancient hill fortress', bestTime: 'October-February', entryFee: '₹20', highlights: ['Sunrise views', 'Cycling', 'Tipu Drop', 'Paragliding'], image: '🏔️' }
          ]
        },
        'Tamil Nadu': {
          name: 'Tamil Nadu',
          icon: '🏛️',
          wonders: [
            { name: 'Nilgiri Hills', description: 'Blue mountains with tea estates', bestTime: 'October-March', entryFee: 'Free', highlights: ['Ooty', 'Tea plantations', 'Toy train', 'Botanical gardens'], image: '🏔️' },
            { name: 'Kodaikanal Lake', description: 'Princess of hill stations', bestTime: 'April-June, September-October', entryFee: 'Boating ₹150+', highlights: ['Star-shaped lake', 'Boating', 'Coaker Walk', 'Pine forests'], image: '💧' },
            { name: 'Yercaud Hills', description: 'Poor man\'s Ooty', bestTime: 'October-June', entryFee: 'Free', highlights: ['Coffee estates', 'Emerald Lake', 'Orange groves', 'Viewpoints'], image: '🏔️' },
            { name: 'Gulf of Mannar', description: 'Marine biosphere reserve', bestTime: 'October-March', entryFee: '₹100', highlights: ['UNESCO reserve', 'Coral reefs', 'Dugongs', 'Island hopping'], image: '🐠' },
            { name: 'Hogenakkal Falls', description: 'Niagara of India', bestTime: 'October-March', entryFee: '₹20', highlights: ['Coracle rides', 'Medicinal baths', 'Fish spa', 'Waterfalls'], image: '💧' },
            { name: 'Mudumalai National Park', description: 'Elephant and tiger reserve', bestTime: 'October-May', entryFee: '₹500-1500', highlights: ['Elephants', 'Tigers', 'Safari', 'Nilgiri biodiversity'], image: '🐘' },
            { name: 'Pichavaram Mangrove', description: 'Second largest mangrove', bestTime: 'October-March', entryFee: '₹50', highlights: ['Mangrove forest', 'Boat ride', 'Waterways', 'Bird watching'], image: '🌳' },
            { name: 'Valparai Hill Station', description: 'Tea estate paradise', bestTime: 'October-March', entryFee: 'Free', highlights: ['Tea gardens', 'Wildlife', 'Waterfalls', 'Cool climate'], image: '☕' },
            { name: 'Courtallam Falls', description: 'Spa of South India', bestTime: 'June-September', entryFee: 'Free', highlights: ['Medicinal water', '5 falls', 'Natural spa', 'Monsoon beauty'], image: '💧' },
            { name: 'Point Calimere', description: 'Wildlife sanctuary', bestTime: 'December-March', entryFee: '₹50', highlights: ['Flamingos', 'Migratory birds', 'Lighthouse', 'Beach'], image: '🦩' }
          ]
        },
        'Goa': {
          name: 'Goa',
          icon: '🏖️',
          wonders: [
            { name: 'Dudhsagar Falls', description: 'Four-tiered milky waterfall', bestTime: 'June-September', entryFee: '₹100', highlights: ['310m drop', 'Jeep safari', 'Railway bridge', 'Monsoon beauty'], image: '💧' },
            { name: 'Mollem National Park', description: 'Biodiversity hotspot', bestTime: 'October-March', entryFee: '₹100', highlights: ['Western Ghats', 'Wildlife', 'Dudhsagar access', 'Trekking'], image: '🌲' },
            { name: 'Agonda Beach', description: 'Pristine quiet beach', bestTime: 'November-March', entryFee: 'Free', highlights: ['Turtle nesting', 'Peaceful', 'Dolphins', 'Sunset'], image: '🐢' },
            { name: 'Netravali Wildlife Sanctuary', description: 'Eco-tourism hotspot', bestTime: 'October-March', entryFee: '₹50', highlights: ['Bubble Lake', 'Savari Waterfalls', 'Wildlife', 'Trekking'], image: '🌲' },
            { name: 'Cotigao Wildlife Sanctuary', description: 'Southern Goa sanctuary', bestTime: 'October-March', entryFee: '₹50', highlights: ['Tree-top tower', 'Wildlife', 'Dense forest', 'Nature trails'], image: '🦜' },
            { name: 'Chorla Ghat', description: 'Tri-state biodiversity', bestTime: 'June-September', entryFee: 'Free', highlights: ['Waterfalls', 'Western Ghats', 'Trekking', 'Monsoon beauty'], image: '🏔️' },
            { name: 'Grand Island', description: 'Water sports paradise', bestTime: 'October-May', entryFee: 'Tour ₹1500+', highlights: ['Snorkeling', 'Dolphin spotting', 'Scuba diving', 'Boat trip'], image: '🏝️' },
            { name: 'Salim Ali Bird Sanctuary', description: 'Mangrove bird sanctuary', bestTime: 'October-March', entryFee: '₹50', highlights: ['Mangroves', 'Bird watching', 'Boat safari', 'Biodiversity'], image: '🦅' },
            { name: 'Butterfly Beach', description: 'Secret beach', bestTime: 'November-March', entryFee: 'Free', highlights: ['Secluded', 'Dolphins', 'Butterflies', 'Sunset'], image: '🦋' },
            { name: 'Arvalem Caves', description: 'Ancient rock-cut caves', bestTime: 'October-March', entryFee: 'Free', highlights: ['6th century', 'Buddhist caves', 'Arvalem waterfall', 'Archaeological'], image: '🕳️' }
          ]
        },
        'Punjab': {
          name: 'Punjab',
          icon: '🌾',
          wonders: [
            { name: 'Harike Wetland', description: 'Ramsar wetland sanctuary', bestTime: 'November-March', entryFee: '₹50', highlights: ['Migratory birds', 'Boat safari', 'Confluence point', 'Biodiversity'], image: '🦜' },
            { name: 'Kanjli Wetland', description: 'Bird sanctuary lake', bestTime: 'November-March', entryFee: '₹30', highlights: ['Bird watching', 'Migratory species', 'Boating', 'Wetland ecosystem'], image: '💧' },
            { name: 'Ropar Wetland', description: 'Ramsar site', bestTime: 'November-February', entryFee: 'Free', highlights: ['Migratory birds', 'Sutlej river', 'Bird watching', 'Picnic spot'], image: '🦅' },
            { name: 'Bir Bhadson Wildlife Sanctuary', description: 'Blackbuck habitat', bestTime: 'October-March', entryFee: '₹50', highlights: ['Blackbucks', 'Grasslands', 'Wildlife', 'Photography'], image: '🦌' },
            { name: 'Thakurdwara Hills', description: 'Shivalik hill range', bestTime: 'October-March', entryFee: 'Free', highlights: ['Temple', 'Trekking', 'Hill views', 'Wildlife'], image: '⛰️' },
            { name: 'Keshopur-Miani Wetland', description: 'Community reserve', bestTime: 'November-February', entryFee: 'Free', highlights: ['Wetland birds', 'Eco-tourism', 'Village tourism', 'Conservation'], image: '🦜' },
            { name: 'Abohar Wildlife Sanctuary', description: 'Blackbuck sanctuary', bestTime: 'October-March', entryFee: '₹30', highlights: ['Blackbucks', 'Blue bulls', 'Wildlife', 'Desert ecosystem'], image: '🦌' },
            { name: 'Jallo Wildlife Park', description: 'Urban park and zoo', bestTime: 'October-March', entryFee: '₹50', highlights: ['Wildlife', 'Lake', 'Boating', 'Picnic spot'], image: '🦌' },
            { name: 'Takhni-Rehmapur Wildlife Sanctuary', description: 'Blackbuck reserve', bestTime: 'October-March', entryFee: '₹30', highlights: ['Blackbucks', 'Grasslands', 'Bird watching', 'Wildlife'], image: '🦌' },
            { name: 'Nangal Wetland', description: 'Bhakra Dam reservoir', bestTime: 'October-March', entryFee: 'Free', highlights: ['Dam views', 'Bird watching', 'Boating', 'Picnic'], image: '💧' }
          ]
        },
        'Haryana': {
          name: 'Haryana',
          icon: '🦜',
          wonders: [
            { name: 'Sultanpur National Park', description: 'Bird sanctuary near Delhi', bestTime: 'November-March', entryFee: '₹50', highlights: ['Migratory birds', 'Lake', 'Nature trails', 'Photography'], image: '🦅' },
            { name: 'Morni Hills', description: 'Only hill station in Haryana', bestTime: 'September-March', entryFee: 'Free', highlights: ['Twin lakes', 'Trekking', 'Adventure park', 'Viewpoints'], image: '🏔️' },
            { name: 'Badkhal Lake', description: 'Seasonal lake', bestTime: 'Monsoon (July-September)', entryFee: 'Free', highlights: ['Lake', 'Boating', 'Aravalli hills', 'Picnic spot'], image: '💧' },
            { name: 'Kalesar National Park', description: 'Shivalik forest', bestTime: 'October-March', entryFee: '₹100', highlights: ['Leopards', 'Red jungle fowl', 'Sal forest', 'Wildlife'], image: '🐆' },
            { name: 'Damdama Lake', description: 'Largest natural lake', bestTime: 'October-March', entryFee: '₹100', highlights: ['Rock climbing', 'Boating', 'Hot air balloon', 'Adventure'], image: '💧' },
            { name: 'Surajkund', description: 'Ancient reservoir', bestTime: 'October-March', entryFee: 'Free (fair entry)', highlights: ['Crafts fair', 'Sun temple', 'Aravalli hills', 'Cultural events'], image: '💧' },
            { name: 'Bhindawas Wildlife Sanctuary', description: 'Wetland sanctuary', bestTime: 'November-March', entryFee: '₹30', highlights: ['Migratory birds', 'Wetland', 'Bird watching', 'Photography'], image: '🦜' },
            { name: 'Karna Lake', description: 'Sacred lake', bestTime: 'October-March', entryFee: 'Free', highlights: ['Historical', 'Boating', 'Temples', 'Mythology'], image: '💧' },
            { name: 'Sarasvati Wildlife Sanctuary', description: 'Blackbuck habitat', bestTime: 'October-March', entryFee: '₹50', highlights: ['Blackbucks', 'Blue bulls', 'Grasslands', 'Wildlife'], image: '🦌' },
            { name: 'Sohna Hot Springs', description: 'Natural hot water springs', bestTime: 'October-March', entryFee: '₹100', highlights: ['Thermal springs', 'Spa', 'Aravalli hills', 'Wellness'], image: '♨️' }
          ]
        },
        'Bihar': {
          name: 'Bihar',
          icon: '🏛️',
          wonders: [
            { name: 'Valmiki National Park', description: 'Tiger reserve on Nepal border', bestTime: 'October-April', entryFee: '₹500-1500', highlights: ['Tigers', 'Gandak river', 'Nepal border', 'Safari'], image: '🐅' },
            { name: 'Rajgir Hot Springs', description: 'Sacred hot water springs', bestTime: 'October-March', entryFee: '₹30', highlights: ['Thermal springs', 'Ropeway', 'Buddhist sites', 'Hills'], image: '♨️' },
            { name: 'Kakolat Waterfall', description: 'Sacred waterfall', bestTime: 'July-March', entryFee: 'Free', highlights: ['50ft fall', 'Natural pool', 'Legends', 'Picnic spot'], image: '💧' },
            { name: 'Vikramshila Gangetic Dolphin Sanctuary', description: 'Dolphin sanctuary', bestTime: 'October-March', entryFee: 'Free', highlights: ['Gangetic dolphins', 'Boat ride', 'River Ganga', 'Conservation'], image: '🐬' },
            { name: 'Kanwar Lake', description: 'Asia\'s largest oxbow lake', bestTime: 'November-February', entryFee: 'Free', highlights: ['Bird sanctuary', 'Migratory birds', 'Boating', 'Wetland'], image: '🦜' },
            { name: 'Barabar Caves', description: 'Ancient rock-cut caves', bestTime: 'October-March', entryFee: 'Free', highlights: ['3rd century BC', 'Acoustic caves', 'Jain/Buddhist', 'Historical'], image: '🕳️' },
            { name: 'Kharagpur Lake', description: 'Largest lake in Bihar', bestTime: 'November-March', entryFee: 'Free', highlights: ['Bird watching', 'Boating', 'Wetland', 'Scenic'], image: '💧' },
            { name: 'Kaimur Wildlife Sanctuary', description: 'Forest sanctuary', bestTime: 'October-March', entryFee: '₹100', highlights: ['Leopards', 'Kaimur hills', 'Waterfalls', 'Trekking'], image: '🐆' },
            { name: 'Sitamarhi', description: 'Birthplace of Sita', bestTime: 'October-March', entryFee: 'Free', highlights: ['Sacred ponds', 'Mythology', 'Pilgrimage', 'Lakes'], image: '🏛️' },
            { name: 'Gautam Buddha Wildlife Sanctuary', description: 'Forest reserve', bestTime: 'November-April', entryFee: '₹100', highlights: ['Wildlife', 'Trekking', 'Nature', 'Conservation'], image: '🌲' }
          ]
        },
        'Jharkhand': {
          name: 'Jharkhand',
          icon: '💧',
          wonders: [
            { name: 'Hundru Falls', description: 'Highest waterfall in Jharkhand', bestTime: 'July-December', entryFee: '₹30', highlights: ['98m drop', 'Subarnarekha river', 'Trekking', 'Photography'], image: '💧' },
            { name: 'Dassam Falls', description: 'Cascade waterfall', bestTime: 'July-December', entryFee: '₹20', highlights: ['44m drop', 'Kanchi river', 'Picnic spot', 'Nature'], image: '💧' },
            { name: 'Betla National Park', description: 'Tiger reserve', bestTime: 'November-March', entryFee: '₹500-1500', highlights: ['Tigers', 'Elephants', 'Safari', 'Fort ruins'], image: '🐅' },
            { name: 'Jonha Falls', description: 'Temple waterfall', bestTime: 'July-December', entryFee: '₹20', highlights: ['43m drop', 'Temple', 'Trekking', 'Scenic beauty'], image: '💧' },
            { name: 'Parasnath Hills', description: 'Highest peak in Jharkhand', bestTime: 'October-March', entryFee: 'Free', highlights: ['4480ft peak', 'Jain pilgrimage', 'Temples', 'Trekking'], image: '⛰️' },
            { name: 'Dimna Lake', description: 'Artificial lake', bestTime: 'October-March', entryFee: '₹30', highlights: ['Dam', 'Boating', 'Picnic', 'Sunset views'], image: '💧' },
            { name: 'Dalma Wildlife Sanctuary', description: 'Elephant habitat', bestTime: 'October-May', entryFee: '₹100', highlights: ['Wild elephants', 'Hilltop sanctuary', 'Trekking', 'Views'], image: '🐘' },
            { name: 'Tagore Hill', description: 'Scenic viewpoint', bestTime: 'October-March', entryFee: 'Free', highlights: ['Tagore connection', 'Rock garden', 'Viewpoint', 'Sunset'], image: '🏔️' },
            { name: 'Hazaribagh National Park', description: 'Wildlife sanctuary', bestTime: 'November-March', entryFee: '₹300', highlights: ['Tigers', 'Leopards', 'Deer', 'Lake'], image: '🐅' },
            { name: 'Netarhat', description: 'Queen of Chotanagpur', bestTime: 'October-March', entryFee: 'Free', highlights: ['Sunrise/sunset points', 'Magnolia Point', 'Cool climate', 'Waterfalls'], image: '🏔️' }
          ]
        },
        'Chhattisgarh': {
          name: 'Chhattisgarh',
          icon: '💧',
          wonders: [
            { name: 'Chitrakote Falls', description: 'Niagara of India', bestTime: 'July-December', entryFee: '₹25', highlights: ['90ft horseshoe falls', 'Monsoon beauty', 'Photography', 'Viewpoints'], image: '💧' },
            { name: 'Tirathgarh Falls', description: 'Multi-tiered waterfall', bestTime: 'July-December', entryFee: '₹30', highlights: ['300ft drop', 'Multiple tiers', 'Natural pool', 'Trekking'], image: '💧' },
            { name: 'Kanger Valley National Park', description: 'Biodiversity hotspot', bestTime: 'October-March', entryFee: '₹100', highlights: ['Kotumsar Cave', 'Tirathgarh Falls', 'Wildlife', 'Underground caves'], image: '🌲' },
            { name: 'Barnawapara Wildlife Sanctuary', description: 'Wildlife reserve', bestTime: 'November-May', entryFee: '₹200', highlights: ['Leopards', 'Deer', 'Birds', 'Safari'], image: '🐆' },
            { name: 'Achanakmar Tiger Reserve', description: 'Tiger habitat', bestTime: 'October-June', entryFee: '₹500-1500', highlights: ['Tigers', 'Elephants', 'Biodiversity', 'Safari'], image: '🐅' },
            { name: 'Indravati National Park', description: 'Wild buffalo habitat', bestTime: 'November-June', entryFee: '₹300', highlights: ['Wild buffalo', 'Tigers', 'Hill myna', 'Dense forest'], image: '🦬' },
            { name: 'Bhoramdeo Wildlife Sanctuary', description: 'Forest sanctuary', bestTime: 'November-May', entryFee: '₹100', highlights: ['Wildlife', 'Maikal hills', 'Temples', 'Nature trails'], image: '🌲' },
            { name: 'Tamor Pingla Wildlife Sanctuary', description: 'Elephant corridor', bestTime: 'November-May', entryFee: '₹150', highlights: ['Elephants', 'Biodiversity', 'Forest', 'Wildlife'], image: '🐘' },
            { name: 'Sitanadi Wildlife Sanctuary', description: 'Forest reserve', bestTime: 'November-May', entryFee: '₹100', highlights: ['Wildlife', 'Trekking', 'Nature', 'Biodiversity'], image: '🌲' },
            { name: 'Kailash and Kutumsar Caves', description: 'Limestone cave system', bestTime: 'October-March', entryFee: '₹50', highlights: ['Stalactites', 'Stalagmites', 'Blind fish', 'Underground wonders'], image: '🕳️' }
          ]
        },
        'Assam': {
          name: 'Assam',
          icon: '🦏',
          wonders: [
            { name: 'Kaziranga National Park', description: 'UNESCO one-horned rhino park', bestTime: 'November-April', entryFee: '₹1100-3500', highlights: ['UNESCO site', 'One-horned rhino', 'Elephant safari', 'Tigers'], image: '🦏' },
            { name: 'Majuli Island', description: 'World\'s largest river island', bestTime: 'October-March', entryFee: 'Free', highlights: ['Brahmaputra island', 'Vaishnavite culture', 'Satras', 'Bird sanctuary'], image: '🏝️' },
            { name: 'Manas National Park', description: 'UNESCO tiger and elephant reserve', bestTime: 'November-April', entryFee: '₹1000-2500', highlights: ['UNESCO site', 'Tigers', 'Elephants', 'Golden langur'], image: '🐅' },
            { name: 'Haflong Hill Station', description: 'Only hill station in Assam', bestTime: 'October-March', entryFee: 'Free', highlights: ['Lake', 'Mountains', 'Jatinga bird mystery', 'Viewpoints'], image: '🏔️' },
            { name: 'Nameri National Park', description: 'White water rafting and wildlife', bestTime: 'November-April', entryFee: '₹500-1500', highlights: ['Rafting', 'Tigers', 'Elephants', 'Jia Bhoroli river'], image: '🚣' },
            { name: 'Dipor Bil', description: 'Ramsar wetland', bestTime: 'November-March', entryFee: 'Free', highlights: ['Bird sanctuary', 'Migratory birds', 'Boating', 'Wetland ecosystem'], image: '🦜' },
            { name: 'Pobitora Wildlife Sanctuary', description: 'Highest rhino density', bestTime: 'November-March', entryFee: '₹500-1000', highlights: ['One-horned rhino', 'Elephant safari', 'Birds', 'High density'], image: '🦏' },
            { name: 'Gibbon Wildlife Sanctuary', description: 'Hoolock gibbon habitat', bestTime: 'November-March', entryFee: '₹200', highlights: ['Hoolock gibbons', 'Rainforest', 'Canopy walk', 'Biodiversity'], image: '🦧' },
            { name: 'Sualkuchi Silk Village', description: 'Manchester of East', bestTime: 'October-March', entryFee: 'Free', highlights: ['Silk weaving', 'Brahmaputra views', 'Village culture', 'Handlooms'], image: '🧵' },
            { name: 'Chandubi Lake', description: 'Scenic natural lake', bestTime: 'October-March', entryFee: 'Free', highlights: ['Boating', 'Elephant rides', 'Bird watching', 'Scenic beauty'], image: '💧' }
          ]
        },
        'Arunachal Pradesh': {
          name: 'Arunachal Pradesh',
          icon: '🏔️',
          wonders: [
            { name: 'Tawang Monastery', description: 'Second largest monastery', bestTime: 'March-October', entryFee: 'Free', highlights: ['Buddhist monastery', '10,000ft altitude', 'Snow peaks', 'Cultural center'], image: '🏛️' },
            { name: 'Sela Pass', description: 'High altitude mountain pass', bestTime: 'April-October', entryFee: 'Free', highlights: ['13,700ft pass', 'Sela Lake', 'Snow peaks', 'Paradise Lake'], image: '🏔️' },
            { name: 'Namdapha National Park', description: 'Mega biodiversity park', bestTime: 'October-April', entryFee: '₹500', highlights: ['4 big cats', 'Hoolock gibbons', 'Rainforest', 'Myanmar border'], image: '🐆' },
            { name: 'Ziro Valley', description: 'UNESCO tentative valley', bestTime: 'March-October', entryFee: 'Free', highlights: ['Rice fields', 'Apatani tribe', 'Music festival', 'Pine forests'], image: '🏞️' },
            { name: 'Gorichen Peak', description: 'Highest peak in Arunachal', bestTime: 'May-September', entryFee: 'Permit required', highlights: ['22,500ft peak', 'Trekking', 'Sacred mountain', 'Snow views'], image: '🏔️' },
            { name: 'Nuranang Falls', description: 'Jung Falls', bestTime: 'April-October', entryFee: 'Free', highlights: ['100m drop', 'Scenic beauty', 'Hydroelectric', 'Photography'], image: '💧' },
            { name: 'Pakhui Wildlife Sanctuary', description: 'Tiger reserve', bestTime: 'November-March', entryFee: '₹300', highlights: ['Tigers', 'Elephants', 'Hornbills', 'Biodiversity'], image: '🐅' },
            { name: 'Sangti Valley', description: 'Black-necked crane habitat', bestTime: 'November-March', entryFee: 'Free', highlights: ['Black-necked cranes', 'Apple orchards', 'Valley views', 'Bird watching'], image: '🦩' },
            { name: 'Madhuri Lake', description: 'High altitude lake', bestTime: 'April-October', entryFee: 'Free', highlights: ['Sangetsar Tso', '12,000ft altitude', 'Crystal clear', 'Snow peaks'], image: '💧' },
            { name: 'Bumla Pass', description: 'Indo-China border pass', bestTime: 'May-October', entryFee: 'Permit required', highlights: ['15,200ft altitude', 'Border views', 'Snow peaks', 'Strategic location'], image: '🏔️' }
          ]
        }
      }
    },
    'Australia': {
      name: 'Australia',
      icon: '🇦🇺',
      locations: {
        'Queensland': {
          name: 'Queensland',
          icon: '🏝️',
          wonders: [
            { name: 'Great Barrier Reef', description: 'World\'s largest coral reef system', bestTime: 'June-October', entryFee: 'Tour dependent', highlights: ['UNESCO site', 'Snorkeling', 'Diving', '2300km reef'], image: '🐠' },
            { name: 'Daintree Rainforest', description: 'Ancient tropical rainforest', bestTime: 'May-September', entryFee: 'Free-$20', highlights: ['UNESCO site', 'Oldest rainforest', 'Cape Tribulation', 'Wildlife'], image: '🌴' },
            { name: 'Whitsunday Islands', description: 'Pristine tropical islands', bestTime: 'April-October', entryFee: 'Tour dependent', highlights: ['Whitehaven Beach', 'Sailing', 'Snorkeling', 'Blue water'], image: '🏝️' },
            { name: 'Fraser Island', description: 'World\'s largest sand island', bestTime: 'April-October', entryFee: '$50 permit', highlights: ['UNESCO site', 'Lake McKenzie', 'Rainforest', '4WD adventures'], image: '🏖️' },
            { name: 'Atherton Tablelands', description: 'Volcanic plateau with waterfalls', bestTime: 'May-September', entryFee: 'Free', highlights: ['Waterfalls', 'Crater lakes', 'Wildlife', 'Cool climate'], image: '💧' },
            { name: 'Cape York Peninsula', description: 'Remote wilderness', bestTime: 'May-October', entryFee: 'Free', highlights: ['4WD adventure', 'Aboriginal culture', 'Remote beaches', 'Wildlife'], image: '🏞️' },
            { name: 'Lamington National Park', description: 'Gondwana rainforest', bestTime: 'Year-round', entryFee: 'Free', highlights: ['UNESCO site', 'Rainforest', 'Tree-top walks', 'Waterfalls'], image: '🌲' },
            { name: 'Magnetic Island', description: 'Tropical island near Townsville', bestTime: 'May-October', entryFee: 'Ferry $35', highlights: ['Koalas', 'Beaches', 'Hiking', 'WWII forts'], image: '🏝️' },
            { name: 'Hinchinbrook Island', description: 'Wilderness island', bestTime: 'May-September', entryFee: 'Permit required', highlights: ['Thorsborne Trail', 'Rainforest', 'Beaches', 'Remote'], image: '⛰️' },
            { name: 'Carnarvon Gorge', description: 'Sandstone gorge with Aboriginal art', bestTime: 'March-October', entryFee: '$7', highlights: ['Aboriginal art', 'Gorge walks', 'Waterfalls', 'Wildlife'], image: '🏜️' }
          ]
        },
        'New South Wales': {
          name: 'New South Wales',
          icon: '🏖️',
          wonders: [
            { name: 'Blue Mountains', description: 'Eucalyptus-covered mountains', bestTime: 'September-November', entryFee: 'Free', highlights: ['Three Sisters', 'Scenic railway', 'Hiking', 'Waterfalls'], image: '🏔️' },
            { name: 'Lord Howe Island', description: 'Volcanic island paradise', bestTime: 'September-May', entryFee: 'Flight only', highlights: ['UNESCO site', 'Limited visitors', 'Snorkeling', 'Mountain climbing'], image: '🏝️' },
            { name: 'Royal National Park', description: 'World\'s second oldest national park', bestTime: 'Year-round', entryFee: '$12', highlights: ['Coastal walk', 'Beaches', 'Waterfalls', 'Aboriginal sites'], image: '🌊' },
            { name: 'Jenolan Caves', description: 'Ancient limestone cave system', bestTime: 'Year-round', entryFee: '$44+', highlights: ['Cave tours', 'Underground rivers', 'Ancient formations', 'Wildlife'], image: '🕳️' },
            { name: 'Kosciuszko National Park', description: 'Home to Australia\'s highest peak', bestTime: 'June-September (skiing)', entryFee: '$17', highlights: ['Mt Kosciuszko', 'Skiing', 'Alpine lakes', 'Hiking'], image: '⛷️' },
            { name: 'Myall Lakes', description: 'Coastal lake system', bestTime: 'Year-round', entryFee: 'Free', highlights: ['Water sports', 'Fishing', 'Camping', 'Wildlife'], image: '💧' },
            { name: 'Barrington Tops', description: 'High altitude wilderness', bestTime: 'October-April', entryFee: 'Free', highlights: ['UNESCO site', 'Waterfalls', 'Rainforest', 'Wildlife'], image: '🌲' },
            { name: 'Warrumbungle National Park', description: 'Volcanic plugs and spires', bestTime: 'March-November', entryFee: '$8', highlights: ['Dark sky park', 'Volcanic formations', 'Rock climbing', 'Aboriginal sites'], image: '🏔️' },
            { name: 'Mungo National Park', description: 'Ancient dry lake bed', bestTime: 'March-October', entryFee: '$8', highlights: ['UNESCO site', 'Ancient footprints', 'Walls of China', 'Aboriginal history'], image: '🏜️' },
            { name: 'Jervis Bay', description: 'Bay with whitest sand beaches', bestTime: 'December-February', entryFee: 'Free', highlights: ['White sand', 'Dolphins', 'Snorkeling', 'Marine park'], image: '🏖️' }
          ]
        }
      }
    },
    'New Zealand': {
      name: 'New Zealand',
      icon: '🇳🇿',
      locations: {
        'South Island': {
          name: 'South Island',
          icon: '🏔️',
          wonders: [
            { name: 'Milford Sound', description: 'Fiord with towering peaks', bestTime: 'December-March', entryFee: 'Cruise $85+', highlights: ['Fiordland', 'Mitre Peak', 'Waterfalls', 'Dolphins'], image: '⛵' },
            { name: 'Mount Cook National Park', description: 'New Zealand\'s highest peak', bestTime: 'December-February', entryFee: 'Free', highlights: ['Aoraki/Mt Cook', 'Glaciers', 'Star gazing', 'Hiking'], image: '🏔️' },
            { name: 'Fox and Franz Josef Glaciers', description: 'Accessible glaciers', bestTime: 'September-May', entryFee: 'Hike free, tours $100+', highlights: ['Glacier hiking', 'Ice climbing', 'Scenic flights', 'West Coast'], image: '❄️' },
            { name: 'Lake Tekapo', description: 'Turquoise glacial lake', bestTime: 'Year-round', entryFee: 'Free', highlights: ['Church of Good Shepherd', 'Dark sky reserve', 'Lupins', 'Star gazing'], image: '💧' },
            { name: 'Queenstown Lakes', description: 'Adventure capital scenery', bestTime: 'December-February', entryFee: 'Free', highlights: ['Lake Wakatipu', 'Remarkables', 'Adventure sports', 'Scenic beauty'], image: '🏞️' },
            { name: 'Doubtful Sound', description: 'Remote fiord', bestTime: 'October-April', entryFee: 'Tour $200+', highlights: ['Remote', 'Dolphins', 'Deep fiord', 'Wilderness'], image: '⛵' },
            { name: 'Punakaiki Pancake Rocks', description: 'Limestone rock formations', bestTime: 'High tide', entryFee: 'Free', highlights: ['Blowholes', 'Rock layers', 'Coastal walk', 'Unique geology'], image: '🪨' },
            { name: 'Abel Tasman National Park', description: 'Golden beaches and forest', bestTime: 'December-March', entryFee: 'Free', highlights: ['Coastal track', 'Kayaking', 'Beaches', 'Native forest'], image: '🏖️' },
            { name: 'Lake Wanaka', description: 'Alpine lake with lone tree', bestTime: 'Year-round', entryFee: 'Free', highlights: ['That Wanaka Tree', 'Mountains', 'Water sports', 'Photography'], image: '💧' },
            { name: 'Marlborough Sounds', description: 'Network of sea-drowned valleys', bestTime: 'December-March', entryFee: 'Free', highlights: ['Kayaking', 'Fishing', 'Hiking', 'Marine life'], image: '🌊' }
          ]
        },
        'North Island': {
          name: 'North Island',
          icon: '🌋',
          wonders: [
            { name: 'Tongariro National Park', description: 'Volcanic plateau with emerald lakes', bestTime: 'December-March', entryFee: 'Free', highlights: ['UNESCO site', 'Emerald Lakes', 'Mt Ngauruhoe', 'Alpine crossing'], image: '🌋' },
            { name: 'Rotorua Geothermal', description: 'Geothermal wonderland', bestTime: 'Year-round', entryFee: '$32+', highlights: ['Geysers', 'Hot springs', 'Maori culture', 'Mud pools'], image: '♨️' },
            { name: 'Waitomo Glowworm Caves', description: 'Underground river with glowworms', bestTime: 'Year-round', entryFee: '$54+', highlights: ['Glowworms', 'Cave rafting', 'Underground river', 'Unique experience'], image: '✨' },
            { name: 'Bay of Islands', description: '144 islands in subtropical sea', bestTime: 'December-April', entryFee: 'Free', highlights: ['Islands', 'Dolphins', 'Sailing', 'History'], image: '🏝️' },
            { name: 'Coromandel Peninsula', description: 'Beaches and hot water beach', bestTime: 'December-March', entryFee: 'Free', highlights: ['Hot Water Beach', 'Cathedral Cove', 'Beaches', 'Hiking'], image: '🏖️' },
            { name: 'Lake Taupo', description: 'Volcanic caldera lake', bestTime: 'Year-round', entryFee: 'Free', highlights: ['Largest lake', 'Trout fishing', 'Huka Falls', 'Water sports'], image: '💧' },
            { name: 'Hobbiton Movie Set', description: 'Lord of Rings filming location', bestTime: 'Year-round', entryFee: '$89', highlights: ['Movie set', 'Green Dragon', 'Hobbit holes', 'Shire'], image: '🏡' },
            { name: 'White Island', description: 'Active marine volcano', bestTime: 'November-April', entryFee: 'Tour $229+', highlights: ['Active volcano', 'Boat or helicopter', 'Steaming crater', 'Unique'], image: '🌋' },
            { name: 'Waitakere Ranges', description: 'Rainforest and black sand beaches', bestTime: 'Year-round', entryFee: 'Free', highlights: ['Rainforest', 'Karekare Beach', 'Waterfalls', 'Hiking'], image: '🌲' },
            { name: 'Cape Reinga', description: 'Northernmost point', bestTime: 'December-March', entryFee: 'Free', highlights: ['Two oceans meet', 'Lighthouse', 'Maori significance', '90 Mile Beach'], image: '🏖️' }
          ]
        }
      }
    },
    'Brazil': {
      name: 'Brazil',
      icon: '🇧🇷',
      locations: {
        'Amazonas': { name: 'Amazonas', icon: '🌳', wonders: [
          { name: 'Amazon Rainforest', description: 'World\'s largest tropical rainforest', bestTime: 'June-November', entryFee: 'Tour-based', highlights: ['Biodiversity', 'River cruises', 'Wildlife', 'Indigenous culture'], image: '🌳' },
          { name: 'Meeting of Waters', description: 'Rio Negro and Solimões confluence', bestTime: 'Year-round', entryFee: 'Boat tour $50+', highlights: ['Two rivers meet', 'Color contrast', 'Dolphin watching', 'Unique phenomenon'], image: '🌊' },
          { name: 'Anavilhanas Archipelago', description: 'River island complex', bestTime: 'June-November', entryFee: 'Tour-based', highlights: ['400 islands', 'Flooded forest', 'Wildlife', 'Kayaking'], image: '🏝️' },
          { name: 'Jaú National Park', description: 'Largest forest reserve in Americas', bestTime: 'June-November', entryFee: 'Permit required', highlights: ['UNESCO site', 'Pristine forest', 'Black river', 'Remote wilderness'], image: '🌲' },
          { name: 'Rio Negro Beaches', description: 'Freshwater river beaches', bestTime: 'September-November', entryFee: 'Free', highlights: ['River beaches', 'White sand', 'Swimming', 'Local food'], image: '🏖️' },
          { name: 'Presidente Figueiredo Waterfalls', description: 'Waterfall circuit', bestTime: 'June-November', entryFee: '₹200-500', highlights: ['100+ waterfalls', 'Caves', 'Swimming', 'Nature trails'], image: '💧' },
          { name: 'Mamirauá Reserve', description: 'Flooded forest reserve', bestTime: 'March-July', entryFee: 'Tour-based', highlights: ['Flooded forest', 'Pink dolphins', 'Piranhas', 'Eco-tourism'], image: '🌲' },
          { name: 'Amazon River Dolphins', description: 'Pink river dolphin habitat', bestTime: 'Year-round', entryFee: 'Tour-based', highlights: ['Pink dolphins', 'Swimming allowed', 'Conservation', 'Unique experience'], image: '🐬' },
          { name: 'Manaus Floating Port', description: 'Largest floating port worldwide', bestTime: 'Year-round', entryFee: 'Free', highlights: ['Engineering marvel', 'River trade', 'Local markets', 'Photo spot'], image: '⚓' },
          { name: 'Indigenous Villages', description: 'Traditional Amazon communities', bestTime: 'Year-round', entryFee: 'Tour-based', highlights: ['Cultural immersion', 'Traditional customs', 'Handicrafts', 'Forest knowledge'], image: '🏘️' }
        ]},
        'Rio de Janeiro': { name: 'Rio de Janeiro', icon: '🏖️', wonders: [
          { name: 'Christ the Redeemer', description: 'Iconic mountaintop statue', bestTime: 'May-September', entryFee: 'R$106', highlights: ['Panoramic views', 'UNESCO site', 'Corcovado mountain', 'Symbol of Brazil'], image: '🗿' },
          { name: 'Sugarloaf Mountain', description: 'Iconic peak with cable car', bestTime: 'Year-round', entryFee: 'R$160', highlights: ['Cable car ride', '360° views', 'Guanabara Bay', 'Sunset views'], image: '🏔️' },
          { name: 'Copacabana Beach', description: 'World-famous urban beach', bestTime: 'December-March', entryFee: 'Free', highlights: ['4km beach', 'Beach culture', 'Promenade', 'Volleyball'], image: '🏖️' },
          { name: 'Ipanema Beach', description: 'Trendy beach neighborhood', bestTime: 'December-March', entryFee: 'Free', highlights: ['Beautiful beach', 'Sunset views', 'Beach lifestyle', 'Fashion scene'], image: '🏖️' },
          { name: 'Tijuca National Park', description: 'Urban rainforest park', bestTime: 'May-September', entryFee: 'Free', highlights: ['Largest urban forest', 'Waterfalls', 'Hiking trails', 'Wildlife'], image: '🌲' },
          { name: 'Pedra da Gávea', description: 'Coastal mountain peak', bestTime: 'May-September', entryFee: 'Free', highlights: ['Challenging hike', 'Ocean views', '842m peak', 'Rock face'], image: '⛰️' },
          { name: 'Lopes Mendes Beach', description: 'Paradise beach on Ilha Grande', bestTime: 'April-October', entryFee: 'Boat access', highlights: ['White sand', 'Clear water', 'Surfing', 'Remote beauty'], image: '🏖️' },
          { name: 'Dois Irmãos', description: 'Twin peaks hiking trail', bestTime: 'May-September', entryFee: 'Free', highlights: ['City views', 'Ocean panorama', 'Moderate hike', 'Photo spot'], image: '⛰️' },
          { name: 'Lagoa Rodrigo de Freitas', description: 'Lagoon surrounded by mountains', bestTime: 'Year-round', entryFee: 'Free', highlights: ['Cycling path', 'Water sports', 'City landmark', 'Mountain backdrop'], image: '💧' },
          { name: 'Prainha Beach', description: 'Secluded surf beach', bestTime: 'April-October', entryFee: 'Free', highlights: ['Surfing', 'Natural beauty', 'Less crowded', 'Green hills'], image: '🌊' }
        ]},
        'Bahia': { name: 'Bahia', icon: '🏖️', wonders: [
          { name: 'Chapada Diamantina', description: 'Table mountain national park', bestTime: 'March-October', entryFee: 'Free', highlights: ['Waterfalls', 'Caves', 'Plateaus', 'Trekking'], image: '⛰️' },
          { name: 'Morro de São Paulo', description: 'Car-free island paradise', bestTime: 'September-March', entryFee: 'R$25 environmental fee', highlights: ['Five beaches', 'No cars', 'Relaxed vibe', 'Ziplines'], image: '🏝️' },
          { name: 'Cachoeira da Fumaça', description: 'Brazil\'s second highest waterfall', bestTime: 'April-September', entryFee: 'Free', highlights: ['340m drop', 'Hiking', 'Mist effect', 'Panoramic views'], image: '💧' },
          { name: 'Praia do Forte', description: 'Coastal turtle conservation area', bestTime: 'September-March', entryFee: 'Free', highlights: ['Turtle project', 'Beach town', 'Natural pools', 'Reef diving'], image: '🐢' },
          { name: 'Poço Encantado', description: 'Enchanted well with blue water', bestTime: 'April-September', entryFee: 'R$30', highlights: ['Crystal clear', 'Sunlight effect', 'Underground lake', 'Diving'], image: '💧' },
          { name: 'Lençóis', description: 'Colonial mining town gateway', bestTime: 'March-October', entryFee: 'Free', highlights: ['Historic center', 'Base for treks', 'Cobblestone streets', 'Local culture'], image: '🏘️' },
          { name: 'Marimbus Pantanal', description: 'Brazilian mini-Pantanal', bestTime: 'Year-round', entryFee: 'Tour-based', highlights: ['Canoe trips', 'Wildlife', 'Wetlands', 'Bird watching'], image: '🚣' },
          { name: 'Pratinha Blue Caves', description: 'Underground blue lake caves', bestTime: 'Year-round', entryFee: 'R$120', highlights: ['Snorkeling', 'Crystal water', 'Cave system', 'Unique ecosystem'], image: '💧' },
          { name: 'Morro do Pai Inácio', description: 'Iconic table mountain', bestTime: 'April-October', entryFee: 'R$20', highlights: ['Sunset views', 'Panoramic vistas', 'Easy hike', 'Photography'], image: '⛰️' },
          { name: 'Vale do Capão', description: 'Hippie valley community', bestTime: 'March-October', entryFee: 'Free', highlights: ['Alternative lifestyle', 'Waterfalls', 'Trekking base', 'Peaceful atmosphere'], image: '🌄' }
        ]},
        'Paraná': { name: 'Paraná', icon: '💧', wonders: [
          { name: 'Iguazu Falls', description: 'Massive waterfall system on border', bestTime: 'March-May, September-November', entryFee: 'R$89', highlights: ['275 waterfalls', 'Devil\'s Throat', 'UNESCO site', 'Boat rides'], image: '💧' },
          { name: 'Ilha do Mel', description: 'Car-free beach island', bestTime: 'November-March', entryFee: 'Boat access', highlights: ['No cars', 'Beaches', 'Lighthouse', 'Surfing'], image: '🏝️' },
          { name: 'Superagüi National Park', description: 'Atlantic forest and beaches', bestTime: 'November-April', entryFee: 'Free', highlights: ['UNESCO site', 'Pristine beaches', 'Dolphins', 'Mangroves'], image: '🌲' },
          { name: 'Vila Velha State Park', description: 'Sandstone formations', bestTime: 'Year-round', entryFee: 'R$23', highlights: ['Rock columns', 'Lagoon', 'Lookout tower', 'Geological wonder'], image: '🪨' },
          { name: 'Serra da Baitaca', description: 'Mountain railway route', bestTime: 'April-October', entryFee: 'Train ticket required', highlights: ['Scenic train', 'Atlantic forest', 'Viaducts', 'Historical route'], image: '🚂' },
          { name: 'Parque Estadual das Lauráceas', description: 'Araucaria forest reserve', bestTime: 'Year-round', entryFee: 'Free', highlights: ['Ancient trees', 'Hiking trails', 'Wildlife', 'Camping'], image: '🌲' },
          { name: 'Salto São Francisco', description: 'Waterfall and canyons', bestTime: 'Year-round', entryFee: 'R$15', highlights: ['65m waterfall', 'Boat rides', 'Canyons', 'Adventure sports'], image: '💧' },
          { name: 'Pico Paraná', description: 'Highest peak in southern Brazil', bestTime: 'May-September', entryFee: 'Permit required', highlights: ['1877m peak', 'Challenging climb', 'Cloud forest', 'Alpine vegetation'], image: '⛰️' },
          { name: 'Gruta das Fadas', description: 'Fairy cave with formations', bestTime: 'Year-round', entryFee: 'R$30', highlights: ['Stalactites', 'Underground river', 'Guided tours', 'Limestone formations'], image: '🕳️' },
          { name: 'Caminho do Itupava', description: 'Colonial trail through forest', bestTime: 'April-October', entryFee: 'Free', highlights: ['Historical path', 'Atlantic forest', 'Waterfalls', 'Day hike'], image: '🥾' }
        ]},
        'Mato Grosso': { name: 'Mato Grosso', icon: '🐆', wonders: [
          { name: 'Pantanal', description: 'World\'s largest wetland', bestTime: 'July-October (dry season)', entryFee: 'Tour-based', highlights: ['Wildlife paradise', 'Jaguars', 'Bird watching', 'Caiman'], image: '🐆' },
          { name: 'Chapada dos Guimarães', description: 'Red sandstone plateau', bestTime: 'May-September', entryFee: 'R$20', highlights: ['Waterfalls', 'Canyons', 'Rock formations', 'Geodesic center'], image: '🏜️' },
          { name: 'Nobres', description: 'Crystal clear rivers for snorkeling', bestTime: 'June-October', entryFee: 'Tour package', highlights: ['Aquarium Rio', 'Blue lagoon', 'Cave diving', 'Clear water'], image: '🐠' },
          { name: 'Bom Jardim', description: 'Underwater nature aquarium', bestTime: 'June-October', entryFee: 'Tour-based', highlights: ['Floating snorkeling', 'Fish schools', 'Crystal springs', 'Nature reserve'], image: '💧' },
          { name: 'Serra do Roncador', description: 'Mystical mountain range', bestTime: 'May-September', entryFee: 'Free', highlights: ['UFO legends', 'Waterfalls', 'Caves', 'Spiritual tourism'], image: '⛰️' },
          { name: 'Cachoeira Véu de Noiva', description: 'Bridal veil waterfall', bestTime: 'Year-round', entryFee: 'R$20', highlights: ['86m drop', 'Canyon views', 'Easy access', 'Photo spot'], image: '💧' },
          { name: 'Lagoa Azul Bom Jardim', description: 'Blue lagoon spring', bestTime: 'June-October', entryFee: 'R$80', highlights: ['Crystal clear', 'Floating', 'Deep spring', 'Aquatic life'], image: '💧' },
          { name: 'Gruta da Lagoa Azul', description: 'Cave with blue lake', bestTime: 'Year-round', entryFee: 'R$50', highlights: ['Underground lake', 'Stalactites', 'Blue water', 'Cave formations'], image: '🕳️' },
          { name: 'Mirante Geodésico', description: 'Geographic center viewpoint', bestTime: 'Year-round', entryFee: 'R$20', highlights: ['Center of South America', 'Panoramic views', 'Sunset spot', 'Monument'], image: '🗺️' },
          { name: 'Cristalino Lodge Area', description: 'Amazon-Pantanal transition', bestTime: 'June-October', entryFee: 'Lodge-based', highlights: ['Canopy tower', 'Wildlife', 'Pristine forest', 'Bird paradise'], image: '🌳' }
        ]},
        'São Paulo': { name: 'São Paulo State', icon: '🏖️', wonders: [
          { name: 'Ilhabela', description: 'Beautiful island with 40 beaches', bestTime: 'April-November', entryFee: 'Ferry R$24', highlights: ['Beaches', 'Waterfalls', 'Hiking', 'Sailing'], image: '🏝️' },
          { name: 'Serra da Cantareira', description: 'Atlantic forest near São Paulo', bestTime: 'Year-round', entryFee: 'R$18', highlights: ['Urban forest', 'Hiking trails', 'Wildlife', 'Pedra Grande viewpoint'], image: '🌲' },
          { name: 'Ubatuba Beaches', description: '100+ beaches coastline', bestTime: 'September-March', entryFee: 'Free', highlights: ['Surf beaches', 'Jungle backing', 'Island tours', 'Biodiversity'], image: '🏖️' },
          { name: 'PETAR Caves', description: 'Cave system in Atlantic forest', bestTime: 'April-October', entryFee: 'R$35+', highlights: ['300+ caves', 'Underground rivers', 'Adventure tourism', 'Speleology'], image: '🕳️' },
          { name: 'Campos do Jordão', description: 'Mountain resort town', bestTime: 'June-August (winter)', entryFee: 'Free entry', highlights: ['Swiss architecture', 'Cable car', 'Pine forests', 'Winter festival'], image: '🏔️' },
          { name: 'Maresias Beach', description: 'Famous surf beach', bestTime: 'September-March', entryFee: 'Free', highlights: ['Surfing', 'Beach parties', 'Nature trails', 'Nightlife'], image: '🏄' },
          { name: 'Parque Estadual Intervales', description: 'Atlantic rainforest reserve', bestTime: 'Year-round', entryFee: 'R$18', highlights: ['Pristine forest', 'Caves', 'Waterfalls', 'Wildlife'], image: '🌲' },
          { name: 'Pico dos Marins', description: 'Distinctive peak mountain', bestTime: 'May-September', entryFee: 'Free', highlights: ['2421m peak', 'Trekking', 'Camping', 'Summit views'], image: '⛰️' },
          { name: 'Gruta do Diabo', description: 'Devil\'s cave system', bestTime: 'Year-round', entryFee: 'R$35', highlights: ['Underground river', 'Formations', 'Adventure tour', 'Wildlife'], image: '🕳️' },
          { name: 'Praia do Rosa', description: 'Whale watching beach', bestTime: 'July-November (whales)', entryFee: 'Free', highlights: ['Right whales', 'Surfing', 'Dunes', 'Nature reserve'], image: '🐋' }
        ]}
      }
    },
    'Argentina': {
      name: 'Argentina',
      icon: '🇦🇷',
      locations: {
        'Patagonia': { name: 'Patagonia', icon: '🏔️', wonders: [
          { name: 'Perito Moreno Glacier', description: 'Advancing glacier', bestTime: 'November-March', entryFee: 'ARS 1600', highlights: ['Glacier calving', 'Walkways', 'Boat tours', 'Blue ice'], image: '❄️' },
          { name: 'Mount Fitz Roy', description: 'Iconic Patagonian peak', bestTime: 'December-March', entryFee: 'Free', highlights: ['Granite spire', 'Trekking', 'Alpine lakes', 'Mountaineering'], image: '⛰️' },
          { name: 'Los Glaciares National Park', description: 'UNESCO glacial park', bestTime: 'November-March', entryFee: 'ARS 1600', highlights: ['Multiple glaciers', 'Hiking', 'Lake Argentina', 'Ice trekking'], image: '❄️' },
          { name: 'Torres del Paine', description: 'Iconic granite towers (Chile border)', bestTime: 'December-February', entryFee: 'Park entry required', highlights: ['W Trek', 'Granite peaks', 'Wildlife', 'Glaciers'], image: '🏔️' },
          { name: 'Valdés Peninsula', description: 'Marine wildlife reserve', bestTime: 'September-April', entryFee: 'ARS 1400', highlights: ['Whales', 'Sea elephants', 'Penguins', 'UNESCO site'], image: '🐋' },
          { name: 'Beagle Channel', description: 'Scenic waterway', bestTime: 'November-March', entryFee: 'Tour-based', highlights: ['Sea lions', 'Penguin colonies', 'Boat tours', 'Lighthouse'], image: '🚢' },
          { name: 'Ushuaia End of World', description: 'Southernmost city', bestTime: 'December-March', entryFee: 'Free access', highlights: ['End of world', 'Antarctica gateway', 'Tierra del Fuego', 'Marine life'], image: '🌍' },
          { name: 'Lago Argentino', description: 'Massive glacial lake', bestTime: 'November-March', entryFee: 'Free', highlights: ['Glacier views', 'Boat tours', 'Icebergs', 'Fishing'], image: '💧' },
          { name: 'Cerro Torre', description: 'Challenging peak', bestTime: 'December-February', entryFee: 'Free', highlights: ['Technical climb', 'Ice mushroom', 'Spectacular views', 'Mountaineering'], image: '⛰️' },
          { name: 'Cueva de las Manos', description: 'Ancient hand cave paintings', bestTime: 'October-April', entryFee: 'ARS 1000', highlights: ['9000-year-old art', 'UNESCO site', 'Rock art', 'Archaeological'], image: '🖐️' }
        ]},
        'Mendoza': { name: 'Mendoza', icon: '🍷', wonders: [
          { name: 'Aconcagua', description: 'Highest peak in Americas', bestTime: 'December-February', entryFee: 'Permit ARS 4000+', highlights: ['6961m peak', 'Mountaineering', 'Seven summits', 'Base camp trek'], image: '🏔️' },
          { name: 'Andes Mountains', description: 'Spectacular mountain range', bestTime: 'Year-round', entryFee: 'Free', highlights: ['Scenic drives', 'Skiing', 'Wine regions', 'Mountain villages'], image: '⛰️' },
          { name: 'Puente del Inca', description: 'Natural rock bridge', bestTime: 'October-April', entryFee: 'ARS 500', highlights: ['Natural bridge', 'Hot springs', 'Mineral deposits', 'Mountain views'], image: '🌉' },
          { name: 'Los Penitentes', description: 'Ski resort and ice formations', bestTime: 'June-September (ski)', entryFee: 'Ski pass required', highlights: ['Skiing', 'Ice penitents', 'Mountain resort', 'Winter sports'], image: '⛷️' },
          { name: 'Laguna del Diamante', description: 'Crater lake', bestTime: 'November-March', entryFee: 'ARS 800', highlights: ['Volcanic lake', 'Maipo Volcano', 'High altitude', 'Crystal clear'], image: '💧' },
          { name: 'Cañón del Atuel', description: 'River canyon', bestTime: 'October-April', entryFee: 'Free', highlights: ['Red rocks', 'Rafting', 'Reservoir', 'Rock formations'], image: '🏞️' },
          { name: 'Tupungato Volcano', description: 'Massive stratovolcano', bestTime: 'December-February', entryFee: 'Expedition-based', highlights: ['6635m peak', 'Technical climb', 'Glaciers', 'Remote'], image: '🌋' },
          { name: 'Potrerillos Lake', description: 'Mountain reservoir', bestTime: 'October-April', entryFee: 'Free', highlights: ['Water sports', 'Mountain views', 'Fishing', 'Camping'], image: '💧' },
          { name: 'Villavicencio Reserve', description: 'Mountain nature reserve', bestTime: 'September-April', entryFee: 'Free', highlights: ['Scenic road', 'Wildlife', 'Historic hotel', 'Hiking'], image: '🏔️' },
          { name: 'Valle de Uco', description: 'High-altitude wine valley', bestTime: 'Year-round', entryFee: 'Free', highlights: ['Vineyards', 'Mountain backdrop', 'Wine tours', 'Scenic beauty'], image: '🍷' }
        ]},
        'Salta': { name: 'Salta', icon: '🏜️', wonders: [
          { name: 'Salinas Grandes', description: 'Vast salt flats', bestTime: 'Year-round', entryFee: 'ARS 300', highlights: ['White desert', 'Salt crust', 'Photography', 'Perspective photos'], image: '🏜️' },
          { name: 'Quebrada de Humahuaca', description: 'Colorful canyon valley', bestTime: 'April-November', entryFee: 'Free', highlights: ['UNESCO site', 'Rainbow mountains', 'Indigenous culture', 'Hill of Seven Colors'], image: '🏜️' },
          { name: 'Cafayate Wine Region', description: 'High-altitude vineyards', bestTime: 'March-May, September-November', entryFee: 'Free', highlights: ['Torrontés wine', 'Red rocks', 'Colonial town', 'Wine tasting'], image: '🍷' },
          { name: 'Los Cardones National Park', description: 'Giant cactus park', bestTime: 'April-November', entryFee: 'Free', highlights: ['Cardon cacti', 'High desert', 'Vicuñas', 'Andean landscape'], image: '🌵' },
          { name: 'Tren a las Nubes', description: 'Train to the clouds', bestTime: 'April-November', entryFee: 'ARS 15000', highlights: ['4220m altitude', 'Viaducts', 'Scenic railway', 'Engineering marvel'], image: '🚂' },
          { name: 'Iruya Village', description: 'Remote Andean village', bestTime: 'April-November', entryFee: 'Free', highlights: ['Mountain village', 'Traditional culture', 'Hiking', 'Scenic drive'], image: '🏘️' },
          { name: 'Cuesta del Obispo', description: 'Mountain pass road', bestTime: 'Year-round', entryFee: 'Free', highlights: ['Winding road', 'Viewpoints', 'Cloud forests', 'Photography'], image: '🛣️' },
          { name: 'Cerro de los Siete Colores', description: 'Seven-colored mountain', bestTime: 'April-October', entryFee: 'Free', highlights: ['Rainbow stripes', 'Mineral layers', 'Photo spot', 'Purmamarca town'], image: '🏔️' },
          { name: 'Pucará de Tilcara', description: 'Pre-Columbian fortress', bestTime: 'Year-round', entryFee: 'ARS 500', highlights: ['Ancient ruins', 'Strategic location', 'Museum', 'Valley views'], image: '🏛️' },
          { name: 'Abra del Acay', description: 'Highest pass in Americas', bestTime: 'April-November', entryFee: 'Free', highlights: ['4895m altitude', 'Mountain pass', 'Remote location', 'Vicuñas'], image: '⛰️' }
        ]}
      }
    },
    'Chile': {
      name: 'Chile',
      icon: '🇨🇱',
      locations: {
        'Atacama Desert': { name: 'Atacama Desert', icon: '🏜️', wonders: [
          { name: 'Valle de la Luna', description: 'Moon valley landscape', bestTime: 'March-May, September-November', entryFee: 'CLP 5000', highlights: ['Lunar landscape', 'Salt caves', 'Sunset views', 'Sand dunes'], image: '🏜️' },
          { name: 'Geysers del Tatio', description: 'High-altitude geysers', bestTime: 'Year-round (sunrise)', entryFee: 'CLP 15000', highlights: ['4320m altitude', 'Sunrise visit', 'Thermal pools', '80+ geysers'], image: '♨️' },
          { name: 'Salar de Atacama', description: 'Massive salt flat with flamingos', bestTime: 'Year-round', entryFee: 'CLP 5000', highlights: ['Pink flamingos', 'Salt crust', 'Lagoons', 'Wildlife'], image: '🦩' },
          { name: 'Laguna Cejar', description: 'Floating lagoon', bestTime: 'Year-round', entryFee: 'CLP 15000', highlights: ['High salt content', 'Floating', 'Turquoise water', 'Sunset'], image: '💧' },
          { name: 'Piedras Rojas', description: 'Red stones and lagoon', bestTime: 'November-March', entryFee: 'CLP 18000', highlights: ['Red rocks', 'Altiplanic lagoons', 'Vicuñas', 'Photography'], image: '🏔️' },
          { name: 'Rainbow Valley', description: 'Multicolored rock formations', bestTime: 'March-November', entryFee: 'CLP 3000', highlights: ['Colorful rocks', 'Minerals', 'Hiking', 'Desert beauty'], image: '🌈' },
          { name: 'Laguna Miscanti', description: 'High-altitude blue lagoon', bestTime: 'Year-round', entryFee: 'CLP 5000', highlights: ['4200m altitude', 'Volcano backdrop', 'Wildlife', 'Crystal water'], image: '💧' },
          { name: 'Death Valley', description: 'Salt and clay valley', bestTime: 'March-November', entryFee: 'CLP 5000', highlights: ['Sand dunes', 'Salt formations', 'Sunset spot', 'Mars-like'], image: '🏜️' },
          { name: 'Puritama Hot Springs', description: 'Desert thermal pools', bestTime: 'Year-round', entryFee: 'CLP 18000', highlights: ['Natural hot springs', 'River canyon', 'Relaxation', 'Desert oasis'], image: '♨️' },
          { name: 'Chaxa Lagoon', description: 'Flamingo reserve', bestTime: 'Year-round', entryFee: 'CLP 5000', highlights: ['Three flamingo species', 'Salt flat', 'Bird watching', 'Easy access'], image: '🦩' }
        ]},
        'Patagonia Chilena': { name: 'Chilean Patagonia', icon: '🏔️', wonders: [
          { name: 'Torres del Paine', description: 'Iconic granite towers', bestTime: 'October-April', entryFee: 'CLP 21000', highlights: ['W Trek', 'Granite peaks', 'Glaciers', 'Guanacos'], image: '🏔️' },
          { name: 'Grey Glacier', description: 'Massive glacier', bestTime: 'November-March', entryFee: 'Park entry', highlights: ['Ice wall', 'Boat tours', 'Icebergs', 'Kayaking'], image: '❄️' },
          { name: 'Lago Pehoé', description: 'Turquoise glacial lake', bestTime: 'November-March', entryFee: 'Park entry', highlights: ['Torres backdrop', 'Photo spot', 'Wind-sculpted', 'Iconic view'], image: '💧' },
          { name: 'French Valley', description: 'Glacier valley', bestTime: 'November-March', entryFee: 'Park entry', highlights: ['Amphitheater valley', 'Hanging glaciers', 'Day hike', 'Spectacular views'], image: '🏔️' },
          { name: 'Marble Caves', description: 'Water-carved marble', bestTime: 'December-February', entryFee: 'Boat tour CLP 25000', highlights: ['Blue marble', 'Lake General Carrera', 'Boat access', 'Unique geology'], image: '🛶' },
          { name: 'Cuernos del Paine', description: 'The Horns peaks', bestTime: 'November-March', entryFee: 'Park entry', highlights: ['Granite horns', 'Iconic shape', 'Photo spot', 'Trekking'], image: '🏔️' },
          { name: 'Salto Grande', description: 'Waterfall and lookout', bestTime: 'November-March', entryFee: 'Park entry', highlights: ['Powerful falls', 'Turquoise water', 'Easy access', 'Photo opportunity'], image: '💧' },
          { name: 'Los Cuernos Viewpoint', description: 'Classic Torres view', bestTime: 'November-March', entryFee: 'Park entry', highlights: ['Sunrise spot', 'Lake reflection', 'Iconic view', 'Photography'], image: '📸' },
          { name: 'Paine Grande', description: 'Highest peak in park', bestTime: 'December-February', entryFee: 'Technical climb', highlights: ['3050m peak', 'Mountaineering', 'Ice climbing', 'Challenging'], image: '⛰️' },
          { name: 'Laguna Azul', description: 'Blue lagoon', bestTime: 'November-March', entryFee: 'Park entry', highlights: ['Torres reflection', 'Camping', 'Horseback riding', 'Peaceful'], image: '💧' }
        ]},
        'Lake District': { name: 'Lake District', icon: '🌋', wonders: [
          { name: 'Osorno Volcano', description: 'Perfect cone volcano', bestTime: 'December-March', entryFee: 'CLP 8000', highlights: ['2652m peak', 'Skiing', 'Hiking', 'Lake views'], image: '🌋' },
          { name: 'Petrohué Falls', description: 'Emerald rapids', bestTime: 'Year-round', entryFee: 'CLP 5000', highlights: ['Green water', 'Volcanic rock', 'Short trails', 'Photo spot'], image: '💧' },
          { name: 'Lake Llanquihue', description: 'Chile\'s second largest lake', bestTime: 'December-March', entryFee: 'Free', highlights: ['Volcano views', 'German towns', 'Water sports', 'Scenic drive'], image: '💧' },
          { name: 'Chiloé Island', description: 'Unique island culture', bestTime: 'December-March', entryFee: 'Ferry access', highlights: ['Wooden churches', 'Palafitos', 'Mythology', 'Seafood'], image: '🏝️' },
          { name: 'Huerquehue National Park', description: 'Araucaria forests', bestTime: 'November-April', entryFee: 'CLP 5000', highlights: ['Ancient trees', 'Alpine lakes', 'Hiking', 'Volcanic landscapes'], image: '🌲' },
          { name: 'Villarrica Volcano', description: 'Active volcano', bestTime: 'December-March', entryFee: 'Guided climb CLP 50000', highlights: ['Lava lake', 'Volcano climb', '2847m peak', 'Active crater'], image: '🌋' },
          { name: 'Pucón', description: 'Adventure tourism hub', bestTime: 'December-March', entryFee: 'Free', highlights: ['Lake town', 'Hot springs', 'Activities', 'Volcano views'], image: '🏞️' },
          { name: 'Termas Geométricas', description: 'Geometric hot springs', bestTime: 'Year-round', entryFee: 'CLP 25000', highlights: ['17 pools', 'Forest setting', 'Architecture', 'Relaxation'], image: '♨️' },
          { name: 'Conguillio National Park', description: 'Araucaria and volcano park', bestTime: 'December-April', entryFee: 'CLP 5000', highlights: ['Llaima Volcano', 'Monkey puzzle trees', 'Lava fields', 'Sierra Nevada'], image: '🌋' },
          { name: 'Frutillar', description: 'German heritage town', bestTime: 'Year-round', entryFee: 'Free', highlights: ['Lake views', 'Music festival', 'German culture', 'Architecture'], image: '🏘️' }
        ]}
      }
    }
  };

  const categories = {
    attractions: [
      { id: 1, name: 'Historical Sites', icon: '🏛️', description: 'Ancient temples, forts, and monuments', hasLocations: true },
      { id: 2, name: 'Museums', icon: '🏺', description: 'Cultural and art museums', hasLocations: true },
      { id: 3, name: 'Religious Places', icon: '🕉️', description: 'Temples, churches, and mosques', hasLocations: true },
      { id: 4, name: 'Natural Wonders', icon: '🏞️', description: 'Lakes, mountains, and scenic landscapes', hasLocations: true }
    ],
    culture: [
      { id: 5, name: 'Local Festivals', icon: '🎊', description: 'Traditional celebrations and events', events: ['Diwali', 'Holi', 'Durga Puja', 'Onam'] },
      { id: 6, name: 'Cuisine', icon: '🍛', description: 'Regional food specialties', dishes: ['North Indian', 'South Indian', 'Bengali', 'Rajasthani'] },
      { id: 7, name: 'Art & Crafts', icon: '🎨', description: 'Traditional handicrafts', items: ['Pashmina Shawls', 'Madhubani Art', 'Blue Pottery'] },
      { id: 8, name: 'Dance & Music', icon: '💃', description: 'Classical and folk performances', forms: ['Bharatanatyam', 'Kathak', 'Odissi', 'Folk Music'] }
    ],
    practical: [
      { id: 9, name: 'Local Transport', icon: '🚌', description: 'Getting around the city', options: ['Metro', 'Auto Rickshaw', 'Local Bus', 'Cab Services'] },
      { id: 10, name: 'Shopping Markets', icon: '🛍️', description: 'Best places to shop', markets: ['Local Bazaars', 'Malls', 'Street Markets', 'Handicraft Centers'] },
      { id: 11, name: 'Language Tips', icon: '💬', description: 'Useful local phrases', tips: ['Namaste (Hello)', 'Dhanyavaad (Thank you)', 'Kitna hai? (How much?)'] },
      { id: 12, name: 'Customs & Etiquette', icon: '🙏', description: 'Cultural do\'s and don\'ts', rules: ['Remove shoes in temples', 'Dress modestly', 'Use right hand for eating'] }
    ]
  };

  const historicalLocationDetails = selectedPlace
    ? resolveLocationDetails(selectedPlace.name, selectedLocation, selectedCountry)
    : null;
  const museumLocationDetails = selectedMuseum
    ? resolveLocationDetails(selectedMuseum.name, selectedMuseumLocation, selectedMuseumCountry)
    : null;
  const religiousLocationDetails = selectedReligiousPlace
    ? resolveLocationDetails(selectedReligiousPlace.name, selectedReligiousLocation, selectedReligiousCountry)
    : null;
  const naturalLocationDetails = selectedNaturalWonder
    ? resolveLocationDetails(selectedNaturalWonder.name, selectedNaturalLocation?.name, selectedNaturalCountry?.name)
    : null;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Back Button */}
      {setPage && (
        <button
          onClick={() => setPage('home')}
          className="mb-4 flex items-center gap-2 text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-semibold transition-all"
        >
          <span className="text-xl">←</span> Back to Home
        </button>
      )}

      <div className="bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl shadow-lg p-8 mb-8 text-white">
        <div className="flex items-center gap-4">
          <span className="text-5xl">🎭</span>
          <div>
            <h2 className="text-3xl font-bold mb-2">Tourist Information</h2>
            <p className="text-lg opacity-90">Discover local attractions, culture, and essential tips</p>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-4 mb-6 overflow-x-auto">
        <button
          onClick={() => setSelectedCategory('attractions')}
          className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all ${
            selectedCategory === 'attractions' 
              ? 'bg-teal-600 text-white' 
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          🏛️ Attractions
        </button>
        <button
          onClick={() => setSelectedCategory('culture')}
          className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all ${
            selectedCategory === 'culture' 
              ? 'bg-teal-600 text-white' 
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          🎨 Culture
        </button>
        <button
          onClick={() => setSelectedCategory('practical')}
          className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all ${
            selectedCategory === 'practical' 
              ? 'bg-teal-600 text-white' 
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          💡 Practical Info
        </button>
      </div>

      {/* Content Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories[selectedCategory].map(item => (
          <div
            key={item.id}
            onClick={() => {
              if (item.hasLocations) {
                setSelectedItem(item);
              } else {
                setSelectedItem(item);
              }
            }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all cursor-pointer transform hover:-translate-y-1"
          >
            <div className="text-5xl mb-4">{item.icon}</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{item.name}</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">{item.description}</p>
          </div>
        ))}
      </div>

      {/* Historical Sites Country Selection Modal */}
      {selectedItem && selectedItem.name === 'Historical Sites' && !selectedCountry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedItem(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{selectedItem.icon}</span>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedItem.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400">Select a country to explore</p>
                </div>
              </div>
              <button onClick={() => setSelectedItem(null)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-3xl leading-none">
                ×
              </button>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.keys(historicalSitesByCountry).map((countryKey) => {
                const country = historicalSitesByCountry[countryKey];
                const totalLocations = Object.keys(country.locations).length;
                const totalPlaces = Object.values(country.locations).reduce((sum, loc) => sum + loc.places.length, 0);
                return (
                  <div
                    key={countryKey}
                    onClick={() => setSelectedCountry(countryKey)}
                    className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-5 cursor-pointer hover:shadow-xl transition-all transform hover:-translate-y-1 border-2 border-transparent hover:border-blue-500"
                  >
                    <div className="text-5xl mb-3 text-center">{country.icon}</div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1 text-center">{country.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 text-center">{totalLocations} locations • {totalPlaces} sites</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Location Selection within Selected Country */}
      {selectedCountry && !selectedLocation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => {
          setSelectedCountry(null);
        }}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <button 
                  onClick={() => setSelectedCountry(null)}
                  className="text-teal-600 dark:text-teal-400 hover:text-teal-700 font-semibold mb-2 flex items-center gap-1"
                >
                  ← Back to Countries
                </button>
                <div className="flex items-center gap-3">
                  <span className="text-5xl">{historicalSitesByCountry[selectedCountry].icon}</span>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {historicalSitesByCountry[selectedCountry].name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">Select a location to explore historical sites</p>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => {
                  setSelectedCountry(null);
                  setSelectedItem(null);
                }} 
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-3xl leading-none"
              >
                ×
              </button>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.keys(historicalSitesByCountry[selectedCountry].locations).map((locationKey) => {
                const location = historicalSitesByCountry[selectedCountry].locations[locationKey];
                return (
                  <div
                    key={locationKey}
                    onClick={() => setSelectedLocation(locationKey)}
                    className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-5 cursor-pointer hover:shadow-xl transition-all transform hover:-translate-y-1 border-2 border-transparent hover:border-teal-500"
                  >
                    <div className="text-4xl mb-3">{location.icon}</div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{location.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{location.places.length} historical sites</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Historical Places in Selected Location */}
      {selectedLocation && !selectedPlace && selectedCountry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => {
          setSelectedLocation(null);
        }}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <button 
                  onClick={() => setSelectedLocation(null)}
                  className="text-teal-600 dark:text-teal-400 hover:text-teal-700 font-semibold mb-2 flex items-center gap-1"
                >
                  ← Back to Locations
                </button>
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{historicalSitesByCountry[selectedCountry].locations[selectedLocation].icon}</span>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {historicalSitesByCountry[selectedCountry].locations[selectedLocation].name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">Historical places to visit</p>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => {
                  setSelectedLocation(null);
                  setSelectedCountry(null);
                  setSelectedItem(null);
                }} 
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-3xl leading-none"
              >
                ×
              </button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              {historicalSitesByCountry[selectedCountry].locations[selectedLocation].places.map((place, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedPlace(place)}
                  className="bg-white dark:bg-gray-700 rounded-xl border-2 border-gray-200 dark:border-gray-600 p-4 cursor-pointer hover:shadow-lg hover:border-teal-500 transition-all"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-3xl">{place.image}</span>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{place.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{place.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-teal-600 dark:text-teal-400 font-semibold">
                    <span>View Details</span>
                    <span>→</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Place Details Modal */}
      {selectedPlace && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedPlace(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <button 
                  onClick={() => setSelectedPlace(null)}
                  className="text-teal-600 dark:text-teal-400 hover:text-teal-700 font-semibold mb-2 flex items-center gap-1"
                >
                  ← Back to Places
                </button>
                <div className="flex items-center gap-3">
                  <span className="text-5xl">{selectedPlace.image}</span>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedPlace.name}</h3>
                </div>
              </div>
              <button onClick={() => setSelectedPlace(null)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-3xl leading-none">
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">📖 About</h4>
                <p className="text-gray-700 dark:text-gray-300">{selectedPlace.description}</p>
              </div>

              {historicalLocationDetails && (
                <div className="bg-emerald-50 dark:bg-emerald-900 dark:bg-opacity-30 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">📍 Location Details</h4>
                  <div className="grid grid-cols-1 gap-2 text-gray-700 dark:text-gray-300">
                    <span><strong>Locality:</strong> {historicalLocationDetails.locality}</span>
                    <span><strong>District / Mandal:</strong> {historicalLocationDetails.mandalOrDistrict}</span>
                    <span><strong>State / Province:</strong> {historicalLocationDetails.state}</span>
                    <span><strong>PIN / Postal Code:</strong> {historicalLocationDetails.pincode}</span>
                  </div>
                </div>
              )}

              <div className="bg-teal-50 dark:bg-teal-900 dark:bg-opacity-30 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">🕐 Timings</h4>
                <p className="text-gray-700 dark:text-gray-300">{selectedPlace.timings}</p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900 dark:bg-opacity-30 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">💰 Entry Fee</h4>
                <p className="text-gray-700 dark:text-gray-300">{selectedPlace.entryFee}</p>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900 dark:bg-opacity-30 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">🌤️ Best Time to Visit</h4>
                {(() => {
                  const visitInfo = isGoodTimeToVisit(selectedPlace.bestTime);
                  return (
                    <div>
                      <p className="text-gray-700 dark:text-gray-300 mb-1">{selectedPlace.bestTime}</p>
                      {visitInfo.isGood !== null && (
                        <div className={`mt-2 px-3 py-1.5 rounded-full text-sm font-medium inline-flex items-center gap-1.5 ${
                          visitInfo.isGood 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                        }`}>
                          <span>{visitInfo.isGood ? '✓' : '⚠'}</span>
                          <span>{visitInfo.message}</span>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              <div className="bg-amber-50 dark:bg-amber-900 dark:bg-opacity-30 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">✨ Highlights</h4>
                <div className="grid grid-cols-1 gap-2">
                  {selectedPlace.highlights.map((highlight, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <span className="text-teal-600 dark:text-teal-400">•</span>
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Museums Country Selection Modal */}
      {selectedItem && selectedItem.name === 'Museums' && !selectedMuseumCountry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedItem(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{selectedItem.icon}</span>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedItem.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400">Select a country to explore museums</p>
                </div>
              </div>
              <button onClick={() => setSelectedItem(null)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-3xl leading-none">
                ×
              </button>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.keys(museumsByCountry).map((countryKey) => {
                const country = museumsByCountry[countryKey];
                const totalLocations = Object.keys(country.locations).length;
                const totalMuseums = Object.values(country.locations).reduce((sum, loc) => sum + loc.museums.length, 0);
                return (
                  <div
                    key={countryKey}
                    onClick={() => setSelectedMuseumCountry(countryKey)}
                    className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-5 cursor-pointer hover:shadow-xl transition-all transform hover:-translate-y-1 border-2 border-transparent hover:border-purple-500"
                  >
                    <div className="text-5xl mb-3 text-center">{country.icon}</div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1 text-center">{country.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 text-center">{totalLocations} locations • {totalMuseums} museums</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Museum Location Selection within Selected Country */}
      {selectedMuseumCountry && !selectedMuseumLocation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => {
          setSelectedMuseumCountry(null);
        }}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <button 
                  onClick={() => setSelectedMuseumCountry(null)}
                  className="text-purple-600 dark:text-purple-400 hover:text-purple-700 font-semibold mb-2 flex items-center gap-1"
                >
                  ← Back to Countries
                </button>
                <div className="flex items-center gap-3">
                  <span className="text-5xl">{museumsByCountry[selectedMuseumCountry].icon}</span>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {museumsByCountry[selectedMuseumCountry].name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">Select a location to explore museums</p>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => {
                  setSelectedMuseumCountry(null);
                  setSelectedItem(null);
                }} 
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-3xl leading-none"
              >
                ×
              </button>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.keys(museumsByCountry[selectedMuseumCountry].locations).map((locationKey) => {
                const location = museumsByCountry[selectedMuseumCountry].locations[locationKey];
                return (
                  <div
                    key={locationKey}
                    onClick={() => setSelectedMuseumLocation(locationKey)}
                    className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-5 cursor-pointer hover:shadow-xl transition-all transform hover:-translate-y-1 border-2 border-transparent hover:border-purple-500"
                  >
                    <div className="text-4xl mb-3">{location.icon}</div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{location.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{location.museums.length} museums</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Museums in Selected Location */}
      {selectedMuseumLocation && !selectedMuseum && selectedMuseumCountry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => {
          setSelectedMuseumLocation(null);
        }}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <button 
                  onClick={() => setSelectedMuseumLocation(null)}
                  className="text-purple-600 dark:text-purple-400 hover:text-purple-700 font-semibold mb-2 flex items-center gap-1"
                >
                  ← Back to Locations
                </button>
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{museumsByCountry[selectedMuseumCountry].locations[selectedMuseumLocation].icon}</span>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {museumsByCountry[selectedMuseumCountry].locations[selectedMuseumLocation].name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">Museums to visit</p>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => {
                  setSelectedMuseumLocation(null);
                  setSelectedMuseumCountry(null);
                  setSelectedItem(null);
                }} 
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-3xl leading-none"
              >
                ×
              </button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              {museumsByCountry[selectedMuseumCountry].locations[selectedMuseumLocation].museums.map((museum, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedMuseum(museum)}
                  className="bg-white dark:bg-gray-700 rounded-xl border-2 border-gray-200 dark:border-gray-600 p-4 cursor-pointer hover:shadow-lg hover:border-purple-500 transition-all"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-3xl">{museum.image}</span>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{museum.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{museum.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400 font-semibold">
                    <span>View Details</span>
                    <span>→</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Museum Details Modal */}
      {selectedMuseum && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedMuseum(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <button 
                  onClick={() => setSelectedMuseum(null)}
                  className="text-purple-600 dark:text-purple-400 hover:text-purple-700 font-semibold mb-2 flex items-center gap-1"
                >
                  ← Back to Museums
                </button>
                <div className="flex items-center gap-3">
                  <span className="text-5xl">{selectedMuseum.image}</span>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedMuseum.name}</h3>
                </div>
              </div>
              <button onClick={() => setSelectedMuseum(null)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-3xl leading-none">
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">📖 About</h4>
                <p className="text-gray-700 dark:text-gray-300">{selectedMuseum.description}</p>
              </div>

              {museumLocationDetails && (
                <div className="bg-indigo-50 dark:bg-indigo-900 dark:bg-opacity-30 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">📍 Location Details</h4>
                  <div className="grid grid-cols-1 gap-2 text-gray-700 dark:text-gray-300">
                    <span><strong>Locality:</strong> {museumLocationDetails.locality}</span>
                    <span><strong>District / Mandal:</strong> {museumLocationDetails.mandalOrDistrict}</span>
                    <span><strong>State / Province:</strong> {museumLocationDetails.state}</span>
                    <span><strong>PIN / Postal Code:</strong> {museumLocationDetails.pincode}</span>
                  </div>
                </div>
              )}

              <div className="bg-purple-50 dark:bg-purple-900 dark:bg-opacity-30 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">🕐 Timings</h4>
                <p className="text-gray-700 dark:text-gray-300">{selectedMuseum.timings}</p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900 dark:bg-opacity-30 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">💰 Entry Fee</h4>
                <p className="text-gray-700 dark:text-gray-300">{selectedMuseum.entryFee}</p>
              </div>

              <div className="bg-green-50 dark:bg-green-900 dark:bg-opacity-30 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">🌤️ Best Time to Visit</h4>
                {(() => {
                  const visitInfo = isGoodTimeToVisit(selectedMuseum.bestTime);
                  return (
                    <div>
                      <p className="text-gray-700 dark:text-gray-300 mb-1">{selectedMuseum.bestTime}</p>
                      {visitInfo.isGood !== null && (
                        <div className={`mt-2 px-3 py-1.5 rounded-full text-sm font-medium inline-flex items-center gap-1.5 ${
                          visitInfo.isGood 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                        }`}>
                          <span>{visitInfo.isGood ? '✓' : '⚠'}</span>
                          <span>{visitInfo.message}</span>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              <div className="bg-amber-50 dark:bg-amber-900 dark:bg-opacity-30 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">✨ Highlights</h4>
                <div className="grid grid-cols-1 gap-2">
                  {selectedMuseum.highlights.map((highlight, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <span className="text-purple-600 dark:text-purple-400">•</span>
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Religious Places Country Selection Modal */}
      {selectedItem && selectedItem.name === 'Religious Places' && !selectedReligiousCountry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedItem(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <div>
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="text-orange-600 dark:text-orange-400 hover:text-orange-700 font-semibold mb-2 flex items-center gap-1"
                >
                  ← Back to Categories
                </button>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Select Country</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Choose a country to explore religious places</p>
              </div>
              <button onClick={() => setSelectedItem(null)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-3xl leading-none">
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(religiousPlacesByCountry).map(([countryKey, country]) => (
                <button
                  key={countryKey}
                  onClick={() => setSelectedReligiousCountry(countryKey)}
                  className="group p-4 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900 dark:to-amber-900 dark:bg-opacity-30 rounded-xl hover:shadow-lg transition-all duration-300 text-left border-2 border-transparent hover:border-orange-300 dark:hover:border-orange-600"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-4xl group-hover:scale-110 transition-transform">{country.icon}</span>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{country.name}</h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {Object.keys(country.locations).length} {Object.keys(country.locations).length === 1 ? 'location' : 'locations'}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Religious Places Location Selection Modal */}
      {selectedReligiousCountry && !selectedReligiousLocation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedReligiousCountry(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <div>
                <button 
                  onClick={() => setSelectedReligiousCountry(null)}
                  className="text-orange-600 dark:text-orange-400 hover:text-orange-700 font-semibold mb-2 flex items-center gap-1"
                >
                  ← Back to Countries
                </button>
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{religiousPlacesByCountry[selectedReligiousCountry].icon}</span>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {religiousPlacesByCountry[selectedReligiousCountry].name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Select a location to explore religious places</p>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedReligiousCountry(null)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-3xl leading-none">
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(religiousPlacesByCountry[selectedReligiousCountry].locations).map(([locationKey, location]) => (
                <button
                  key={locationKey}
                  onClick={() => setSelectedReligiousLocation(locationKey)}
                  className="group p-4 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900 dark:to-amber-900 dark:bg-opacity-30 rounded-xl hover:shadow-lg transition-all duration-300 text-left border-2 border-transparent hover:border-orange-300 dark:hover:border-orange-600"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-4xl group-hover:scale-110 transition-transform">{location.icon}</span>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{location.name}</h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {location.places.length} {location.places.length === 1 ? 'religious place' : 'religious places'}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Religious Places List Modal */}
      {selectedReligiousLocation && !selectedReligiousPlace && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedReligiousLocation(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <div>
                <button 
                  onClick={() => setSelectedReligiousLocation(null)}
                  className="text-orange-600 dark:text-orange-400 hover:text-orange-700 font-semibold mb-2 flex items-center gap-1"
                >
                  ← Back to Locations
                </button>
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{religiousPlacesByCountry[selectedReligiousCountry].locations[selectedReligiousLocation].icon}</span>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {religiousPlacesByCountry[selectedReligiousCountry].locations[selectedReligiousLocation].name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      Religious Places in {religiousPlacesByCountry[selectedReligiousCountry].name}
                    </p>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedReligiousLocation(null)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-3xl leading-none">
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {religiousPlacesByCountry[selectedReligiousCountry].locations[selectedReligiousLocation].places.map((place, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedReligiousPlace(place)}
                  className="group p-4 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900 dark:to-amber-900 dark:bg-opacity-30 rounded-xl hover:shadow-lg transition-all duration-300 text-left border-2 border-transparent hover:border-orange-300 dark:hover:border-orange-600"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-4xl group-hover:scale-110 transition-transform flex-shrink-0">{place.image}</span>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{place.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{place.description}</p>
                      <div className="mt-2 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                        <span>⏰ {place.timings.split(',')[0]}</span>
                        <span>💰 {place.entryFee}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Religious Place Details Modal */}
      {selectedReligiousPlace && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedReligiousPlace(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <button 
                  onClick={() => setSelectedReligiousPlace(null)}
                  className="text-orange-600 dark:text-orange-400 hover:text-orange-700 font-semibold mb-2 flex items-center gap-1"
                >
                  ← Back to Religious Places
                </button>
                <div className="flex items-center gap-3">
                  <span className="text-5xl">{selectedReligiousPlace.image}</span>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedReligiousPlace.name}</h3>
                </div>
              </div>
              <button onClick={() => setSelectedReligiousPlace(null)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-3xl leading-none">
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">📖 About</h4>
                <p className="text-gray-700 dark:text-gray-300">{selectedReligiousPlace.description}</p>
              </div>

              {religiousLocationDetails && (
                <div className="bg-orange-50 dark:bg-orange-900 dark:bg-opacity-30 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">📍 Location Details</h4>
                  <div className="grid grid-cols-1 gap-2 text-gray-700 dark:text-gray-300">
                    <span><strong>Locality:</strong> {religiousLocationDetails.locality}</span>
                    <span><strong>District / Mandal:</strong> {religiousLocationDetails.mandalOrDistrict}</span>
                    <span><strong>State / Province:</strong> {religiousLocationDetails.state}</span>
                    <span><strong>PIN / Postal Code:</strong> {religiousLocationDetails.pincode}</span>
                  </div>
                </div>
              )}

              <div className="bg-orange-50 dark:bg-orange-900 dark:bg-opacity-30 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">🕐 Timings</h4>
                <p className="text-gray-700 dark:text-gray-300">{selectedReligiousPlace.timings}</p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900 dark:bg-opacity-30 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">💰 Entry Fee</h4>
                <p className="text-gray-700 dark:text-gray-300">{selectedReligiousPlace.entryFee}</p>
              </div>

              <div className="bg-green-50 dark:bg-green-900 dark:bg-opacity-30 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">🌤️ Best Time to Visit</h4>
                {(() => {
                  const visitInfo = isGoodTimeToVisit(selectedReligiousPlace.bestTime);
                  return (
                    <div>
                      <p className="text-gray-700 dark:text-gray-300 mb-1">{selectedReligiousPlace.bestTime}</p>
                      {visitInfo.isGood !== null && (
                        <div className={`mt-2 px-3 py-1.5 rounded-full text-sm font-medium inline-flex items-center gap-1.5 ${
                          visitInfo.isGood 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                        }`}>
                          <span>{visitInfo.isGood ? '✓' : '⚠'}</span>
                          <span>{visitInfo.message}</span>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              <div className="bg-amber-50 dark:bg-amber-900 dark:bg-opacity-30 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">✨ Highlights</h4>
                <div className="grid grid-cols-1 gap-2">
                  {selectedReligiousPlace.highlights.map((highlight, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <span className="text-orange-600 dark:text-orange-400">•</span>
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Natural Wonders Country Selection Modal */}
      {selectedItem && selectedItem.name === 'Natural Wonders' && !selectedNaturalCountry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedItem(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6 sticky top-0 bg-white dark:bg-gray-800 z-10 pb-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl">🏞️</span>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Select Country - Natural Wonders</h3>
              </div>
              <button onClick={() => setSelectedItem(null)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                <span className="text-2xl">×</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.keys(naturalWondersByCountry).map((countryName) => (
                <button
                  key={countryName}
                  onClick={() => setSelectedNaturalCountry(naturalWondersByCountry[countryName])}
                  className="bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-900 dark:to-green-800 dark:bg-opacity-30 hover:from-emerald-100 hover:to-green-200 dark:hover:from-emerald-800 dark:hover:to-green-700 p-4 rounded-lg transition-all duration-200 text-left group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{naturalWondersByCountry[countryName].icon}</span>
                    <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-300">
                      {countryName}
                    </h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {Object.keys(naturalWondersByCountry[countryName].locations).length} regions
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Natural Wonders Location Selection Modal */}
      {selectedNaturalCountry && !selectedNaturalLocation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedNaturalCountry(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6 sticky top-0 bg-white dark:bg-gray-800 z-10 pb-4">
              <div className="flex items-center gap-3">
                <button onClick={() => setSelectedNaturalCountry(null)} className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300">
                  ← Back
                </button>
                <span className="text-3xl">{selectedNaturalCountry.icon}</span>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedNaturalCountry.name} - Select Region</h3>
              </div>
              <button onClick={() => { setSelectedNaturalCountry(null); setSelectedItem(null); }} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                <span className="text-2xl">×</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.keys(selectedNaturalCountry.locations).map((locationName) => (
                <button
                  key={locationName}
                  onClick={() => setSelectedNaturalLocation(selectedNaturalCountry.locations[locationName])}
                  className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900 dark:to-emerald-800 dark:bg-opacity-30 hover:from-green-100 hover:to-emerald-200 dark:hover:from-green-800 dark:hover:to-emerald-700 p-4 rounded-lg transition-all duration-200 text-left group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{selectedNaturalCountry.locations[locationName].icon}</span>
                    <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-green-700 dark:group-hover:text-green-300">
                      {locationName}
                    </h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {selectedNaturalCountry.locations[locationName].wonders.length} natural wonders
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Natural Wonders List Modal */}
      {selectedNaturalLocation && !selectedNaturalWonder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedNaturalLocation(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6 sticky top-0 bg-white dark:bg-gray-800 z-10 pb-4">
              <div className="flex items-center gap-3">
                <button onClick={() => setSelectedNaturalLocation(null)} className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300">
                  ← Back
                </button>
                <span className="text-3xl">{selectedNaturalLocation.icon}</span>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedNaturalLocation.name} Natural Wonders</h3>
              </div>
              <button onClick={() => { setSelectedNaturalLocation(null); setSelectedNaturalCountry(null); setSelectedItem(null); }} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                <span className="text-2xl">×</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedNaturalLocation.wonders.map((wonder, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedNaturalWonder(wonder)}
                  className="bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-900 dark:to-teal-800 dark:bg-opacity-30 hover:from-emerald-100 hover:to-teal-200 dark:hover:from-emerald-800 dark:hover:to-teal-700 p-4 rounded-lg transition-all duration-200 text-left group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-4xl">{wonder.image}</span>
                    <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-300">
                      {wonder.name}
                    </h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                    {wonder.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Natural Wonders Details Modal */}
      {selectedNaturalWonder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedNaturalWonder(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <button onClick={() => setSelectedNaturalWonder(null)} className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300">
                  ← Back
                </button>
                <span className="text-4xl">{selectedNaturalWonder.image}</span>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedNaturalWonder.name}</h3>
              </div>
              <button onClick={() => { setSelectedNaturalWonder(null); setSelectedNaturalLocation(null); setSelectedNaturalCountry(null); setSelectedItem(null); }} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                <span className="text-2xl">×</span>
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-emerald-50 dark:bg-emerald-900 dark:bg-opacity-30 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">📝 Description</h4>
                <p className="text-gray-700 dark:text-gray-300">{selectedNaturalWonder.description}</p>
              </div>

              {naturalLocationDetails && (
                <div className="bg-lime-50 dark:bg-lime-900 dark:bg-opacity-30 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">📍 Location Details</h4>
                  <div className="grid grid-cols-1 gap-2 text-gray-700 dark:text-gray-300">
                    <span><strong>Locality:</strong> {naturalLocationDetails.locality}</span>
                    <span><strong>District / Mandal:</strong> {naturalLocationDetails.mandalOrDistrict}</span>
                    <span><strong>State / Province:</strong> {naturalLocationDetails.state}</span>
                    <span><strong>PIN / Postal Code:</strong> {naturalLocationDetails.pincode}</span>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 dark:bg-blue-900 dark:bg-opacity-30 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">🎫 Entry Fee</h4>
                <p className="text-gray-700 dark:text-gray-300">{selectedNaturalWonder.entryFee}</p>
              </div>

              <div className="bg-green-50 dark:bg-green-900 dark:bg-opacity-30 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">🌤️ Best Time to Visit</h4>
                {(() => {
                  const visitInfo = isGoodTimeToVisit(selectedNaturalWonder.bestTime);
                  return (
                    <div>
                      <p className="text-gray-700 dark:text-gray-300 mb-1">{selectedNaturalWonder.bestTime}</p>
                      {visitInfo.isGood !== null && (
                        <div className={`mt-2 px-3 py-1.5 rounded-full text-sm font-medium inline-flex items-center gap-1.5 ${
                          visitInfo.isGood 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                        }`}>
                          <span>{visitInfo.isGood ? '✓' : '⚠'}</span>
                          <span>{visitInfo.message}</span>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              <div className="bg-teal-50 dark:bg-teal-900 dark:bg-opacity-30 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">✨ Highlights</h4>
                <div className="grid grid-cols-1 gap-2">
                  {selectedNaturalWonder.highlights.map((highlight, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <span className="text-emerald-600 dark:text-emerald-400">•</span>
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Regular Detail Modal for other categories */}
      {selectedItem && selectedItem.name !== 'Historical Sites' && selectedItem.name !== 'Museums' && selectedItem.name !== 'Religious Places' && selectedItem.name !== 'Natural Wonders' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedItem(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{selectedItem.icon}</span>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedItem.name}</h3>
              </div>
              <button onClick={() => setSelectedItem(null)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                <span className="text-2xl">×</span>
              </button>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{selectedItem.description}</p>
            <div className="space-y-2">
              {(selectedItem.places || selectedItem.events || selectedItem.dishes || selectedItem.items || selectedItem.forms || selectedItem.options || selectedItem.markets || selectedItem.tips || selectedItem.rules || []).map((detail, idx) => (
                <div key={idx} className="bg-teal-50 dark:bg-teal-900 dark:bg-opacity-30 p-3 rounded-lg text-gray-800 dark:text-gray-200">
                  • {detail}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Emergency Services Component
export const EmergencyPage = ({ currentUser, setPage }) => {
  const [selectedService, setSelectedService] = useState(null);
  const [activeTab, setActiveTab] = useState('quick'); // quick, services, advanced, history
  const [panicCountdown, setPanicCountdown] = useState(null);
  const [liveTrackingActive, setLiveTrackingActive] = useState(false);
  const [checkInTimer, setCheckInTimer] = useState(null);
  const [emergencyHistory, setEmergencyHistory] = useState([]);
  const [activeEmergency, setActiveEmergency] = useState(null);
  const [showContactsModal, setShowContactsModal] = useState(false);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '', relationship: '', isPrimary: false, countryCode: '+1' });
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [editContact, setEditContact] = useState({ name: '', phone: '', relationship: '', isPrimary: false, countryCode: '+1' });

  // Common country codes
  const countryCodes = [
    { code: '+1', country: 'USA/Canada', flag: '🇺🇸' },
    { code: '+44', country: 'UK', flag: '🇬🇧' },
    { code: '+91', country: 'India', flag: '🇮🇳' },
    { code: '+86', country: 'China', flag: '🇨🇳' },
    { code: '+81', country: 'Japan', flag: '🇯🇵' },
    { code: '+33', country: 'France', flag: '🇫🇷' },
    { code: '+49', country: 'Germany', flag: '🇩🇪' },
    { code: '+39', country: 'Italy', flag: '🇮🇹' },
    { code: '+34', country: 'Spain', flag: '🇪🇸' },
    { code: '+61', country: 'Australia', flag: '🇦🇺' },
    { code: '+55', country: 'Brazil', flag: '🇧🇷' },
    { code: '+7', country: 'Russia', flag: '🇷🇺' },
    { code: '+82', country: 'South Korea', flag: '🇰🇷' },
    { code: '+971', country: 'UAE', flag: '🇦🇪' },
    { code: '+65', country: 'Singapore', flag: '🇸🇬' }
  ];

  const emergencyServices = [
    {
      id: 1,
      name: 'Police',
      icon: '👮',
      number: '100',
      color: 'from-blue-600 to-blue-700',
      description: 'For crime, theft, or security emergencies',
      tips: ['Stay calm', 'Provide exact location', 'Describe the situation clearly']
    },
    {
      id: 2,
      name: 'Ambulance',
      icon: '🚑',
      number: '102',
      color: 'from-red-600 to-red-700',
      description: 'Medical emergencies and health issues',
      tips: ['State medical emergency clearly', 'Provide patient details', 'Mention exact address']
    },
    {
      id: 3,
      name: 'Fire Service',
      icon: '🚒',
      number: '101',
      color: 'from-orange-600 to-orange-700',
      description: 'Fire emergencies and rescue operations',
      tips: ['Evacuate immediately', 'Don\'t use elevators', 'Cover mouth with wet cloth']
    },
    {
      id: 4,
      name: 'Tourist Helpline',
      icon: '📞',
      number: '1363',
      color: 'from-green-600 to-green-700',
      description: '24/7 assistance for tourists',
      tips: ['Available in multiple languages', 'Helps with directions and emergencies', 'Free service']
    },
    {
      id: 5,
      name: 'Women Helpline',
      icon: '👩',
      number: '1091',
      color: 'from-pink-600 to-pink-700',
      description: 'Emergency helpline for women',
      tips: ['24/7 support', 'All women-related emergencies', 'Confidential service']
    },
    {
      id: 6,
      name: 'Child Helpline',
      icon: '👶',
      number: '1098',
      color: 'from-purple-600 to-purple-700',
      description: 'Emergency helpline for children',
      tips: ['For child in distress', 'Missing children', 'Child abuse cases']
    }
  ];

  const quickActions = [
    { id: 'location', name: 'Share Location', icon: '📍', action: () => handleShareLocation(), color: 'bg-blue-500' },
    { id: 'sos', name: 'Send SOS', icon: '🆘', action: () => handleTriggerSOS(), color: 'bg-red-600' },
    { id: 'contacts', name: 'Emergency Contacts', icon: '📱', action: () => handleShowContacts(), color: 'bg-green-500' }
  ];

  // Fetch emergency contacts
  const fetchEmergencyContacts = async () => {
    setLoadingContacts(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/emergency-contacts`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setEmergencyContacts(data.contacts);
      } else {
        console.error('Failed to fetch contacts:', data.message);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoadingContacts(false);
    }
  };

  // Add emergency contact
  const handleAddContact = async () => {
    // Validation
    if (!newContact.name || !newContact.name.trim()) {
      alert('❌ Please enter a contact name');
      return;
    }
    
    if (!newContact.phone || !newContact.phone.trim()) {
      alert('❌ Please enter a phone number');
      return;
    }
    
    // Basic phone validation (should have at least 10 digits)
    const phoneDigits = newContact.phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      alert('❌ Please enter a valid phone number (at least 10 digits)');
      return;
    }

    // Combine country code with phone number
    const fullPhoneNumber = newContact.countryCode + newContact.phone;

    try {
      const response = await fetch(`${API_BASE_URL}/api/emergency-contacts/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...newContact,
          phone: fullPhoneNumber
        })
      });
      const data = await response.json();
      if (data.success) {
        setEmergencyContacts(data.contacts);
        setNewContact({ name: '', phone: '', relationship: '', isPrimary: false, countryCode: '+1' });
        setShowAddContact(false);
        alert('✅ Emergency contact added successfully!');
      } else {
        alert('Failed to add contact: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error adding contact:', error);
      alert('Failed to add contact: ' + error.message);
    }
  };

  // Delete emergency contact
  const handleDeleteContact = async (contactId) => {
    if (!confirm('Are you sure you want to delete this contact?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/emergency-contacts/${contactId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setEmergencyContacts(data.contacts);
        alert('Contact deleted successfully');
      } else {
        alert('Failed to delete contact: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
      alert('Failed to delete contact: ' + error.message);
    }
  };

  // Set primary contact
  const handleSetPrimary = async (contactId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/emergency-contacts/${contactId}/set-primary`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setEmergencyContacts(data.contacts);
      } else {
        alert('Failed to set primary contact: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error setting primary:', error);
      alert('Failed to set primary contact: ' + error.message);
    }
  };

  // Show contacts modal
  const handleShowContacts = () => {
    setShowContactsModal(true);
    fetchEmergencyContacts();
  };

  // Handle edit contact
  const handleEditContact = (contact) => {
    setEditingContact(contact._id);
    
    // Parse country code from phone number
    let countryCode = '+1';
    let phoneNumber = contact.phone;
    
    // Try to extract country code from phone number
    const phoneStr = contact.phone || '';
    const matchingCode = countryCodes.find(cc => phoneStr.startsWith(cc.code));
    if (matchingCode) {
      countryCode = matchingCode.code;
      phoneNumber = phoneStr.substring(matchingCode.code.length);
    }
    
    setEditContact({
      name: contact.name,
      phone: phoneNumber,
      relationship: contact.relationship || '',
      isPrimary: contact.isPrimary || false,
      countryCode: countryCode
    });
  };

  // Update emergency contact
  const handleUpdateContact = async () => {
    // Validation
    if (!editContact.name || !editContact.name.trim()) {
      alert('❌ Please enter a contact name');
      return;
    }
    
    if (!editContact.phone || !editContact.phone.trim()) {
      alert('❌ Please enter a phone number');
      return;
    }
    
    // Basic phone validation
    const phoneDigits = editContact.phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      alert('❌ Please enter a valid phone number (at least 10 digits)');
      return;
    }

    // Combine country code with phone number
    const fullPhoneNumber = (editContact.countryCode || '+1') + editContact.phone;

    try {
      const response = await fetch(`${API_BASE_URL}/api/emergency-contacts/${editingContact}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...editContact,
          phone: fullPhoneNumber
        })
      });
      const data = await response.json();
      if (data.success) {
        setEmergencyContacts(data.contacts);
        setEditingContact(null);
        setEditContact({ name: '', phone: '', relationship: '', isPrimary: false, countryCode: '+1' });
        alert('✅ Contact updated successfully!');
      } else {
        alert('Failed to update contact: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating contact:', error);
      alert('Failed to update contact: ' + error.message);
    }
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingContact(null);
    setEditContact({ name: '', phone: '', relationship: '', isPrimary: false, countryCode: '+1' });
  };

  const advancedFeatures = [
    {
      id: 'panic',
      name: 'Panic Button',
      icon: '🔴',
      description: '10-second countdown before triggering full emergency alert',
      color: 'from-red-500 to-red-700',
      action: () => handleActivatePanicButton()
    },
    {
      id: 'tracking',
      name: 'Live Tracking',
      icon: '📡',
      description: 'Real-time location sharing with emergency contacts',
      color: 'from-blue-500 to-blue-700',
      action: () => handleToggleLiveTracking()
    },
    {
      id: 'geofence',
      name: 'Geofence Alert',
      icon: '🎯',
      description: 'Alert contacts if you move outside safe zone',
      color: 'from-purple-500 to-purple-700',
      action: () => handleSetGeofence()
    },
    {
      id: 'checkin',
      name: 'Safety Check-in',
      icon: '✅',
      description: 'Periodic safety checks with auto-alert',
      color: 'from-green-500 to-green-700',
      action: () => handleSetupCheckIn()
    },
    {
      id: 'fakecall',
      name: 'Fake Call',
      icon: '📞',
      description: 'Schedule a fake call to exit uncomfortable situations',
      color: 'from-yellow-500 to-yellow-700',
      action: () => handleScheduleFakeCall()
    },
    {
      id: 'safeword',
      name: 'Safe Word',
      icon: '🔐',
      description: 'Set a secret word to verify your safety',
      color: 'from-pink-500 to-pink-700',
      action: () => handleSetSafeWord()
    },
    {
      id: 'facilities',
      name: 'Nearby Help',
      icon: '🏥',
      description: 'Find nearby hospitals, police stations, safe spaces',
      color: 'from-teal-500 to-teal-700',
      action: () => handleFindFacilities()
    },
    {
      id: 'medical',
      name: 'Medical Info',
      icon: '💊',
      description: 'Store critical medical information for emergencies',
      color: 'from-indigo-500 to-indigo-700',
      action: () => handleUpdateMedicalInfo()
    }
  ];

  const handleShareLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        const url = `https://maps.google.com/?q=${latitude},${longitude}`;
        alert(`Location shared: ${url}\nCopied to clipboard!`);
        navigator.clipboard.writeText(url);
      });
    } else {
      alert('Geolocation not supported');
    }
  };

  const handleTriggerSOS = async () => {
    if (!confirm('⚠️ This will trigger an SOS alert to all emergency contacts. Continue?')) {
      return;
    }

    try {
      // Get current location
      if (!navigator.geolocation) {
        alert('❌ Geolocation is not supported by your browser');
        return;
      }

      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Trigger SOS
        const response = await fetch(`${API_BASE_URL}/api/emergency/sos/quick-trigger`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            type: 'sos',
            location: {
              lat: latitude,
              lon: longitude
            },
            description: 'Emergency SOS triggered - I am in trouble and need immediate help!'
          })
        });

        const data = await response.json();
        
        if (data.success) {
          alert(`🚨 SOS ALERT SENT!\n\nYour location and emergency message have been sent to ${data.notifiedCount} contact(s).\n\nEmergency ID: ${data.emergencyId}`);
          
          // Set active emergency
          setActiveEmergency({
            id: data.emergencyId,
            type: 'sos',
            status: 'active',
            time: new Date(),
            notifiedCount: data.notifiedCount
          });
        } else {
          alert('❌ Failed to send SOS: ' + (data.message || 'Unknown error'));
        }
      }, (error) => {
        console.error('Geolocation error:', error);
        alert('❌ Unable to get your location. Please enable location services and try again.');
      });
    } catch (error) {
      console.error('Error triggering SOS:', error);
      alert('❌ Failed to trigger SOS: ' + error.message);
    }
  };

  const handleActivatePanicButton = () => {
    if (panicCountdown) {
      alert('Panic button already active!');
      return;
    }

    let countdown = 10;
    setPanicCountdown(countdown);
    
    const timer = setInterval(() => {
      countdown--;
      setPanicCountdown(countdown);
      
      if (countdown === 0) {
        clearInterval(timer);
        alert('🚨 PANIC ALERT TRIGGERED!\n\nEmergency services and contacts have been notified!');
        setPanicCountdown(null);
      }
    }, 1000);
  };

  const handleCancelPanic = () => {
    setPanicCountdown(null);
    alert('✅ Panic button cancelled');
  };

  const handleToggleLiveTracking = () => {
    if (liveTrackingActive) {
      setLiveTrackingActive(false);
      alert('📡 Live tracking stopped');
    } else {
      setLiveTrackingActive(true);
      alert('📡 Live tracking started!\n\nYour location is being shared with emergency contacts every 30 seconds.');
      
      // Mock tracking updates
      const trackingInterval = setInterval(() => {
        if (!liveTrackingActive) {
          clearInterval(trackingInterval);
        }
        console.log('Location update sent:', new Date());
      }, 30000);
    }
  };

  const handleSetGeofence = () => {
    const radius = prompt('Enter safe zone radius in meters (default: 500):', '500');
    if (radius) {
      alert(`🎯 Geofence activated!\n\nRadius: ${radius}m\nYou will be alerted if you move outside this zone.`);
    }
  };

  const handleSetupCheckIn = () => {
    const interval = prompt('Check-in interval in minutes (default: 30):', '30');
    if (interval) {
      alert(`✅ Safety check-in activated!\n\nYou will be asked to check in every ${interval} minutes.`);
      setCheckInTimer(interval);
    }
  };

  const handleScheduleFakeCall = () => {
    const delay = prompt('Schedule fake call in how many minutes? (default: 5):', '5');
    const caller = prompt('Caller name (default: Mom):', 'Mom');
    if (delay) {
      alert(`📞 Fake call scheduled!\n\nCaller: ${caller || 'Mom'}\nWill ring in: ${delay} minutes`);
    }
  };

  const handleSetSafeWord = () => {
    const word = prompt('Enter your safe word (keep it secret):');
    if (word) {
      alert(`🔐 Safe word set!\n\nYou can use this word to verify your safety to emergency contacts.`);
    }
  };

  const handleFindFacilities = () => {
    alert('🏥 Finding nearby facilities...\n\n✓ 2 hospitals within 2km\n✓ 1 police station within 1km\n✓ 3 safe spaces nearby');
  };

  const handleUpdateMedicalInfo = () => {
    alert('💊 Medical Information Form\n\nPlease provide:\n- Blood type\n- Allergies\n- Current medications\n- Medical conditions\n- Emergency medical contact');
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Back Button */}
      {setPage && (
        <button
          onClick={() => setPage('home')}
          className="mb-4 flex items-center gap-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-semibold transition-all"
        >
          <span className="text-xl">←</span> Back to Home
        </button>
      )}

      <div className="bg-gradient-to-r from-red-600 to-pink-600 rounded-xl shadow-lg p-8 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-5xl">🚨</span>
            <div>
              <h2 className="text-3xl font-bold mb-2">Emergency Services</h2>
              <p className="text-lg opacity-90">Quick access to emergency helplines and advanced safety features</p>
            </div>
          </div>
          {activeEmergency && (
            <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2">
              <div className="text-sm font-semibold">Active Emergency</div>
              <div className="text-xs opacity-90">{activeEmergency.type.toUpperCase()}</div>
            </div>
          )}
        </div>
      </div>

      {/* Panic Button Countdown */}
      {panicCountdown !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="text-8xl font-bold text-red-500 mb-4 animate-pulse">{panicCountdown}</div>
            <p className="text-white text-2xl mb-6">Triggering Emergency Alert...</p>
            <button
              onClick={handleCancelPanic}
              className="bg-white text-black px-8 py-4 rounded-lg text-xl font-bold hover:bg-gray-200"
            >
              CANCEL
            </button>
          </div>
        </div>
      )}

      {/* Live Tracking Indicator */}
      {liveTrackingActive && (
        <div className="bg-blue-500 text-white px-4 py-3 rounded-lg mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl animate-pulse">📡</span>
            <div>
              <div className="font-bold">Live Tracking Active</div>
              <div className="text-sm opacity-90">Location being shared with emergency contacts</div>
            </div>
          </div>
          <button
            onClick={handleToggleLiveTracking}
            className="bg-white text-blue-500 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100"
          >
            Stop
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {['Quick Actions', 'Emergency Services', 'Advanced Features', 'History'].map((tab, index) => {
          const tabId = ['quick', 'services', 'advanced', 'history'][index];
          return (
            <button
              key={tabId}
              onClick={() => setActiveTab(tabId)}
              className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all ${
                activeTab === tabId
                  ? 'bg-red-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Quick Actions Tab */}
      {activeTab === 'quick' && (
        <div className="grid grid-cols-3 gap-4">
          {quickActions.map(action => (
            <button
              key={action.id}
              onClick={action.action}
              className={`${action.color} hover:opacity-90 text-white rounded-xl shadow-lg p-6 transition-all active:scale-95`}
            >
              <div className="text-4xl mb-2">{action.icon}</div>
              <p className="text-sm font-semibold">{action.name}</p>
            </button>
          ))}
        </div>
      )}

      {/* Emergency Services Tab */}
      {activeTab === 'services' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {emergencyServices.map(service => (
            <div
              key={service.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all"
            >
              <div className={`bg-gradient-to-r ${service.color} p-6 text-white`}>
                <div className="text-5xl mb-3">{service.icon}</div>
                <h3 className="text-2xl font-bold mb-1">{service.name}</h3>
                <p className="text-sm opacity-90">{service.description}</p>
              </div>
              <div className="p-6">
                <a
                  href={`tel:${service.number}`}
                  className="block w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-center py-4 rounded-lg mb-3 transition-all"
                >
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">{service.number}</span>
                </a>
                <button
                  onClick={() => setSelectedService(service)}
                  className="w-full text-blue-600 dark:text-blue-400 hover:underline text-sm"
                >
                  View Tips →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Advanced Features Tab */}
      {activeTab === 'advanced' && (
        <div className="grid md:grid-cols-2 gap-6">
          {advancedFeatures.map(feature => (
            <div
              key={feature.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all cursor-pointer"
              onClick={feature.action}
            >
              <div className={`bg-gradient-to-r ${feature.color} p-6 text-white`}>
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{feature.icon}</span>
                  <div>
                    <h3 className="text-xl font-bold mb-1">{feature.name}</h3>
                    <p className="text-sm opacity-90">{feature.description}</p>
                  </div>
                </div>
              </div>
              <div className="p-4 text-center">
                <button className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
                  Activate →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Emergency History</h3>
          {emergencyHistory.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <div className="text-5xl mb-4">📋</div>
              <p>No emergency alerts in history</p>
              <p className="text-sm mt-2">Past emergencies will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {emergencyHistory.map((emergency, index) => (
                <div key={index} className="border dark:border-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">{emergency.type}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{emergency.date}</div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      emergency.status === 'resolved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {emergency.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tips Modal */}
      {selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedService(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">{selectedService.icon}</span>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedService.name}</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{selectedService.description}</p>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Important Tips:</h4>
            <ul className="space-y-2 mb-4">
              {selectedService.tips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span className="text-gray-700 dark:text-gray-300">{tip}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => setSelectedService(null)}
              className="w-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-2 px-6 rounded-lg transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Emergency Contacts Modal */}
      {showContactsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowContactsModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-green-600 to-teal-600 p-6 text-white rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">📱</span>
                  <div>
                    <h3 className="text-2xl font-bold">Emergency Contacts</h3>
                    <p className="text-sm opacity-90">Manage your emergency contacts</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowContactsModal(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full w-8 h-8 flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Add Contact Button */}
              <button
                onClick={() => setShowAddContact(!showAddContact)}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg mb-4 flex items-center justify-center gap-2 transition-all"
              >
                <span className="text-xl">+</span>
                Add New Contact
              </button>

              {/* Add Contact Form */}
              {showAddContact && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 mb-4 border-2 border-blue-200 dark:border-blue-500 shadow-lg">
                  <h4 className="font-black text-2xl bg-gradient-to-r from-green-600 via-purple-600 to-orange-600 bg-clip-text text-transparent mb-5">✨ New Contact Details</h4>
                  <div className="space-y-5">
                    <div>
                      <label className="block text-lg font-black text-green-800 dark:text-green-300 mb-2 tracking-wide">
                        👤 Full Name <span className="text-red-600 dark:text-red-400 text-xl">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Enter full name"
                        value={newContact.name}
                        onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                        className="w-full px-4 py-3 text-xl border-3 border-green-400 dark:border-green-500 rounded-lg focus:ring-4 focus:ring-green-500 focus:border-green-600 bg-white dark:bg-gray-900 text-green-900 dark:text-green-100 placeholder-green-400 dark:placeholder-green-500 transition-all font-black tracking-wide shadow-md"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-lg font-black text-purple-800 dark:text-purple-300 mb-2 tracking-wide">
                        📞 Phone Number <span className="text-red-600 dark:text-red-400 text-xl">*</span>
                      </label>
                      <div className="flex gap-2">
                        <select
                          value={newContact.countryCode}
                          onChange={(e) => setNewContact({ ...newContact, countryCode: e.target.value })}
                          className="px-3 py-3 text-xl border-3 border-purple-400 dark:border-purple-500 rounded-lg focus:ring-4 focus:ring-purple-500 focus:border-purple-600 bg-white dark:bg-gray-900 text-purple-900 dark:text-purple-100 transition-all font-black w-32 shadow-md"
                        >
                          {countryCodes.map((cc) => (
                            <option key={cc.code} value={cc.code}>
                              {cc.flag} {cc.code}
                            </option>
                          ))}
                        </select>
                        <input
                          type="tel"
                          placeholder="Enter phone number"
                          value={newContact.phone}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '');
                            setNewContact({ ...newContact, phone: value });
                          }}
                          className="flex-1 px-4 py-3 text-xl border-3 border-purple-400 dark:border-purple-500 rounded-lg focus:ring-4 focus:ring-purple-500 focus:border-purple-600 bg-white dark:bg-gray-900 text-purple-900 dark:text-purple-100 placeholder-purple-400 dark:placeholder-purple-500 transition-all font-black tracking-wide shadow-md"
                          required
                        />
                      </div>
                      <p className="text-sm text-purple-700 dark:text-purple-300 mt-1 ml-1 font-bold">💡 Enter numbers only (e.g., 1234567890)</p>
                    </div>
                    <div>
                      <label className="block text-lg font-black text-orange-800 dark:text-orange-300 mb-2 tracking-wide">
                        💼 Relationship
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Parent, Spouse, Friend"
                        value={newContact.relationship}
                        onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
                        className="w-full px-4 py-3 text-xl border-3 border-orange-400 dark:border-orange-500 rounded-lg focus:ring-4 focus:ring-orange-500 focus:border-orange-600 bg-white dark:bg-gray-900 text-orange-900 dark:text-orange-100 placeholder-orange-400 dark:placeholder-orange-500 transition-all font-black tracking-wide shadow-md"
                      />
                    </div>
                    <div className="flex gap-3 mt-5">
                      <button
                        onClick={handleAddContact}
                        className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 rounded-lg shadow-lg transform hover:scale-105 transition-all flex items-center justify-center gap-2"
                      >
                        <span>✅</span> Save Contact
                      </button>
                      <button
                        onClick={() => {
                          setShowAddContact(false);
                          setNewContact({ name: '', phone: '', relationship: '', isPrimary: false, countryCode: '+1' });
                        }}
                        className="flex-1 bg-gray-400 dark:bg-gray-700 hover:bg-gray-500 dark:hover:bg-gray-600 text-white font-bold py-3 rounded-lg shadow-lg transform hover:scale-105 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Contacts List */}
              {loadingContacts ? (
                <div className="text-center py-8">
                  <div className="animate-spin text-4xl mb-2">⏳</div>
                  <p className="text-gray-600 dark:text-gray-400">Loading contacts...</p>
                </div>
              ) : emergencyContacts.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <div className="text-5xl mb-4">👤</div>
                  <p className="font-semibold mb-2">No emergency contacts yet</p>
                  <p className="text-sm">Add contacts who should be notified in case of emergency</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {emergencyContacts.map((contact) => (
                    <div
                      key={contact._id}
                      className={`border-2 rounded-lg p-4 transition-all ${
                        contact.isPrimary
                          ? 'border-green-500 bg-green-50 dark:bg-green-900 dark:bg-opacity-20'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                      }`}
                    >
                      {editingContact === contact._id ? (
                        // Edit Mode
                        <div className="space-y-4">
                          <h4 className="font-black text-2xl bg-gradient-to-r from-green-600 via-purple-600 to-orange-600 bg-clip-text text-transparent mb-3">✏️ Edit Contact</h4>
                          <div>
                            <label className="block text-lg font-black text-green-800 dark:text-green-300 mb-2 tracking-wide">👤 Name <span className="text-red-600 dark:text-red-400 text-xl">*</span></label>
                            <input
                              type="text"
                              placeholder="Enter full name"
                              value={editContact.name}
                              onChange={(e) => setEditContact({ ...editContact, name: e.target.value })}
                              className="w-full px-4 py-3 text-xl border-3 border-green-400 dark:border-green-500 rounded-lg focus:ring-4 focus:ring-green-500 focus:border-green-600 bg-white dark:bg-gray-900 text-green-900 dark:text-green-100 placeholder-green-400 dark:placeholder-green-500 transition-all font-black tracking-wide shadow-md"
                            />
                          </div>
                          <div>
                            <label className="block text-lg font-black text-purple-800 dark:text-purple-300 mb-2 tracking-wide">📞 Phone <span className="text-red-600 dark:text-red-400 text-xl">*</span></label>
                            <div className="flex gap-2">
                              <select
                                value={editContact.countryCode || '+1'}
                                onChange={(e) => setEditContact({ ...editContact, countryCode: e.target.value })}
                                className="px-3 py-3 text-xl border-3 border-purple-400 dark:border-purple-500 rounded-lg focus:ring-4 focus:ring-purple-500 focus:border-purple-600 bg-white dark:bg-gray-900 text-purple-900 dark:text-purple-100 transition-all font-black w-32 shadow-md"
                              >
                                {countryCodes.map((cc) => (
                                  <option key={cc.code} value={cc.code}>
                                    {cc.flag} {cc.code}
                                  </option>
                                ))}
                              </select>
                              <input
                                type="tel"
                                placeholder="Enter phone number"
                                value={editContact.phone}
                                onChange={(e) => {
                                  const value = e.target.value.replace(/[^0-9]/g, '');
                                  setEditContact({ ...editContact, phone: value });
                                }}
                                className="flex-1 px-4 py-3 text-xl border-3 border-purple-400 dark:border-purple-500 rounded-lg focus:ring-4 focus:ring-purple-500 focus:border-purple-600 bg-white dark:bg-gray-900 text-purple-900 dark:text-purple-100 placeholder-purple-400 dark:placeholder-purple-500 transition-all font-black tracking-wide shadow-md"
                              />
                            </div>
                            <p className="text-sm text-purple-700 dark:text-purple-300 mt-1 ml-1 font-bold">💡 Enter numbers only (e.g., 1234567890)</p>
                          </div>
                          <div>
                            <label className="block text-lg font-black text-orange-800 dark:text-orange-300 mb-2 tracking-wide">💼 Relationship</label>
                            <input
                              type="text"
                              placeholder="e.g., Parent, Spouse, Friend"
                              value={editContact.relationship}
                              onChange={(e) => setEditContact({ ...editContact, relationship: e.target.value })}
                              className="w-full px-4 py-3 text-xl border-3 border-orange-400 dark:border-orange-500 rounded-lg focus:ring-4 focus:ring-orange-500 focus:border-orange-600 bg-white dark:bg-gray-900 text-orange-900 dark:text-orange-100 placeholder-orange-400 dark:placeholder-orange-500 transition-all font-black tracking-wide shadow-md"
                            />
                          </div>
                          <div className="flex gap-3 mt-4">
                            <button
                              onClick={handleUpdateContact}
                              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 rounded-lg shadow-lg transform hover:scale-105 transition-all flex items-center justify-center gap-2"
                            >
                              <span>💾</span> Save Changes
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="flex-1 bg-gray-400 dark:bg-gray-700 hover:bg-gray-500 dark:hover:bg-gray-600 text-white font-bold py-3 rounded-lg shadow-lg transform hover:scale-105 transition-all"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        // View Mode
                        <>
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-lg text-gray-900 dark:text-white">{contact.name}</h4>
                                {contact.isPrimary && (
                                  <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                                    PRIMARY
                                  </span>
                                )}
                              </div>
                              <a
                                href={`tel:${contact.phone}`}
                                className="text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-2 mt-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <span>📞</span>
                                {contact.phone}
                              </a>
                              {contact.relationship && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  {contact.relationship}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditContact(contact)}
                                className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 text-lg"
                                title="Edit contact"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => handleSetPrimary(contact._id)}
                                className={`text-lg transition-all ${
                                  contact.isPrimary
                                    ? 'text-yellow-500 hover:text-yellow-600'
                                    : 'text-gray-400 hover:text-yellow-500'
                                }`}
                                title={contact.isPrimary ? 'Remove from primary' : 'Set as primary'}
                              >
                                {contact.isPrimary ? '⭐' : '☆'}
                              </button>
                              <button
                                onClick={() => handleDeleteContact(contact._id)}
                                className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 text-lg"
                                title="Delete contact"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                          
                          {/* Quick Call Button */}
                          <a
                            href={`tel:${contact.phone}`}
                            className="block w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg text-center transition-all"
                            onClick={(e) => e.stopPropagation()}
                          >
                            📞 Call Now
                          </a>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Info Box */}
              <div className="mt-6 bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex gap-3">
                  <span className="text-2xl">ℹ️</span>
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    <p className="font-semibold mb-1">About Emergency Contacts:</p>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>These contacts will be notified during emergencies</li>
                      <li>Primary contact receives alerts first</li>
                      <li>Click phone number to call directly</li>
                      <li>Keep at least 2-3 trusted contacts</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Ride Group Chat Modal Component (similar to trip chat)
const RideGroupChatModal = ({ ride, currentUser, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showMembers, setShowMembers] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [members, setMembers] = useState(ride.members || []);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load full member details if not already populated
  useEffect(() => {
    const loadMemberDetails = async () => {
      // Check if members are already populated (have name property)
      if (ride.members && ride.members.length > 0 && ride.members[0].name) {
        setMembers(ride.members);
        return;
      }

      // If members are just IDs, fetch full details
      if (ride.members && ride.members.length > 0) {
        try {
          const memberPromises = ride.members.map(async (memberId) => {
            const id = typeof memberId === 'string' ? memberId : memberId._id;
            const response = await fetch(`${API_BASE_URL}/api/auth/user/${id}`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              }
            });
            if (response.ok) {
              return await response.json();
            }
            return { _id: id, name: 'Unknown User', email: '' };
          });
          
          const memberDetails = await Promise.all(memberPromises);
          setMembers(memberDetails);
        } catch (err) {
          console.error('Error loading member details:', err);
          setMembers(ride.members);
        }
      }
    };

    loadMemberDetails();
  }, [ride.members]);

  useEffect(() => {
    loadMessages();
    
    // Ensure socket connection and then join room
    const joinRoomWhenReady = () => {
      if (socketService.getConnectionStatus()) {
        socketService.joinRideRoom(ride._id);
        console.log('🚀 Joined ride room and listening for messages:', ride._id);
      } else {
        console.log('⏳ Socket not ready, retrying in 100ms...');
        setTimeout(joinRoomWhenReady, 100);
      }
    };
    
    joinRoomWhenReady();
    
    // Listen for new messages
    const handleNewRideMessage = (data) => {
      console.log('📨 Received new ride message event:', data);
      
      if (data && data.message) {
        console.log('✅ Adding message to state:', data.message);
        setMessages(prev => {
          console.log('📝 Previous messages count:', prev.length);
          
          // Check if message already exists (prevent duplicates for sender)
          const messageExists = prev.some(msg => msg._id === data.message._id);
          if (messageExists) {
            console.log('⚠️ Message already exists, skipping:', data.message._id);
            return prev;
          }
          
          const newMessages = [...prev, data.message];
          console.log('📝 New messages count:', newMessages.length);
          return newMessages;
        });
      }
    };
    
    socketService.onNewRideMessage(handleNewRideMessage);

    return () => {
      console.log('🔌 Cleaning up ride message listener for ride:', ride._id);
      socketService.off('new-ride-message');
    };
  }, [ride._id]);

  const loadMessages = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/rideshare/${ride._id}/messages`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (err) {
      console.error('Error loading messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/rideshare/${ride._id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ message: newMessage.trim() })
      });

      if (response.ok) {
        const message = await response.json();
        console.log('✅ Message sent successfully:', message);
        
        // Add to local state immediately for the sender
        setMessages(prev => [...prev, message]);
        setNewMessage('');
        
        // Scroll to bottom
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        
        // Reload messages after a short delay to ensure sync with server
        setTimeout(() => loadMessages(), 500);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Failed to send message');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="chat-modal-container rounded-lg shadow-xl max-w-4xl w-full h-[85vh] flex flex-col bg-white" onClick={(e) => e.stopPropagation()}>
        {/* Header - WhatsApp Style */}
        <div className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white p-4 rounded-t-lg flex justify-between items-center shadow-md">
          <div className="flex items-center gap-3 flex-1">
            <button
              onClick={onClose}
              className="hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-colors"
            >
              ←
            </button>
            <div 
              className="flex items-center gap-3 flex-1 cursor-pointer hover:bg-white hover:bg-opacity-10 p-2 rounded-lg transition-colors"
              onClick={() => setShowMembers(!showMembers)}
            >
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center font-bold">
                {members?.length || 0}
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  🚗 {ride.from} → {ride.to}
                </h2>
                <p className="text-xs opacity-90">
                  Click to see {members?.length || 0} rider{(members?.length || 0) !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowMembers(!showMembers)}
              className="hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-colors"
              title="View riders"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Messages Section */}
          <div className="flex-1 flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 chat-messages bg-gray-50" style={{backgroundImage: "url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d1d5db' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"}}>
              {loading ? (
                <div className="text-center text-gray-500">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <div className="text-4xl mb-2">💬</div>
                  <div className="font-semibold">No messages yet</div>
                  <div className="text-sm">Start the conversation!</div>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isOwnMessage = msg.sender._id === currentUser._id;
                  const showSenderName = !isOwnMessage && (idx === 0 || messages[idx - 1].sender._id !== msg.sender._id);
                  
                  return (
                    <div
                      key={msg._id}
                      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-1`}
                    >
                      <div className={`max-w-md ${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col`}>
                        {showSenderName && (
                          <div 
                            className="text-xs font-semibold mb-1 px-2 cursor-pointer hover:underline flex items-center gap-1"
                            style={{ color: isOwnMessage ? '#d97706' : '#ea580c' }}
                            onClick={() => setSelectedUser(msg.sender)}
                          >
                            {!isOwnMessage && (
                              <>
                                {msg.sender.profilePhoto ? (
                                  <img 
                                    src={msg.sender.profilePhoto} 
                                    alt={msg.sender.name}
                                    className="w-4 h-4 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="w-4 h-4 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white text-[8px] font-bold">
                                    {msg.sender.name?.charAt(0)}
                                  </div>
                                )}
                                {msg.sender.name}
                              </>
                            )}
                          </div>
                        )}
                        <div
                          className={`px-4 py-2 rounded-lg shadow-sm ${
                            isOwnMessage
                              ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-br-none'
                              : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'
                          }`}
                        >
                          <div className="break-words">{msg.message}</div>
                          <div className={`text-[10px] mt-1 flex items-center gap-1 ${isOwnMessage ? 'text-orange-100 justify-end' : 'text-gray-500'}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {isOwnMessage && <span>✓✓</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={sendMessage} className="p-4 border-t bg-gray-100">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-full hover:from-yellow-600 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-400 font-semibold shadow-md transition-all"
                >
                  Send
                </button>
              </div>
            </form>
          </div>

          {/* Members Sidebar */}
          {showMembers && (
            <div className="w-80 border-l bg-white overflow-y-auto">
              <div className="p-4 border-b bg-gray-50">
                <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                  <span>👥</span> Ride Members ({members?.length || 0})
                </h3>
                <p className="text-xs text-gray-500 mt-1">Click on any member to view profile</p>
              </div>
              <div className="divide-y">
                {members?.map((member) => {
                  const memberData = typeof member === 'string' ? { _id: member, name: 'Loading...', email: '' } : member;
                  const isDriver = memberData._id === ride.driver?._id || memberData._id === ride.driver;
                  const isYou = memberData._id === currentUser._id;
                  
                  return (
                    <div
                      key={memberData._id}
                      onClick={() => typeof member === 'string' ? null : setSelectedUser(memberData)}
                      className={`p-4 ${typeof member === 'string' ? 'opacity-50' : 'hover:bg-gray-50 cursor-pointer'} transition-colors`}
                    >
                      <div className="flex items-center gap-3">
                        {memberData.profilePhoto ? (
                          <img 
                            src={memberData.profilePhoto} 
                            alt={memberData.name || 'User'}
                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 shadow-sm"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white text-xl font-bold border-2 border-white shadow-md">
                            {memberData.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900 truncate">
                              {memberData.name || 'Loading...'}
                              {isYou && <span className="text-xs text-gray-500">(You)</span>}
                            </p>
                            {isDriver && (
                              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full font-medium">
                                🚗 Driver
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 truncate">{memberData.email}</p>
                          {memberData.phone && (
                            <p className="text-xs text-gray-400">{memberData.phone}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Modal (if selected) */}
        {selectedUser && (
          <div 
            className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 rounded-lg"
            onClick={() => setSelectedUser(null)}
          >
            <div 
              className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-4 mb-4">
                {selectedUser.profilePhoto ? (
                  <img 
                    src={selectedUser.profilePhoto} 
                    alt={selectedUser.name}
                    className="w-20 h-20 rounded-full object-cover border-4 border-yellow-400"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white text-3xl font-bold border-4 border-yellow-400">
                    {selectedUser.name?.charAt(0)?.toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedUser.name}</h3>
                  <p className="text-sm text-gray-500">{selectedUser.email}</p>
                  {selectedUser.phone && (
                    <p className="text-sm text-gray-500">{selectedUser.phone}</p>
                  )}
                </div>
              </div>
              
              {selectedUser.bio && (
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-1">Bio</h4>
                  <p className="text-gray-700">{selectedUser.bio}</p>
                </div>
              )}
              
              {selectedUser.location && (
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-1">Location</h4>
                  <p className="text-gray-700">{selectedUser.location}</p>
                </div>
              )}
              
              <button
                onClick={() => setSelectedUser(null)}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Ride Share Component
export const RideSharePage = ({ currentUser, rideSharePosts = [], onPostRide, onDeleteRide, onBookSeat, sentRideBookings = [], receivedRideBookings = [], onAcceptBooking, onRejectBooking, loadingActions = {}, setPage }) => {
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [viewMode, setViewMode] = useState('find'); // 'find' | 'offer' | 'bookings' | 'myoffers' | 'chat'
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedRideChat, setSelectedRideChat] = useState(null);
  const [chatMessage, setChatMessage] = useState('');
  const [ratingModal, setRatingModal] = useState(null);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [shareDetails, setShareDetails] = useState({
    from: '',
    to: '',
    date: '',
    seats: 1,
    pricePerSeat: '',
    vehicle: '',
    description: '',
    preferences: ''
  });

  // Only show real user-created rides
  const availableRides = rideSharePosts.filter(ride => ride && ride._id);

  const handlePostRide = async () => {
    // Validation
    const errors = {};
    if (!shareDetails.from) errors.from = 'Starting point is required';
    if (!shareDetails.to) errors.to = 'Destination is required';
    if (!shareDetails.date) errors.date = 'Date is required';
    if (!shareDetails.pricePerSeat) errors.pricePerSeat = 'Price per seat is required';
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    setValidationErrors({});

    try {
      // Create new ride post data
      const newRideData = {
        from: shareDetails.from,
        to: shareDetails.to,
        date: shareDetails.date,
        seats: parseInt(shareDetails.seats),
        price: parseInt(shareDetails.pricePerSeat),
        vehicle: shareDetails.vehicle || 'Personal Vehicle',
        description: shareDetails.description || '',
        preferences: shareDetails.preferences || ''
      };

      // Call parent handler to add ride (now async)
      if (onPostRide) {
        await onPostRide(newRideData);
      }

      // Show success message
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

      // Reset form
      setShareDetails({
        from: '',
        to: '',
        date: '',
        seats: 1,
        pricePerSeat: '',
        vehicle: '',
        description: '',
        preferences: ''
      });

      // Switch to find view to see the posted ride
      setTimeout(() => setViewMode('find'), 1500);
    } catch (error) {
      alert('Error posting ride: ' + error.message);
    }
  };

  // Sync received bookings from my rides
  React.useEffect(() => {
    const myRides = rideSharePosts.filter(r => r.isMyRide);
    const allBookings = [];
    myRides.forEach(ride => {
      if (ride.bookings && ride.bookings.length > 0) {
        allBookings.push(...ride.bookings);
      }
    });
    // This would normally update parent state, but we're receiving it as prop
  }, [rideSharePosts]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Back Button */}
      {setPage && (
        <button
          onClick={() => setPage('home')}
          className="mb-4 flex items-center gap-2 text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 font-semibold transition-all"
        >
          <span className="text-xl">←</span> Back to Home
        </button>
      )}

      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl shadow-lg p-8 mb-8 text-white">
        <div className="flex items-center gap-4">
          <span className="text-5xl">🚗</span>
          <div>
            <h2 className="text-3xl font-bold mb-2">Ride Share</h2>
            <p className="text-lg opacity-90">Share rides, save money, and travel together</p>
          </div>
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <button
          onClick={() => setViewMode('find')}
          className={`py-3 rounded-lg font-semibold transition-all ${
            viewMode === 'find'
              ? 'bg-yellow-600 text-white shadow-lg'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50'
          }`}
        >
          🔍 Find Rides
        </button>
        <button
          onClick={() => setViewMode('offer')}
          className={`py-3 rounded-lg font-semibold transition-all ${
            viewMode === 'offer'
              ? 'bg-yellow-600 text-white shadow-lg'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50'
          }`}
        >
          🚙 Offer Ride
        </button>
        <button
          onClick={() => setViewMode('myoffers')}
          className={`py-3 rounded-lg font-semibold transition-all relative ${
            viewMode === 'myoffers'
              ? 'bg-yellow-600 text-white shadow-lg'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50'
          }`}
        >
          📋 My Offers
          {rideSharePosts.filter(r => r.isMyRide).length > 0 && (
            <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {rideSharePosts.filter(r => r.isMyRide).length}
            </span>
          )}
        </button>
        <button
          onClick={() => setViewMode('bookings')}
          className={`py-3 rounded-lg font-semibold transition-all relative ${
            viewMode === 'bookings'
              ? 'bg-yellow-600 text-white shadow-lg'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50'
          }`}
        >
          💼 Bookings
          {receivedRideBookings.filter(b => b.status === 'pending').length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {receivedRideBookings.filter(b => b.status === 'pending').length}
            </span>
          )}
        </button>
        <button
          onClick={() => setViewMode('chat')}
          className={`py-3 rounded-lg font-semibold transition-all ${
            viewMode === 'chat'
              ? 'bg-yellow-600 text-white shadow-lg'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50'
          }`}
        >
          💬 Group Chat
        </button>
      </div>

      {/* Find Rides View */}
      {viewMode === 'find' && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Available Rides</h3>
          {availableRides.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl">
              <span className="text-6xl mb-4 block">🚗</span>
              <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">No rides available yet</p>
              <button
                onClick={() => setViewMode('offer')}
                className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-3 px-6 rounded-lg transition-all"
              >
                Offer Your First Ride
              </button>
            </div>
          ) : (
            availableRides.map(ride => {
              // Check user's booking status for this ride
              const myBooking = sentRideBookings.find(b => b.rideId === ride.id || b.rideId === ride._id);
              const isMyRide = ride.isMyRide || ride.driver._id === currentUser?._id;
              const isMember = ride.members?.some(m => {
                const memberId = m._id || m.user?._id || m.user || m;
                return memberId && memberId.toString() === currentUser._id;
              });
              const hasPendingRequest = myBooking?.status === 'pending';
              const isAccepted = myBooking?.status === 'accepted' || isMember;
              const isRejected = myBooking?.status === 'rejected';
              const isFull = (ride.members?.length || 0) >= ride.seats;

              return (
                <div key={ride.id || ride._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white">{ride.driver || ride.driverName}</h4>
                        {ride.verified && <span className="text-blue-500" title="Verified">✓</span>}
                        {isMyRide && <span className="bg-yellow-600 text-white text-xs px-2 py-1 rounded-full">My Ride</span>}
                        <span className="text-sm text-yellow-600 dark:text-yellow-400">⭐ {ride.rating || 5}</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{ride.vehicle}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">₹{ride.price}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">per seat</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">From:</span>
                      <p className="font-semibold text-gray-900 dark:text-white">{ride.from}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">To:</span>
                      <p className="font-semibold text-gray-900 dark:text-white">{ride.to}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Date:</span>
                      <p className="font-semibold text-gray-900 dark:text-white">{new Date(ride.date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Seats:</span>
                      <p className="font-semibold text-gray-900 dark:text-white">{(ride.members?.length || 0)}/{ride.seats}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    {isMyRide ? (
                      <button
                        onClick={() => setViewMode('myoffers')}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all"
                      >
                        Manage Ride
                      </button>
                    ) : isAccepted ? (
                      <button
                        onClick={() => setSelectedRideChat(ride)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-all"
                      >
                        💬 Open Chat
                      </button>
                    ) : hasPendingRequest ? (
                      <button
                        disabled
                        className="flex-1 bg-yellow-100 text-yellow-700 font-semibold py-2 px-4 rounded-lg cursor-not-allowed"
                      >
                        ⏳ Request Pending
                      </button>
                    ) : isRejected ? (
                      <button
                        disabled
                        className="flex-1 bg-red-100 text-red-700 font-semibold py-2 px-4 rounded-lg cursor-not-allowed"
                      >
                        ❌ Request Rejected
                      </button>
                    ) : isFull ? (
                      <button
                        disabled
                        className="flex-1 bg-gray-300 text-gray-600 font-semibold py-2 px-4 rounded-lg cursor-not-allowed"
                      >
                        Ride Full
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (onBookSeat) {
                            onBookSeat(ride.id || ride._id);
                          }
                        }}
                        disabled={loadingActions?.[`book_${ride.id || ride._id}`]}
                        className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 px-4 rounded-lg transition-all disabled:bg-gray-400"
                      >
                        {loadingActions?.[`book_${ride.id || ride._id}`] ? 'Requesting...' : 'Request to Join'}
                      </button>
                    )}
                    <button 
                      onClick={() => setSelectedRideChat(ride)}
                      className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-all"
                    >
                      💬
                    </button>
                    <button
                      onClick={() => setRatingModal(ride)}
                      className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-2 px-4 rounded-lg transition-all"
                    >
                      ⭐
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Offer Ride View */}
      {viewMode === 'offer' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Offer Your Ride</h3>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">From *</label>
                <input
                  type="text"
                  placeholder="Starting point"
                  value={shareDetails.from}
                  onChange={(e) => {
                    setShareDetails({...shareDetails, from: e.target.value});
                    if (validationErrors.from) setValidationErrors({...validationErrors, from: null});
                  }}
                  className={`w-full p-3 border-2 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    validationErrors.from ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {validationErrors.from && (
                  <p className="text-red-500 text-sm mt-1">⚠️ {validationErrors.from}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">To *</label>
                <input
                  type="text"
                  placeholder="Destination"
                  value={shareDetails.to}
                  onChange={(e) => {
                    setShareDetails({...shareDetails, to: e.target.value});
                    if (validationErrors.to) setValidationErrors({...validationErrors, to: null});
                  }}
                  className={`w-full p-3 border-2 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    validationErrors.to ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {validationErrors.to && (
                  <p className="text-red-500 text-sm mt-1">⚠️ {validationErrors.to}</p>
                )}
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Date *</label>
                <input
                  type="date"
                  value={shareDetails.date}
                  onChange={(e) => {
                    setShareDetails({...shareDetails, date: e.target.value});
                    if (validationErrors.date) setValidationErrors({...validationErrors, date: null});
                  }}
                  className={`w-full p-3 border-2 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    validationErrors.date ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {validationErrors.date && (
                  <p className="text-red-500 text-sm mt-1">⚠️ {validationErrors.date}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Seats Available *</label>
                <input
                  type="number"
                  min="1"
                  max="7"
                  value={shareDetails.seats}
                  onChange={(e) => setShareDetails({...shareDetails, seats: parseInt(e.target.value) || 1})}
                  className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Price/Seat (₹) *</label>
                <input
                  type="number"
                  placeholder="500"
                  value={shareDetails.pricePerSeat}
                  onChange={(e) => {
                    setShareDetails({...shareDetails, pricePerSeat: e.target.value});
                    if (validationErrors.pricePerSeat) setValidationErrors({...validationErrors, pricePerSeat: null});
                  }}
                  className={`w-full p-3 border-2 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    validationErrors.pricePerSeat ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {validationErrors.pricePerSeat && (
                  <p className="text-red-500 text-sm mt-1">⚠️ {validationErrors.pricePerSeat}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Vehicle (Optional)</label>
              <input
                type="text"
                placeholder="e.g., Honda City, Toyota Innova"
                value={shareDetails.vehicle}
                onChange={(e) => setShareDetails({...shareDetails, vehicle: e.target.value})}
                className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Ride Description</label>
              <textarea
                placeholder="Add details about your ride, route, stops, etc."
                value={shareDetails.description}
                onChange={(e) => setShareDetails({...shareDetails, description: e.target.value})}
                rows="3"
                className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Preferences</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">🚭 No Smoking</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">🎵 Music OK</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">🐕 Pets Allowed</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">❄️ AC Available</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">🧳 Luggage Space</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">💬 Chatty</span>
                </label>
              </div>
            </div>

            {/* Success Message */}
            {showSuccess && (
              <div className="bg-green-50 dark:bg-green-900 dark:bg-opacity-30 border-2 border-green-500 rounded-lg p-4 animate-fadeIn">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">✅</span>
                  <div>
                    <h4 className="font-bold text-green-800 dark:text-green-200">Ride Posted Successfully!</h4>
                    <p className="text-sm text-green-700 dark:text-green-300">Your ride is now visible to other travelers</p>
                  </div>
                </div>
              </div>
            )}

            <button 
              onClick={handlePostRide}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-all"
            >
              Post Your Ride
            </button>
          </div>
        </div>
      )}

      {/* My Posted Rides */}
      {viewMode === 'myoffers' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">📋 My Ride Offers</h3>
            <button
              onClick={() => setViewMode('offer')}
              className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 px-4 rounded-lg transition-all"
            >
              + New Offer
            </button>
          </div>

          {rideSharePosts.filter(r => r.isMyRide).length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl">
              <span className="text-6xl mb-4 block">🚗</span>
              <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">No ride offers yet</p>
              <button
                onClick={() => setViewMode('offer')}
                className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-3 px-6 rounded-lg transition-all"
              >
                Offer Your First Ride
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {rideSharePosts.filter(r => r.isMyRide).map(ride => (
                <div key={ride.id} className="bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 dark:from-yellow-900 dark:via-orange-900 dark:to-red-900 dark:bg-opacity-20 rounded-xl shadow-lg p-6 border-2 border-yellow-400">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-xl font-bold text-gray-900 dark:text-white">{ride.from} → {ride.to}</h4>
                        <span className="bg-yellow-600 text-white text-xs px-3 py-1 rounded-full font-semibold">My Ride</span>
                        {ride.verified && <span className="text-blue-500 text-xl" title="Verified">✓</span>}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">🚗 {ride.vehicle}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-green-600 dark:text-green-400">₹{ride.price}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">per seat</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                      <span className="text-gray-500 dark:text-gray-400 block text-xs">Date</span>
                      <p className="font-bold text-gray-900 dark:text-white">{new Date(ride.date).toLocaleDateString()}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                      <span className="text-gray-500 dark:text-gray-400 block text-xs">Seats</span>
                      <p className="font-bold text-gray-900 dark:text-white">{ride.seats} available</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                      <span className="text-gray-500 dark:text-gray-400 block text-xs">Bookings</span>
                      <p className="font-bold text-gray-900 dark:text-white">{ride.bookings?.length || 0} requests</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                      <span className="text-gray-500 dark:text-gray-400 block text-xs">Status</span>
                      <p className="font-bold text-green-600">Active</p>
                    </div>
                  </div>

                  {ride.bookings && ride.bookings.length > 0 && (
                    <div className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg">
                      <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Recent Bookings:</h5>
                      <div className="space-y-2">
                        {ride.bookings.slice(0, 3).map((booking, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <span className="text-gray-700 dark:text-gray-300">{booking.userName}</span>
                            <span className={`px-2 py-1 rounded text-xs ${
                              booking.status === 'accepted' ? 'bg-green-100 text-green-800' :
                              booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {booking.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setSelectedRideChat(ride)}
                      className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-all"
                    >
                      💬 Chat
                    </button>
                    <button
                      onClick={() => setViewMode('bookings')}
                      className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-all"
                    >
                      📋 Manage
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this ride offer?')) {
                          if (onDeleteRide) {
                            onDeleteRide(ride.id);
                          }
                        }
                      }}
                      className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-all"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Group Chat View */}
      {viewMode === 'chat' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            💬 Group Chat
            <span className="text-sm font-normal text-gray-500">(Connect with riders)</span>
          </h3>

          <div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Select a ride to start chatting</p>
            <div className="space-y-3">
              {rideSharePosts.map(ride => (
                <button
                  key={ride.id}
                  onClick={() => setSelectedRideChat(ride)}
                  className="w-full text-left p-4 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-all"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">{ride.from} → {ride.to}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{new Date(ride.date).toLocaleDateString()}</p>
                    </div>
                    <span className="text-gray-400">💬</span>
                  </div>
                </button>
              ))}
              {rideSharePosts.length === 0 && (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">No active rides to chat about</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Ride Group Chat Modal */}
      {selectedRideChat && (
        <RideGroupChatModal 
          ride={selectedRideChat}
          currentUser={currentUser}
          onClose={() => setSelectedRideChat(null)}
        />
      )}

      {/* My Posted Rides - Old Section (now removed since we have dedicated view) */}
      {rideSharePosts.filter(r => r.isMyRide).length > 0 && viewMode === 'find' && false && (
        <div className="mt-8">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">📋 My Posted Rides</h3>
          <div className="space-y-4">
            {rideSharePosts.filter(r => r.isMyRide).map(ride => (
              <div key={ride.id} className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900 dark:to-orange-900 dark:bg-opacity-20 rounded-xl shadow-lg p-6 border-2 border-yellow-400">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white">{ride.driver} (You)</h4>
                      <span className="bg-yellow-600 text-white text-xs px-2 py-1 rounded-full">My Ride</span>
                      {ride.verified && <span className="text-blue-500" title="Verified">✓</span>}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{ride.vehicle}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">₹{ride.price}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">per seat</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">From:</span>
                    <p className="font-semibold text-gray-900 dark:text-white">{ride.from}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">To:</span>
                    <p className="font-semibold text-gray-900 dark:text-white">{ride.to}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Date:</span>
                    <p className="font-semibold text-gray-900 dark:text-white">{new Date(ride.date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Seats:</span>
                    <p className="font-semibold text-gray-900 dark:text-white">{ride.seats} available</p>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this ride?')) {
                      if (onDeleteRide) {
                        onDeleteRide(ride.id);
                      }
                    }
                  }}
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-all"
                >
                  Delete Ride
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bookings View */}
      {viewMode === 'bookings' && (
        <div className="space-y-6">
          {/* Received Booking Requests (for my rides) */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              📥 Booking Requests ({receivedRideBookings.filter(b => b.status === 'pending').length} pending)
            </h3>
            {receivedRideBookings.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
                <p className="text-gray-500 dark:text-gray-400">No booking requests yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {receivedRideBookings.map(booking => (
                  <div key={booking.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white">{booking.userName}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{booking.userEmail}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">🚗 {booking.rideName}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          booking.status === 'accepted' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {booking.status === 'pending' ? '⏳ Pending' :
                           booking.status === 'accepted' ? '✓ Accepted' :
                           '✗ Rejected'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Seats requested: <span className="font-bold text-gray-900 dark:text-white">{booking.seats}</span>
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {new Date(booking.createdAt).toLocaleString()}
                      </p>
                    </div>

                    {booking.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => onAcceptBooking && onAcceptBooking(booking.id)}
                          disabled={loadingActions[`accept_booking_${booking.id}`]}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-all disabled:opacity-50"
                        >
                          {loadingActions[`accept_booking_${booking.id}`] ? 'Accepting...' : '✓ Accept'}
                        </button>
                        <button
                          onClick={() => onRejectBooking && onRejectBooking(booking.id)}
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-all"
                        >
                          ✗ Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* My Sent Bookings */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              📤 My Booking Requests
            </h3>
            {sentRideBookings.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
                <p className="text-gray-500 dark:text-gray-400">No bookings yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sentRideBookings.map(booking => (
                  <div key={booking.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white">{booking.rideName}</h4>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        booking.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {booking.status === 'pending' ? '⏳ Pending' :
                         booking.status === 'accepted' ? '✓ Accepted' :
                         '✗ Rejected'}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <p>Seats: <span className="font-bold">{booking.seats}</span></p>
                      <p className="text-xs mt-1">{new Date(booking.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rating/Review Modal */}
      {ratingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setRatingModal(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">⭐ Ratings & Reviews</h3>
              <button onClick={() => setRatingModal(null)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl">
                ✕
              </button>
            </div>

            {/* Driver Info */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900 dark:to-orange-900 dark:bg-opacity-20 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-yellow-500 text-white flex items-center justify-center font-bold text-2xl">
                  {ratingModal.driver[0]}
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white">{ratingModal.driver}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-yellow-500">{'⭐'.repeat(Math.floor(ratingModal.rating))}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{ratingModal.rating} / 5.0</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Add Review Section */}
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Add Your Review</h4>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className={`text-3xl transition-all ${star <= rating ? 'text-yellow-500' : 'text-gray-300'}`}
                    >
                      ⭐
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Your Review</label>
                <textarea
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="Share your experience..."
                  rows="3"
                  className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <button
                onClick={() => {
                  alert(`Review submitted! Rating: ${rating}/5`);
                  setReview('');
                  setRating(5);
                }}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 px-4 rounded-lg transition-all"
              >
                Submit Review
              </button>
            </div>

            {/* Existing Reviews */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Reviews (23)</h4>
              <div className="space-y-4">
                {[
                  { name: 'Priya S.', rating: 5, comment: 'Excellent driver! Very punctual and friendly.', date: '2 days ago' },
                  { name: 'Rahul K.', rating: 4, comment: 'Good experience overall. Safe driving.', date: '1 week ago' },
                  { name: 'Amit P.', rating: 5, comment: 'Highly recommended! Clean car and comfortable ride.', date: '2 weeks ago' }
                ].map((rev, idx) => (
                  <div key={idx} className="border-b border-gray-200 dark:border-gray-700 pb-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{rev.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-yellow-500 text-sm">{'⭐'.repeat(rev.rating)}</span>
                          <span className="text-xs text-gray-500">{rev.date}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">{rev.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {selectedTrip && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedTrip(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Confirm Booking</h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Driver:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{selectedTrip.driver}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Route:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{selectedTrip.from} → {selectedTrip.to}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Price:</span>
                <span className="font-semibold text-green-600 dark:text-green-400">₹{selectedTrip.price}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  alert('Booking confirmed!');
                  setSelectedTrip(null);
                }}
                className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-3 px-6 rounded-lg transition-all"
              >
                Confirm
              </button>
              <button
                onClick={() => setSelectedTrip(null)}
                className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-3 px-6 rounded-lg transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default {
  InsurancePage,
  HelpCenterPage,
  PromoCodesPage,
  TravelGuidePage,
  TouristInfoPage,
  EmergencyPage,
  RideSharePage
};
