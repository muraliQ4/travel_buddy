import React, { useState, useEffect, useRef } from 'react';
import './styles.css';
import { 
  searchPlaces, 
  calculateDistance, 
  getSuggestedTransportModes,
  getTransportBookingUrls 
} from './apiService';
import { authAPI, tripsAPI, requestsAPI, storage, otpAPI, rideShareAPI } from './api';
import socketService from './socketService';
import { InsurancePage, HelpCenterPage, PromoCodesPage, TravelGuidePage, TouristInfoPage, EmergencyPage, RideSharePage } from './components/NewFeatures';
import ProfilePage from './components/ProfilePage';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/api\/?$/, '').replace(/\/+$/, '');

// --- Icon Components ---
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

const ProfileIcon = ({ active }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-6 h-6 ${active ? 'text-white' : 'text-gray-400'}`}>
    <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" clipRule="evenodd" />
  </svg>
);

const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.166a.75.75 0 0 0-1.06-1.06l-1.591 1.59a.75.75 0 1 0 1.06 1.061l1.591-1.59ZM21.75 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5H21a.75.75 0 0 1 .75.75ZM17.834 18.894a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 1 0-1.061 1.06l1.59 1.591ZM12 18a.75.75 0 0 1 .75.75V21a.75.75 0 0 1-1.5 0v-2.25A.75.75 0 0 1 12 18ZM7.758 17.303a.75.75 0 0 0-1.061-1.06l-1.591 1.59a.75.75 0 0 0 1.06 1.061l1.591-1.59ZM6 12a.75.75 0 0 1-.75.75H3a.75.75 0 0 1 0-1.5h2.25A.75.75 0 0 1 6 12ZM6.697 7.757a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 0 0-1.061 1.06l1.59 1.591Z" />
  </svg>
);

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.98 10.503 10.503 0 0 1-9.694 6.46c-5.799 0-10.5-4.7-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 0 1 .818.162Z" clipRule="evenodd" />
  </svg>
);

// Helper function to get proper transport icon
const getTransportIcon = (transport) => {
  if (!transport) return '🚗';
  const mode = transport.toLowerCase();
  
  if (mode.includes('car')) return '🚗';
  if (mode.includes('bike') || mode.includes('bicycle') || mode.includes('cycle')) return '🏍️';
  if (mode.includes('bus')) return '🚌';
  if (mode.includes('train') || mode.includes('railway')) return '🚆';
  if (mode.includes('flight') || mode.includes('plane') || mode.includes('air')) return '✈️';
  if (mode.includes('taxi') || mode.includes('cab')) return '🚖';
  if (mode.includes('walk')) return '🚶';
  if (mode.includes('ship') || mode.includes('boat') || mode.includes('ferry')) return '🚢';
  if (mode.includes('auto') || mode.includes('rickshaw')) return '🛺';
  
  return '🚗'; // default
};

const RequestsIcon = ({ active, count }) => (
  <div className="relative">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-6 h-6 ${active ? 'text-white' : 'text-gray-400'}`}>
      <path d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a4.403 4.403 0 0 0-1.032-.211 50.89 50.89 0 0 0-8.42 0c-2.358.196-4.04 2.19-4.04 4.434v4.286a4.47 4.47 0 0 0 2.433 3.984L7.28 21.53A.75.75 0 0 1 6 21v-4.03a48.527 48.527 0 0 1-1.087-.128C2.905 16.58 1.5 14.833 1.5 12.862V6.638c0-1.97 1.405-3.718 3.413-3.979Z" />
      <path d="M15.75 7.5c-1.376 0-2.739.057-4.086.169C10.124 7.797 9 9.103 9 10.609v4.285c0 1.507 1.128 2.814 2.67 2.94 1.243.102 2.5.157 3.768.165l2.782 2.781a.75.75 0 0 0 1.28-.53v-2.39l.33-.026c1.542-.125 2.67-1.433 2.67-2.94v-4.286c0-1.505-1.125-2.811-2.664-2.94A49.392 49.392 0 0 0 15.75 7.5Z" />
    </svg>
    {count > 0 && (
      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
        {count}
      </span>
    )}
  </div>
);

