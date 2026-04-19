import React, { useState, useEffect } from 'react';
import { 
  searchPlaces, 
  getWeather, 
  getTransportBookingUrls, 
  calculateDistance, 
  getSuggestedTransportModes 
} from './apiService';

// --- Helper: Icon Components ---
const HomeIcon = ({ active }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-6 h-6 ${active ? 'text-white' : 'text-gray-400'}`}>
    <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.69-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.061l8.69-8.69Z" />
    <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75v4.5a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z" />
  </svg>
);

const SearchIcon = ({ active }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-6 h-6 ${active ? 'text-white' : 'text-gray-400'}`}>
    <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z" clipRule="evenodd" />
  </svg>
);

const CreateIcon = ({ active }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-6 h-6 ${active ? 'text-white' : 'text-gray-400'}`}>
    <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 9a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V15a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V9Z" clipRule="evenodd" />
  </svg>
);

// --- Home Page (Trips Feed) ---
const HomePage = ({ trips }) => {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">My Trips</h2>
      {trips.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No trips yet. Search for destinations to plan your journey!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {trips.map((trip, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">{trip.from.name} → {trip.to.name}</h3>
                <span className="text-sm text-gray-500">{trip.date}</span>
              </div>
              <p className="text-gray-600">Distance: {trip.distance} km</p>
              <p className="text-gray-600">Suggested: {trip.suggestedMode}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- Travel Search Page ---
const TravelSearchPage = ({ setPage, setSearchData }) => {
  const [fromInput, setFromInput] = useState('');
  const [toInput, setToInput] = useState('');
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);
  const [selectedFrom, setSelectedFrom] = useState(null);
  const [selectedTo, setSelectedTo] = useState(null);
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);

  // Debounced search for FROM field
  useEffect(() => {
    if (fromInput.length < 2) {
      setFromSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const results = await searchPlaces(fromInput);
        setFromSuggestions(results);
        setShowFromDropdown(true);
      } catch (error) {
        console.error('Error searching places:', error);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [fromInput]);

  // Debounced search for TO field
  useEffect(() => {
    if (toInput.length < 2) {
      setToSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const results = await searchPlaces(toInput);
        setToSuggestions(results);
        setShowToDropdown(true);
      } catch (error) {
        console.error('Error searching places:', error);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [toInput]);

  const handleFromSelect = (place) => {
    setSelectedFrom(place);
    setFromInput(place.name);
    setShowFromDropdown(false);
  };

  const handleToSelect = (place) => {
    setSelectedTo(place);
    setToInput(place.name);
    setShowToDropdown(false);
  };

  const handleSearch = () => {
    if (!selectedFrom || !selectedTo) {
      alert('Please select both FROM and TO destinations');
      return;
    }

    setSearchData({
      from: selectedFrom,
      to: selectedTo
    });
    setPage('transport-results');
  };

  const handleSwap = () => {
    const temp = selectedFrom;
    setSelectedFrom(selectedTo);
    setSelectedTo(temp);
    setFromInput(toInput);
    setToInput(fromInput);
  };

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">🌍 Travel Planner</h1>
        <p className="text-gray-600 mt-2">Search destinations and find the best transport options</p>
      </div>

      {/* FROM Field */}
      <div className="mb-4 relative">
        <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
        <input
          type="text"
          value={fromInput}
          onChange={(e) => {
            setFromInput(e.target.value);
            setSelectedFrom(null);
          }}
          onFocus={() => fromSuggestions.length > 0 && setShowFromDropdown(true)}
          placeholder="Enter departure city..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        
        {showFromDropdown && fromSuggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {fromSuggestions.map((place) => (
              <div
                key={place.id}
                onClick={() => handleFromSelect(place)}
                className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
              >
                <div className="font-medium text-gray-800">{place.name}</div>
                <div className="text-sm text-gray-500">{place.formatted}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Swap Button */}
      <div className="flex justify-center my-2">
        <button
          onClick={handleSwap}
          className="p-2 rounded-full hover:bg-gray-100"
          title="Swap destinations"
        >
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        </button>
      </div>

      {/* TO Field */}
      <div className="mb-6 relative">
        <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
        <input
          type="text"
          value={toInput}
          onChange={(e) => {
            setToInput(e.target.value);
            setSelectedTo(null);
          }}
          onFocus={() => toSuggestions.length > 0 && setShowToDropdown(true)}
          placeholder="Enter destination city..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        
        {showToDropdown && toSuggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {toSuggestions.map((place) => (
              <div
                key={place.id}
                onClick={() => handleToSelect(place)}
                className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
              >
                <div className="font-medium text-gray-800">{place.name}</div>
                <div className="text-sm text-gray-500">{place.formatted}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={handleSearch}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
      >
        Search Transport Options
      </button>
    </div>
  );
};

// --- Transport Results Page ---
const TransportResultsPage = ({ searchData, setPage, addTrip }) => {
  const [fromWeather, setFromWeather] = useState(null);
  const [toWeather, setToWeather] = useState(null);
  const [distance, setDistance] = useState(0);
  const [transportModes, setTransportModes] = useState([]);
  const [bookingUrls, setBookingUrls] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch weather for both locations
        const [fromW, toW] = await Promise.all([
          getWeather(searchData.from.lat, searchData.from.lon),
          getWeather(searchData.to.lat, searchData.to.lon)
        ]);

        setFromWeather(fromW);
        setToWeather(toW);

        // Calculate distance
        const dist = calculateDistance(
          searchData.from.lat,
          searchData.from.lon,
          searchData.to.lat,
          searchData.to.lon
        );
        setDistance(dist);

        // Get transport suggestions
        const modes = getSuggestedTransportModes(dist);
        setTransportModes(modes);

        // Get booking URLs
        const urls = getTransportBookingUrls(searchData.from, searchData.to);
        setBookingUrls(urls);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching transport data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [searchData]);

  const handleSaveTrip = () => {
    const recommendedMode = transportModes.find(m => m.recommended);
    addTrip({
      from: searchData.from,
      to: searchData.to,
      distance: distance.toFixed(0),
      suggestedMode: recommendedMode?.label || 'Multiple options',
      date: new Date().toLocaleDateString()
    });
    alert('Trip saved!');
    setPage('home');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading transport options...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-24">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => setPage('search')}
          className="flex items-center text-blue-600 mb-4"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Search
        </button>
        <h2 className="text-2xl font-bold text-gray-800">Journey Overview</h2>
      </div>

      {/* Journey Details */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <p className="text-sm opacity-90">From</p>
            <p className="font-bold text-lg">{searchData.from.name}</p>
            {fromWeather && (
              <div className="flex items-center mt-2">
                <img 
                  src={`https://openweathermap.org/img/wn/${fromWeather.icon}@2x.png`} 
                  alt={fromWeather.description}
                  className="w-10 h-10"
                />
                <span className="ml-2">{fromWeather.temp}°C</span>
              </div>
            )}
          </div>
          
          <div className="px-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
          
          <div className="flex-1 text-right">
            <p className="text-sm opacity-90">To</p>
            <p className="font-bold text-lg">{searchData.to.name}</p>
            {toWeather && (
              <div className="flex items-center justify-end mt-2">
                <span className="mr-2">{toWeather.temp}°C</span>
                <img 
                  src={`https://openweathermap.org/img/wn/${toWeather.icon}@2x.png`} 
                  alt={toWeather.description}
                  className="w-10 h-10"
                />
              </div>
            )}
          </div>
        </div>
        
        <div className="text-center pt-4 border-t border-white/20">
          <p className="text-sm opacity-90">Distance</p>
          <p className="text-2xl font-bold">{distance.toFixed(0)} km</p>
        </div>
      </div>

      {/* Transport Options */}
      <h3 className="text-xl font-bold text-gray-800 mb-4">Recommended Transport</h3>
      
      <div className="space-y-3 mb-6">
        {transportModes.map((mode, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border-2 ${
              mode.recommended 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-200 bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-2xl mr-3">{mode.icon}</span>
                <div>
                  <p className="font-semibold text-gray-800">{mode.label}</p>
                  <p className="text-sm text-gray-600">{mode.type}</p>
                </div>
              </div>
              {mode.recommended && (
                <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full">
                  Recommended
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Booking Buttons */}
      <h3 className="text-xl font-bold text-gray-800 mb-4">Book Now</h3>
      
      <div className="grid grid-cols-2 gap-3">
        {bookingUrls.flight && (
          <a
            href={bookingUrls.flight}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 text-white py-3 px-4 rounded-lg text-center hover:bg-blue-700 transition-colors"
          >
            ✈️ Flights
          </a>
        )}
        
        {bookingUrls.train && (
          <a
            href={bookingUrls.train}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-orange-600 text-white py-3 px-4 rounded-lg text-center hover:bg-orange-700 transition-colors"
          >
            🚆 Trains
          </a>
        )}
        
        {bookingUrls.bus && (
          <a
            href={bookingUrls.bus}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-red-600 text-white py-3 px-4 rounded-lg text-center hover:bg-red-700 transition-colors"
          >
            🚌 Buses
          </a>
        )}
        
        {bookingUrls.taxi && (
          <a
            href={bookingUrls.taxi}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-black text-white py-3 px-4 rounded-lg text-center hover:bg-gray-800 transition-colors"
          >
            🚖 Taxi
          </a>
        )}
        
        {bookingUrls.rental && (
          <a
            href={bookingUrls.rental}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-purple-600 text-white py-3 px-4 rounded-lg text-center hover:bg-purple-700 transition-colors"
          >
            🚗 Car Rental
          </a>
        )}

        {bookingUrls.hotel && (
          <a
            href={bookingUrls.hotel}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-600 text-white py-3 px-4 rounded-lg text-center hover:bg-green-700 transition-colors"
          >
            🏨 Hotels
          </a>
        )}
      </div>

      {/* Save Trip Button */}
      <button
        onClick={handleSaveTrip}
        className="w-full mt-6 bg-gray-800 text-white py-3 rounded-lg font-semibold hover:bg-gray-900 transition-colors"
      >
        💾 Save This Trip
      </button>
    </div>
  );
};

// --- Main App Component ---
function App() {
  const [page, setPage] = useState('search'); // 'home' | 'search' | 'transport-results'
  const [searchData, setSearchData] = useState(null);
  const [trips, setTrips] = useState([]);

  const addTrip = (trip) => {
    setTrips([trip, ...trips]);
  };

  const renderPage = () => {
    switch (page) {
      case 'home':
        return <HomePage trips={trips} />;
      case 'search':
        return <TravelSearchPage setPage={setPage} setSearchData={setSearchData} />;
      case 'transport-results':
        return <TransportResultsPage searchData={searchData} setPage={setPage} addTrip={addTrip} />;
      default:
        return <TravelSearchPage setPage={setPage} setSearchData={setSearchData} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Logo/Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-4">
        <h1 className="text-2xl font-bold text-blue-600 text-center">🧳 TravelEasy</h1>
      </div>

      {/* Main Content */}
      <div className="pb-20">
        {renderPage()}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="flex justify-around items-center py-3">
          <button
            onClick={() => setPage('home')}
            className={`flex flex-col items-center space-y-1 px-4 py-2 rounded-lg transition-colors ${
              page === 'home' ? 'bg-blue-600' : 'hover:bg-gray-100'
            }`}
          >
            <HomeIcon active={page === 'home'} />
            <span className={`text-xs ${page === 'home' ? 'text-white' : 'text-gray-600'}`}>
              Home
            </span>
          </button>

          <button
            onClick={() => setPage('search')}
            className={`flex flex-col items-center space-y-1 px-4 py-2 rounded-lg transition-colors ${
              page === 'search' ? 'bg-blue-600' : 'hover:bg-gray-100'
            }`}
          >
            <SearchIcon active={page === 'search'} />
            <span className={`text-xs ${page === 'search' ? 'text-white' : 'text-gray-600'}`}>
              Search
            </span>
          </button>

          <button
            onClick={() => setPage('create')}
            className={`flex flex-col items-center space-y-1 px-4 py-2 rounded-lg transition-colors ${
              page === 'create' ? 'bg-blue-600' : 'hover:bg-gray-100'
            }`}
          >
            <CreateIcon active={page === 'create'} />
            <span className={`text-xs ${page === 'create' ? 'text-white' : 'text-gray-600'}`}>
              Create
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