// --- HOME PAGE: Public Travel Plans Feed ---
const HomePage = ({ publicPlans, rideSharePosts, currentUser, onJoinRequest, myRequests, onLikeTrip, onManageMembers, loadingActions, onOpenChat, unreadMessages, sentRideBookings, onBookSeat, onLikeRide, setPage, setSelectedTrip }) => {
  const [filter, setFilter] = useState('all'); // 'all' | 'upcoming' | 'today'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showFeatureMenu, setShowFeatureMenu] = useState(false);
  const [loadingUserDetails, setLoadingUserDetails] = useState(false);

  // Function to fetch full user details
  const handleUserClick = async (member) => {
    console.log('=== Clicked member ===', member);
    
    // Check if member already has full data
    if (member && member.name && member.email && member.name !== 'Unknown User') {
      console.log('Member already has full data, showing directly');
      setSelectedUser(member);
      return;
    }
    
    const memberId = member._id || member.user?._id || member.user || member;
    console.log('Extracted Member ID:', memberId);
    
    // If memberId is not valid, show error
    if (!memberId || typeof memberId !== 'string') {
      console.error('Invalid member ID:', memberId);
      setSelectedUser({ name: 'Unknown User', email: '' });
      return;
    }
    
    setLoadingUserDetails(true);
    setSelectedUser(null); // Clear previous user
    
    try {
      const token = localStorage.getItem('token');
      console.log('Token present:', !!token);
      console.log('Fetching from URL:', `${API_BASE_URL}/api/auth/user/${memberId}`);
      
      const response = await fetch(`${API_BASE_URL}/api/auth/user/${memberId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (response.ok) {
        const userData = await response.json();
        console.log('✅ Successfully fetched user data:', userData);
        setSelectedUser(userData);
      } else {
        const errorText = await response.text();
        console.error('❌ Fetch failed:', response.status, errorText);
        // Show a user with the error info
        setSelectedUser({ 
          name: 'Unknown User', 
          email: `Error: ${response.status} - ${errorText}` 
        });
      }
    } catch (err) {
      console.error('❌ Exception while fetching:', err);
      setSelectedUser({ 
        name: 'Unknown User', 
        email: `Network error: ${err.message}` 
      });
    } finally {
      setLoadingUserDetails(false);
    }
  };

  // Feature cards data
  const newFeatures = [
    { id: 'tourist', name: '🎭 Tourist Info', desc: 'Places & culture', color: 'from-teal-500 to-cyan-500', page: 'tourist' },
    { id: 'emergency', name: '🚨 Emergency', desc: 'SOS & help', color: 'from-red-500 to-pink-600', page: 'emergency' },
    { id: 'rideshare', name: '🚗 Ride Share', desc: 'Share rides', color: 'from-yellow-500 to-orange-500', page: 'rideshare' },
    { id: 'travel-guide', name: '🗺️ Travel Guide', desc: 'Destinations & tips', color: 'from-purple-500 to-pink-500', page: 'travel-guide', hasImage: true },
    { id: 'insurance', name: '🛡️ Insurance', desc: 'Trip protection', color: 'from-blue-500 to-blue-600', page: 'insurance' },
    { id: 'help', name: '❓ Help Center', desc: 'Get support', color: 'from-indigo-500 to-purple-500', page: 'help' },
    { id: 'promos', name: '🎫 Promo Codes', desc: 'Save money', color: 'from-green-500 to-emerald-500', page: 'promos' }
  ];

  // Combine plans and ride shares
  const allItems = [
    ...publicPlans.map(p => ({ ...p, type: 'trip' })),
    ...(rideSharePosts || []).map(r => ({ ...r, type: 'rideshare' }))
  ];

  // Filter plans based on selected filter and search query
  const filteredPlans = allItems.filter(plan => {
    // Apply date filter
    let matchesFilter = true;
    if (filter === 'today') {
      matchesFilter = plan.date === new Date().toISOString().split('T')[0];
    } else if (filter === 'upcoming') {
      matchesFilter = new Date(plan.date) > new Date();
    }

    // Apply search query
    let matchesSearch = true;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      matchesSearch = 
        plan.title?.toLowerCase().includes(query) ||
        plan.from?.toLowerCase().includes(query) ||
        plan.to?.toLowerCase().includes(query) ||
        plan.transport?.toLowerCase().includes(query) ||
        plan.creator?.name?.toLowerCase().includes(query);
    }

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-teal-500 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative px-6 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Discover Your Next Adventure</h1>
          <p className="text-xl mb-6 opacity-90">Find travel buddies and explore the world together</p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mt-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search trips by destination, title, transport, or creator..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-full text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-white/30 shadow-lg text-lg"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* NEW FEATURES SECTION */}
      <div className="px-6 py-8 bg-white border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">🌟 New Features</h2>
          <button
            onClick={() => setShowFeatureMenu(!showFeatureMenu)}
            className="text-blue-600 font-semibold hover:text-blue-700"
          >
            {showFeatureMenu ? 'Hide' : 'View All'}
          </button>
        </div>
        
        {showFeatureMenu && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {newFeatures.map(feature => (
              <button
                key={feature.id}
                onClick={() => setPage(feature.page)}
                className={`bg-gradient-to-br ${feature.color} text-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105`}
              >
                <div className="text-2xl mb-2">{feature.name.split(' ')[0]}</div>
                <div className="font-semibold text-sm">{feature.name.substring(2)}</div>
                <div className="text-xs opacity-90 mt-1">{feature.desc}</div>
              </button>
            ))}
          </div>
        )}
        
        {!showFeatureMenu && (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {newFeatures.slice(0, 4).map(feature => (
              <button
                key={feature.id}
                onClick={() => setPage(feature.page)}
                className={`flex-shrink-0 bg-gradient-to-br ${feature.color} text-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all`}
              >
                <span className="font-semibold">{feature.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-6 pb-24">
        {/* Filter Tabs */}
        <div className="flex gap-3 mb-6 overflow-x-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-5 py-2.5 rounded-full whitespace-nowrap font-semibold transition-all ${filter === 'all' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
          >
            All Plans ({allItems.length})
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-5 py-2.5 rounded-full whitespace-nowrap font-semibold transition-all ${filter === 'upcoming' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter('today')}
            className={`px-5 py-2.5 rounded-full whitespace-nowrap font-semibold transition-all ${filter === 'today' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
          >
            Today
          </button>
        </div>

        {/* Search Results Info */}
        {searchQuery && (
          <div className="mb-4 text-gray-600">
            Found <span className="font-semibold">{filteredPlans.length}</span> trip{filteredPlans.length !== 1 ? 's' : ''} matching "{searchQuery}"
          </div>
        )}

        {/* Public Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlans.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-white rounded-xl shadow-sm">
            <div className="text-6xl mb-4">🌍</div>
            <p className="text-gray-500 text-lg">
              {searchQuery 
                ? `No trips found matching "${searchQuery}". Try a different search term!` 
                : filter === 'all' 
                  ? 'No public plans yet. Be the first to create one!' 
                  : `No ${filter} plans found.`}
            </p>
          </div>
        ) : (
          filteredPlans.map((plan) => {
            // Ride Share Card
            if (plan.type === 'rideshare') {
              const isMyRide = plan.driver === (currentUser?.name || 'You') || plan.isMyRide;
              const bookingForThisRide = sentRideBookings?.find(b => {
                const bookingRideId = b.ride?._id || b.ride || b.rideId;
                return bookingRideId === plan.id;
              });
              const alreadyBooked = bookingForThisRide && bookingForThisRide.status === 'pending';
              const isAccepted = bookingForThisRide && bookingForThisRide.status === 'accepted';
              const availableSeats = plan.seats - (plan.bookedSeats || 0);
              
              return (
                <div key={plan.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden">
                  {/* Card Image/Header - Yellow theme for ride shares */}
                  <div className="h-40 bg-gradient-to-br from-yellow-400 to-orange-400 relative">
                    <div className="absolute inset-0 flex items-center justify-center text-white">
                      <div className="text-center">
                        <div className="text-5xl mb-2">🚗</div>
                        <h3 className="font-bold text-xl">Ride Share</h3>
                      </div>
                    </div>
                    {isMyRide && (
                      <div className="absolute top-3 right-3 bg-yellow-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
                        My Ride
                      </div>
                    )}
                    {isAccepted && (
                      <div className="absolute top-3 left-3 bg-green-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
                        ✓ Booked
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-5">
                    {/* Date and Driver */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <span>📅</span>
                        <span>{new Date(plan.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>👤</span>
                        <span className="font-medium">{plan.driver}</span>
                      </div>
                    </div>

                    {/* Route */}
                    <div className="mb-4">
                      <div className="text-sm font-semibold text-gray-800">{plan.from}</div>
                      <div className="text-xs text-gray-500 my-1">↓</div>
                      <div className="text-sm font-semibold text-gray-800">{plan.to}</div>
                    </div>

                    {/* Vehicle & Seats */}
                    <div className="mb-4 flex items-center justify-between text-sm">
                      <div className="text-gray-600">
                        <span className="font-medium">🚙 {plan.vehicle || 'Vehicle'}</span>
                      </div>
                      <div className="text-gray-600">
                        <span className="font-medium">👥 {availableSeats}/{plan.seats} seats</span>
                      </div>
                    </div>

                    {/* Likes */}
                    <div className="flex items-center gap-2 mb-3">
                      <button
                        onClick={() => onLikeRide && onLikeRide(plan.id)}
                        className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-all ${
                          plan.isLiked 
                            ? 'bg-red-100 text-red-600' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <span>{plan.isLiked ? '❤️' : '🤍'}</span>
                        <span className="font-semibold">{plan.likesCount || 0}</span>
                      </button>
                      {plan.verified && (
                        <span className="text-blue-600 text-xs flex items-center gap-1">
                          <span>✓</span>
                          Verified
                        </span>
                      )}
                    </div>

                    {/* Price and Action */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-green-600 dark:text-green-400">₹{plan.price}</span>
                        <span className="text-xs text-gray-500">per seat</span>
                      </div>
                      
                      {/* Members and Chat buttons for ride members */}
                      {(isMyRide || isAccepted) && (
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => {
                              setSelectedTrip(plan);
                              setPage('rideshare-members');
                            }}
                            className="bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-semibold text-sm transition-all"
                          >
                            👥 Members ({plan.members?.length || 1})
                          </button>
                          <button
                            onClick={() => onOpenChat && onOpenChat(plan)}
                            className="bg-purple-500 hover:bg-purple-600 text-white py-2 rounded-lg font-semibold text-sm transition-all relative"
                          >
                            💬 Chat
                            {unreadMessages?.[plan._id] > 0 && (
                              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                                {unreadMessages[plan._id]}
                              </span>
                            )}
                          </button>
                        </div>
                      )}
                      
                      {isMyRide ? (
                        <button 
                          onClick={() => setPage('rideshare')}
                          className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-2.5 rounded-lg font-semibold hover:from-yellow-600 hover:to-orange-600 transition-all"
                        >
                          Manage Ride ({(plan.bookings || []).filter(b => b.status === 'pending').length} requests)
                        </button>
                      ) : isAccepted ? (
                        <button
                          onClick={() => setPage('rideshare')}
                          className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-2.5 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all flex items-center justify-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          ✅ Active - View Details
                        </button>
                      ) : alreadyBooked ? (
                        <button
                          disabled
                          className="w-full bg-yellow-500 text-white py-2.5 rounded-lg font-semibold cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          ⏳ Request Pending
                        </button>
                      ) : availableSeats > 0 ? (
                        <button
                          onClick={() => onBookSeat && onBookSeat(plan.id)}
                          disabled={loadingActions?.[`book_${plan.id}`]}
                          className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-2.5 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                        >
                          {loadingActions?.[`book_${plan.id}`] ? (
                            <>
                              <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Booking...
                            </>
                          ) : (
                            <>
                              🎫 Book Seat
                            </>
                          )}
                        </button>
                      ) : (
                        <button
                          disabled
                          className="w-full bg-gray-300 text-gray-600 py-2.5 rounded-lg font-semibold cursor-not-allowed"
                        >
                          🔒 Fully Booked
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            }

            // Regular Trip Card
            const requestForThisTrip = myRequests.find(r => {
              const reqTripId = r.trip?._id || r.trip || r.tripId;
              return reqTripId === plan._id;
            });
            const alreadyRequested = requestForThisTrip && requestForThisTrip.status === 'pending';
            const isAccepted = requestForThisTrip && requestForThisTrip.status === 'accepted';
            const isMember = plan.members.some(member => {
              const memberId = member._id || member.user?._id || member.user || member;
              return memberId && memberId.toString() === currentUser._id;
            });
            const isMyTrip = plan.creator._id === currentUser._id;
            
            return (
              <div key={plan._id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden">
                {/* Card Image/Header */}
                <div className="h-40 bg-gradient-to-br from-blue-400 to-teal-400 relative">
                  <div className="absolute inset-0 flex items-center justify-center text-white">
                    <div className="text-center">
                      <div className="text-5xl mb-2">📍</div>
                      <h3 className="font-bold text-xl">{plan.title}</h3>
                    </div>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5">
                  {/* Date and Transport */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <span>📅</span>
                      <span>{new Date(plan.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="text-xl">{getTransportIcon(plan.transport)}</span>
                        <span className="font-medium">{plan.transport}</span>
                      </div>
                      <button 
                        onClick={() => onLikeTrip(plan._id)}
                        className={`flex items-center gap-1 text-sm transition-all transform hover:scale-110 active:scale-95 ${plan.isLiked ? 'text-red-500 animate-pulse' : 'text-gray-500 hover:text-red-500'}`}
                      >
                        {plan.isLiked ? '❤️' : '🤍'} <span className="font-semibold">{plan.likesCount || 0}</span>
                      </button>
                    </div>
                  </div>

                  {/* Route */}
                  <div className="mb-4">
                    <div className="text-sm font-semibold text-gray-800">{plan.from}</div>
                    <div className="text-xs text-gray-500 my-1">↓</div>
                    <div className="text-sm font-semibold text-gray-800">{plan.to}</div>
                  </div>

                  {/* Buddies Joined */}
                  <div className="mb-4">
                    <div className="text-xs text-gray-500 mb-2">Buddies Joined</div>
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {plan.members?.slice(0, 3).map((member, idx) => (
                          <div 
                            key={idx} 
                            onClick={() => handleUserClick(member)}
                            className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-white flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:scale-110 hover:z-10 transition-transform"
                            title={`Click to view ${member.name}'s profile`}
                          >
                            {member.name?.charAt(0) || '🧑'}
                          </div>
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        {plan.members?.length || 0}/{plan.maxMembers}
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="space-y-2">
                    {isMyTrip ? (
                      <button 
                        onClick={() => onManageMembers(plan)}
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2.5 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all"
                      >
                        Manage Trip
                      </button>
                    ) : (isMember || isAccepted) ? (
                      <button 
                        onClick={() => onOpenChat && onOpenChat(plan)}
                        className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-2.5 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all relative"
                      >
                        Active
                        {unreadMessages?.[plan._id] > 0 && (
                          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold animate-pulse">
                            {unreadMessages[plan._id]}
                          </span>
                        )}
                      </button>
                    ) : alreadyRequested ? (
                      <button className="w-full bg-yellow-500 text-white py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 cursor-not-allowed" disabled>
                        <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        ⏳ Request Pending
                      </button>
                    ) : plan.members?.length >= plan.maxMembers ? (
                      <button className="w-full bg-gray-300 text-gray-600 py-2.5 rounded-lg font-semibold cursor-not-allowed" disabled>
                        🔒 Trip Full
                      </button>
                    ) : (
                      <button
                        onClick={() => onJoinRequest(plan._id)}
                        disabled={loadingActions?.[`join_${plan._id}`]}
                        className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white py-2.5 rounded-lg font-semibold hover:from-teal-600 hover:to-teal-700 transition-all disabled:from-gray-400 disabled:to-gray-400 transform hover:scale-105 active:scale-95"
                      >
                        <span className="flex items-center justify-center gap-2">
                          {loadingActions?.[`join_${plan._id}`] ? (
                            <>
                              <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Sending...
                            </>
                          ) : (
                            <>
                              Join
                            </>
                          )}
                        </span>
                      </button>
                    )}
                    <div className="flex items-center justify-end text-sm text-gray-600">
                      <span className="font-medium">📏 {plan.distance || 0} km</span>
                      <span className="text-gray-400 ml-1">• {((plan.distance || 0) * 0.621371).toFixed(1)} mi</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

        {/* Adventure Banner */}
        {filteredPlans.length > 0 && (
          <div className="mt-12 rounded-xl overflow-hidden shadow-2xl">
            <div className="relative h-96 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
              <div className="absolute inset-0 bg-black opacity-30"></div>
              <div className="relative h-full flex flex-col items-center justify-center text-white text-center px-6">
                <h2 className="text-5xl font-bold mb-4">Your Adventure</h2>
                <h2 className="text-5xl font-bold mb-6">Begins Here.</h2>
                <p className="text-xl opacity-90 max-w-2xl">
                  Join thousands of travelers exploring the world together
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Profile Modal */}
      {selectedUser && (
        <>
          {loadingUserDetails ? (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg p-8 shadow-xl">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading profile details...</p>
                </div>
              </div>
            </div>
          ) : (
            <UserProfileModal
              user={selectedUser}
              onClose={() => setSelectedUser(null)}
            />
          )}
        </>
      )}
    </div>
  );
};

// --- SEARCH PAGE: Direction & Transport Only ---
const SearchPage = ({ setPage, setSearchData }) => {
  const [fromInput, setFromInput] = useState('');
  const [toInput, setToInput] = useState('');
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);
  const [selectedFrom, setSelectedFrom] = useState(null);
  const [selectedTo, setSelectedTo] = useState(null);
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);

  useEffect(() => {
    if (fromInput.length < 2) {
      setFromSuggestions([]);
      setShowFromDropdown(false);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const results = await searchPlaces(fromInput);
        setFromSuggestions(results);
        if (results.length > 0 && !selectedFrom) {
          setShowFromDropdown(true);
        }
      } catch (error) {
        console.error('Error searching places:', error);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [fromInput, selectedFrom]);

  useEffect(() => {
    if (toInput.length < 2) {
      setToSuggestions([]);
      setShowToDropdown(false);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const results = await searchPlaces(toInput);
        setToSuggestions(results);
        if (results.length > 0 && !selectedTo) {
          setShowToDropdown(true);
        }
      } catch (error) {
        console.error('Error searching places:', error);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [toInput, selectedTo]);

  const handleSearch = () => {
    if (!selectedFrom || !selectedTo) {
      alert('Please select both FROM and TO destinations');
      return;
    }
    setSearchData({ from: selectedFrom, to: selectedTo });
    setPage('search-results');
  };

  return (
    <div className="p-4 pb-24">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">🗺️ Route Planner</h1>
      <p className="text-gray-600 mb-6">Find directions, distance & transport options</p>

      <div className="mb-4 relative">
        <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
        <input
          type="text"
          value={fromInput}
          onChange={(e) => { setFromInput(e.target.value); setSelectedFrom(null); setShowFromDropdown(true); }}
          onFocus={() => fromSuggestions.length > 0 && !selectedFrom && setShowFromDropdown(true)}
          onBlur={() => setTimeout(() => setShowFromDropdown(false), 200)}
          placeholder="Enter departure city..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        {showFromDropdown && fromSuggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {fromSuggestions.map((place) => (
              <div
                key={place.id}
                onMouseDown={(e) => {
                  e.preventDefault();
                  setSelectedFrom(place);
                  setFromInput(place.name);
                  setShowFromDropdown(false);
                }}
                className="px-4 py-3 hover:bg-blue-50 cursor-pointer"
              >
                <div className="font-medium">{place.name}</div>
                <div className="text-sm text-gray-500">{place.formatted}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-center my-2">
        <button
          onClick={() => {
            const temp = selectedFrom;
            setSelectedFrom(selectedTo);
            setSelectedTo(temp);
            setFromInput(toInput);
            setToInput(fromInput);
          }}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        </button>
      </div>

      <div className="mb-6 relative">
        <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
        <input
          type="text"
          value={toInput}
          onChange={(e) => { setToInput(e.target.value); setSelectedTo(null); setShowToDropdown(true); }}
          onFocus={() => toSuggestions.length > 0 && !selectedTo && setShowToDropdown(true)}
          onBlur={() => setTimeout(() => setShowToDropdown(false), 200)}
          placeholder="Enter destination city..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        {showToDropdown && toSuggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {toSuggestions.map((place) => (
              <div
                key={place.id}
                onMouseDown={(e) => {
                  e.preventDefault();
                  setSelectedTo(place);
                  setToInput(place.name);
                  setShowToDropdown(false);
                }}
                className="px-4 py-3 hover:bg-blue-50 cursor-pointer"
              >
                <div className="font-medium">{place.name}</div>
                <div className="text-sm text-gray-500">{place.formatted}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={handleSearch}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
      >
        🔍 Find Route & Transport
      </button>
    </div>
  );
};

// --- SEARCH RESULTS: Distance & Transport Options ---
const SearchResultsPage = ({ searchData, setPage }) => {
  const [distance, setDistance] = useState(0);
  const [transportModes, setTransportModes] = useState([]);
  const [bookingUrls, setBookingUrls] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDistance = async () => {
      setLoading(true);
      const dist = await calculateDistance(
        searchData.from.lat, searchData.from.lon,
        searchData.to.lat, searchData.to.lon
      );
      setDistance(dist);
      setTransportModes(getSuggestedTransportModes(dist));
      setBookingUrls(getTransportBookingUrls(searchData.from, searchData.to));
      setLoading(false);
    };
    
    fetchDistance();
  }, [searchData]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className="p-4 pb-24">
      <button onClick={() => setPage('search')} className="flex items-center text-blue-600 mb-4">
        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90">From</p>
            <p className="font-bold text-lg">{searchData.from.name}</p>
          </div>
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
          <div className="text-right">
            <p className="text-sm opacity-90">To</p>
            <p className="font-bold text-lg">{searchData.to.name}</p>
          </div>
        </div>
        <div className="text-center pt-4 mt-4 border-t border-white/20">
          <p className="text-sm opacity-90">Road Distance</p>
          <p className="text-3xl font-bold">{distance.toFixed(2)} km</p>
          <p className="text-sm opacity-75 mt-1">({(distance * 0.621371).toFixed(2)} miles)</p>
          <p className="text-xs opacity-60 mt-1">🚗 Actual driving distance</p>
        </div>
      </div>

      {/* Distance Details Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <span>�</span> Road Distance Details
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <p className="text-sm text-gray-600 mb-1">Kilometers</p>
            <p className="text-2xl font-bold text-blue-600">{distance.toFixed(2)} km</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-3 text-center">
            <p className="text-sm text-gray-600 mb-1">Miles</p>
            <p className="text-2xl font-bold text-purple-600">{(distance * 0.621371).toFixed(2)} mi</p>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Approx. Travel Time:</span>
            <span className="font-semibold text-gray-800">
              {distance < 100 ? '2-3 hours' : distance < 300 ? '4-6 hours' : distance < 800 ? '8-12 hours' : '1-2 days'}
            </span>
          </div>
          <p className="text-xs text-gray-500 text-center mt-2">
            ℹ️ This is the actual road distance, not straight-line distance
          </p>
        </div>
      </div>

      <h3 className="text-xl font-bold text-gray-800 mb-4">Available Transport</h3>
      <div className="space-y-3 mb-6">
        {transportModes.map((mode, index) => (
          <div key={index} className={`p-4 rounded-lg border-2 ${mode.recommended ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-2xl mr-3">{mode.icon}</span>
                <div>
                  <p className="font-semibold text-gray-800">{mode.label}</p>
                  <p className="text-sm text-gray-600">{mode.type}</p>
                </div>
              </div>
              {mode.recommended && <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full">Best</span>}
            </div>
          </div>
        ))}
      </div>

      <h3 className="text-xl font-bold text-gray-800 mb-4">Book Now</h3>
      <div className="grid grid-cols-2 gap-3">
        {bookingUrls.flight && <a href={bookingUrls.flight} target="_blank" rel="noopener noreferrer" className="bg-blue-600 text-white py-3 px-4 rounded-lg text-center hover:bg-blue-700">✈️ Flights</a>}
        {bookingUrls.train && <a href={bookingUrls.train} target="_blank" rel="noopener noreferrer" className="bg-orange-600 text-white py-3 px-4 rounded-lg text-center hover:bg-orange-700">🚆 Trains</a>}
        {bookingUrls.bus && <a href={bookingUrls.bus} target="_blank" rel="noopener noreferrer" className="bg-red-600 text-white py-3 px-4 rounded-lg text-center hover:bg-red-700">🚌 Buses</a>}
        {bookingUrls.taxi && <a href={bookingUrls.taxi} target="_blank" rel="noopener noreferrer" className="bg-black text-white py-3 px-4 rounded-lg text-center hover:bg-gray-800">🚖 Taxi</a>}
      </div>
    </div>
  );
};

// --- CREATE PAGE: Create Public Travel Plan ---
const CreatePage = ({ currentUser, onCreatePlan, setPage }) => {
  const [title, setTitle] = useState('');
  const [fromInput, setFromInput] = useState('');
  const [toInput, setToInput] = useState('');
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);
  const [selectedFrom, setSelectedFrom] = useState(null);
  const [selectedTo, setSelectedTo] = useState(null);
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [date, setDate] = useState('');
  const [maxMembers, setMaxMembers] = useState(4);
  const [transport, setTransport] = useState('Car');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [errors, setErrors] = useState({});
  
  // Refs for scrolling to error fields
  const titleRef = useRef(null);
  const fromRef = useRef(null);
  const toRef = useRef(null);
  const dateRef = useRef(null);

  // Pre-fill from Travel Guide
  useEffect(() => {
    const travelGuideData = sessionStorage.getItem('travelGuideDestination');
    if (travelGuideData) {
      try {
        const data = JSON.parse(travelGuideData);
        if (data.destination) {
          setToInput(data.destination);
          setTitle(data.destination || '');
        }
        if (data.description) {
          setDescription(data.description);
        }
        // Clear the session storage after using
        sessionStorage.removeItem('travelGuideDestination');
      } catch (error) {
        console.error('Error parsing travel guide data:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (fromInput.length < 2) { setFromSuggestions([]); return; }
    const timer = setTimeout(async () => {
      try {
        const results = await searchPlaces(fromInput);
        setFromSuggestions(results);
        setShowFromDropdown(true);
      } catch (error) { console.error(error); }
    }, 300);
    return () => clearTimeout(timer);
  }, [fromInput]);

  useEffect(() => {
    if (toInput.length < 2) { setToSuggestions([]); return; }
    const timer = setTimeout(async () => {
      try {
        const results = await searchPlaces(toInput);
        setToSuggestions(results);
        setShowToDropdown(true);
      } catch (error) { console.error(error); }
    }, 300);
    return () => clearTimeout(timer);
  }, [toInput]);

  const handleCreate = async () => {
    const newErrors = {};
    if (!title) newErrors.title = true;
    if (!selectedFrom) newErrors.from = true;
    if (!selectedTo) newErrors.to = true;
    if (!date) newErrors.date = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      
      // Scroll to first error field
      setTimeout(() => {
        if (newErrors.title && titleRef.current) {
          titleRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
          titleRef.current.focus();
        } else if (newErrors.from && fromRef.current) {
          fromRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
          fromRef.current.focus();
        } else if (newErrors.to && toRef.current) {
          toRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
          toRef.current.focus();
        } else if (newErrors.date && dateRef.current) {
          dateRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
          dateRef.current.focus();
        }
      }, 100);
      
      return;
    }

    setErrors({});

    // Calculate actual road distance
    const distance = await calculateDistance(
      selectedFrom.lat, selectedFrom.lon,
      selectedTo.lat, selectedTo.lon
    );

    const tripData = {
      title,
      from: selectedFrom.name,
      to: selectedTo.name,
      fromData: selectedFrom,
      toData: selectedTo,
      date,
      maxMembers: parseInt(maxMembers),
      transport,
      description,
      distance: distance.toFixed(2),
      isPublic
    };

    onCreatePlan(tripData);
    
    // Reset form
    setTitle('');
    setFromInput('');
    setToInput('');
    setSelectedFrom(null);
    setSelectedTo(null);
    setDate('');
    setDescription('');
  };

  return (
    <div className="p-4 pb-24">
      <button
        onClick={() => setPage('home')}
        className="mb-4 flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition-all"
      >
        <span className="text-xl">←</span> Back to Home
      </button>

      <h1 className="text-3xl font-bold text-gray-800 mb-2">✨ Create Travel Plan</h1>
      <p className="text-gray-600 mb-6">Plan a trip and invite others to join!</p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Plan Title *</label>
          <input
            ref={titleRef}
            type="text"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setErrors({...errors, title: false}); }}
            placeholder="e.g., Weekend trip to Goa"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.title ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">Please enter a plan title</p>}
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">From *</label>
          <input
            ref={fromRef}
            type="text"
            value={fromInput}
            onChange={(e) => { setFromInput(e.target.value); setSelectedFrom(null); setErrors({...errors, from: false}); }}
            onFocus={() => fromSuggestions.length > 0 && setShowFromDropdown(true)}
            placeholder="Departure city"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.from ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
          />
          {errors.from && <p className="text-red-500 text-sm mt-1">Please select a departure city</p>}
          {showFromDropdown && fromSuggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {fromSuggestions.map((place) => (
                <div key={place.id} onClick={() => { setSelectedFrom(place); setFromInput(place.name); setShowFromDropdown(false); setErrors({...errors, from: false}); }} className="px-4 py-2 hover:bg-blue-50 cursor-pointer">
                  <div className="font-medium text-sm">{place.name}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">To *</label>
          <input
            ref={toRef}
            type="text"
            value={toInput}
            onChange={(e) => { setToInput(e.target.value); setSelectedTo(null); setErrors({...errors, to: false}); }}
            onFocus={() => toSuggestions.length > 0 && setShowToDropdown(true)}
            placeholder="Destination city"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.to ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
          />
          {errors.to && <p className="text-red-500 text-sm mt-1">Please select a destination city</p>}
          {showToDropdown && toSuggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {toSuggestions.map((place) => (
                <div key={place.id} onClick={() => { setSelectedTo(place); setToInput(place.name); setShowToDropdown(false); setErrors({...errors, to: false}); }} className="px-4 py-2 hover:bg-blue-50 cursor-pointer">
                  <div className="font-medium text-sm">{place.name}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Travel Date *</label>
          <input
            ref={dateRef}
            type="date"
            value={date}
            onChange={(e) => { setDate(e.target.value); setErrors({...errors, date: false}); }}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.date ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
          />
          {errors.date && <p className="text-red-500 text-sm mt-1">Please select a travel date</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Transport Mode</label>
          <select
            value={transport}
            onChange={(e) => setTransport(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option>Car</option>
            <option>Bus</option>
            <option>Train</option>
            <option>Flight</option>
            <option>Bike</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Max Team Members</label>
          <input
            type="number"
            value={maxMembers}
            onChange={(e) => setMaxMembers(e.target.value)}
            min="2"
            max="20"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell others about your trip plan..."
            rows="3"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-3 bg-blue-50 p-4 rounded-lg">
          <input
            type="checkbox"
            id="public"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="w-5 h-5"
          />
          <label htmlFor="public" className="text-sm text-gray-700">
            <span className="font-semibold">Make this plan public</span>
            <p className="text-gray-600">Others can see and request to join your trip</p>
          </label>
        </div>

        <button
          onClick={handleCreate}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
        >
          🚀 Create Plan
        </button>
      </div>
    </div>
  );
};

// --- REQUESTS PAGE: Manage Join Requests ---
const RequestsPage = ({ receivedRequests, sentRequests, onAcceptRequest, onRejectRequest, currentUser, loadingActions, setPage }) => {
  const [tab, setTab] = useState('received'); // 'received' | 'sent'

  return (
    <div className="p-4 pb-24">
      {/* Back Button */}
      <button
        onClick={() => setPage('home')}
        className="mb-4 flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition-all"
      >
        <span className="text-xl">←</span> Back to Home
      </button>

      <h1 className="text-3xl font-bold text-gray-800 mb-6">📬 Requests</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('received')}
          className={`flex-1 py-2 rounded-lg font-semibold ${tab === 'received' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Received ({receivedRequests.length})
        </button>
        <button
          onClick={() => setTab('sent')}
          className={`flex-1 py-2 rounded-lg font-semibold ${tab === 'sent' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Sent ({sentRequests.length})
        </button>
      </div>

      {/* Received Requests */}
      {tab === 'received' && (
        <div className="space-y-3">
          {receivedRequests.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No requests received</p>
          ) : (
            receivedRequests.map((request) => (
              <div key={request._id} className="bg-white rounded-lg shadow p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-800">{request.userName}</p>
                    <p className="text-sm text-gray-500">wants to join "{request.tripTitle}"</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(request.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                {request.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => onAcceptRequest(request._id)}
                      disabled={loadingActions?.[`accept_${request._id}`]}
                      className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400"
                    >
                      {loadingActions?.[`accept_${request._id}`] ? 'Accepting...' : 'Accept'}
                    </button>
                    <button
                      onClick={() => onRejectRequest(request._id)}
                      disabled={loadingActions?.[`reject_${request._id}`]}
                      className="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-400"
                    >
                      {loadingActions?.[`reject_${request._id}`] ? 'Rejecting...' : 'Reject'}
                    </button>
                  </div>
                )}
                {request.status === 'accepted' && (
                  <div className="bg-green-100 text-green-700 py-2 rounded-lg text-center font-semibold">✓ Accepted</div>
                )}
                {request.status === 'rejected' && (
                  <div className="bg-red-100 text-red-700 py-2 rounded-lg text-center font-semibold">✗ Rejected</div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Sent Requests */}
      {tab === 'sent' && (
        <div className="space-y-3">
          {sentRequests.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No requests sent</p>
          ) : (
            sentRequests.map((request) => (
              <div key={request._id} className="bg-white rounded-lg shadow p-4">
                <div className="mb-3">
                  <p className="font-semibold text-gray-800">{request.tripTitle}</p>
                  <p className="text-sm text-gray-500">Request to {request.creatorName}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(request.createdAt).toLocaleDateString()}</p>
                </div>
                {request.status === 'pending' && (
                  <div className="bg-yellow-100 text-yellow-700 py-2 rounded-lg text-center font-semibold">⏳ Pending</div>
                )}
                {request.status === 'accepted' && (
                  <div className="bg-green-100 text-green-700 py-2 rounded-lg text-center font-semibold">✓ Accepted</div>
                )}
                {request.status === 'rejected' && (
                  <div className="bg-red-100 text-red-700 py-2 rounded-lg text-center font-semibold">✗ Rejected</div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

// --- PROFILE PAGE: Imported from ./components/ProfilePage.jsx ---

// --- TRIP DETAIL MODAL (for viewing trip details from profile page) ---
const TripDetailModal = ({ trip, onClose }) => {
  if (!trip) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-gray-900">{trip.title || trip.destination}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <span className="text-gray-600">Date:</span>
              <span className="ml-2 font-semibold">{new Date(trip.startDate || trip.date).toLocaleDateString()}</span>
              {trip.endDate && <span> - {new Date(trip.endDate).toLocaleDateString()}</span>}
            </div>
            {trip.from && trip.to && (
              <div>
                <span className="text-gray-600">Route:</span>
                <span className="ml-2 font-semibold">{trip.from} → {trip.to}</span>
              </div>
            )}
            {trip.description && (
              <div>
                <span className="text-gray-600">Description:</span>
                <p className="mt-1 text-gray-700">{trip.description}</p>
              </div>
            )}
            <div>
              <span className="text-gray-600">Members:</span>
              <span className="ml-2 font-semibold">{trip.members?.length || 0}/{trip.maxMembers}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- USER PROFILE MODAL ---
const UserProfileModal = ({ user, onClose }) => {
  if (!user) return null;

  // Check if we have minimal user data
  const hasFullData = user.name && user.name !== 'Unknown User';
                      if (file) {
                        if (file.size > 5 * 1024 * 1024) {
                          alert('File size must be less than 5MB');
                          return;
                        }
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setPhotoPreview(reader.result);
                          setProfilePhoto(reader.result);
                          setShowPhotoMenu(false);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  {/* Edit Badge */}
                  <button
                    type="button"
                    className="absolute -bottom-1 -right-1 bg-blue-600 rounded-full p-1.5 shadow-lg cursor-pointer hover:bg-blue-700 transition-all"
                    onClick={() => setShowPhotoMenu(!showPhotoMenu)}
                    title="Edit photo"
                  >
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>

                  {/* Photo Menu Modal */}
                  {showPhotoMenu && (
                    <>
                      {/* Backdrop */}
                      <div 
                        className="fixed inset-0 bg-black bg-opacity-50 z-40"
                        onClick={() => setShowPhotoMenu(false)}
                      />
                      {/* Menu */}
                      <div className="absolute top-full right-0 mt-2 w-64 bg-gray-800 rounded-2xl shadow-2xl z-50 overflow-hidden">
                        <button
                          type="button"
                          onClick={() => {
                            fileInputRef.current?.click();
                          }}
                          className="w-full flex items-center gap-4 px-6 py-4 text-white hover:bg-gray-700 transition-colors text-left"
                        >
                          <div className="w-10 h-10 flex items-center justify-center">
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <span className="text-lg">Choose from library</span>
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => {
                            fileInputRef.current?.click();
                          }}
                          className="w-full flex items-center gap-4 px-6 py-4 text-white hover:bg-gray-700 transition-colors text-left"
                        >
                          <div className="w-10 h-10 flex items-center justify-center">
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <span className="text-lg">Take photo</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            alert('Facebook import coming soon!');
                            setShowPhotoMenu(false);
                          }}
                          className="w-full flex items-center gap-4 px-6 py-4 text-white hover:bg-gray-700 transition-colors text-left"
                        >
                          <div className="w-10 h-10 flex items-center justify-center">
                            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                          </div>
                          <span className="text-lg">Import from Facebook</span>
                        </button>

                        <div className="h-px bg-gray-700" />

                        <button
                          type="button"
                          onClick={() => {
                            setPhotoPreview('');
                            setProfilePhoto('');
                            setShowPhotoMenu(false);
                          }}
                          className="w-full flex items-center gap-4 px-6 py-4 text-red-500 hover:bg-gray-700 transition-colors text-left"
                        >
                          <div className="w-10 h-10 flex items-center justify-center">
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </div>
                          <span className="text-lg font-semibold">Delete</span>
                        </button>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
            <div className="flex-1">
              {isEditing ? (
                <div className="text-gray-500 text-sm italic">Edit your information below</div>
              ) : (
                <>
                  <h2 className="text-3xl font-bold text-gray-800 mb-1">{currentUser.name}</h2>
                  <p className="text-gray-600 mb-4">{currentUser.email}</p>
                </>
              )}
              
              {/* Stats */}
              <div className="flex gap-8 mb-4">
                <div className="text-center">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    <span className="text-2xl font-bold text-gray-800">{totalTrips}</span>
                  </div>
                  <div className="text-sm text-gray-600">Trips</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="text-2xl font-bold text-gray-800">{totalBuddies}</span>
                  </div>
                  <div className="text-sm text-gray-600">Buddies</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span className="text-2xl font-bold text-gray-800">{totalDistance.toLocaleString()}</span>
                  </div>
                  <div className="text-sm text-gray-600">km <span className="text-gray-400">• {(totalDistance * 0.621371).toLocaleString(undefined, {maximumFractionDigits: 0})} mi</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details & Actions */}
          {isEditing ? (
            <div className="space-y-4">
              {/* Required Fields Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border-2 border-blue-200">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span>⭐</span> Required Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      required
                      className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1">Email Address *</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      required
                      className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-1">Phone Number *</label>
                      <div className="flex gap-2">
                        <select
                          value={phone.startsWith('+') ? phone.split(' ')[0] : '+1'}
                          onChange={(e) => {
                            const code = e.target.value;
                            const number = phone.includes(' ') ? phone.split(' ').slice(1).join(' ') : '';
                            setPhone(code + (number ? ' ' + number : ''));
                          }}
                          className="w-28 px-2 py-2.5 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none text-sm"
                        >
                          <option value="+1">🇺🇸 +1</option>
                          <option value="+91">🇮🇳 +91</option>
                          <option value="+44">🇬🇧 +44</option>
                          <option value="+61">🇦🇺 +61</option>
                          <option value="+86">🇨🇳 +86</option>
                          <option value="+81">🇯🇵 +81</option>
                          <option value="+82">🇰🇷 +82</option>
                          <option value="+33">🇫🇷 +33</option>
                          <option value="+49">🇩🇪 +49</option>
                          <option value="+39">🇮🇹 +39</option>
                          <option value="+34">🇪🇸 +34</option>
                          <option value="+7">🇷🇺 +7</option>
                          <option value="+55">🇧🇷 +55</option>
                          <option value="+52">🇲🇽 +52</option>
                          <option value="+27">🇿🇦 +27</option>
                          <option value="+20">🇪🇬 +20</option>
                          <option value="+971">🇦🇪 +971</option>
                          <option value="+966">🇸🇦 +966</option>
                          <option value="+90">🇹🇷 +90</option>
                          <option value="+65">🇸🇬 +65</option>
                          <option value="+60">🇲🇾 +60</option>
                          <option value="+62">🇮🇩 +62</option>
                          <option value="+63">🇵🇭 +63</option>
                          <option value="+84">🇻🇳 +84</option>
                          <option value="+66">🇹🇭 +66</option>
                          <option value="+64">🇳🇿 +64</option>
                          <option value="+31">🇳🇱 +31</option>
                          <option value="+41">🇨🇭 +41</option>
                          <option value="+46">🇸🇪 +46</option>
                          <option value="+47">🇳🇴 +47</option>
                          <option value="+45">🇩🇰 +45</option>
                          <option value="+48">🇵🇱 +48</option>
                          <option value="+30">🇬🇷 +30</option>
                          <option value="+351">🇵🇹 +351</option>
                          <option value="+353">🇮🇪 +353</option>
                          <option value="+43">🇦🇹 +43</option>
                          <option value="+32">🇧🇪 +32</option>
                        </select>
                        <input
                          type="tel"
                          value={phone.includes(' ') ? phone.split(' ').slice(1).join(' ') : phone.replace(/^\+\d+/, '')}
                          onChange={(e) => {
                            const code = phone.startsWith('+') ? phone.split(' ')[0] : '+1';
                            const number = e.target.value.replace(/[^0-9]/g, '');
                            setPhone(code + (number ? ' ' + number : ''));
                          }}
                          placeholder="234 567 8900"
                          required
                          className="flex-1 px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-1">Username *</label>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="@username"
                        required
                        className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-1">Country *</label>
                      <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        required
                        className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
                      >
                        <option value="">Select Country</option>
                        <option value="United States">🇺🇸 United States</option>
                        <option value="India">🇮🇳 India</option>
                        <option value="United Kingdom">🇬🇧 United Kingdom</option>
                        <option value="Canada">🇨🇦 Canada</option>
                        <option value="Australia">🇦🇺 Australia</option>
                        <option value="Germany">🇩🇪 Germany</option>
                        <option value="France">🇫🇷 France</option>
                        <option value="Italy">🇮🇹 Italy</option>
                        <option value="Spain">🇪🇸 Spain</option>
                        <option value="Japan">🇯🇵 Japan</option>
                        <option value="China">🇨🇳 China</option>
                        <option value="South Korea">🇰🇷 South Korea</option>
                        <option value="Brazil">🇧🇷 Brazil</option>
                        <option value="Mexico">🇲🇽 Mexico</option>
                        <option value="Argentina">🇦🇷 Argentina</option>
                        <option value="South Africa">🇿🇦 South Africa</option>
                        <option value="Egypt">🇪🇬 Egypt</option>
                        <option value="UAE">🇦🇪 United Arab Emirates</option>
                        <option value="Saudi Arabia">🇸🇦 Saudi Arabia</option>
                        <option value="Turkey">🇹🇷 Turkey</option>
                        <option value="Russia">🇷🇺 Russia</option>
                        <option value="Thailand">🇹🇭 Thailand</option>
                        <option value="Singapore">🇸🇬 Singapore</option>
                        <option value="Malaysia">🇲🇾 Malaysia</option>
                        <option value="Indonesia">🇮🇩 Indonesia</option>
                        <option value="Philippines">🇵🇭 Philippines</option>
                        <option value="Vietnam">🇻🇳 Vietnam</option>
                        <option value="New Zealand">🇳🇿 New Zealand</option>
                        <option value="Netherlands">🇳🇱 Netherlands</option>
                        <option value="Switzerland">🇨🇭 Switzerland</option>
                        <option value="Sweden">🇸🇪 Sweden</option>
                        <option value="Norway">🇳🇴 Norway</option>
                        <option value="Denmark">🇩🇰 Denmark</option>
                        <option value="Poland">🇵🇱 Poland</option>
                        <option value="Greece">🇬🇷 Greece</option>
                        <option value="Portugal">🇵🇹 Portugal</option>
                        <option value="Ireland">🇮🇪 Ireland</option>
                        <option value="Austria">🇦🇹 Austria</option>
                        <option value="Belgium">🇧🇪 Belgium</option>
                        <option value="Czech Republic">🇨🇿 Czech Republic</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-1">City *</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Your city"
                        required
                        className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1">Password (leave blank to keep current)</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter new password to change"
                      className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Optional Common Fields Section */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span>👤</span> Personal Details
                </h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-1">Date of Birth</label>
                      <input
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-1">Gender</label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1">Nationality</label>
                    <select
                      value={nationality}
                      onChange={(e) => setNationality(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none"
                    >
                      <option value="">Select Nationality</option>
                      <option value="American">American</option>
                      <option value="Indian">Indian</option>
                      <option value="British">British</option>
                      <option value="Canadian">Canadian</option>
                      <option value="Australian">Australian</option>
                      <option value="German">German</option>
                      <option value="French">French</option>
                      <option value="Italian">Italian</option>
                      <option value="Spanish">Spanish</option>
                      <option value="Japanese">Japanese</option>
                      <option value="Chinese">Chinese</option>
                      <option value="Korean">Korean</option>
                      <option value="Brazilian">Brazilian</option>
                      <option value="Mexican">Mexican</option>
                      <option value="Argentine">Argentine</option>
                      <option value="South African">South African</option>
                      <option value="Egyptian">Egyptian</option>
                      <option value="Emirati">Emirati</option>
                      <option value="Saudi">Saudi</option>
                      <option value="Turkish">Turkish</option>
                      <option value="Russian">Russian</option>
                      <option value="Thai">Thai</option>
                      <option value="Singaporean">Singaporean</option>
                      <option value="Malaysian">Malaysian</option>
                      <option value="Indonesian">Indonesian</option>
                      <option value="Filipino">Filipino</option>
                      <option value="Vietnamese">Vietnamese</option>
                      <option value="New Zealander">New Zealander</option>
                      <option value="Dutch">Dutch</option>
                      <option value="Swiss">Swiss</option>
                      <option value="Swedish">Swedish</option>
                      <option value="Norwegian">Norwegian</option>
                      <option value="Danish">Danish</option>
                      <option value="Polish">Polish</option>
                      <option value="Greek">Greek</option>
                      <option value="Portuguese">Portuguese</option>
                      <option value="Irish">Irish</option>
                      <option value="Austrian">Austrian</option>
                      <option value="Belgian">Belgian</option>
                      <option value="Czech">Czech</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Location Details Section */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span>📍</span> Location Details
                </h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Full Address (optional)"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none"
                  />
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Languages You Speak</label>
                    <div className="border border-gray-300 rounded-lg p-3 bg-white">
                      <div className="flex flex-wrap gap-2">
                        {['English', 'Hindi', 'Spanish', 'Mandarin', 'French', 'German', 'Italian', 'Portuguese', 'Russian', 'Japanese', 'Korean', 'Arabic', 'Turkish', 'Dutch', 'Swedish', 'Polish', 'Thai', 'Vietnamese', 'Indonesian', 'Tagalog', 'Bengali', 'Tamil', 'Telugu', 'Marathi'].map(lang => {
                          const selectedLangs = languages.split(',').map(l => l.trim()).filter(Boolean);
                          const isSelected = selectedLangs.includes(lang);
                          return (
                            <button
                              key={lang}
                              type="button"
                              onClick={() => {
                                if (isSelected) {
                                  // Remove language
                                  const updated = selectedLangs.filter(l => l !== lang);
                                  setLanguages(updated.join(', '));
                                } else {
                                  // Add language
                                  setLanguages([...selectedLangs, lang].join(', '));
                                }
                              }}
                              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                                isSelected 
                                  ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700' 
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {isSelected && '✓ '}{lang}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Click to select/deselect languages</p>
                  </div>
                </div>
              </div>



              {/* About Section */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span>✨</span> About Me
                </h3>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell others about yourself, your travel experiences, and what you're looking for in travel buddies..."
                  rows="3"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Travel Preferences Section */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span>✈️</span> Travel Preferences
                </h3>
                <div className="space-y-3">
                  <select
                    value={travelerType}
                    onChange={(e) => setTravelerType(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Type of Traveler</option>
                    <option value="Solo">Solo Traveler</option>
                    <option value="Family">Family Traveler</option>
                    <option value="Friends">With Friends</option>
                    <option value="Couple">Couple</option>
                    <option value="Business">Business Traveler</option>
                  </select>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Travel Interests</label>
                    <div className="border border-gray-300 rounded-lg p-3 bg-white">
                      <div className="flex flex-wrap gap-2">
                        {[
                          { name: 'Beaches', emoji: '🏖️' },
                          { name: 'Mountains', emoji: '⛰️' },
                          { name: 'Adventure', emoji: '🎢' },
                          { name: 'Culture', emoji: '🏛️' },
                          { name: 'Food', emoji: '🍜' },
                          { name: 'Wildlife', emoji: '🦁' },
                          { name: 'Photography', emoji: '📷' },
                          { name: 'Nightlife', emoji: '🎉' },
                          { name: 'Shopping', emoji: '🛍️' },
                          { name: 'Relaxation', emoji: '🧘' },
                          { name: 'Sports', emoji: '⚽' },
                          { name: 'Festivals', emoji: '🎭' },
                          { name: 'Road Trips', emoji: '🚗' },
                          { name: 'Hiking', emoji: '🥾' },
                          { name: 'Water Sports', emoji: '🏄' }
                        ].map(interest => {
                          const selectedInterests = interests.split(',').map(i => i.trim()).filter(Boolean);
                          const isSelected = selectedInterests.includes(interest.name);
                          return (
                            <button
                              key={interest.name}
                              type="button"
                              onClick={() => {
                                if (isSelected) {
                                  const updated = selectedInterests.filter(i => i !== interest.name);
                                  setInterests(updated.join(', '));
                                } else {
                                  setInterests([...selectedInterests, interest.name].join(', '));
                                }
                              }}
                              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                                isSelected 
                                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:from-blue-700 hover:to-indigo-700' 
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {interest.emoji} {interest.name} {isSelected && '✓'}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Click to select/deselect your interests</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Preferred Destinations</label>
                    <div className="border border-gray-300 rounded-lg p-3 bg-white max-h-80 overflow-y-auto">
                      {/* India */}
                      <div className="mb-3">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">India</div>
                        <div className="flex flex-wrap gap-2">
                          {['Goa', 'Kerala', 'Rajasthan', 'Himachal Pradesh', 'Uttarakhand', 'Kashmir', 'Mumbai', 'Delhi', 'Bangalore'].map(dest => {
                            const selectedDests = preferredDestinations.split(',').map(d => d.trim()).filter(Boolean);
                            const isSelected = selectedDests.includes(dest);
                            return (
                              <button
                                key={dest}
                                type="button"
                                onClick={() => {
                                  if (isSelected) {
                                    const updated = selectedDests.filter(d => d !== dest);
                                    setPreferredDestinations(updated.join(', '));
                                  } else {
                                    setPreferredDestinations([...selectedDests, dest].join(', '));
                                  }
                                }}
                                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                                  isSelected 
                                    ? 'bg-green-600 text-white shadow-md hover:bg-green-700' 
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                              >
                                {isSelected && '✓ '}{dest}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      {/* Asia */}
                      <div className="mb-3">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Asia</div>
                        <div className="flex flex-wrap gap-2">
                          {['Dubai', 'Singapore', 'Thailand', 'Bali', 'Japan', 'South Korea', 'Vietnam', 'Malaysia'].map(dest => {
                            const selectedDests = preferredDestinations.split(',').map(d => d.trim()).filter(Boolean);
                            const isSelected = selectedDests.includes(dest);
                            return (
                              <button
                                key={dest}
                                type="button"
                                onClick={() => {
                                  if (isSelected) {
                                    const updated = selectedDests.filter(d => d !== dest);
                                    setPreferredDestinations(updated.join(', '));
                                  } else {
                                    setPreferredDestinations([...selectedDests, dest].join(', '));
                                  }
                                }}
                                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                                  isSelected 
                                    ? 'bg-teal-600 text-white shadow-md hover:bg-teal-700' 
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                              >
                                {isSelected && '✓ '}{dest}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      {/* Europe */}
                      <div className="mb-3">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Europe</div>
                        <div className="flex flex-wrap gap-2">
                          {['Paris', 'London', 'Rome', 'Barcelona', 'Amsterdam', 'Switzerland', 'Greece', 'Iceland'].map(dest => {
                            const selectedDests = preferredDestinations.split(',').map(d => d.trim()).filter(Boolean);
                            const isSelected = selectedDests.includes(dest);
                            return (
                              <button
                                key={dest}
                                type="button"
                                onClick={() => {
                                  if (isSelected) {
                                    const updated = selectedDests.filter(d => d !== dest);
                                    setPreferredDestinations(updated.join(', '));
                                  } else {
                                    setPreferredDestinations([...selectedDests, dest].join(', '));
                                  }
                                }}
                                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                                  isSelected 
                                    ? 'bg-purple-600 text-white shadow-md hover:bg-purple-700' 
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                              >
                                {isSelected && '✓ '}{dest}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      {/* Americas */}
                      <div className="mb-3">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Americas</div>
                        <div className="flex flex-wrap gap-2">
                          {['New York', 'Los Angeles', 'Miami', 'Mexico', 'Brazil', 'Canada'].map(dest => {
                            const selectedDests = preferredDestinations.split(',').map(d => d.trim()).filter(Boolean);
                            const isSelected = selectedDests.includes(dest);
                            return (
                              <button
                                key={dest}
                                type="button"
                                onClick={() => {
                                  if (isSelected) {
                                    const updated = selectedDests.filter(d => d !== dest);
                                    setPreferredDestinations(updated.join(', '));
                                  } else {
                                    setPreferredDestinations([...selectedDests, dest].join(', '));
                                  }
                                }}
                                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                                  isSelected 
                                    ? 'bg-red-600 text-white shadow-md hover:bg-red-700' 
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                              >
                                {isSelected && '✓ '}{dest}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      {/* Others */}
                      <div>
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Others</div>
                        <div className="flex flex-wrap gap-2">
                          {['Australia', 'New Zealand', 'South Africa', 'Maldives'].map(dest => {
                            const selectedDests = preferredDestinations.split(',').map(d => d.trim()).filter(Boolean);
                            const isSelected = selectedDests.includes(dest);
                            return (
                              <button
                                key={dest}
                                type="button"
                                onClick={() => {
                                  if (isSelected) {
                                    const updated = selectedDests.filter(d => d !== dest);
                                    setPreferredDestinations(updated.join(', '));
                                  } else {
                                    setPreferredDestinations([...selectedDests, dest].join(', '));
                                  }
                                }}
                                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                                  isSelected 
                                    ? 'bg-orange-600 text-white shadow-md hover:bg-orange-700' 
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                              >
                                {isSelected && '✓ '}{dest}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Click to select/deselect destinations</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Travel Style</label>
                    <select
                      value={travelStyle}
                      onChange={(e) => setTravelStyle(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none"
                    >
                      <option value="">Select Travel Style</option>
                      <option value="Budget">Budget - Hostels & Local Transport</option>
                      <option value="Comfort">Comfort - Mid-range Hotels</option>
                      <option value="Luxury">Luxury - Premium Experience</option>
                      <option value="Adventure">Adventure - Outdoor Activities</option>
                      <option value="Relaxed">Relaxed - Slow Travel</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1">Preferred Season</label>
                    <select
                      value={preferredSeason}
                      onChange={(e) => setPreferredSeason(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none"
                    >
                      <option value="">Select Season</option>
                      <option value="Spring">🌸 Spring (Mar-May)</option>
                      <option value="Summer">☀️ Summer (Jun-Aug)</option>
                      <option value="Autumn">🍂 Autumn (Sep-Nov)</option>
                      <option value="Winter">❄️ Winter (Dec-Feb)</option>
                      <option value="Monsoon">🌧️ Monsoon</option>
                      <option value="All Year">🌍 All Year Round</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Social Links Section */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span>🔗</span> Social Media
                </h3>
                <input
                  type="text"
                  value={instagramHandle}
                  onChange={(e) => setInstagramHandle(e.target.value)}
                  placeholder="📸 Instagram handle (e.g., @username)"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button onClick={handleSave} className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700">💾 Save Changes</button>
                <button onClick={() => setIsEditing(false)} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300">Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-6">
                {/* Username Badge */}
                {username && (
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full font-semibold shadow-md">
                      <span>👤</span>
                      <span>@{username}</span>
                    </div>
                  </div>
                )}
                
                {/* Personal Information Card */}
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <span className="text-lg">📋</span> Personal Information
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {phone && (
                      <div className="bg-blue-50 px-3 py-2 rounded-lg">
                        <div className="text-xs text-gray-500 mb-1">Phone</div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">📱</span>
                          <span className="text-sm font-medium text-gray-700">{phone}</span>
                        </div>
                      </div>
                    )}
                    {gender && (
                      <div className="bg-purple-50 px-3 py-2 rounded-lg">
                        <div className="text-xs text-gray-500 mb-1">Gender</div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{gender === 'Male' ? '👨' : gender === 'Female' ? '👩' : '🧑'}</span>
                          <span className="text-sm font-medium text-gray-700">{gender}</span>
                        </div>
                      </div>
                    )}
                    {dateOfBirth && (
                      <div className="bg-pink-50 px-3 py-2 rounded-lg">
                        <div className="text-xs text-gray-500 mb-1">Date of Birth</div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">🎂</span>
                          <span className="text-sm font-medium text-gray-700">{new Date(dateOfBirth).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                        </div>
                      </div>
                    )}
                    {nationality && (
                      <div className="bg-yellow-50 px-3 py-2 rounded-lg">
                        <div className="text-xs text-gray-500 mb-1">Nationality</div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">🏳️</span>
                          <span className="text-sm font-medium text-gray-700">{nationality}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Location Card */}
                {(country || city || location) && (
                  <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-3 flex items-center gap-2">
                      <span className="text-lg">📍</span> Location
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {country && (
                        <div className="bg-green-50 px-3 py-2 rounded-lg">
                          <div className="text-xs text-gray-500 mb-1">Country</div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">🌎</span>
                            <span className="text-sm font-medium text-gray-700">{country}</span>
                          </div>
                        </div>
                      )}
                      {city && (
                        <div className="bg-green-50 px-3 py-2 rounded-lg">
                          <div className="text-xs text-gray-500 mb-1">City</div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">🏙️</span>
                            <span className="text-sm font-medium text-gray-700">{city}</span>
                          </div>
                        </div>
                      )}
                      {location && (
                        <div className="bg-green-50 px-3 py-2 rounded-lg col-span-full">
                          <div className="text-xs text-gray-500 mb-1">Full Address</div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">📮</span>
                            <span className="text-sm font-medium text-gray-700">{location}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* About Me Card */}
                {bio && (
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-4">
                    <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-2 flex items-center gap-2">
                      <span className="text-lg">✨</span> About Me
                    </h4>
                    <p className="text-gray-700 leading-relaxed italic">{bio}</p>
                  </div>
                )}

                {/* Travel Profile Card */}
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <span className="text-lg">✈️</span> Travel Profile
                  </h4>
                  
                  {/* Traveler Type */}
                  {travelerType && (
                    <div className="mb-3">
                      <div className="text-xs text-gray-500 mb-2">Traveler Type</div>
                      <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-full font-semibold text-sm shadow-sm">
                        <span>🎒</span>
                        <span>{travelerType} Traveler</span>
                      </div>
                    </div>
                  )}

                  {/* Travel Interests */}
                  {interests && (
                    <div className="mb-3">
                      <div className="text-xs text-gray-500 mb-2">Travel Interests</div>
                      <div className="flex flex-wrap gap-2">
                        {interests.split(',').map((interest, i) => (
                          <span key={i} className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-xs font-semibold">
                            {interest.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Preferred Destinations */}
                  {preferredDestinations && (
                    <div className="mb-3">
                      <div className="text-xs text-gray-500 mb-2">Preferred Destinations</div>
                      <div className="flex flex-wrap gap-2">
                        {preferredDestinations.split(',').map((dest, i) => (
                          <span key={i} className="bg-teal-100 text-teal-700 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1">
                            <span>🌴</span>
                            <span>{dest.trim()}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Travel Preferences Grid */}
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    {travelStyle && (
                      <div className="bg-purple-50 px-3 py-2 rounded-lg">
                        <div className="text-xs text-gray-500 mb-1">Style</div>
                        <div className="text-sm font-medium text-gray-700">{travelStyle}</div>
                      </div>
                    )}
                    {preferredSeason && (
                      <div className="bg-orange-50 px-3 py-2 rounded-lg">
                        <div className="text-xs text-gray-500 mb-1">Season</div>
                        <div className="text-sm font-medium text-gray-700">{preferredSeason}</div>
                      </div>
                    )}
                    {languages && (
                      <div className="bg-green-50 px-3 py-2 rounded-lg">
                        <div className="text-xs text-gray-500 mb-1">Languages</div>
                        <div className="text-sm font-medium text-gray-700">{languages}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Social Media Card */}
                {instagramHandle && (
                  <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl border border-pink-100 p-4">
                    <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-3 flex items-center gap-2">
                      <span className="text-lg">🔗</span> Social Media
                    </h4>
                    <a 
                      href={`https://instagram.com/${instagramHandle.replace('@', '')}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all font-semibold shadow-md"
                    >
                      <span>📸</span>
                      <span>{instagramHandle}</span>
                      <span className="text-xs">→</span>
                    </a>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setIsEditing(true)} className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg">
                  ✏️ Edit Profile
                </button>
                <button onClick={onLogout} className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg">
                  🚪 Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto flex">
          <button
            onClick={() => setActiveTab('myPlans')}
            className={`flex-1 py-4 px-6 font-semibold transition-colors ${activeTab === 'myPlans' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
          >
            My Plans <span className="ml-1 text-sm">({myPlans.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('joinedTrips')}
            className={`flex-1 py-4 px-6 font-semibold transition-colors ${activeTab === 'joinedTrips' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
          >
            <span className="flex items-center justify-center gap-2">
              Joined <span className="ml-1 text-sm">({joinedTrips?.length || 0})</span>
            </span>
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 py-4 px-6 font-semibold transition-colors relative ${activeTab === 'pending' ? 'text-yellow-600 border-b-2 border-yellow-600' : 'text-gray-600 hover:text-gray-800'}`}
          >
            <span className="flex items-center justify-center gap-2">
              Pending
              <span className={`ml-1 text-sm px-2 py-0.5 rounded-full ${activeTab === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100'}`}>
                {pendingTrips?.length || 0}
              </span>
            </span>
            {pendingTrips?.length > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
            )}
          </button>
        </div>
      </div>

      {/* Trip Grid */}
      <div className="max-w-4xl mx-auto p-6">
        {activeTab === 'myPlans' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {myPlans.length === 0 ? (
              <div className="col-span-full text-center py-16">
                <div className="text-6xl mb-4">📍</div>
                <p className="text-gray-500">No plans created yet</p>
              </div>
            ) : (
              myPlans.map((plan) => (
                <div 
                  key={plan._id} 
                  className="aspect-square rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setViewingTrip(plan)}
                >
                  <div className="h-full bg-gradient-to-br from-blue-400 to-teal-400 p-4 flex flex-col justify-between">
                    <div className="text-white">
                      <div className="text-2xl mb-2">📍</div>
                      <div className="font-semibold text-sm">{plan.title}</div>
                    </div>
                    <div className="text-white text-xs">
                      <div>{new Date(plan.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                      <div className="opacity-90">{plan.members?.length || 0}/{plan.maxMembers} joined</div>
                      <div className="opacity-90 mt-1">📏 {plan.distance || 0} km ({((plan.distance || 0) * 0.621371).toFixed(0)} mi)</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
        {activeTab === 'joinedTrips' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {!joinedTrips || joinedTrips.length === 0 ? (
              <div className="col-span-full text-center py-16">
                <div className="text-6xl mb-4">🎒</div>
                <p className="text-gray-500">No joined trips yet</p>
                <p className="text-sm text-gray-400 mt-2">Join trips from the home page to see them here</p>
              </div>
            ) : (
              joinedTrips.map((trip) => (
                <div 
                  key={trip._id} 
                  className="aspect-square rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setViewingTrip(trip)}
                >
                  <div className="h-full bg-gradient-to-br from-green-400 to-teal-400 p-4 flex flex-col justify-between">
                    <div className="text-white">
                      <div className="text-2xl mb-2">🌍</div>
                      <div className="font-semibold text-sm">{trip.title}</div>
                      <div className="text-xs opacity-90 mt-1">{trip.from} → {trip.to}</div>
                    </div>
                    <div className="text-white text-xs">
                      <div>{new Date(trip.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                      <div className="opacity-90">{trip.members?.length || 0}/{trip.maxMembers} members</div>
                      <div className="opacity-90 mt-1">📏 {trip.distance || 0} km ({((trip.distance || 0) * 0.621371).toFixed(0)} mi)</div>
                      <div className="text-xs bg-white bg-opacity-20 rounded px-2 py-1 mt-2 inline-block">
                        Created by {trip.creator?.name || 'Unknown'}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
        {activeTab === 'pending' && (
          <div className="space-y-4">
            {!pendingTrips || pendingTrips.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">⏳</div>
                <p className="text-gray-500">No pending requests</p>
                <p className="text-sm text-gray-400 mt-2">Send requests to join trips from the home page</p>
              </div>
            ) : (
              pendingTrips.map((trip) => (
                <div 
                  key={trip._id} 
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6 border-l-4 border-yellow-400"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center text-3xl flex-shrink-0">
                      ⏳
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-gray-800 mb-1 truncate">{trip.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{trip.from} → {trip.to}</p>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="px-2 py-1 bg-yellow-50 text-yellow-700 rounded-full font-medium flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Waiting for approval
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                          {new Date(trip.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                          {trip.members?.length || 0}/{trip.maxMembers} members
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Created by {trip.creator?.name || 'Unknown'}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Trip Detail Modal */}
      {viewingTrip && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setViewingTrip(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="h-48 bg-gradient-to-br from-blue-400 to-teal-400 relative rounded-t-2xl">
              <button 
                onClick={() => setViewingTrip(null)}
                className="absolute top-4 right-4 text-white bg-black bg-opacity-30 hover:bg-opacity-50 rounded-full p-2 transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <div className="text-6xl mb-3">🎈</div>
                <h2 className="font-bold text-3xl text-center px-4">{viewingTrip.title}</h2>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Date and Transport */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b">
                <div className="flex items-center gap-2 text-gray-700">
                  <span className="text-xl">📅</span>
                  <span className="font-medium">{new Date(viewingTrip.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2 text-gray-700">
                    <span className="text-2xl">{getTransportIcon(viewingTrip.transport)}</span>
                    <span className="font-medium">{viewingTrip.transport}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500">
                    {viewingTrip.isLiked ? '❤️' : '🤍'} <span className="text-sm">{viewingTrip.likesCount || 0}</span>
                  </div>
                </div>
              </div>

              {/* Route */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-3">{viewingTrip.from}</h3>
                <div className="flex items-center text-gray-400 mb-2">
                  <div className="w-full h-px bg-gray-300"></div>
                  <span className="px-3 text-2xl">↓</span>
                  <div className="w-full h-px bg-gray-300"></div>
                </div>
                <h3 className="text-lg font-bold text-gray-800">{viewingTrip.to}</h3>
              </div>

              {/* Buddies Joined */}
              <div className="mb-6">
                <div className="text-sm text-gray-500 mb-3">Buddies Joined</div>
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-3">
                    {viewingTrip.members?.map((member, idx) => (
                      member.profilePhoto ? (
                        <img 
                          key={idx}
                          src={member.profilePhoto}
                          alt={member.name}
                          className="w-10 h-10 rounded-full border-2 border-white object-cover hover:scale-110 hover:z-10 transition-transform cursor-pointer"
                          title={member.name}
                        />
                      ) : (
                        <div 
                          key={idx} 
                          className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-white flex items-center justify-center text-white text-sm font-bold hover:scale-110 hover:z-10 transition-transform cursor-pointer"
                          title={member.name}
                        >
                          {member.name?.charAt(0) || '👤'}
                        </div>
                      )
                    ))}
                  </div>
                  <span className="text-gray-600 font-medium">
                    {viewingTrip.members?.length || 0}/{viewingTrip.maxMembers}
                  </span>
                </div>
              </div>

              {/* Distance */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between text-gray-700">
                  <span className="text-sm">Distance</span>
                  <span className="font-semibold">📏 {viewingTrip.distance || 0} km • {((viewingTrip.distance || 0) * 0.621371).toFixed(1)} mi</span>
                </div>
              </div>

              {/* Open Chat Button */}
              <button 
                onClick={() => {
                  setViewingTrip(null);
                  onOpenChat && onOpenChat(viewingTrip);
                }}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl font-bold text-lg hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl"
              >
                Open Chat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- USER PROFILE MODAL ---
const UserProfileModal = ({ user, onClose }) => {
  if (!user) return null;

  // Check if we have minimal user data
  const hasFullData = user.name && user.name !== 'Unknown User';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {!hasFullData ? (
          /* Show message when data is not available */
          <div className="p-8 text-center">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4">
              👤
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Profile Not Available</h2>
            <p className="text-gray-600 mb-6">This user's profile information is not available at the moment.</p>
            <button
              onClick={onClose}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            {/* Header with Profile Photo */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-t-lg">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                  {user.profilePhoto ? (
                    <img 
                      src={user.profilePhoto} 
                      alt={user.name}
                      className="w-20 h-20 rounded-full border-4 border-white shadow-lg object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full border-4 border-white flex items-center justify-center text-3xl font-bold shadow-lg">
                      {user.name?.charAt(0)?.toUpperCase() || '👤'}
                    </div>
                  )}
                  <div>
                    <h2 className="text-2xl font-bold">{user.name || 'Unknown User'}</h2>
                    {user.email && <p className="text-sm opacity-90">📧 {user.email}</p>}
                    {user.username && <p className="text-sm opacity-90">@{user.username}</p>}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-all"
                >
                  ✕
                </button>
              </div>
            </div>

        {/* Profile Details */}
        <div className="p-6 space-y-6">
          
          {/* Personal Information */}
          {(user.email || user.phone || user.dateOfBirth || user.gender || user.nationality) && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span>📋</span> Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {user.email && (
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium text-gray-700">{user.email}</p>
                  </div>
                )}
                {user.phone && (
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm font-medium text-gray-700">{user.phone}</p>
                  </div>
                )}
                {user.dateOfBirth && (
                  <div>
                    <p className="text-xs text-gray-500">Date of Birth</p>
                    <p className="text-sm font-medium text-gray-700">
                      {(() => {
                        try {
                          const date = new Date(user.dateOfBirth);
                          return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                        } catch {
                          return user.dateOfBirth;
                        }
                      })()}
                    </p>
                  </div>
                )}
                {user.gender && (
                  <div>
                    <p className="text-xs text-gray-500">Gender</p>
                    <p className="text-sm font-medium text-gray-700">{user.gender}</p>
                  </div>
                )}
                {user.nationality && (
                  <div>
                    <p className="text-xs text-gray-500">Nationality</p>
                    <p className="text-sm font-medium text-gray-700">{user.nationality}</p>
                  </div>
                )}
                {(user.country || user.city) && (
                  <div className="col-span-full">
                    <p className="text-xs text-gray-500">Location</p>
                    <p className="text-sm font-medium text-gray-700">
                      {[user.city, user.country].filter(Boolean).join(', ')}
                    </p>
                  </div>
                )}
                {user.location && (
                  <div className="col-span-full">
                    <p className="text-xs text-gray-500">Full Address</p>
                    <p className="text-sm font-medium text-gray-700">{user.location}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* About Me */}
          {user.bio && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
              <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                <span>✨</span> About Me
              </h3>
              <p className="text-gray-700 leading-relaxed">{user.bio}</p>
            </div>
          )}

          {/* Travel Profile */}
          {(user.travelerType || user.interests || user.languages || user.travelStyle) && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span>✈️</span> Travel Profile
              </h3>
              
              {user.travelerType && (
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-1">Traveler Type</p>
                  <span className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-full font-semibold text-sm shadow-sm">
                    <span>🎒</span> {user.travelerType} Traveler
                  </span>
                </div>
              )}

              {user.interests && (
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-2">Travel Interests</p>
                  <div className="flex flex-wrap gap-2">
                    {user.interests.split(',').map((interest, i) => (
                      <span key={i} className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-sm font-medium">
                        {interest.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {user.languages && (
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-2">Languages</p>
                  <div className="flex flex-wrap gap-2">
                    {user.languages.split(',').map((lang, i) => (
                      <span key={i} className="bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-sm font-medium">
                        {lang.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {user.travelStyle && (
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-1">Travel Style</p>
                  <span className="inline-block bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg text-sm font-medium">
                    {user.travelStyle}
                  </span>
                </div>
              )}

              {user.preferredDestinations && (
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-2">Preferred Destinations</p>
                  <div className="flex flex-wrap gap-2">
                    {user.preferredDestinations.split(',').map((dest, i) => (
                      <span key={i} className="bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full text-sm font-medium">
                        {dest.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {user.budgetRange && (
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-1">Budget Range</p>
                  <span className="inline-block bg-teal-100 text-teal-700 px-3 py-1.5 rounded-lg text-sm font-medium">
                    💰 {user.budgetRange}
                  </span>
                </div>
              )}

              {user.preferredSeason && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Preferred Season</p>
                  <span className="inline-block bg-pink-100 text-pink-700 px-3 py-1.5 rounded-lg text-sm font-medium">
                    {user.preferredSeason}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Social Media */}
          {user.instagramHandle && (
            <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg p-4 border border-pink-100">
              <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                <span>🔗</span> Social Media
              </h3>
              <a 
                href={`https://instagram.com/${user.instagramHandle.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-700 font-medium"
              >
                📸 {user.instagramHandle}
              </a>
            </div>
          )}

          {/* Member Since */}
          {user.createdAt && (
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Member since {new Date(user.createdAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          )}

          {/* Stats Section */}
          {(user.tripsCount || user.buddiesCount || user.distance) && (
            <div className="grid grid-cols-3 gap-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
              {user.tripsCount !== undefined && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{user.tripsCount || 0}</div>
                  <div className="text-xs text-gray-600">Trips</div>
                </div>
              )}
              {user.buddiesCount !== undefined && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{user.buddiesCount || 0}</div>
                  <div className="text-xs text-gray-600">Buddies</div>
                </div>
              )}
              {user.distance !== undefined && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{user.distance || 0}</div>
                  <div className="text-xs text-gray-600">km</div>
                </div>
              )}
            </div>
          )}
        </div>
      </>
        )}
      </div>
    </div>
  );
};

// --- GROUP CHAT MODAL ---
const GroupChatModal = ({ trip, currentUser, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showMembers, setShowMembers] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [members, setMembers] = useState(trip.members || []);
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
      if (trip.members && trip.members.length > 0 && trip.members[0].name) {
        setMembers(trip.members);
        return;
      }

      // If members are just IDs, fetch full details
      if (trip.members && trip.members.length > 0) {
        try {
          const memberPromises = trip.members.map(async (memberId) => {
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
          setMembers(trip.members);
        }
      }
    };

    loadMemberDetails();
  }, [trip.members]);

  useEffect(() => {
    loadMessages();
    
    // Ensure socket connection and then join room
    const joinRoomWhenReady = () => {
      if (socketService.getConnectionStatus()) {
        socketService.joinTripRoom(trip._id);
        console.log('🚀 Joined trip room and listening for messages:', trip._id);
      } else {
        console.log('⏳ Socket not ready, retrying in 100ms...');
        setTimeout(joinRoomWhenReady, 100);
      }
    };
    
    joinRoomWhenReady();
    
    // Listen for new messages
    const handleNewMessage = (data) => {
      console.log('📨 Received new message event:', data);
      console.log('📨 Message data structure:', JSON.stringify(data, null, 2));
      
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
      } else {
        console.log('❌ Invalid message data structure:', data);
      }
    };
    
    socketService.onNewMessage(handleNewMessage);

    return () => {
      console.log('🔌 Cleaning up message listener for trip:', trip._id);
      socketService.off('new-message');
    };
  }, [trip._id]);

  const loadMessages = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/trips/${trip._id}/messages`, {
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
      const response = await fetch(`${API_BASE_URL}/api/trips/${trip._id}/messages`, {
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
        <div className="bg-gradient-to-r from-teal-600 to-green-600 text-white p-4 rounded-t-lg flex justify-between items-center shadow-md">
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
                  💬 {trip.title}
                </h2>
                <p className="text-xs opacity-90">
                  Click to see {members?.length || 0} participant{(members?.length || 0) !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowMembers(!showMembers)}
              className="hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-colors"
              title="View group members"
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
                            style={{ color: isOwnMessage ? '#075e54' : '#128c7e' }}
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
                                  <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-[8px] font-bold">
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
                              ? 'bg-gradient-to-r from-green-500 to-green-600 text-white rounded-br-none'
                              : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'
                          }`}
                        >
                          <div className="break-words">{msg.message}</div>
                          <div className={`text-[10px] mt-1 flex items-center gap-1 ${isOwnMessage ? 'text-green-100 justify-end' : 'text-gray-500'}`}>
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
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-400 font-semibold shadow-md transition-all"
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
                  <span>👥</span> Group Members ({members?.length || 0})
                </h3>
                <p className="text-xs text-gray-500 mt-1">Click on any member to view profile</p>
              </div>
              <div className="divide-y">
                {members?.map((member) => {
                  // Handle both populated member objects and ID-only members
                  const memberData = typeof member === 'string' ? { _id: member, name: 'Loading...', email: '' } : member;
                  const isCreator = memberData._id === trip.creator?._id || memberData._id === trip.creator;
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
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xl font-bold border-2 border-white shadow-md">
                            {memberData.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-800 truncate flex items-center gap-2 flex-wrap">
                            <span>{memberData.name || 'Unknown User'}</span>
                            {isYou && <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full font-medium">You</span>}
                            {isCreator && <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full font-medium">Admin</span>}
                          </div>
                          <div className="text-xs text-gray-500 truncate mt-0.5">{memberData.email || 'Email not available'}</div>
                          {memberData.location && (
                            <div className="text-xs text-gray-400 truncate mt-0.5 flex items-center gap-1">
                              <span>📍</span> {memberData.location}
                            </div>
                          )}
                          {memberData.bio && (
                            <div className="text-xs text-gray-400 truncate mt-0.5 italic">
                              "{memberData.bio.substring(0, 40)}{memberData.bio.length > 40 ? '...' : ''}"
                            </div>
                          )}
                        </div>
                        <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Profile Modal */}
      {selectedUser && (
        <UserProfileModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
};

// --- MEMBERS MANAGEMENT PAGE ---
const MembersPage = ({ trip, currentUser, onRemoveMember, onBack }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [loadingUserDetails, setLoadingUserDetails] = useState(false);

  const handleRemoveMember = async (tripId, userId, userName) => {
    await onRemoveMember(tripId, userId, userName);
    // Update local members list immediately
    setMembers(prev => prev.filter(member => member._id !== userId));
  };

  // Function to fetch full user details
  const handleUserClick = async (member) => {
    // If user has full details (not "Unknown User"), show directly
    if (member.name !== 'Unknown User' && member.email !== 'No email available') {
      setSelectedUser(member);
      return;
    }

    // For "Unknown User", fetch full details from server
    setLoadingUserDetails(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/user/${member._id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        setSelectedUser(userData);
      } else {
        // If fetch fails, show what we have
        setSelectedUser(member);
      }
    } catch (err) {
      console.error('Error fetching user details:', err);
      // Show what we have even if fetch fails
      setSelectedUser(member);
    } finally {
      setLoadingUserDetails(false);
    }
  };

  useEffect(() => {
    const loadMembers = async () => {
      try {
        // Get member details by fetching user info for each member ID
        const memberPromises = trip.members.map(async (member) => {
          // Extract member ID from different possible structures
          const memberId = member._id || member.user?._id || member.user || member;
          
          try {
            const response = await fetch(`${API_BASE_URL}/api/auth/user/${memberId}`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              }
            });
            if (response.ok) {
              return await response.json();
            }
            // Return placeholder for unknown users but allow clicking for details
            return { _id: memberId, name: 'Unknown User', email: 'No email available', clickable: true };
          } catch (err) {
            return { _id: memberId, name: 'Unknown User', email: 'No email available', clickable: true };
          }
        });
        
        const memberDetails = await Promise.all(memberPromises);
        setMembers(memberDetails);
      } catch (err) {
        console.error('Error loading members:', err);
      } finally {
        setLoading(false);
      }
    };

    loadMembers();
  }, [trip]);

  if (loading) {
    return (
      <div className="p-4 pb-24">
        <div className="flex items-center mb-6">
          <button onClick={onBack} className="mr-3 p-2 hover:bg-gray-100 rounded">
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Loading Members...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button onClick={onBack} className="mr-3 p-2 hover:bg-gray-100 rounded">
            ← Back
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Trip Members</h1>
            <p className="text-gray-600">{trip.title}</p>
          </div>
        </div>
        <button
          onClick={() => setShowChat(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          💬 Group Chat
        </button>
      </div>

      {/* Trip Info */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{getTransportIcon(trip.transport)}</span>
              <span className="font-semibold text-gray-700">{trip.transport}</span>
            </div>
            <p className="text-gray-600">{trip.from} → {trip.to}</p>
            <p className="text-sm text-gray-500">📅 {new Date(trip.date).toLocaleDateString()}</p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-lg">{members.length}/{trip.maxMembers}</p>
            <p className="text-xs text-gray-500">Buddies</p>
          </div>
        </div>
      </div>

      {/* Members List */}
      <div className="space-y-3">
        {members.map((member) => {
          const isCreator = member._id === trip.creator._id;
          const isCurrentUser = member._id === currentUser._id;
          
          return (
            <div key={member._id} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div 
                  className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded -m-2 flex-1"
                  onClick={() => handleUserClick(member)}
                >
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {member.name[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-800">{member.name}</h3>
                      {isCreator && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full font-semibold">
                          Creator
                        </span>
                      )}
                      {isCurrentUser && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                          You
                        </span>
                      )}
                      {member.name === 'Unknown User' && (
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full">
                          👁️ Click to view
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{member.email}</p>
                  </div>
                </div>
                
                {!isCreator && !isCurrentUser && trip.creator._id === currentUser._id && (
                  <button
                    onClick={() => handleRemoveMember(trip._id, member._id, member.name)}
                    className="px-3 py-1.5 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* User Profile Modal */}
      {selectedUser && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedUser(null)}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {loadingUserDetails ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading profile details...</p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-4 mb-6">
                  {selectedUser.profilePhoto ? (
                    <img 
                      src={selectedUser.profilePhoto} 
                      alt={selectedUser.name}
                      className="w-20 h-20 rounded-full object-cover border-4 border-blue-400"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-3xl font-bold border-4 border-blue-400">
                      {selectedUser.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedUser.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{selectedUser.email}</p>
                  </div>
                </div>

                {/* Personal Information Section */}
                <div className="mb-4 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    📋 Personal Information
                  </h4>
                  <div className="space-y-2">
                    {selectedUser.phone && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 dark:text-gray-400 text-sm w-24">📱 Phone:</span>
                        <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">{selectedUser.phone}</span>
                      </div>
                    )}
                    {selectedUser.gender && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 dark:text-gray-400 text-sm w-24">👤 Gender:</span>
                        <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">{selectedUser.gender}</span>
                      </div>
                    )}
                    {selectedUser.dateOfBirth && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 dark:text-gray-400 text-sm w-24">🎂 Birth Date:</span>
                        <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">
                          {new Date(selectedUser.dateOfBirth).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {selectedUser.nationality && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 dark:text-gray-400 text-sm w-24">🌍 Nationality:</span>
                        <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">{selectedUser.nationality}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Location Section */}
                {(selectedUser.country || selectedUser.city || selectedUser.location) && (
                  <div className="mb-4 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      📍 Location
                    </h4>
                    <div className="space-y-2">
                      {selectedUser.country && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 dark:text-gray-400 text-sm w-20">🌐 Country:</span>
                          <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">{selectedUser.country}</span>
                        </div>
                      )}
                      {selectedUser.city && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 dark:text-gray-400 text-sm w-20">🏙️ City:</span>
                          <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">{selectedUser.city}</span>
                        </div>
                      )}
                      {selectedUser.location && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 dark:text-gray-400 text-sm w-20">📌 Location:</span>
                          <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">{selectedUser.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {selectedUser.bio && (
                  <div className="mb-4 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      ✍️ Bio
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">{selectedUser.bio}</p>
                  </div>
                )}
                
                <button
                  onClick={() => setSelectedUser(null)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Ride Members Page Component
const RideMembersPage = ({ ride, currentUser, onRemoveMember, onBack }) => {
  const members = ride.members || [ride.creator];
  const isDriver = ride.creator?._id === currentUser._id || ride.driverId === currentUser._id;

  return (
    <div className="p-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button onClick={onBack} className="mr-3 p-2 hover:bg-gray-100 rounded">
            ← Back
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Ride Members</h1>
            <p className="text-gray-600">{ride.from} → {ride.to}</p>
          </div>
        </div>
      </div>

      {/* Ride Info */}
      <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg shadow p-6 mb-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-3xl">🚗</span>
              <span className="font-semibold text-lg">{ride.vehicle || 'Vehicle'}</span>
            </div>
            <p className="text-white/90 font-medium">{ride.from} → {ride.to}</p>
            <p className="text-sm text-white/80">📅 {new Date(ride.date).toLocaleDateString()}</p>
            <p className="text-sm text-white/80 mt-1">👤 Driver: {ride.driver}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-2xl">{members.length}/{ride.seats}</p>
            <p className="text-xs text-white/80">Passengers</p>
          </div>
        </div>
      </div>

      {/* Members List */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Passengers ({members.length})</h2>
        {members.map((member) => {
          const isRideDriver = member._id === ride.creator?._id || member._id === ride.driverId;
          const isCurrentUser = member._id === currentUser._id;
          
          return (
            <div key={member._id} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {member.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-800">{member.name}</h3>
                      {isRideDriver && (
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full font-semibold">
                          Driver
                        </span>
                      )}
                      {isCurrentUser && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                          You
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{member.email}</p>
                  </div>
                </div>
                
                {isDriver && !isRideDriver && !isCurrentUser && (
                  <button
                    onClick={() => onRemoveMember(member._id)}
                    className="px-3 py-1.5 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {members.length === 1 && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-4xl mb-2">🚗</p>
          <p>No other passengers yet. Share this ride to fill the seats!</p>
        </div>
      )}
    </div>
  );
};


// --- AUTHENTICATION COMPONENTS ---

// Password Reset Component
const PasswordResetModal = ({ isOpen, onClose, onSwitchToSignup }) => {
  const [step, setStep] = useState('email'); // 'email', 'verification', 'newPassword', 'success'
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState(null);

  // Clear error when user starts typing
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (error) setError('');
  };

  const handleVerificationCodeChange = (e) => {
    setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6));
    if (error) setError('');
  };

  const handleNewPasswordChange = (e) => {
    setNewPassword(e.target.value);
    if (error) setError('');
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    if (error) setError('');
  };

  const handleSendVerification = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Check if user exists
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (!user) {
        setError('No account found with this email address. Please check your email or sign up.');
        setLoading(false);
        return;
      }

      setUserData(user);
      
      // Generate 6-digit verification code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedCode(code);
      
      // In production, send email with code
      // For demo, auto-fill the verification code
      console.log('=== PASSWORD RESET CODE ===');
      console.log(`Email: ${email}`);
      console.log(`Verification Code: ${code}`);
      console.log('===========================');
      
      // Auto-fill the verification code
      setVerificationCode(code);
      
      setStep('verification');
      setError(''); // Clear any errors
      
      // Auto-verify after 1.5 seconds
      setTimeout(() => {
        setStep('newPassword');
      }, 1500);
    } catch (err) {
      setError('Failed to send verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = (e) => {
    e.preventDefault();
    setError('');

    if (verificationCode !== generatedCode) {
      setError('Invalid verification code. Please try again.');
      return;
    }

    setStep('newPassword');
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      // Update password in localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = users.findIndex(u => u.email === userData.email);
      
      if (userIndex !== -1) {
        users[userIndex].password = newPassword;
        localStorage.setItem('users', JSON.stringify(users));
        setStep('success');
      }
    } catch (err) {
      setError('Failed to reset password. Please try again.');
    }
  };

  const handleClose = () => {
    setStep('email');
    setEmail('');
    setVerificationCode('');
    setGeneratedCode('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setUserData(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50" onClick={handleClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            {step === 'email' && '🔐 Reset Password'}
            {step === 'verification' && '✉️ Verify Email'}
            {step === 'newPassword' && '🔑 New Password'}
            {step === 'success' && '✅ Success!'}
          </h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-300 dark:hover:text-gray-200 text-3xl leading-none">
            ×
          </button>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900 dark:bg-opacity-30 border border-red-200 dark:border-red-700 rounded-lg mb-4 overflow-hidden">
            <div className="px-4 py-3 text-red-700 dark:text-red-200">
              <div className="flex items-start gap-2">
                <span className="text-xl">⚠️</span>
                <div className="flex-1">
                  <p className="font-medium">{error}</p>
                  {error.includes('No account found') && (
                    <p className="text-sm mt-1 opacity-90">
                      Double-check your email address or{' '}
                      <button 
                        onClick={() => {
                          handleClose();
                          if (onSwitchToSignup) {
                            onSwitchToSignup();
                          }
                        }}
                        className="underline font-semibold hover:opacity-80 transition-opacity"
                      >
                        create a new account
                      </button>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Email */}
        {step === 'email' && (
          <form onSubmit={handleSendVerification}>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Enter your email address and we'll send you a verification code to reset your password.
            </p>
            <div className="mb-6">
              <label className="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                className={`w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 ${
                  error && error.includes('No account found') 
                    ? 'border-red-300 dark:border-red-600' 
                    : 'border-gray-200 dark:border-gray-600'
                } text-gray-900 dark:text-white rounded-lg focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none placeholder-gray-400 dark:placeholder-gray-400 transition-colors`}
                placeholder="Enter your email"
                required
                autoFocus
              />
              {email && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                  💡 Make sure this is the email you used to sign up
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-teal-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-400 transition-all shadow-lg"
            >
              {loading ? 'Sending...' : 'Send Verification Code'}
            </button>
          </form>
        )}

        {/* Step 2: Verification Code */}
        {step === 'verification' && (
          <div className="text-center py-6">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 dark:bg-opacity-30 rounded-full mb-4">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Verification Code Sent!</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Code sent to <strong className="text-gray-900 dark:text-white">{email}</strong>
              </p>
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-2">
                Verification Code
              </label>
              <input
                type="text"
                value={verificationCode}
                readOnly
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-green-300 dark:border-green-600 text-gray-900 dark:text-white rounded-lg text-center text-2xl tracking-widest font-mono"
                placeholder="000000"
              />
              <div className="mt-3 flex items-center justify-center gap-2 text-sm text-green-600 dark:text-green-400">
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Verifying code...</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: New Password */}
        {step === 'newPassword' && (
          <form onSubmit={handleResetPassword}>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Create a new secure password for your account.
            </p>
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-2">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={handleNewPasswordChange}
                className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none placeholder-gray-400 dark:placeholder-gray-400"
                placeholder="Enter new password"
                required
                autoFocus
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Must be at least 6 characters</p>
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none placeholder-gray-400 dark:placeholder-gray-400"
                placeholder="Confirm new password"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-teal-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-teal-700 transition-all shadow-lg"
            >
              Reset Password
            </button>
          </form>
        )}

        {/* Step 4: Success */}
        {step === 'success' && (
          <div className="text-center">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Password Reset Successful!</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Your password has been successfully reset. You can now log in with your new password.
            </p>
            <button
              onClick={handleClose}
              className="w-full bg-gradient-to-r from-blue-600 to-teal-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-teal-700 transition-all shadow-lg"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const LoginPage = ({ onLogin, onSwitchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const result = await authAPI.login(email, password);
      onLogin(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Side - Hero with Adventure Image */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
          <div className="absolute inset-0 bg-black opacity-40"></div>
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center text-white text-center px-12">
          <h1 className="text-6xl font-bold mb-6">Your Adventure</h1>
          <h1 className="text-6xl font-bold mb-8">Begins Here.</h1>
          <p className="text-2xl opacity-90 max-w-lg">
            Connect with travel buddies and explore the world together
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Log in to TravelBuddy</h2>
            <p className="text-gray-600 mb-8">Welcome back! Please enter your details.</p>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="Enter your email"
                  required
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-gray-700 text-sm font-semibold">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowResetPassword(true)}
                    className="text-sm text-blue-600 hover:underline font-semibold"
                  >
                    Forgot Password?
                  </button>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="Enter your password"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-teal-600 text-white py-3.5 rounded-lg font-semibold hover:from-blue-700 hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-400 transition-all shadow-md hover:shadow-lg"
              >
                {loading ? 'Logging in...' : 'Log in'}
              </button>
            </form>
            
            <p className="text-center mt-6 text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={onSwitchToSignup}
                className="text-blue-600 hover:underline font-semibold"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
      
      {/* Password Reset Modal */}
      <PasswordResetModal 
        isOpen={showResetPassword} 
        onClose={() => setShowResetPassword(false)}
        onSwitchToSignup={onSwitchToSignup}
      />
    </div>
  );
};

const SignupPage = ({ onSignup, onSwitchToLogin }) => {
  const [step, setStep] = useState(1); // 1: Basic info, 2: Phone verification
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [phoneValidation, setPhoneValidation] = useState({ valid: false, message: '' });
  const [passwordStrength, setPasswordStrength] = useState({ strength: 0, message: '', color: '' });

  // Password strength checker
  const checkPasswordStrength = (pwd) => {
    if (!pwd) return { strength: 0, message: '', color: '' };
    
    let strength = 0;
    const checks = {
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      numbers: /\d/.test(pwd),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(pwd)
    };
    
    Object.values(checks).forEach(check => { if (check) strength++; });
    
    const messages = {
      0: '',
      1: 'Very Weak',
      2: 'Weak',
      3: 'Fair',
      4: 'Good',
      5: 'Strong'
    };
    
    const colors = {
      0: '',
      1: 'text-red-600',
      2: 'text-orange-600',
      3: 'text-yellow-600',
      4: 'text-blue-600',
      5: 'text-green-600'
    };
    
    const requirements = [];
    if (!checks.length) requirements.push('8+ characters');
    if (!checks.uppercase) requirements.push('uppercase');
    if (!checks.lowercase) requirements.push('lowercase');
    if (!checks.numbers) requirements.push('number');
    if (!checks.special) requirements.push('special character');
    
    return {
      strength,
      message: messages[strength],
      color: colors[strength],
      requirements
    };
  };

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Validate phone number as user types
  const validatePhoneNumber = (phoneNum) => {
    if (!phoneNum) {
      return { valid: false, message: '' };
    }

    // Must start with +
    if (!phoneNum.startsWith('+')) {
      return { valid: false, message: 'Phone number must start with + (e.g., +1234567890)' };
    }

    // Extract digits only
    const digits = phoneNum.replace(/\D/g, '');

    // Length check
    if (digits.length < 10) {
      return { valid: false, message: 'Phone number too short (minimum 10 digits)' };
    }
    if (digits.length > 15) {
      return { valid: false, message: 'Phone number too long (maximum 15 digits)' };
    }

    // Check for suspicious patterns
    // All same digits
    if (/^(\d)\1+$/.test(digits)) {
      return { valid: false, message: 'Invalid phone number pattern' };
    }

    // Sequential numbers
    let isSequential = true;
    for (let i = 1; i < digits.length; i++) {
      if (parseInt(digits[i]) !== parseInt(digits[i-1]) + 1) {
        isSequential = false;
        break;
      }
    }
    if (isSequential) {
      return { valid: false, message: 'Invalid phone number pattern' };
    }

    return { valid: true, message: '✓ Valid phone number format' };
  };

  const handlePhoneChange = (value) => {
    setPhone(value);
    setPhoneValidation(validatePhoneNumber(value));
  };

  const handleSendOTP = async () => {
    if (!phoneValidation.valid) {
      setError('Please enter a valid phone number in international format');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const result = await otpAPI.sendOTP(phone);
      setOtpSent(true);
      setSuccess(result.message + (result.maskedPhone ? ` to ${result.maskedPhone}` : ''));
      setCountdown(120); // 2 minutes countdown
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const result = await otpAPI.verifyOTP(phone, otp);
      
      // Mark as verified
      setPhoneVerified(true);
      setSuccess(result.message + ' ✓');
      
      // Wait 2 seconds before going back to show success message
      setTimeout(() => {
        setStep(1);
        setOtpSent(false);
        setOtp('');
        setError('');
      }, 2000);
    } catch (err) {
      setError(err.message);
      setPhoneVerified(false); // Ensure not marked as verified on error
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const result = await otpAPI.resendOTP(phone);
      setSuccess(result.message);
      setCountdown(60);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Double check phone verification
    if (!phoneVerified) {
      setError('Please verify your phone number first');
      setStep(2);
      return;
    }

    // Check password strength
    if (passwordStrength.strength < 3) {
      setError('Password is too weak. Please create a stronger password.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const result = await authAPI.register(name, email, password, phone, phoneVerified);
      onSignup(result);
    } catch (err) {
      setError(err.message);
      // If phone verification error, reset verification state
      if (err.message.includes('phone') || err.message.includes('verify')) {
        setPhoneVerified(false);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Side - Hero */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-teal-600 to-green-500">
          <div className="absolute inset-0 bg-black opacity-40"></div>
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center text-white text-center px-12">
          <h1 className="text-6xl font-bold mb-6">Join TravelBuddy</h1>
          <p className="text-2xl opacity-90 max-w-lg">
            Start your journey and connect with travelers around the world
          </p>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h2>
                <p className="text-gray-600">
                  {step === 1 ? 'Join us and start your adventure!' : 'Verify your phone number'}
                </p>
              </div>
              {phoneVerified && (
                <div className="text-green-500 text-2xl" title="Phone Verified">
                  ✓
                </div>
              )}
            </div>

            {/* Progress Indicator */}
            <div className="flex items-center mb-4">
              <div className={`flex-1 h-2 rounded-full ${step >= 1 ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
              <div className="w-4"></div>
              <div className={`flex-1 h-2 rounded-full ${phoneVerified ? 'bg-green-500' : step >= 2 ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
            </div>

            {/* Verification Status Banner */}
            {phoneVerified && step === 1 && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg mb-4 flex items-center gap-2">
                <span className="text-xl">✓</span>
                <span className="text-sm font-medium">Phone number verified successfully</span>
              </div>
            )}
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
                {success}
              </div>
            )}
            
            {step === 1 ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="Enter your name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setPasswordStrength(checkPasswordStrength(e.target.value));
                    }}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="Create a strong password"
                    required
                    minLength={8}
                  />
                  {password && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div
                            key={level}
                            className={`h-1 flex-1 rounded ${
                              level <= passwordStrength.strength
                                ? passwordStrength.strength <= 2
                                  ? 'bg-red-500'
                                  : passwordStrength.strength === 3
                                  ? 'bg-yellow-500'
                                  : passwordStrength.strength === 4
                                  ? 'bg-blue-500'
                                  : 'bg-green-500'
                                : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <p className={`text-xs font-medium ${passwordStrength.color}`}>
                        {passwordStrength.message}
                        {passwordStrength.requirements && passwordStrength.requirements.length > 0 && (
                          <span className="text-gray-500"> - Add: {passwordStrength.requirements.join(', ')}</span>
                        )}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    Phone Number {phoneVerified && <span className="text-green-500 text-sm font-medium">✓ Verified</span>}
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                          phoneVerified 
                            ? 'border-green-300 bg-green-50' 
                            : phone && !phoneValidation.valid 
                              ? 'border-red-300 focus:border-red-500' 
                              : 'border-gray-200 focus:border-blue-500'
                        }`}
                        placeholder="+1234567890"
                        required
                        disabled={phoneVerified}
                      />
                      {phone && !phoneVerified && (
                        <p className={`text-xs mt-1 ${phoneValidation.valid ? 'text-green-600' : 'text-red-600'}`}>
                          {phoneValidation.message}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (phoneVerified) {
                          // Already verified, just go back
                          setStep(1);
                        } else if (phoneValidation.valid) {
                          // Valid phone, go to verification step
                          setStep(2);
                          setError('');
                          setSuccess('');
                        } else {
                          setError('Please enter a valid phone number in international format');
                        }
                      }}
                      className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
                        phoneVerified 
                          ? 'bg-green-500 text-white cursor-default' 
                          : phoneValidation.valid
                            ? 'bg-blue-500 text-white hover:bg-blue-600'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      disabled={phoneVerified || !phoneValidation.valid}
                    >
                      {phoneVerified ? '✓ Verified' : 'Verify'}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    <span className="font-medium">Required:</span> International format with country code (e.g., +1 for US, +91 for India)
                  </p>
                </div>
                
                <button
                  type="submit"
                  disabled={loading || !phoneVerified || passwordStrength.strength < 3}
                  className="w-full bg-gradient-to-r from-blue-600 to-teal-600 text-white py-3.5 rounded-lg font-semibold hover:from-blue-700 hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-400 transition-all shadow-md hover:shadow-lg"
                >
                  {loading ? 'Creating Account...' : !phoneVerified ? 'Verify Phone First' : passwordStrength.strength < 3 ? 'Password Too Weak' : 'Sign Up'}
                </button>
              </form>
            ) : (
              <div className="space-y-5">
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    Phone Number
                  </label>
                  <div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                        otpSent 
                          ? 'border-gray-200 bg-gray-50' 
                          : phone && !phoneValidation.valid 
                            ? 'border-red-300 focus:border-red-500' 
                            : 'border-gray-200 focus:border-blue-500'
                      }`}
                      placeholder="+1234567890"
                      disabled={otpSent}
                    />
                    {phone && !otpSent && (
                      <p className={`text-xs mt-1 ${phoneValidation.valid ? 'text-green-600' : 'text-red-600'}`}>
                        {phoneValidation.message}
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {otpSent 
                      ? 'OTP sent to this number' 
                      : 'Must include country code (e.g., +1 for US, +44 for UK, +91 for India)'
                    }
                  </p>
                </div>

                {!otpSent ? (
                  <>
                    <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm">
                      <strong>Development Mode:</strong> Enter any 6-digit number to verify (e.g., 123456)
                    </div>
                    <button
                      onClick={handleSendOTP}
                      disabled={loading || !phoneValidation.valid}
                      className="w-full bg-blue-500 text-white py-3.5 rounded-lg font-semibold hover:bg-blue-600 disabled:bg-gray-400 transition-all"
                    >
                      {loading ? 'Sending...' : 'Send OTP'}
                    </button>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-gray-700 text-sm font-semibold mb-2">
                        Enter OTP
                      </label>
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors text-center text-2xl tracking-widest"
                        placeholder="000000"
                        maxLength={6}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Check your phone for the 6-digit code
                      </p>
                    </div>

                    <button
                      onClick={handleVerifyOTP}
                      disabled={loading || otp.length !== 6}
                      className="w-full bg-green-500 text-white py-3.5 rounded-lg font-semibold hover:bg-green-600 disabled:bg-gray-400 transition-all"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Verifying...
                        </span>
                      ) : (
                        'Verify OTP'
                      )}
                    </button>

                    <div className="flex items-center justify-between">
                      <button
                        onClick={handleResendOTP}
                        disabled={loading || countdown > 0}
                        className="text-blue-600 hover:underline font-semibold disabled:text-gray-400"
                      >
                        {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
                      </button>
                      <button
                        onClick={() => {
                          setStep(1);
                          setOtpSent(false);
                          setOtp('');
                        }}
                        className="text-gray-600 hover:underline"
                      >
                        Change Number
                      </button>
                    </div>
                  </>
                )}

                <button
                  onClick={() => {
                    if (!loading) {
                      setStep(1);
                      setError('');
                    }
                  }}
                  disabled={loading}
                  className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  {loading ? 'Please wait...' : 'Back to Form'}
                </button>
              </div>
            )}
            
            <p className="text-center mt-6 text-gray-600">
              Already have an account?{' '}
              <button
                onClick={onSwitchToLogin}
                className="text-blue-600 hover:underline font-semibold"
              >
                Log in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP ---
function App() {
  const [page, setPage] = useState('home');
  const [searchData, setSearchData] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [authPage, setAuthPage] = useState('login'); // 'login' or 'signup'
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  
  // App State
  const [publicPlans, setPublicPlans] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [myTrips, setMyTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [loadingActions, setLoadingActions] = useState({});
  const [chatTrip, setChatTrip] = useState(null);
  const [unreadMessages, setUnreadMessages] = useState({}); // { tripId: count }
  const [rideSharePosts, setRideSharePosts] = useState([]); // Ride share posts
  const [sentRideBookings, setSentRideBookings] = useState([]); // Ride booking requests sent by user
  const [receivedRideBookings, setReceivedRideBookings] = useState([]); // Ride booking requests received

  // Apply theme on mount and when it changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Toggle theme function
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  // Sync received ride bookings from my rides
  useEffect(() => {
    if (!currentUser) return;
    
    const myRides = rideSharePosts.filter(r => r.isMyRide || r.driverId === currentUser._id);
    const allReceivedBookings = [];
    
    myRides.forEach(ride => {
      if (ride.bookings && ride.bookings.length > 0) {
        allReceivedBookings.push(...ride.bookings);
      }
    });
    
    setReceivedRideBookings(allReceivedBookings);
  }, [rideSharePosts, currentUser]);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await authAPI.getCurrentUser();
        setCurrentUser(user);
        loadAppData();
        
        // Request notification permission
        if ('Notification' in window && Notification.permission === 'default') {
          Notification.requestPermission();
        }
      } catch (err) {
        console.log('Not logged in');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  // Setup Socket.IO when user is authenticated
  useEffect(() => {
    if (currentUser) {
      // Connect to Socket.IO
      socketService.connect(currentUser._id);

      // Setup real-time event listeners
      socketService.onNewRequest((data) => {
        console.log('📨 New request received:', data);
        setReceivedRequests(prev => [data.request, ...prev]);
        // Immediately reload data to ensure everything is in sync
        loadAppData();
        // Force another refresh after a short delay
        setTimeout(() => loadAppData(), 500);
        // Show notification
        alert(`New join request from ${data.request.userName}`);
      });

      socketService.onRequestAccepted((data) => {
        console.log('✅ Request accepted:', data);
        setSentRequests(prev => prev.map(r => 
          r._id === data.request._id ? { ...r, status: 'accepted' } : r
        ));
        alert(`Your request to join "${data.request.tripTitle}" was accepted!`);
        // Immediately reload data to update UI
        loadAppData();
        // Force another refresh after a short delay
        setTimeout(() => loadAppData(), 500);
      });

      socketService.onRequestRejected((data) => {
        console.log('❌ Request rejected:', data);
        setSentRequests(prev => prev.map(r => 
          r._id === data.request._id ? { ...r, status: 'rejected' } : r
        ));
        // Immediately reload data to ensure everything is in sync
        loadAppData();
        // Force another refresh after a short delay
        setTimeout(() => loadAppData(), 500);
        alert(`Your request to join "${data.request.tripTitle}" was rejected.`);
      });

      socketService.onTripUpdated((data) => {
        console.log('🔄 Trip updated:', data);
        if (data.type === 'member-added') {
          // Update both public plans and my trips
          const updateTripMembers = (trip) => 
            trip._id === data.tripId ? 
              { ...trip, members: [...trip.members, data.newMember] } : trip;
          
          setPublicPlans(prev => prev.map(updateTripMembers));
          setMyTrips(prev => prev.map(updateTripMembers));
        } else if (data.type === 'member-removed') {
          // Remove member from trip
          const updateTripMembers = (trip) => 
            trip._id === data.tripId ? 
              { ...trip, members: trip.members.filter(m => m._id !== data.removedMember) } : trip;
          
          setPublicPlans(prev => prev.map(updateTripMembers));
          setMyTrips(prev => prev.map(updateTripMembers));
        }
        // Immediately reload data to ensure everything is in sync
        loadAppData();
        // Force another refresh after a short delay
        setTimeout(() => loadAppData(), 500);
      });

      socketService.onMemberRemoved((data) => {
        console.log('👤 You were removed from trip:', data);
        alert(`You were removed from "${data.tripTitle}"`);
        // Refresh data to update UI
        loadAppData();
      });

      // Listen for new messages to show unread count
      socketService.onNewMessage((data) => {
        if (data && data.message && data.message.sender._id !== currentUser._id) {
          const tripId = data.tripId || data.message.trip;
          console.log('📬 New message notification for trip:', tripId);
          
          // Only increment unread count if chat is not currently open for this trip
          if (!chatTrip || chatTrip._id !== tripId) {
            setUnreadMessages(prev => ({
              ...prev,
              [tripId]: (prev[tripId] || 0) + 1
            }));
            
            // Show browser notification if permission granted
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('New Message', {
                body: `${data.message.sender.name}: ${data.message.message.substring(0, 50)}...`,
                icon: '/favicon.ico'
              });
            }
          }
          
          // Refresh data to ensure message counts and trip info are updated
          setTimeout(() => loadAppData(), 500);
        }
      });

      // Auto-refresh data every 10 seconds to keep everything in sync
      const refreshInterval = setInterval(() => {
        console.log('🔄 Auto-refreshing data...');
        loadAppData();
      }, 10000); // 10 seconds for more responsive updates

      return () => {
        socketService.removeAllListeners();
        clearInterval(refreshInterval);
      };
    } else {
      // Disconnect socket when user logs out
      socketService.disconnect();
    }
  }, [currentUser]);

  // Load app data when user is authenticated
  const loadAppData = async () => {
    try {
      const [trips, sentReqs, receivedReqs, userTrips, rides, sentBookings, receivedBookings] = await Promise.all([
        tripsAPI.getAll(),
        requestsAPI.getSent(),
        requestsAPI.getReceived(),
        tripsAPI.getMyTrips(),
        rideShareAPI.getAll(),
        rideShareAPI.getSentBookings(),
        rideShareAPI.getReceivedBookings()
      ]);
      
      setPublicPlans(trips);
      setSentRequests(sentReqs);
      setReceivedRequests(receivedReqs);
      setMyTrips(userTrips);
      
      // Get current user from storage if not in state
      const user = currentUser || storage.getUser();
      
      setRideSharePosts(rides.map(ride => {
        // Handle both populated and non-populated driver field
        const driverId = ride.driver?._id || ride.driver;
        const userId = user?._id;
        
        return {
          ...ride,
          id: ride._id,
          driver: ride.driverName,
          isMyRide: driverId && userId && driverId.toString() === userId.toString(),
          bookedSeats: (ride.members?.length || 1) - 1
        };
      }));
      
      // Format bookings to match expected structure
      setSentRideBookings(sentBookings.map(b => ({
        ...b,
        id: b._id,
        rideId: b.ride?._id || b.ride,
        rideName: b.rideName || `${b.ride?.from} → ${b.ride?.to}`
      })));
      
      setReceivedRideBookings(receivedBookings.map(b => ({
        ...b,
        id: b._id,
        rideId: b.ride?._id || b.ride,
        rideName: b.rideName || `${b.ride?.from} → ${b.ride?.to}`,
        userName: b.user?.name || b.userName,
        userEmail: b.user?.email || ''
      })));
    } catch (err) {
      console.error('Error loading app data:', err);
    }
  };

  // Authentication handlers
  const handleLogin = (result) => {
    storage.setToken(result.token);
    storage.setUser(result.user);
    setCurrentUser(result.user);
    loadAppData();
  };

  const handleSignup = (result) => {
    storage.setToken(result.token);
    storage.setUser(result.user);
    setCurrentUser(result.user);
    loadAppData();
  };

  const handleLogout = () => {
    authAPI.logout();
    setCurrentUser(null);
    setPublicPlans([]);
    setSentRequests([]);
    setReceivedRequests([]);
    setMyTrips([]);
    setPage('home');
  };

  // Trip actions
  const handleJoinRequest = async (tripId) => {
    // Prevent duplicate requests
    if (loadingActions[`join_${tripId}`]) {
      return; // Already processing this request
    }
    
    // Check if already requested or accepted
    const alreadyRequested = sentRequests?.some(req => {
      const reqTripId = req.trip?._id || req.trip || req.tripId;
      return reqTripId === tripId && (req.status === 'pending' || req.status === 'accepted');
    });
    
    if (alreadyRequested) {
      alert('You have already sent a request for this trip.');
      return;
    }
    
    setLoadingActions(prev => ({ ...prev, [`join_${tripId}`]: true }));
    try {
      const newRequest = await requestsAPI.send(tripId);
      
      // Immediately add to sent requests with complete structure
      setSentRequests(prev => [{
        ...newRequest,
        trip: tripId,
        tripId: tripId,
        status: 'pending',
        createdAt: new Date().toISOString()
      }, ...prev]);
      
      // Force immediate UI update by reloading app data
      await loadAppData();
      
      alert('✅ Join request sent successfully! The trip creator will review your request.');
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoadingActions(prev => ({ ...prev, [`join_${tripId}`]: false }));
    }
  };

  const handleAcceptRequest = async (requestId) => {
    setLoadingActions(prev => ({ ...prev, [`accept_${requestId}`]: true }));
    try {
      await requestsAPI.accept(requestId);
      
      // Update local state immediately
      const request = receivedRequests.find(r => r._id === requestId);
      if (request) {
        // Update request status
        setReceivedRequests(prev => prev.map(r => 
          r._id === requestId ? { ...r, status: 'accepted' } : r
        ));
        
        // Add user to trip members in public plans
        setPublicPlans(prev => prev.map(trip => 
          trip._id === request.trip ? 
            { ...trip, members: [...trip.members, request.user] } : trip
        ));
        
        // Update myTrips if it's my trip
        setMyTrips(prev => prev.map(trip => 
          trip._id === request.trip ? 
            { ...trip, members: [...trip.members, request.user] } : trip
        ));
      }
      
      // Reload app data to ensure everything is in sync
      await loadAppData();
      
      alert('Request accepted!');
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoadingActions(prev => ({ ...prev, [`accept_${requestId}`]: false }));
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await requestsAPI.reject(requestId);
      
      // Update local state immediately - remove from received requests
      setReceivedRequests(prev => prev.filter(r => r._id !== requestId));
      
      // Also remove from sent requests if it's there
      setSentRequests(prev => prev.filter(r => r._id !== requestId));
      
      // Reload app data to ensure everything is in sync
      await loadAppData();
      
      alert('Request rejected!');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleRemoveMember = async (tripId, userId, userName) => {
    if (window.confirm(`Are you sure you want to remove ${userName} from this trip?`)) {
      try {
        await tripsAPI.removeMember(tripId, userId);
        
        // Update local state immediately
        const updateTripMembers = (trip) => 
          trip._id === tripId ? 
            { ...trip, members: trip.members.filter(m => m._id !== userId) } : trip;
        
        setPublicPlans(prev => prev.map(updateTripMembers));
        setMyTrips(prev => prev.map(updateTripMembers));
        
        // Update selectedTrip if we're on members page
        if (selectedTrip && selectedTrip._id === tripId) {
          setSelectedTrip(prev => ({
            ...prev,
            members: prev.members.filter(m => m._id !== userId)
          }));
        }
        
        // Reload app data to ensure everything is in sync
        await loadAppData();
        
        alert('Member removed successfully!');
      } catch (err) {
        alert('Error: ' + err.message);
      }
    }
  };

  const handleManageMembers = (trip) => {
    setSelectedTrip(trip);
    setPage('members');
  };

  const handleOpenChat = (trip) => {
    setChatTrip(trip);
    // Clear unread messages for this trip
    setUnreadMessages(prev => ({
      ...prev,
      [trip._id]: 0
    }));
  };

  const handleCreatePlan = async (planData) => {
    try {
      const newTrip = await tripsAPI.create(planData);
      
      // Add to both public plans and my trips immediately
      setPublicPlans(prev => [newTrip, ...prev]);
      setMyTrips(prev => [newTrip, ...prev]);
      
      // Immediately reload app data to ensure everything is in sync
      await loadAppData();
      
      // Force another refresh after a short delay
      setTimeout(() => loadAppData(), 500);
      
      alert('Trip created successfully!');
      setPage('home');
    } catch (err) {
      alert('Error creating trip: ' + err.message);
    }
  };

  const handleUpdateProfile = async (updates) => {
    try {
      const updatedUser = await authAPI.updateProfile(updates);
      
      // Update current user immediately
      setCurrentUser(updatedUser);
      
      // Update creator info in trips where user is the creator
      const updateCreatorInfo = (trip) => 
        trip.creator._id === currentUser._id ? 
          { ...trip, creator: { ...trip.creator, ...updatedUser }, creatorName: updatedUser.name } : trip;
      
      setPublicPlans(prev => prev.map(updateCreatorInfo));
      setMyTrips(prev => prev.map(updateCreatorInfo));
      
      alert('Profile updated successfully!');
    } catch (err) {
      alert('Error updating profile: ' + err.message);
    }
  };

  const handleLikeTrip = async (tripId) => {
    try {
      await tripsAPI.like(tripId);
      
      // Update likes immediately in both public plans and my trips
      const updateLikes = (trip) => {
        if (trip._id === tripId) {
          const newIsLiked = !trip.isLiked;
          const newLikesCount = newIsLiked ? trip.likesCount + 1 : trip.likesCount - 1;
          return { ...trip, isLiked: newIsLiked, likesCount: newLikesCount };
        }
        return trip;
      };
      
      setPublicPlans(prev => prev.map(updateLikes));
      
      // Reload app data to ensure likes are in sync
      setTimeout(() => loadAppData(), 500);
      setMyTrips(prev => prev.map(updateLikes));
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // Handle posting a new ride share
  const handlePostRide = async (rideData) => {
    try {
      const newRide = await rideShareAPI.create({
        from: rideData.from,
        to: rideData.to,
        date: rideData.date,
        time: '09:00',
        seats: rideData.seats,
        price: rideData.price,
        vehicle: rideData.vehicle || 'Personal Vehicle',
        description: rideData.description || '',
        preferences: rideData.preferences || ''
      });
      
      // Add to state with proper formatting
      setRideSharePosts(prev => [{
        ...newRide,
        id: newRide._id,
        driver: newRide.driverName,
        isMyRide: true,
        bookedSeats: 0
      }, ...prev]);
      
      return newRide;
    } catch (error) {
      console.error('Error posting ride:', error);
      throw error;
    }
  };

  // Handle deleting a ride share
  const handleDeleteRide = (rideId) => {
    setRideSharePosts(prev => prev.filter(ride => ride.id !== rideId));
  };

  // Handle booking a seat on a ride
  const handleBookSeat = async (rideId, seats = 1) => {
    // Prevent duplicate requests
    if (loadingActions[`book_${rideId}`]) {
      return; // Already processing this request
    }
    
    // Check if already requested or accepted
    const alreadyRequested = sentRideBookings?.some(booking => {
      const bookingRideId = booking.ride?._id || booking.ride || booking.rideId;
      return bookingRideId === rideId && (booking.status === 'pending' || booking.status === 'accepted');
    });
    
    if (alreadyRequested) {
      alert('You have already sent a booking request for this ride.');
      return;
    }
    
    setLoadingActions(prev => ({ ...prev, [`book_${rideId}`]: true }));
    try {
      const newBooking = await rideShareAPI.sendBookingRequest(rideId, seats);
      
      // Add to sent bookings
      setSentRideBookings(prev => [{
        ...newBooking,
        id: newBooking._id,
        rideId: newBooking.ride || rideId,
        status: 'pending',
        createdAt: new Date().toISOString()
      }, ...prev]);
      
      alert('✅ Booking request sent successfully! The driver will review your request.');
      await loadAppData(); // Refresh data
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoadingActions(prev => ({ ...prev, [`book_${rideId}`]: false }));
    }
  };

  // Handle accepting a ride booking
  const handleAcceptBooking = async (bookingId) => {
    setLoadingActions(prev => ({ ...prev, [`accept_booking_${bookingId}`]: true }));
    try {
      await rideShareAPI.acceptBooking(bookingId);
      
      // Reload data to get updated bookings and rides
      await loadAppData();
      
      alert('Booking accepted!');
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoadingActions(prev => ({ ...prev, [`accept_booking_${bookingId}`]: false }));
    }
  };

  // Handle rejecting a ride booking
  const handleRejectBooking = async (bookingId) => {
    setLoadingActions(prev => ({ ...prev, [`reject_booking_${bookingId}`]: true }));
    try {
      await rideShareAPI.rejectBooking(bookingId);
      
      // Reload data to get updated bookings
      await loadAppData();
      
      alert('Booking rejected.');
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoadingActions(prev => ({ ...prev, [`reject_booking_${bookingId}`]: false }));
    }
  };

  // Handle liking a ride
  const handleLikeRide = (rideId) => {
    setRideSharePosts(prev => prev.map(ride => {
      if (ride.id === rideId) {
        const isLiked = ride.isLiked || false;
        const likesCount = ride.likesCount || 0;
        return {
          ...ride,
          isLiked: !isLiked,
          likesCount: isLiked ? likesCount - 1 : likesCount + 1
        };
      }
      return ride;
    }));
  };

  // Handle removing a member from a ride
  const handleRemoveMemberFromRide = (rideId, memberId) => {
    if (!confirm('Are you sure you want to remove this member from the ride?')) {
      return;
    }

    setRideSharePosts(prev => prev.map(ride => {
      if (ride.id === rideId) {
        const updatedMembers = ride.members.filter(m => m._id !== memberId);
        return {
          ...ride,
          members: updatedMembers
        };
      }
      return ride;
    }));

    alert('Member removed from ride');
  };

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading TravelBuddy...</p>
        </div>
      </div>
    );
  }

  // Show auth pages if not logged in
  if (!currentUser) {
    if (authPage === 'signup') {
      return <SignupPage onSignup={handleSignup} onSwitchToLogin={() => setAuthPage('login')} />;
    }
    return <LoginPage onLogin={handleLogin} onSwitchToSignup={() => setAuthPage('signup')} />;
  }

  const pendingRequestsCount = receivedRequests.filter(r => r.status === 'pending').length;

  // Calculate joined trips (trips where user is a member but not the creator)
  const joinedTrips = publicPlans.filter(trip => 
    trip.members?.some(member => member._id === currentUser._id) && 
    trip.creator?._id !== currentUser._id
  );

  // Calculate pending trips (trips where user sent a request that is still pending)
  const pendingTrips = publicPlans.filter(trip => {
    const pendingRequest = sentRequests.find(req => 
      req.trip === trip._id && req.status === 'pending'
    );
    return pendingRequest;
  });

  const renderPage = () => {
    switch (page) {
      case 'home':
        return <HomePage publicPlans={publicPlans} rideSharePosts={rideSharePosts} currentUser={currentUser} onJoinRequest={handleJoinRequest} myRequests={sentRequests} onLikeTrip={handleLikeTrip} onManageMembers={handleManageMembers} loadingActions={loadingActions} onOpenChat={handleOpenChat} unreadMessages={unreadMessages} sentRideBookings={sentRideBookings} onBookSeat={handleBookSeat} onLikeRide={handleLikeRide} setPage={setPage} setSelectedTrip={setSelectedTrip} />;
      case 'search':
        return <SearchPage setPage={setPage} setSearchData={setSearchData} />;
      case 'search-results':
        return <SearchResultsPage searchData={searchData} setPage={setPage} />;
      case 'create':
        return <CreatePage currentUser={currentUser} onCreatePlan={handleCreatePlan} setPage={setPage} />;
      case 'requests':
        return <RequestsPage receivedRequests={receivedRequests} sentRequests={sentRequests} onAcceptRequest={handleAcceptRequest} onRejectRequest={handleRejectRequest} currentUser={currentUser} loadingActions={loadingActions} setPage={setPage} />;
      case 'members':
        return <MembersPage trip={selectedTrip} currentUser={currentUser} onRemoveMember={handleRemoveMember} onBack={() => setPage('home')} />;
      case 'profile':
        return <ProfilePage currentUser={currentUser} myPlans={myTrips} joinedTrips={joinedTrips} pendingTrips={pendingTrips} onUpdateProfile={handleUpdateProfile} onLogout={handleLogout} onOpenChat={handleOpenChat} />;
      case 'insurance':
        return <InsurancePage currentUser={currentUser} setPage={setPage} />;
      case 'tourist':
        return <TouristInfoPage currentUser={currentUser} setPage={setPage} />;
      case 'emergency':
        return <EmergencyPage currentUser={currentUser} setPage={setPage} />;
      case 'rideshare':
        return <RideSharePage currentUser={currentUser} rideSharePosts={rideSharePosts} onPostRide={handlePostRide} onDeleteRide={handleDeleteRide} onBookSeat={handleBookSeat} sentRideBookings={sentRideBookings} receivedRideBookings={receivedRideBookings} onAcceptBooking={handleAcceptBooking} onRejectBooking={handleRejectBooking} loadingActions={loadingActions} setPage={setPage} />;
      case 'rideshare-members':
        return <RideMembersPage ride={selectedTrip} currentUser={currentUser} onRemoveMember={(memberId) => handleRemoveMemberFromRide(selectedTrip.id, memberId)} onBack={() => setPage('home')} />;
      case 'travel-guide':
        return <TravelGuidePage currentUser={currentUser} setPage={setPage} />;
      case 'help':
        return <HelpCenterPage setPage={setPage} />;
      case 'promos':
        return <PromoCodesPage currentUser={currentUser} setPage={setPage} />;
      default:
        return <HomePage publicPlans={publicPlans} rideSharePosts={rideSharePosts} currentUser={currentUser} onJoinRequest={handleJoinRequest} myRequests={sentRequests} onLikeTrip={handleLikeTrip} onManageMembers={handleManageMembers} loadingActions={loadingActions} onOpenChat={handleOpenChat} unreadMessages={unreadMessages} sentRideBookings={sentRideBookings} onBookSeat={handleBookSeat} onLikeRide={handleLikeRide} setPage={setPage} setSelectedTrip={setSelectedTrip} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200 p-4 relative">
        <h1 className="text-2xl font-bold text-blue-600 text-center">🧳 TravelBuddy</h1>
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? <MoonIcon /> : <SunIcon />}
        </button>
      </div>

      <div className="pb-20">{renderPage()}</div>

      {/* Bottom Navigation - 5 Icons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="flex justify-around items-center py-2">
          <button onClick={() => setPage('home')} className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg ${page === 'home' ? 'bg-blue-600' : ''}`}>
            <HomeIcon active={page === 'home'} />
            <span className={`text-xs ${page === 'home' ? 'text-white' : 'text-gray-600'}`}>Home</span>
          </button>

          <button onClick={() => setPage('search')} className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg ${page === 'search' || page === 'search-results' ? 'bg-blue-600' : ''}`}>
            <SearchIcon active={page === 'search' || page === 'search-results'} />
            <span className={`text-xs ${page === 'search' || page === 'search-results' ? 'text-white' : 'text-gray-600'}`}>Search</span>
          </button>

          <button onClick={() => setPage('create')} className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg ${page === 'create' ? 'bg-blue-600' : ''}`}>
            <CreateIcon active={page === 'create'} />
            <span className={`text-xs ${page === 'create' ? 'text-white' : 'text-gray-600'}`}>Create</span>
          </button>

          <button onClick={() => setPage('requests')} className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg ${page === 'requests' ? 'bg-blue-600' : ''}`}>
            <RequestsIcon active={page === 'requests'} count={pendingRequestsCount} />
            <span className={`text-xs ${page === 'requests' ? 'text-white' : 'text-gray-600'}`}>Requests</span>
          </button>

          <button onClick={() => setPage('profile')} className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg ${page === 'profile' ? 'bg-blue-600' : ''}`}>
            <ProfileIcon active={page === 'profile'} />
            <span className={`text-xs ${page === 'profile' ? 'text-white' : 'text-gray-600'}`}>Profile</span>
          </button>
        </div>
      </div>

      {/* Chat Modal */}
      {chatTrip && (
        <GroupChatModal 
          trip={chatTrip} 
          currentUser={currentUser} 
          onClose={() => setChatTrip(null)} 
        />
      )}
    </div>
  );
}

export default App;
