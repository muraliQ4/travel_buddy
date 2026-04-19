import React, { useState, useEffect, useRef } from 'react';
import './styles.css';
import { searchPlaces, calculateDistance } from './apiService';
import { authAPI, tripsAPI, requestsAPI, storage, otpAPI, rideShareAPI } from './api';
import socketService from './socketService';
import { InsurancePage, HelpCenterPage, PromoCodesPage, TravelGuidePage, TouristInfoPage, EmergencyPage, RideSharePage } from './components/NewFeatures';

// --- Icon Components ---
const HomeIcon = ({ active }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-6 h-6 ${active ? 'text-white' : 'text-gray-400'}`}>
    <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.69-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.061l8.69-8.69Z" />
    <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75v4.5a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z" />
  </svg>
);

const StoreIcon = ({ active }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-6 h-6 ${active ? 'text-white' : 'text-gray-400'}`}>
    <path d="M3 4.5A1.5 1.5 0 0 1 4.5 3h15A1.5 1.5 0 0 1 21 4.5V6H3V4.5ZM3 7.5h18v10.125A2.625 2.625 0 0 1 18.375 20.25H5.625A2.625 2.625 0 0 1 3 17.625V7.5Zm6 3a.75.75 0 0 0 0 1.5h6a.75.75 0 0 0 0-1.5H9Z" />
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
const HomePage = ({ publicPlans, rideSharePosts, currentUser, onJoinRequest, myRequests, onLikeTrip, onManageMembers, onDeleteTrip, loadingActions, onOpenChat, unreadMessages, sentRideBookings, onBookSeat, onLikeRide, setPage, setSelectedTrip, isGuestBrowsing, onShowLoginPrompt, isDataLoading }) => {
  const [filter, setFilter] = useState('all'); // 'all' | 'upcoming' | 'today'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showFeatureMenu, setShowFeatureMenu] = useState(false);
  const [loadingUserDetails, setLoadingUserDetails] = useState(false);

  const getMemberUserId = (member) => {
    if (!member) return '';
    if (typeof member === 'string') return member;

    // Trip members are stored as subdocuments with a `user` field.
    const userField = member.user;
    if (userField) {
      if (typeof userField === 'string') return userField;
      return userField._id || userField.id || '';
    }

    return member._id || member.id || '';
  };
  
  // Debug: Log what HomePage receives
  useEffect(() => {
    console.log('🏠 HomePage rendered with:', {
      publicPlansCount: publicPlans?.length || 0,
      rideShareCount: rideSharePosts?.length || 0,
      currentUser: currentUser?.email
    });
  }, [publicPlans, rideSharePosts, currentUser]);
  
  // Debug: Log what HomePage receives
  useEffect(() => {
    console.log('🏠 HomePage rendered with:', {
      publicPlansCount: publicPlans?.length || 0,
      rideShareCount: rideSharePosts?.length || 0,
      currentUser: currentUser?.email
    });
  }, [publicPlans, rideSharePosts, currentUser]);

  // Function to fetch full user details
  const handleUserClick = async (member) => {
    console.log('=== Clicked member ===', member);
    
    // Check if member already has full data
    if (member && member.name && member.email && member.name !== 'Unknown User') {
      console.log('Member already has full data, showing directly');
      setSelectedUser(member);
      return;
    }
    
    const memberId = getMemberUserId(member);
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
      console.log('Fetching from URL:', `http://localhost:5000/api/auth/user/${memberId}`);
      
      const response = await fetch(`http://localhost:5000/api/auth/user/${memberId}`, {
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

  // Remove duplicate plans by normalized content before rendering cards
  const uniquePublicPlans = (() => {
    const seen = new Set();
    const normalize = (value) => String(value || '').trim().toLowerCase();
    const normalizeDate = (value) => String(value || '').slice(0, 10);
    const getPlanDedupKey = (plan) => {
      // Use content signature first to collapse repeated plans across different IDs.
      const signature = [
        normalize(plan?.title),
        normalize(plan?.from),
        normalize(plan?.to),
        normalizeDate(plan?.date),
        normalize(plan?.transport),
        normalize(plan?.maxMembers),
        normalize(plan?.description),
        normalize(plan?.distance),
        normalize(plan?.creator?._id || plan?.creator?.id || plan?.creator),
        normalize(plan?.creator?.name || plan?.creatorName)
      ].join('|');

      const idKey = String(plan?._id || plan?.id || '').trim();
      return signature || (idKey ? `id:${idKey}` : '');
    };

    return (publicPlans || []).filter((plan) => {
      if (!plan) return false;

      const key = getPlanDedupKey(plan);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  })();

  // Combine plans and ride shares
  const allItems = [
    ...uniquePublicPlans.map(p => ({ ...p, type: 'trip' })),
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
        {/* Guest Browsing Banner */}
        {isGuestBrowsing && (
          <div className="mb-6 bg-gradient-to-r from-blue-50 to-teal-50 border-2 border-blue-300 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl">👀</div>
                <div>
                  <p className="font-semibold text-gray-800">
                    Browsing as Guest
                  </p>
                  <p className="text-sm text-gray-600">
                    Sign in to join trips, create plans, and access exclusive features
                  </p>
                </div>
              </div>
              <button
                onClick={onShowLoginPrompt}
                className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg whitespace-nowrap"
              >
                🔓 Sign In
              </button>
            </div>
          </div>
        )}
        
        {/* Filter Tabs */}
        <div className="flex gap-3 mb-6 overflow-x-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-5 py-2.5 rounded-full whitespace-nowrap font-semibold transition-all ${filter === 'all' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
          >
            All Plans ({uniquePublicPlans.length})
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

        {/* Show loading indicator if no data yet */}
        {isDataLoading && allItems.length === 0 && !searchQuery && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm mb-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading trips...</p>
          </div>
        )}

        {!isDataLoading && allItems.length === 0 && !searchQuery && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm mb-6">
            <div className="text-5xl mb-3">🧳</div>
            <p className="text-gray-700 font-semibold">No plans yet</p>
            <p className="text-gray-500 mt-1">Create your first trip or check back later for community plans.</p>
          </div>
        )}

        {/* Public Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlans.length === 0 && allItems.length > 0 ? (
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
                        <span className="font-medium">{typeof plan.driver === 'string' ? plan.driver : (plan.driver?.name || 'Driver')}</span>
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
            const currentUserId = (currentUser?._id || currentUser?.id || '').toString();
            const creatorId = (plan?.creator?._id || plan?.creator?.id || plan?.creator || '').toString();
            const isMember = !!currentUserId && (plan.members || []).some(member => {
              const memberId = (member?._id || member?.id || member?.user?._id || member?.user?.id || member?.user || member || '').toString();
              return memberId && memberId === currentUserId;
            });
            const isMyTrip = !!currentUserId && creatorId === currentUserId;
            
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
                        {plan.members?.slice(0, 3).map((member, idx) => {
                          // Safely extract member name - handle if member is an object or ID
                          const memberName = typeof member === 'string' ? 'User' : (member?.name || member?.user?.name || 'User');
                          const memberId = typeof member === 'string' ? member : (member?._id || member?.id || idx);
                          
                          return (
                            <div 
                              key={memberId}
                              onClick={() => handleUserClick(member)}
                              className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-white flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:scale-110 hover:z-10 transition-transform"
                              title={`Click to view ${memberName}'s profile`}
                            >
                              {memberName?.charAt(0)?.toUpperCase() || '🧑'}
                            </div>
                          );
                        })}
                      </div>
                      <span className="text-sm text-gray-600">
                        {plan.members?.length || 0}/{plan.maxMembers}
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="space-y-2">
                    {isMyTrip ? (
                      <div className="grid grid-cols-3 gap-2">
                        <button 
                          onClick={() => onManageMembers(plan)}
                          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2.5 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all"
                        >
                          Manage Trip
                        </button>
                        <button
                          onClick={() => {
                            if (isGuestBrowsing) {
                              onShowLoginPrompt && onShowLoginPrompt();
                            } else {
                              onOpenChat && onOpenChat(plan);
                            }
                          }}
                          className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2.5 rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all relative"
                        >
                          Text
                          {unreadMessages?.[plan._id] > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full min-w-6 h-6 px-1 flex items-center justify-center font-bold animate-pulse">
                              {unreadMessages[plan._id]}
                            </span>
                          )}
                        </button>
                            <button
                              onClick={() => onDeleteTrip && onDeleteTrip(plan)}
                              className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-2.5 rounded-lg font-semibold hover:from-red-600 hover:to-red-700 transition-all"
                            >
                              Delete
                            </button>
                      </div>
                    ) : (isMember || isAccepted) ? (
                      <div className="grid grid-cols-2 gap-2">
                        <div className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-2.5 rounded-lg font-semibold text-center">
                          Active
                        </div>
                        <button
                          onClick={() => {
                            if (isGuestBrowsing) {
                              onShowLoginPrompt && onShowLoginPrompt();
                            } else {
                              onOpenChat && onOpenChat(plan);
                            }
                          }}
                          className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2.5 rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all relative"
                        >
                          Text
                          {unreadMessages?.[plan._id] > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full min-w-6 h-6 px-1 flex items-center justify-center font-bold animate-pulse">
                              {unreadMessages[plan._id]}
                            </span>
                          )}
                        </button>
                      </div>
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

// --- STORE PAGE: Travel Materials ---
const StorePage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [query, setQuery] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [address, setAddress] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [paymentProvider, setPaymentProvider] = useState('gpay');
  const [buying, setBuying] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [cityName, setCityName] = useState('');
  const [stateName, setStateName] = useState('');
  const [countryName, setCountryName] = useState('India');
  const [pincode, setPincode] = useState('');

  const products = [
    { id: 1, name: 'Cabin Backpack 40L', category: 'Bags', price: 59, rating: 4.6, stock: 'In Stock', tag: 'Best Seller', image: 'https://images.unsplash.com/photo-1491637639811-60e2756cc1c7?auto=format&fit=crop&w=800&q=80' },
    { id: 2, name: 'Hard Shell Trolley 24"', category: 'Bags', price: 109, rating: 4.7, stock: 'In Stock', tag: 'New', image: 'https://images.unsplash.com/photo-1527610276295-f4c1b38deccf?auto=format&fit=crop&w=800&q=80' },
    { id: 3, name: 'Universal Travel Adapter', category: 'Electronics', price: 24, rating: 4.8, stock: 'In Stock', tag: 'Popular', image: 'https://images.unsplash.com/photo-1587033411391-5d9e51cce126?auto=format&fit=crop&w=800&q=80' },
    { id: 4, name: 'Power Bank 20000mAh', category: 'Electronics', price: 39, rating: 4.5, stock: 'Low Stock', tag: 'Fast Charge', image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=800&q=80' },
    { id: 5, name: 'Neck Pillow Memory Foam', category: 'Comfort', price: 19, rating: 4.4, stock: 'In Stock', tag: 'Comfort', image: 'https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=800&q=80' },
    { id: 6, name: 'Eye Mask + Earplugs Set', category: 'Comfort', price: 12, rating: 4.3, stock: 'In Stock', tag: 'Travel Sleep', image: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=800&q=80' },
    { id: 7, name: 'Waterproof Toiletry Kit', category: 'Essentials', price: 18, rating: 4.6, stock: 'In Stock', tag: 'Organizer', image: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&w=800&q=80' },
    { id: 8, name: 'Packing Cubes (6 Pack)', category: 'Essentials', price: 22, rating: 4.7, stock: 'In Stock', tag: 'Space Saver', image: 'https://images.unsplash.com/photo-1513924971473-a26b40f30047?auto=format&fit=crop&w=800&q=80' },
    { id: 9, name: 'Travel First Aid Pouch', category: 'Safety', price: 16, rating: 4.5, stock: 'In Stock', tag: 'Safety', image: 'https://images.unsplash.com/photo-1576671081837-49000212a370?auto=format&fit=crop&w=800&q=80' },
    { id: 10, name: 'RFID Passport Wallet', category: 'Safety', price: 21, rating: 4.6, stock: 'In Stock', tag: 'Secure', image: 'https://images.unsplash.com/photo-1452421822248-d4c2b47f0c81?auto=format&fit=crop&w=800&q=80' },
    { id: 11, name: 'Insulated Water Bottle 1L', category: 'Outdoor', price: 27, rating: 4.5, stock: 'In Stock', tag: 'Hot/Cold', image: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=800&q=80' },
    { id: 12, name: 'Foldable Rain Jacket', category: 'Outdoor', price: 35, rating: 4.4, stock: 'In Stock', tag: 'Lightweight', image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80' }
  ];

  const formatPrice = (amount) => `$${amount.toFixed(2)}`;

  const addToCart = (product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId, delta) => {
    setCartItems((prev) => prev
      .map((item) => item.id === productId ? { ...item, quantity: item.quantity + delta } : item)
      .filter((item) => item.quantity > 0)
    );
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const couponCatalog = {
    TRAVEL10: 0.1,
    BUDDY15: 0.15,
    SAVE20: 0.2
  };

  const paymentOptions = [
    { id: 'gpay', label: 'GPay', icon: '🟢', subtitle: 'Google Pay' },
    { id: 'paytm', label: 'Paytm', icon: '🔵', subtitle: 'Wallet / UPI' },
    { id: 'phonepe', label: 'PhonePe', icon: '🟣', subtitle: 'UPI fast pay' },
    { id: 'qr', label: 'QR Code', icon: '▣', subtitle: 'Scan to pay' },
    { id: 'upi', label: 'UPI ID', icon: '@', subtitle: 'Pay to UPI ID' }
  ];

  const countryCodeOptions = ['+91', '+1', '+44', '+61', '+971', '+65'];

  const upiId = 'travelbuddy@upi';

  const discountPercent = appliedCoupon ? (couponCatalog[appliedCoupon] || 0) : 0;
  const discountAmount = cartTotal * discountPercent;
  const payableTotal = Math.max(cartTotal - discountAmount, 0);
  const platformFee = 7;
  const handlingFee = paymentMethod === 'cod' ? 9 : 0;
  const finalPayable = payableTotal + platformFee + handlingFee;

  const handleBuyNow = () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty. Please add items first.');
      return;
    }
    setCheckoutStep(1);
    setShowCheckout(true);
  };

  const goToOrderSummary = () => {
    if (!customerName.trim()) {
      alert('Please enter your name.');
      return;
    }

    const digitsOnlyPhone = phoneNumber.replace(/\D/g, '');
    if (digitsOnlyPhone.length < 10) {
      alert('Please enter a valid phone number.');
      return;
    }

    if (!address.trim()) {
      alert('Please enter your address.');
      return;
    }

    if (pincode.trim().length < 5) {
      alert('Please enter a valid pincode.');
      return;
    }

    if (!cityName.trim()) {
      alert('Please enter your city.');
      return;
    }

    if (!stateName.trim()) {
      alert('Please enter your state.');
      return;
    }

    if (!countryName.trim()) {
      alert('Please enter your country.');
      return;
    }

    setCheckoutStep(2);
  };

  const applyCoupon = () => {
    const normalized = couponCode.trim().toUpperCase();
    if (!normalized) {
      alert('Enter a coupon code first.');
      return;
    }

    if (!couponCatalog[normalized]) {
      setAppliedCoupon(null);
      alert('Invalid coupon code. Try TRAVEL10, BUDDY15, or SAVE20.');
      return;
    }

    setAppliedCoupon(normalized);
    alert(`Coupon ${normalized} applied.`);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
  };

  const confirmPurchase = () => {
    if (!address.trim()) {
      alert('Please enter your address before buying.');
      return;
    }

    setBuying(true);
    setTimeout(() => {
      const paymentLabel = paymentMethod === 'online'
        ? `online payment via ${paymentProvider.toUpperCase()}`
        : `cash on delivery${paymentProvider ? ` with optional ${paymentProvider.toUpperCase()} payment` : ''}`;
      alert(`Order placed successfully using ${paymentLabel}. Total payable: ${formatPrice(finalPayable)}`);
      setCartItems([]);
      setShowCheckout(false);
      setCouponCode('');
      setAppliedCoupon(null);
      setAddress('');
      setCustomerName('');
      setCountryCode('+91');
      setPhoneNumber('');
      setCityName('');
      setStateName('');
      setCountryName('India');
      setPincode('');
      setPaymentMethod('online');
      setPaymentProvider('gpay');
      setCheckoutStep(1);
      setBuying(false);
    }, 600);
  };

  const categories = ['all', ...new Set(products.map((product) => product.category))];
  const filteredProducts = products.filter((product) => {
    const categoryMatch = selectedCategory === 'all' || product.category === selectedCategory;
    const searchMatch =
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.tag.toLowerCase().includes(query.toLowerCase()) ||
      product.category.toLowerCase().includes(query.toLowerCase());

    return categoryMatch && searchMatch;
  });

  return (
    <div className="p-4 pb-44">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Travel Store</h1>
      <p className="text-gray-600 mb-5">All travelling materials in one place.</p>

      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-4 text-white mb-5">
        <p className="text-sm opacity-90">Featured Offer</p>
        <h2 className="text-xl font-bold">Up to 30% off on travel essentials</h2>
        <p className="text-sm opacity-90 mt-1">Limited period sale on bags, accessories and safety kits.</p>
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search travel materials..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-5">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium ${selectedCategory === category ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-700'}`}
          >
            {category === 'all' ? 'All' : category}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
              className="w-full h-40 object-cover"
            />
            <div className="p-4">
              <div className="flex items-start justify-between mb-2 gap-2">
                <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">{product.tag}</span>
                <button
                  type="button"
                  onClick={() => addToCart(product)}
                  className="w-9 h-9 rounded-full border border-gray-200 bg-white text-blue-600 hover:bg-blue-50 flex items-center justify-center shrink-0"
                  title="Add to cart"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2Zm10 0c-1.1 0-1.99.9-1.99 2S15.9 22 17 22s2-.9 2-2-.9-2-2-2ZM7.17 14h9.66c.75 0 1.4-.41 1.74-1.03l3.58-6.49A1 1 0 0 0 21.3 5H6.21L5.27 3H2v2h2l3.6 7.59-1.35 2.45C5.52 16.37 6.48 18 8 18h12v-2H8l1.17-2Z" />
                  </svg>
                </button>
              </div>
              <h3 className="font-semibold text-gray-900">{product.name}</h3>
              <p className="text-sm text-gray-500">{product.category}</p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-lg font-bold text-blue-700">{formatPrice(product.price)}</span>
                <span className="text-sm text-yellow-600">⭐ {product.rating}</span>
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className={`text-xs font-medium ${product.stock === 'Low Stock' ? 'text-red-600' : 'text-green-600'}`}>
                  {product.stock}
                </span>
                <button
                  onClick={() => addToCart(product)}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1.5 rounded-lg flex items-center gap-2"
                >
                  <span>+</span>
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-10 text-gray-500">No materials found for this filter.</div>
      )}

      {/* Floating Cart Button */}
      <button
        type="button"
        onClick={handleBuyNow}
        className="fixed bottom-24 right-4 z-40 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg px-4 py-3 flex items-center gap-3"
      >
        <span className="relative flex items-center justify-center w-6 h-6">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2Zm10 0c-1.1 0-1.99.9-1.99 2S15.9 22 17 22s2-.9 2-2-.9-2-2-2ZM7.17 14h9.66c.75 0 1.4-.41 1.74-1.03l3.58-6.49A1 1 0 0 0 21.3 5H6.21L5.27 3H2v2h2l3.6 7.59-1.35 2.45C5.52 16.37 6.48 18 8 18h12v-2H8l1.17-2Z" />
          </svg>
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {cartCount}
            </span>
          )}
        </span>
        <span className="font-semibold">Cart</span>
      </button>

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-end sm:items-center justify-center p-3" onClick={() => !buying && setShowCheckout(false)}>
          <div className="w-full max-w-6xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    if (checkoutStep > 1) {
                      setCheckoutStep((prev) => prev - 1);
                    } else {
                      setShowCheckout(false);
                    }
                  }}
                  className="w-9 h-9 rounded-full hover:bg-gray-100 text-gray-700"
                >
                  ←
                </button>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Complete Payment</h3>
                  <p className="text-sm text-gray-500">Follow the process to place your order.</p>
                </div>
              </div>
              <div className="text-sm font-semibold text-gray-700 bg-gray-100 px-3 py-1 rounded-lg">100% Secure</div>
            </div>

            <div className="px-5 pt-4">
              <div className="grid grid-cols-3 gap-3 text-center text-sm font-medium">
                {[
                  { id: 1, label: 'Address' },
                  { id: 2, label: 'Order Summary' },
                  { id: 3, label: 'Payment' }
                ].map((step) => (
                  <div key={step.id} className={`rounded-xl py-2 border ${checkoutStep === step.id ? 'border-blue-600 bg-blue-50 text-blue-700' : checkoutStep > step.id ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-gray-200 bg-gray-50 text-gray-500'}`}>
                    {checkoutStep > step.id ? '✓' : step.id}. {step.label}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 grid grid-cols-1 lg:grid-cols-[1.5fr_0.8fr] gap-5">
              <div className="space-y-4">
                {checkoutStep === 1 && (
                  <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-4">
                    <h4 className="text-lg font-bold text-gray-900">Delivery Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Full Name" className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      <div className="grid grid-cols-[110px_1fr] gap-2">
                        <select
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          className="px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                          {countryCodeOptions.map((code) => (
                            <option key={code} value={code}>{code}</option>
                          ))}
                        </select>
                        <input
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="Phone Number"
                          className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <input value={cityName} onChange={(e) => setCityName(e.target.value)} placeholder="City" className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      <input value={stateName} onChange={(e) => setStateName(e.target.value)} placeholder="State" className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      <input value={countryName} onChange={(e) => setCountryName(e.target.value)} placeholder="Country" className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
                      <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={4} placeholder="House no, street, landmark, city" className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                      <input value={pincode} onChange={(e) => setPincode(e.target.value)} placeholder="Pincode" className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 md:w-36" />
                    </div>
                    <button onClick={goToOrderSummary} className="w-full md:w-auto px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700">Continue to Order Summary</button>
                  </div>
                )}

                {checkoutStep === 2 && (
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-sm text-gray-700">
                      <p className="font-semibold text-gray-900">Deliver to: {customerName}</p>
                      <p className="mt-1">{address}</p>
                      <p>{cityName}, {stateName}, {countryName} - {pincode}</p>
                      <p>{countryCode} {phoneNumber}</p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-lg font-bold text-gray-900">Items ({cartCount})</h4>
                        <button onClick={() => setCheckoutStep(1)} className="text-sm font-semibold text-blue-600">Change Address</button>
                      </div>
                      <div className="space-y-3">
                        {cartItems.map((item) => (
                          <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                            <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 truncate">{item.name}</p>
                              <p className="text-xs text-gray-500 mt-1">{formatPrice(item.price)} each</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 rounded-full border border-gray-300">-</button>
                              <span className="w-5 text-center font-semibold text-sm">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 rounded-full border border-gray-300">+</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-2xl p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Apply Coupon</h4>
                      <div className="flex gap-2">
                        <input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="TRAVEL10" className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <button onClick={applyCoupon} className="px-4 py-3 bg-gray-900 text-white rounded-xl font-semibold">Apply</button>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                        <span>Valid: TRAVEL10, BUDDY15, SAVE20</span>
                        {appliedCoupon && <button onClick={removeCoupon} className="text-rose-600 font-semibold">Remove</button>}
                      </div>
                    </div>

                    <button onClick={() => setCheckoutStep(3)} className="w-full md:w-auto px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700">Continue to Payment</button>
                  </div>
                )}

                {checkoutStep === 3 && (
                  <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-bold text-gray-900">Select Payment Method</h4>
                      <span className={`text-xs px-3 py-1 rounded-full ${paymentMethod === 'online' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}`}>
                        {paymentMethod === 'online' ? 'Instant' : 'COD'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => setPaymentMethod('online')} className={`px-4 py-3 rounded-xl border font-semibold ${paymentMethod === 'online' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-300'}`}>Online Payment</button>
                      <button onClick={() => setPaymentMethod('cod')} className={`px-4 py-3 rounded-xl border font-semibold ${paymentMethod === 'cod' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-300'}`}>Cash on Delivery</button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {paymentOptions.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => setPaymentProvider(option.id)}
                          className={`rounded-xl border p-3 text-left ${paymentProvider === option.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}
                        >
                          <div className="text-lg">{option.icon}</div>
                          <div className="text-sm font-semibold text-gray-900 mt-1">{option.label}</div>
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl border border-gray-200 bg-gray-50">
                        <p className="text-xs text-gray-500 uppercase font-semibold">UPI ID</p>
                        <div className="mt-2 flex items-center justify-between bg-white border border-gray-200 rounded-lg px-3 py-2">
                          <span className="font-semibold text-gray-900">{upiId}</span>
                          <button type="button" onClick={() => navigator.clipboard?.writeText(upiId)} className="text-xs text-blue-600 font-semibold">Copy</button>
                        </div>
                      </div>
                      <div className="p-3 rounded-xl border border-gray-200 bg-gray-50">
                        <p className="text-xs text-gray-500 uppercase font-semibold">QR Payment</p>
                        <p className="text-sm text-gray-600 mt-2">Scan using any UPI app (GPay, Paytm, PhonePe).</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button onClick={() => setCheckoutStep(2)} className="flex-1 px-4 py-3 rounded-xl border border-gray-300 font-semibold">Back</button>
                      <button onClick={confirmPurchase} disabled={buying || cartItems.length === 0} className="flex-1 px-4 py-3 rounded-xl bg-emerald-600 text-white font-semibold disabled:bg-gray-300">
                        {buying ? 'Processing...' : `Place Order (${paymentMethod === 'online' ? 'Online' : 'COD'})`}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sticky top-24">
                  <h4 className="font-bold text-gray-900 mb-3">Price Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span>MRP (incl. all taxes)</span><span>{formatPrice(cartTotal)}</span></div>
                    <div className="flex justify-between"><span>Payment Handling Fee</span><span>{formatPrice(handlingFee)}</span></div>
                    <div className="flex justify-between"><span>Platform Fee</span><span>{formatPrice(platformFee)}</span></div>
                    <div className="flex justify-between"><span>Discounts</span><span className="text-emerald-600">-{formatPrice(discountAmount)}</span></div>
                    <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-base"><span>Total Amount</span><span>{formatPrice(finalPayable)}</span></div>
                  </div>
                  {discountAmount > 0 && (
                    <div className="mt-4 rounded-xl bg-emerald-50 text-emerald-700 px-3 py-2 text-sm font-medium">
                      You save {formatPrice(discountAmount)} on this order.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
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

// --- CHAT LIST PAGE: Show all conversations from joined trips ---
const ChatListPage = ({ joinedTrips, currentUser, onOpenChat, myTrips, setPage }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [lastMessages, setLastMessages] = useState({}); // { tripId: { text, createdAt } }
  const [loading, setLoading] = useState(true);
  
  // Combine joined trips and created trips for chat
  const allChattableTrips = [
    ...joinedTrips.filter(trip => trip._id),
    ...myTrips.filter(trip => trip._id)
  ].reduce((unique, trip) => {
    const exists = unique.find(t => t._id === trip._id);
    return exists ? unique : [...unique, trip];
  }, []);

  // Load last message for each trip
  useEffect(() => {
    const loadLastMessages = async () => {
      setLoading(true);
      const messages = {};
      for (const trip of allChattableTrips) {
        try {
          const response = await fetch(`http://localhost:5000/api/trips/${trip._id}/messages`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          if (response.ok) {
            const tripMessages = await response.json();
            if (tripMessages && tripMessages.length > 0) {
              const lastMsg = tripMessages[tripMessages.length - 1];
              messages[trip._id] = {
                text: lastMsg.message || 'Message sent',
                createdAt: lastMsg.createdAt || null
              };
            }
          }
        } catch (err) {
          console.warn('Could not load messages for trip:', trip._id);
          // Continue even if one trip fails
        }
      }
      setLastMessages(messages);
      setLoading(false);
    };

    if (allChattableTrips && allChattableTrips.length > 0) {
      loadLastMessages();
    } else {
      setLoading(false);
    }
  }, [allChattableTrips]);

  // Filter trips based on search
  const filteredTrips = allChattableTrips.filter(trip => 
    trip.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trip.from?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trip.to?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trip.creator?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => {
    // Sort by trips with messages first
    const aHasMsg = !!lastMessages[a._id];
    const bHasMsg = !!lastMessages[b._id];
    if (aHasMsg && !bHasMsg) return -1;
    if (!aHasMsg && bHasMsg) return 1;
    return 0;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-green-600 text-white p-4 sticky top-0 z-20">
        <button
          onClick={() => setPage('home')}
          className="flex items-center gap-2 mb-4 hover:bg-white hover:bg-opacity-10 p-2 rounded-lg transition-colors"
        >
          <span className="text-xl">←</span>
          <span>Back</span>
        </button>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          💬 Messages
        </h1>
        <p className="text-teal-100 text-sm mt-1">{filteredTrips.length} conversation{filteredTrips.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Search Bar */}
      <div className="p-4 bg-white border-b">
        <div className="relative">
          <svg className="absolute left-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="space-y-2 p-4">
        {filteredTrips.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💭</div>
            <p className="text-gray-500 font-semibold mb-2">No conversations yet</p>
            <p className="text-gray-400 text-sm">Join trips to start chatting with other travelers</p>
          </div>
        ) : (
          filteredTrips.map((trip) => {
            const creatorName = trip.creator?.name || trip.creatorName || 'Unknown';
            const memberCount = trip.members?.length || 0;
            const lastMessage = lastMessages[trip._id];
            const lastMessagePreview = lastMessage?.text || 'No messages yet';
            const tripDate = trip.date ? new Date(trip.date).toLocaleDateString() : 'No date';
            const lastMessageTime = lastMessage?.createdAt
              ? new Date(lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : '';
            const titleInitial = (trip.title || 'T').charAt(0).toUpperCase();

            return (
              <button
                key={trip._id}
                onClick={() => {
                  onOpenChat(trip);
                  setPage('home');
                }}
                className="w-full bg-white rounded-2xl shadow-sm hover:shadow-md transition-all p-4 border border-gray-100 hover:border-orange-300 text-left group"
              >
                <div className="flex items-start gap-4">
                  {/* Instagram-style avatar */}
                  <div className="w-14 h-14 rounded-full p-[2px] bg-gradient-to-br from-orange-500 via-pink-500 to-red-500 flex-shrink-0">
                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-gray-800 font-bold text-lg">
                      {titleInitial}
                    </div>
                  </div>

                  {/* Trip Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-gray-900 truncate text-lg">{trip.title || 'Untitled Trip'}</h3>
                      {lastMessageTime && <span className="text-xs text-gray-400">{lastMessageTime}</span>}
                    </div>
                    <p className="text-sm text-gray-600 mt-1 truncate">
                      {trip.from} → {trip.to}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                      <span>📍 {creatorName}</span>
                      <span>•</span>
                      <span>{memberCount} member{memberCount !== 1 ? 's' : ''}</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-1">📅 {tripDate}</p>
                  </div>

                  {/* Chat Arrow */}
                  <div className="flex-shrink-0 text-orange-500 group-hover:text-orange-600 group-hover:translate-x-1 transition-all">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>

                {/* Last Message Preview */}
                {lastMessagePreview !== 'No messages yet' && (
                  <p className="text-xs text-gray-500 mt-3 truncate italic">
                    💬 {lastMessagePreview.substring(0, 50)}{lastMessagePreview.length > 50 ? '...' : ''}
                  </p>
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Quick Stats */}
      {filteredTrips.length > 0 && (
        <div className="px-4 pb-4 grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-4 border border-teal-100">
            <div className="text-2xl font-bold text-teal-600">{filteredTrips.length}</div>
            <div className="text-sm text-gray-600">Active Chats</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-100">
            <div className="text-2xl font-bold text-green-600">{allChattableTrips.reduce((sum, t) => sum + (t.members?.length || 0), 0)}</div>
            <div className="text-sm text-gray-600">Total Members</div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- PROFILE PAGE: Mobile-style About/Account ---
const ProfilePage = ({ currentUser, onUpdateProfile, onLogout }) => {
  const fileInputRef = useRef(null);
  const [profileTab, setProfileTab] = useState('about');
  const [editorType, setEditorType] = useState('');
  const buildProfileFormData = (user) => ({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    country: user?.country || '',
    city: user?.city || '',
    travelerType: user?.travelerType || '',
    travelStyle: user?.travelStyle || '',
    interests: user?.interests || '',
    profilePhoto: user?.profilePhoto || '',
    vehicleType: user?.vehicleType || '',
    vehicleNumber: user?.vehicleNumber || '',
    vehicleColor: user?.vehicleColor || ''
  });

  const [formData, setFormData] = useState(() => buildProfileFormData(currentUser));

  useEffect(() => {
    if (!editorType) {
      setFormData(buildProfileFormData(currentUser));
    }
  }, [currentUser, editorType]);

  const isGovtIdVerified = Boolean(
    currentUser?.govtIdVerified ||
    currentUser?.idVerified ||
    currentUser?.verificationStatus === 'approved'
  );
  const isEmailVerified = Boolean(currentUser?.emailVerified || currentUser?.isEmailVerified);
  const isPhoneVerified = Boolean(currentUser?.phoneVerified);

  const hasProfilePhoto = Boolean(formData.profilePhoto);
  const hasPersonalDetails = Boolean(formData.name && formData.email);
  const hasBio = Boolean(formData.bio?.trim());
  const hasTravelPreferences = Boolean(
    formData.travelerType || formData.travelStyle || formData.interests
  );

  const completionFlags = [
    hasProfilePhoto,
    hasPersonalDetails,
    isGovtIdVerified,
    isEmailVerified,
    isPhoneVerified,
    hasBio
  ];
  const completedCount = completionFlags.filter(Boolean).length;
  const completionPercent = Math.round((completedCount / completionFlags.length) * 100);

  const vehicleSummary = [formData.vehicleType, formData.vehicleNumber, formData.vehicleColor]
    .filter(Boolean)
    .join(' • ');

  const gmailComposeUrl = formData.email
    ? `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(formData.email)}`
    : '';

  const phoneDialValue = formData.phone
    ? formData.phone.replace(/[^\d+]/g, '')
    : '';

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const nextPhoto = String(reader.result || '');
      setFormData((prev) => ({ ...prev, profilePhoto: nextPhoto }));
      onUpdateProfile({ profilePhoto: nextPhoto });
    };
    reader.readAsDataURL(file);
  };

  const saveEditorChanges = () => {
    const updates = {};

    if (editorType === 'personal') {
      updates.name = formData.name;
      updates.email = formData.email;
      updates.phone = formData.phone;
      updates.country = formData.country;
      updates.city = formData.city;
    }

    if (editorType === 'bio') {
      updates.bio = formData.bio;
    }

    if (editorType === 'preferences') {
      updates.travelerType = formData.travelerType;
      updates.travelStyle = formData.travelStyle;
      updates.interests = formData.interests;
    }

    if (editorType === 'vehicle') {
      updates.vehicleType = formData.vehicleType;
      updates.vehicleNumber = formData.vehicleNumber;
      updates.vehicleColor = formData.vehicleColor;
    }

    onUpdateProfile(updates);
    setEditorType('');
  };

  const openPlaceholder = (label) => {
    alert(`${label} will be available soon.`);
  };

  const RowIcon = ({ done }) => (
    <span
      className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold ${
        done
          ? 'bg-blue-600 border-blue-600 text-white'
          : 'border-blue-500 text-blue-500'
      }`}
    >
      {done ? '✓' : '+'}
    </span>
  );

  const Chevron = () => (
    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );

  const AccountRow = ({ label, onClick, danger }) => (
    <button
      onClick={onClick}
      className={`w-full px-4 py-4 border-b border-gray-100 flex items-center justify-between text-left ${
        danger ? 'text-blue-700' : 'text-gray-900'
      }`}
      type="button"
    >
      <span className="font-medium">{label}</span>
      {!danger && <Chevron />}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-2xl mx-auto bg-white min-h-screen shadow-sm">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />

        <div className="flex border-b border-gray-200 sticky top-0 bg-white z-20">
          <button
            onClick={() => setProfileTab('about')}
            className={`flex-1 py-4 text-center font-semibold transition-colors ${
              profileTab === 'about' ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-500'
            }`}
            type="button"
          >
            About you
          </button>
          <button
            onClick={() => setProfileTab('account')}
            className={`flex-1 py-4 text-center font-semibold transition-colors ${
              profileTab === 'account' ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-500'
            }`}
            type="button"
          >
            Account
          </button>
        </div>

        {profileTab === 'about' && (
          <div className="pb-10">
            <button
              onClick={() => setEditorType('personal')}
              className="w-full px-6 py-5 border-b border-gray-100 flex items-center justify-between text-left"
              type="button"
            >
              <div className="flex items-center gap-4">
                {formData.profilePhoto ? (
                  <img
                    src={formData.profilePhoto}
                    alt={formData.name || 'Profile'}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-xl text-gray-500 font-semibold">
                    {(formData.name || '?').charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-3xl leading-none font-extrabold text-blue-950">{formData.name || 'Your name'}</p>
                  <p className="text-gray-500 mt-1">Newcomer</p>
                  <div className="mt-3 flex items-center gap-2">
                    <a
                      href={gmailComposeUrl || '#'}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => {
                        if (!gmailComposeUrl) e.preventDefault();
                      }}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
                        gmailComposeUrl
                          ? 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50'
                          : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                      }`}
                      aria-label="Open email in Gmail"
                      title={formData.email ? `Email: ${formData.email}` : 'Email not available'}
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 6h16v12H4z" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="m4 7 8 6 8-6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Mail
                    </a>

                    <a
                      href={phoneDialValue ? `tel:${phoneDialValue}` : '#'}
                      onClick={(e) => {
                        if (!phoneDialValue) e.preventDefault();
                      }}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
                        phoneDialValue
                          ? 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50'
                          : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                      }`}
                      aria-label="Call phone number"
                      title={formData.phone ? `Call: ${formData.phone}` : 'Phone not available'}
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.78 19.78 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.78 19.78 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.63 2.63a2 2 0 0 1-.45 2.11L8.1 9.91a16 16 0 0 0 6 6l1.45-1.19a2 2 0 0 1 2.11-.45c.85.3 1.73.51 2.63.63A2 2 0 0 1 22 16.92z" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Phone
                    </a>
                  </div>
                </div>
              </div>
              <Chevron />
            </button>

            <div className="mx-4 mt-4 rounded-2xl bg-blue-50 p-5 border border-blue-100">
              <h3 className="text-3xl leading-none font-semibold text-blue-950">Complete your profile</h3>
              <p className="text-gray-700 mt-3 text-sm">This helps build trust, encouraging members to travel with you.</p>
              <p className="text-blue-950 font-semibold mt-3">{completedCount} out of 6 complete</p>

              <div className="mt-3 h-2 rounded-full bg-white overflow-hidden">
                <div className="h-2 bg-blue-600 rounded-full" style={{ width: `${completionPercent}%` }} />
              </div>

              {!hasProfilePhoto && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-3 text-blue-700 font-semibold"
                  type="button"
                >
                  Add profile picture
                </button>
              )}
            </div>

            <button
              onClick={() => setEditorType('personal')}
              className="px-6 py-4 text-blue-700 font-semibold"
              type="button"
            >
              Edit personal details
            </button>

            <div className="h-2 bg-gray-100" />

            <section className="px-6 py-5">
              <h4 className="text-2xl font-semibold text-blue-950">Verify your profile</h4>
              <div className="mt-4 space-y-4">
                <button onClick={() => openPlaceholder('Verify your Govt. ID')} className="w-full flex items-center justify-between" type="button">
                  <span className="flex items-center gap-3 text-blue-700 font-semibold">
                    <RowIcon done={isGovtIdVerified} />
                    Verify your Govt. ID
                  </span>
                  <span className="text-xs text-gray-500">{isGovtIdVerified ? 'Verified' : 'Required'}</span>
                </button>

                <button onClick={() => openPlaceholder('Confirm email')} className="w-full flex items-center justify-between" type="button">
                  <span className="flex items-center gap-3 text-blue-700 font-semibold">
                    <RowIcon done={isEmailVerified} />
                    Confirm email {formData.email || ''}
                  </span>
                  <span className="text-xs text-gray-500">{isEmailVerified ? 'Verified' : 'Pending'}</span>
                </button>

                <div className="w-full flex items-center justify-between">
                  <span className="flex items-center gap-3 text-gray-700">
                    <RowIcon done={isPhoneVerified} />
                    {formData.phone || 'No phone number'}
                  </span>
                  <span className="text-xs text-gray-500">{isPhoneVerified ? 'Verified' : 'Pending'}</span>
                </div>
              </div>
            </section>

            <div className="h-2 bg-gray-100" />

            <section className="px-6 py-5">
              <h4 className="text-2xl font-semibold text-blue-950">About you</h4>
              <div className="mt-4 space-y-4">
                <button onClick={() => setEditorType('bio')} className="w-full flex items-center justify-between" type="button">
                  <span className="flex items-center gap-3 text-blue-700 font-semibold">
                    <RowIcon done={hasBio} />
                    {hasBio ? 'Edit your mini bio' : 'Add a mini bio'}
                  </span>
                  <Chevron />
                </button>

                <button onClick={() => setEditorType('preferences')} className="w-full flex items-center justify-between" type="button">
                  <span className="flex items-center gap-3 text-blue-700 font-semibold">
                    <RowIcon done={hasTravelPreferences} />
                    Edit travel preferences
                  </span>
                  <Chevron />
                </button>
              </div>
            </section>

            <div className="h-px bg-gray-100" />

            <section className="px-6 py-5">
              <h4 className="text-2xl font-semibold text-blue-950">Vehicles</h4>
              <div className="mt-4">
                <button onClick={() => setEditorType('vehicle')} className="w-full flex items-center justify-between" type="button">
                  <span className="flex items-center gap-3 text-blue-700 font-semibold">
                    <RowIcon done={Boolean(vehicleSummary)} />
                    {vehicleSummary ? `Edit vehicle (${vehicleSummary})` : 'Add vehicle'}
                  </span>
                  <Chevron />
                </button>
              </div>
            </section>
          </div>
        )}

        {profileTab === 'account' && (
          <div className="pb-10">
            <AccountRow label="Ratings" onClick={() => openPlaceholder('Ratings')} />
            <AccountRow label="Saved passengers" onClick={() => openPlaceholder('Saved passengers')} />
            <AccountRow label="Communication preferences" onClick={() => openPlaceholder('Communication preferences')} />
            <AccountRow label="Password" onClick={() => openPlaceholder('Password')} />
            <AccountRow label="Postal address" onClick={() => openPlaceholder('Postal address')} />
            <AccountRow label="Payout methods" onClick={() => openPlaceholder('Payout methods')} />
            <AccountRow label="Payouts" onClick={() => openPlaceholder('Payouts')} />
            <AccountRow label="Payment methods" onClick={() => openPlaceholder('Payment methods')} />
            <AccountRow label="Payments & refunds" onClick={() => openPlaceholder('Payments & refunds')} />
            <AccountRow label="Help" onClick={() => openPlaceholder('Help')} />
            <AccountRow label="Terms and Conditions" onClick={() => openPlaceholder('Terms and Conditions')} />
            <AccountRow label="Data protection" onClick={() => openPlaceholder('Data protection')} />
            <AccountRow label="Log out" onClick={onLogout} danger />
            <AccountRow
              label="Close my account"
              onClick={() => {
                const agreed = window.confirm('Are you sure you want to close your account?');
                if (agreed) {
                  alert('Account closure request submitted.');
                }
              }}
              danger
            />
          </div>
        )}

        {editorType && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setEditorType('')}>
            <div className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl p-5" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {editorType === 'personal' && 'Edit personal details'}
                {editorType === 'bio' && 'Edit mini bio'}
                {editorType === 'preferences' && 'Edit travel preferences'}
                {editorType === 'vehicle' && 'Add vehicle'}
              </h3>

              <div className="space-y-3">
                {editorType === 'personal' && (
                  <>
                    <input type="text" placeholder="Full name" value={formData.name} onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))} className="w-full" />
                    <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))} className="w-full" />
                    <input type="tel" placeholder="Phone" value={formData.phone} onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))} className="w-full" />
                    <input type="text" placeholder="Country" value={formData.country} onChange={(e) => setFormData((prev) => ({ ...prev, country: e.target.value }))} className="w-full" />
                    <input type="text" placeholder="City" value={formData.city} onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))} className="w-full" />
                  </>
                )}

                {editorType === 'bio' && (
                  <textarea
                    rows={4}
                    placeholder="Tell others about yourself"
                    value={formData.bio}
                    onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                    className="w-full"
                  />
                )}

                {editorType === 'preferences' && (
                  <>
                    <select value={formData.travelerType} onChange={(e) => setFormData((prev) => ({ ...prev, travelerType: e.target.value }))} className="w-full">
                      <option value="">Traveler type</option>
                      <option value="Solo">Solo</option>
                      <option value="Family">Family</option>
                      <option value="Friends">Friends</option>
                      <option value="Business">Business</option>
                    </select>
                    <select value={formData.travelStyle} onChange={(e) => setFormData((prev) => ({ ...prev, travelStyle: e.target.value }))} className="w-full">
                      <option value="">Travel style</option>
                      <option value="Budget">Budget</option>
                      <option value="Comfort">Comfort</option>
                      <option value="Luxury">Luxury</option>
                      <option value="Adventure">Adventure</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Interests (comma separated)"
                      value={formData.interests}
                      onChange={(e) => setFormData((prev) => ({ ...prev, interests: e.target.value }))}
                      className="w-full"
                    />
                  </>
                )}

                {editorType === 'vehicle' && (
                  <>
                    <input type="text" placeholder="Vehicle type (Car/Bike)" value={formData.vehicleType} onChange={(e) => setFormData((prev) => ({ ...prev, vehicleType: e.target.value }))} className="w-full" />
                    <input type="text" placeholder="Vehicle number" value={formData.vehicleNumber} onChange={(e) => setFormData((prev) => ({ ...prev, vehicleNumber: e.target.value }))} className="w-full" />
                    <input type="text" placeholder="Vehicle color" value={formData.vehicleColor} onChange={(e) => setFormData((prev) => ({ ...prev, vehicleColor: e.target.value }))} className="w-full" />
                  </>
                )}
              </div>

              <div className="mt-5 flex gap-3">
                <button onClick={saveEditorChanges} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 font-semibold" type="button">
                  Save
                </button>
                <button onClick={() => setEditorType('')} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg py-3 font-semibold" type="button">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- SETTINGS PAGE ---
const SettingsPage = ({ currentUser, theme, onToggleTheme, setPage, onLogout }) => {
  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-24">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => setPage('profile')}
          className="mb-4 flex items-center gap-2 text-blue-600 font-semibold"
        >
          <span className="text-xl">←</span> Back to Profile
        </button>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">⚙️ Settings</h2>
          <p className="text-gray-600">Manage app preferences and account actions.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="bg-white rounded-2xl shadow p-5">
            <h3 className="font-semibold text-gray-900 mb-2">Appearance</h3>
            <p className="text-sm text-gray-600 mb-4">Switch between light and dark mode.</p>
            <button
              onClick={onToggleTheme}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl"
            >
              {theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow p-5">
            <h3 className="font-semibold text-gray-900 mb-2">Account</h3>
            <p className="text-sm text-gray-600 mb-4">Signed in as {currentUser?.email || 'Guest'}</p>
            <button
              onClick={onLogout}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl"
            >
              Logout
            </button>
          </div>

          <button
            onClick={() => setPage('home')}
            className="bg-white rounded-2xl shadow p-5 text-left hover:shadow-md transition-all"
          >
            <div className="text-2xl mb-2">🏠</div>
            <h3 className="font-semibold text-gray-900">Home</h3>
            <p className="text-sm text-gray-600">Return to the main travel feed.</p>
          </button>

          <button
            onClick={() => setPage('requests')}
            className="bg-white rounded-2xl shadow p-5 text-left hover:shadow-md transition-all"
          >
            <div className="text-2xl mb-2">📬</div>
            <h3 className="font-semibold text-gray-900">Requests</h3>
            <p className="text-sm text-gray-600">Review join and booking requests.</p>
          </button>
        </div>
      </div>
    </div>
  );
};

// --- LOCATION PAGE ---
const LocationPage = ({ currentUser, myPlans, setPage }) => {
  const locationLabel = currentUser?.location || [currentUser?.city, currentUser?.country].filter(Boolean).join(', ');

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-24">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => setPage('profile')}
          className="mb-4 flex items-center gap-2 text-blue-600 font-semibold"
        >
          <span className="text-xl">←</span> Back to Profile
        </button>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">📍 Location</h2>
          <p className="text-gray-600">Your saved location and trip-related places.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="bg-white rounded-2xl shadow p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Current Location</h3>
            <p className="text-gray-600">{locationLabel || 'Location not set yet'}</p>
            {currentUser?.country && <p className="text-sm text-gray-500 mt-2">Country: {currentUser.country}</p>}
            {currentUser?.city && <p className="text-sm text-gray-500">City: {currentUser.city}</p>}
          </div>

          <div className="bg-white rounded-2xl shadow p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Trip Destinations</h3>
            {myPlans?.length ? (
              <div className="space-y-2">
                {myPlans.slice(0, 5).map((plan) => (
                  <div key={plan._id || plan.id} className="bg-gray-50 rounded-xl px-4 py-3">
                    <div className="font-medium text-gray-800">{plan.from} → {plan.to}</div>
                    <div className="text-sm text-gray-500">{plan.date || 'Date not set'}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No trips available yet.</p>
            )}
          </div>

          <button
            onClick={() => setPage('settings')}
            className="bg-white rounded-2xl shadow p-5 text-left hover:shadow-md transition-all"
          >
            <div className="text-2xl mb-2">⚙️</div>
            <h3 className="font-semibold text-gray-900">Go to Settings</h3>
            <p className="text-sm text-gray-600">Adjust theme and account preferences.</p>
          </button>

          <button
            onClick={() => setPage('home')}
            className="bg-white rounded-2xl shadow p-5 text-left hover:shadow-md transition-all"
          >
            <div className="text-2xl mb-2">🏠</div>
            <h3 className="font-semibold text-gray-900">Back to Home</h3>
            <p className="text-sm text-gray-600">Return to the main feed.</p>
          </button>
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
            const response = await fetch(`http://localhost:5000/api/auth/user/${id}`, {
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
        const incomingTripId = (data.tripId || data.message.trip?._id || data.message.trip?.id || data.message.trip || '').toString();
        const currentTripId = (trip?._id || trip?.id || '').toString();
        if (!incomingTripId || incomingTripId !== currentTripId) {
          console.log('↪️ Ignoring message for different trip:', { incomingTripId, currentTripId });
          return;
        }

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
      socketService.off('new-message', handleNewMessage);
    };
  }, [trip._id]);

  const loadMessages = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/trips/${trip._id}/messages`, {
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

  const sendMessagePayload = async (content) => {
    const messageText = content.trim();
    if (!messageText) return;

    try {
      const response = await fetch(`http://localhost:5000/api/trips/${trip._id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ message: messageText })
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

  const sendMessage = async (e) => {
    e.preventDefault();
    await sendMessagePayload(newMessage);
  };

  const sendQuickHeart = async () => {
    await sendMessagePayload('❤️');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="chat-modal-container rounded-lg shadow-xl max-w-4xl w-full h-[85vh] flex flex-col bg-white" onClick={(e) => e.stopPropagation()}>
        {/* Header - Instagram-like Style */}
        <div className="bg-gradient-to-r from-orange-500 to-rose-500 text-white p-4 rounded-t-lg flex justify-between items-center shadow-md">
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
                  Active now · {members?.length || 0} participant{(members?.length || 0) !== 1 ? 's' : ''}
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
            <div className="flex-1 overflow-y-auto p-4 space-y-3 chat-messages bg-slate-50">
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
                                  <div className="w-4 h-4 rounded-full bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center text-white text-[8px] font-bold">
                                    {msg.sender.name?.charAt(0)}
                                  </div>
                                )}
                                {msg.sender.name}
                              </>
                            )}
                          </div>
                        )}
                        <div
                          className={`px-4 py-2 rounded-2xl shadow-sm ${
                            isOwnMessage
                              ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-br-md'
                              : 'bg-white text-gray-800 rounded-bl-md border border-gray-200'
                          }`}
                        >
                          <div className="break-words">{msg.message}</div>
                          <div className={`text-[10px] mt-1 flex items-center gap-1 ${isOwnMessage ? 'text-cyan-100 justify-end' : 'text-gray-500'}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {isOwnMessage && <span>Seen</span>}
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
            <form onSubmit={sendMessage} className="p-4 border-t bg-white">
              <div className="flex gap-2 items-center">
                <button
                  type="button"
                  onClick={sendQuickHeart}
                  className="w-11 h-11 rounded-full bg-rose-50 text-rose-500 hover:bg-rose-100 text-xl"
                  title="Send heart"
                >
                  ❤
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Message..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-full hover:from-orange-600 hover:to-rose-600 disabled:from-gray-400 disabled:to-gray-400 font-semibold shadow-md transition-all"
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
const MembersPage = ({
  trip,
  currentUser,
  onRemoveMember,
  onDeleteTrip,
  onBack,
  receivedRequests = [],
  onAcceptRequest,
  onRejectRequest,
  loadingActions = {}
}) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedMemberToRemove, setSelectedMemberToRemove] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [loadingUserDetails, setLoadingUserDetails] = useState(false);
  const currentUserId = (currentUser?._id || currentUser?.id || '').toString();
  const tripCreatorId = (trip?.creator?._id || trip?.creator?.id || trip?.creator || '').toString();
  const tripId = (trip?._id || trip?.id || '').toString();
  const isHost = !!currentUserId && !!tripCreatorId && currentUserId === tripCreatorId;

  const getMemberUserId = (member) => {
    if (!member) return '';
    if (typeof member === 'string') return member;

    const userField = member.user;
    if (userField) {
      if (typeof userField === 'string') return userField;
      return userField._id || userField.id || '';
    }

    return member._id || member.id || '';
  };

  const pendingTripRequests = receivedRequests.filter((request) => {
    const requestTripId = (request?.trip?._id || request?.trip || request?.tripId || '').toString();
    return request?.status === 'pending' && requestTripId === tripId;
  });

  const handleRemoveMember = async (tripId, userId, userName) => {
    await onRemoveMember(tripId, userId, userName);
    // Update local members list immediately
    setMembers(prev => prev.filter(member => (member?._id || member?.id || '').toString() !== (userId || '').toString()));
    setSelectedMemberToRemove(null);
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
      const memberId = getMemberUserId(member);
      if (!memberId) {
        setSelectedUser(member);
        return;
      }

      const response = await fetch(`http://localhost:5000/api/auth/user/${memberId}`, {
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
        const memberPromises = (trip?.members || []).map(async (member) => {
          // Extract actual user id from member subdocument
          const memberId = getMemberUserId(member);

          if (!memberId) {
            return { _id: '', name: 'Unknown User', email: 'No email available', clickable: false };
          }
          
          try {
            const response = await fetch(`http://localhost:5000/api/auth/user/${memberId}`, {
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

  if (!trip) {
    return (
      <div className="p-4 pb-24">
        <div className="flex items-center mb-6">
          <button onClick={onBack} className="mr-3 p-2 hover:bg-gray-100 rounded">
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Plan not found</h1>
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
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowChat(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            💬 Group Chat
          </button>
          {isHost && (
            <button
              onClick={() => onDeleteTrip && onDeleteTrip(trip)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              🗑️ Delete Plan
            </button>
          )}
        </div>
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

      {/* Pending Join Requests */}
      {isHost && (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Pending Join Requests</h2>
            <span className="text-sm text-gray-500">{pendingTripRequests.length} pending</span>
          </div>

          {pendingTripRequests.length === 0 ? (
            <p className="text-sm text-gray-500">No pending requests for this plan.</p>
          ) : (
            <div className="space-y-3">
              {pendingTripRequests.map((request) => {
                const requestId = request._id;
                const requestUser = request.user || {};
                const requestUserName = requestUser?.name || request.userName || 'Traveler';
                const requestUserEmail = requestUser?.email || 'Email not available';

                return (
                  <div key={requestId} className="border border-gray-200 rounded-lg p-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-gray-800 truncate">{requestUserName}</p>
                      <p className="text-sm text-gray-500 truncate">{requestUserEmail}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onRejectRequest && onRejectRequest(requestId)}
                        disabled={loadingActions?.[`reject_${requestId}`] || loadingActions?.[`accept_${requestId}`]}
                        className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 disabled:opacity-60"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => onAcceptRequest && onAcceptRequest(requestId)}
                        disabled={loadingActions?.[`accept_${requestId}`] || loadingActions?.[`reject_${requestId}`]}
                        className="px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-60"
                      >
                        {loadingActions?.[`accept_${requestId}`] ? 'Accepting...' : 'Accept'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Members List */}
      {isHost && selectedMemberToRemove && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center justify-between gap-3">
          <p className="text-sm text-red-700">
            Selected for removal: <span className="font-semibold">{selectedMemberToRemove.name}</span>
          </p>
          <button
            onClick={() => handleRemoveMember(tripId, selectedMemberToRemove._id, selectedMemberToRemove.name)}
            className="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700"
          >
            Remove Selected Member
          </button>
        </div>
      )}

      <div className="space-y-3">
        {members.map((member) => {
          const memberId = (member?._id || member?.id || '').toString();
          const isCreator = memberId === tripCreatorId;
          const isCurrentUser = memberId === currentUserId;
          const isRemovable = !isCreator && !isCurrentUser && isHost;
          const isSelectedForRemoval = selectedMemberToRemove?._id === member._id;
          
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
                
                {isRemovable && (
                  <button
                    onClick={() => setSelectedMemberToRemove(isSelectedForRemoval ? null : member)}
                    className={`px-3 py-1.5 text-sm rounded transition-colors ${
                      isSelectedForRemoval
                        ? 'bg-red-100 text-red-700 border border-red-300'
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                  >
                    {isSelectedForRemoval ? 'Selected' : 'Select'}
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
            <p className="text-sm text-white/80 mt-1">👤 Driver: {typeof ride.driver === 'string' ? ride.driver : (ride.driver?.name || 'Driver')}</p>
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
      
      // Auto-fill the verification code for demo
      setVerificationCode(code);
      
      // In production, send email with code
      // For demo, code is logged to console and auto-filled
      console.log('=== PASSWORD RESET CODE ===');
      console.log(`Email: ${email}`);
      console.log(`Verification Code: ${code}`);
      console.log('Code has been auto-filled for demo');
      console.log('===========================');
      
      setStep('verification');
      setError(''); // Clear any errors
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
        
        // Auto-close modal after 2 seconds
        setTimeout(() => {
          handleClose();
        }, 2000);
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
          <form onSubmit={handleVerifyCode}>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Verification code has been sent to <strong className="text-gray-900 dark:text-white">{email}</strong>
            </p>
            
            {/* Auto-filled notification */}
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900 dark:bg-opacity-20 border border-green-200 dark:border-green-700 rounded-lg">
              <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
                <span className="text-lg">✅</span>
                <div className="text-sm">
                  <p className="font-semibold">Code Auto-Filled!</p>
                  <p className="text-xs opacity-90">The verification code has been automatically entered. Click "Verify Code" to continue.</p>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-2">
                Verification Code
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={handleVerificationCodeChange}
                className="w-full px-4 py-3 bg-green-50 dark:bg-green-900 dark:bg-opacity-20 border-2 border-green-300 dark:border-green-600 text-gray-900 dark:text-white rounded-lg focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none text-center text-2xl tracking-widest font-mono font-bold"
                placeholder="000000"
                maxLength="6"
                required
                readOnly
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 text-center">
                Code verified and ready to proceed
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep('email')}
                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-3 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-600 to-teal-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-teal-700 transition-all shadow-lg"
              >
                Verify Code
              </button>
            </div>
            <button
              type="button"
              onClick={handleSendVerification}
              className="w-full mt-4 text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
            >
              Didn't receive code? Resend
            </button>
          </form>
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
      // Server-first login for cross-browser sync
      const result = await authAPI.login(email, password);
      onLogin(result);
    } catch (err) {
      // Fallback to legacy local demo accounts only when server is unreachable
      const isNetworkIssue = err.name === 'TypeError' || String(err.message || '').toLowerCase().includes('fetch');
      if (isNetworkIssue) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

        if (user && user.password === password) {
          const token = 'demo-token-' + user.id;
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          onLogin({ user, token });
          return;
        }
      }

      setError(err.message || 'Login failed');
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
  const [countryCode, setCountryCode] = useState('+1');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOTP, setGeneratedOTP] = useState('');
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [phoneValidation, setPhoneValidation] = useState({ valid: false, message: '' });
  const [passwordStrength, setPasswordStrength] = useState({ strength: 0, message: '', color: '' });

  // Popular country codes
  const countryCodes = [
    { code: '+1', country: 'US/Canada', flag: '🇺🇸' },
    { code: '+91', country: 'India', flag: '🇮🇳' },
    { code: '+44', country: 'UK', flag: '🇬🇧' },
    { code: '+61', country: 'Australia', flag: '🇦🇺' },
    { code: '+86', country: 'China', flag: '🇨🇳' },
    { code: '+81', country: 'Japan', flag: '🇯🇵' },
    { code: '+49', country: 'Germany', flag: '🇩🇪' },
    { code: '+33', country: 'France', flag: '🇫🇷' },
    { code: '+55', country: 'Brazil', flag: '🇧🇷' },
    { code: '+971', country: 'UAE', flag: '🇦🇪' },
    { code: '+65', country: 'Singapore', flag: '🇸🇬' },
    { code: '+82', country: 'South Korea', flag: '🇰🇷' },
    { code: '+7', country: 'Russia', flag: '🇷🇺' },
    { code: '+34', country: 'Spain', flag: '🇪🇸' },
    { code: '+39', country: 'Italy', flag: '🇮🇹' },
    { code: '+60', country: 'Malaysia', flag: '🇲🇾' },
    { code: '+66', country: 'Thailand', flag: '🇹🇭' },
    { code: '+27', country: 'South Africa', flag: '🇿🇦' },
    { code: '+52', country: 'Mexico', flag: '🇲🇽' },
    { code: '+64', country: 'New Zealand', flag: '🇳🇿' }
  ];

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

    // Extract digits only
    const digits = phoneNum.replace(/\D/g, '');

    // Length check (without country code)
    if (digits.length < 7) {
      return { valid: false, message: 'Phone number too short (minimum 7 digits)' };
    }
    if (digits.length > 12) {
      return { valid: false, message: 'Phone number too long (maximum 12 digits)' };
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
    // Remove any non-digit characters except spaces and dashes
    const cleaned = value.replace(/[^0-9\s-]/g, '');
    setPhone(cleaned);
    const validation = validatePhoneNumber(cleaned);
    setPhoneValidation(validation);
  };

  const handleSendOTP = async () => {
    if (!phoneValidation.valid) {
      setError('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Generate random 4-digit OTP locally
      const randomOTP = Math.floor(1000 + Math.random() * 9000).toString();
      setGeneratedOTP(randomOTP);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setOtpSent(true);
      setSuccess(`OTP sent successfully! (Demo: ${randomOTP})`);
      setCountdown(60);
      
      console.log('\n📱 OTP SENT');
      console.log('━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`Phone: ${countryCode}${phone}`);
      console.log(`OTP Code: ${randomOTP}`);
      console.log('Note: Any 4-digit code will work for verification');
      console.log('━━━━━━━━━━━━━━━━━━━━━━\n');
    } catch (err) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 4) {
      setError('Please enter a valid 4-digit OTP');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Accept any 4-digit code
      // Mark as verified
      setPhoneVerified(true);
      setSuccess('Phone verified successfully! ✓');
      
      console.log('\n✅ OTP VERIFIED');
      console.log('━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`Entered OTP: ${otp}`);
      console.log(`Generated OTP: ${generatedOTP}`);
      console.log('Status: Accepted (any 4-digit code works)');
      console.log('━━━━━━━━━━━━━━━━━━━━━━\n');
      
      // Wait 2 seconds before going back to show success message
      setTimeout(() => {
        setStep(1);
        setOtpSent(false);
        setOtp('');
        setError('');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Verification failed');
      setPhoneVerified(false);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Generate new random 4-digit OTP
      const randomOTP = Math.floor(1000 + Math.random() * 9000).toString();
      setGeneratedOTP(randomOTP);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setSuccess(`OTP resent successfully! (Demo: ${randomOTP})`);
      setCountdown(60);
      
      console.log('\n🔄 OTP RESENT');
      console.log('━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`New OTP: ${randomOTP}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━\n');
    } catch (err) {
      setError(err.message || 'Failed to resend OTP');
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
      // Combine country code with phone number
      const fullPhoneNumber = countryCode + phone;

      // Server-first registration so plans sync across browsers/devices
      const result = await authAPI.register(name, email, password, fullPhoneNumber, true);
      onSignup(result);
    } catch (err) {
      // Fallback to local demo account only if backend is unavailable
      const isNetworkIssue = err.name === 'TypeError' || String(err.message || '').toLowerCase().includes('fetch');
      if (isNetworkIssue) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (existingUser) {
          setError('Email already registered. Please login instead.');
          return;
        }

        const fullPhoneNumber = countryCode + phone;
        const newUser = {
          id: Date.now().toString(),
          name,
          email,
          password,
          phone: fullPhoneNumber,
          phoneVerified,
          createdAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('token', 'demo-token-' + newUser.id);
        localStorage.setItem('user', JSON.stringify(newUser));
        onSignup({ user: newUser, token: 'demo-token-' + newUser.id });
        return;
      }

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
                    <div className="flex-1 flex gap-2">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="px-3 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors bg-white"
                        disabled={phoneVerified}
                      >
                        {countryCodes.map((country) => (
                          <option key={country.code} value={country.code}>
                            {country.flag} {country.code}
                          </option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        className={`flex-1 px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                          phoneVerified 
                            ? 'border-green-300 bg-green-50' 
                            : phone && !phoneValidation.valid 
                              ? 'border-red-300 focus:border-red-500' 
                              : 'border-gray-200 focus:border-blue-500'
                        }`}
                        placeholder="1234567890"
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
                    <span className="font-medium">Select country code</span> and enter your phone number
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
                  <div className="flex gap-2">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="px-3 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors bg-white"
                      disabled={otpSent}
                    >
                      {countryCodes.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.flag} {country.code}
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      className={`flex-1 px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                        otpSent 
                          ? 'border-gray-200 bg-gray-50' 
                          : phone && !phoneValidation.valid 
                            ? 'border-red-300 focus:border-red-500' 
                            : 'border-gray-200 focus:border-blue-500'
                      }`}
                      placeholder="1234567890"
                      disabled={otpSent}
                    />
                  </div>
                  {phone && !otpSent && (
                    <p className={`text-xs mt-1 ${phoneValidation.valid ? 'text-green-600' : 'text-red-600'}`}>
                      {phoneValidation.message}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {otpSent 
                      ? `OTP sent to ${countryCode}${phone}` 
                      : 'Select country code and enter your phone number'
                    }
                  </p>
                </div>

                {!otpSent ? (
                  <>
                    <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm">
                      <strong>Demo Mode:</strong> Any 4-digit number will be accepted (e.g., 1234, 5678, 9999)
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
                        Enter OTP (4 digits)
                      </label>
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors text-center text-3xl tracking-widest font-bold"
                        placeholder="0000"
                        maxLength={4}
                        autoFocus
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Enter any 4-digit code to verify
                      </p>
                    </div>

                    <button
                      onClick={handleVerifyOTP}
                      disabled={loading || otp.length !== 4}
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

// --- LOGIN PROMPT MODAL (for guests trying to access restricted features) ---
const LoginPromptModal = ({ onLogin, onSignup, onDismiss }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        <button
          onClick={onDismiss}
          className="float-right text-gray-500 hover:text-gray-700 text-2xl font-bold mb-4"
        >
          ×
        </button>
        
        <div className="text-center mb-6">
          <div className="text-5xl mb-4">🔐</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Sign In To Continue</h2>
          <p className="text-gray-600">
            Create an account or sign in to join trips and access exclusive features
          </p>
        </div>

        <div className="space-y-3 mb-6">
          <button
            onClick={onLogin}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3.5 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-md"
          >
            🔓 Sign In to Your Account
          </button>
          <button
            onClick={onSignup}
            className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white py-3.5 rounded-lg font-semibold hover:from-green-600 hover:to-teal-600 transition-all shadow-md"
          >
            ✨ Create New Account
          </button>
        </div>

        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">or</span>
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all"
        >
          ← Continue Browsing
        </button>

        <p className="text-center text-xs text-gray-500 mt-4">
          Browse available trips and plans without signing in. You'll need an account to join trips or create your own.
        </p>
      </div>
    </div>
  );
};

// --- MAIN APP ---
function App() {
  const [page, setPage] = useState('home');
  const [currentUser, setCurrentUser] = useState(null);
  const [authPage, setAuthPage] = useState('login'); // 'login' or 'signup'
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [refreshing, setRefreshing] = useState(false);
  const [isGuestBrowsing, setIsGuestBrowsing] = useState(false); // Guest mode for browsing without login
  const [showLoginPrompt, setShowLoginPrompt] = useState(false); // Show login prompt modal
  
  // Track if initial data load has happened
  const dataLoadedRef = useRef(false);
  
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

  const dedupePlans = (plans = []) => {
    const seen = new Set();
    const normalize = (value) => String(value || '').trim().toLowerCase();
    const normalizeDate = (value) => String(value || '').slice(0, 10);
    const getPlanDedupKey = (plan) => {
      const signature = [
        normalize(plan?.title),
        normalize(plan?.from),
        normalize(plan?.to),
        normalizeDate(plan?.date),
        normalize(plan?.transport),
        normalize(plan?.maxMembers),
        normalize(plan?.description),
        normalize(plan?.distance),
        normalize(plan?.creator?._id || plan?.creator?.id || plan?.creator),
        normalize(plan?.creator?.name || plan?.creatorName)
      ].join('|');

      const idKey = String(plan?._id || plan?.id || '').trim();
      return signature || (idKey ? `id:${idKey}` : '');
    };

    return (plans || []).filter((plan) => {
      if (!plan) return false;

      const key = getPlanDedupKey(plan);

      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  // Load app data function - defined early so useEffect can use it
  const loadAppData = async () => {
    setDataLoading(true);
    try {
      console.log('🔄 Loading app data from API...');
      
      // Get current user from storage
      let user = currentUser || storage.getUser();
      let userId = user?._id || user?.id;
      let token = localStorage.getItem('token');

      const migrateDemoAccount = async () => {
        if (!token || !token.startsWith('demo-token-') || !user?.email || !user?.password) {
          return false;
        }

        try {
          console.log('🔄 Migrating demo account to server account...');
          let result;

          try {
            result = await authAPI.login(user.email, user.password);
          } catch (loginError) {
            const phoneNumber = user.phone || '';
            if (!phoneNumber) throw loginError;

            result = await authAPI.register(
              user.name || 'User',
              user.email,
              user.password,
              phoneNumber,
              true
            );
          }

          if (result?.token && result?.user) {
            localStorage.setItem('token', result.token);
            localStorage.setItem('user', JSON.stringify(result.user));
            setCurrentUser(result.user);
            user = result.user;
            userId = result.user?._id || result.user?.id;
            token = result.token;
            setIsGuestBrowsing(false);

            // Promote any locally created demo trips to the server so other browsers can see them.
            const storedTrips = JSON.parse(localStorage.getItem('demo_trips') || '[]');
            if (storedTrips.length > 0) {
              const serverTripsResponse = await tripsAPI.getAll();
              const serverTrips = Array.isArray(serverTripsResponse) ? serverTripsResponse : (serverTripsResponse?.trips || []);
              const serverKeys = new Set(dedupePlans(serverTrips).map((trip) => {
                const normalize = (value) => String(value || '').trim().toLowerCase();
                const normalizeDate = (value) => String(value || '').slice(0, 10);
                return [
                  normalize(trip?.title),
                  normalize(trip?.from),
                  normalize(trip?.to),
                  normalizeDate(trip?.date),
                  normalize(trip?.transport),
                  normalize(trip?.maxMembers),
                  normalize(trip?.description),
                  normalize(trip?.distance),
                  normalize(trip?.creator?._id || trip?.creator?.id || trip?.creator),
                  normalize(trip?.creator?.name || trip?.creatorName)
                ].join('|');
              }));

              for (const trip of storedTrips) {
                const normalize = (value) => String(value || '').trim().toLowerCase();
                const normalizeDate = (value) => String(value || '').slice(0, 10);
                const tripKey = [
                  normalize(trip?.title),
                  normalize(trip?.from),
                  normalize(trip?.to),
                  normalizeDate(trip?.date),
                  normalize(trip?.transport),
                  normalize(trip?.maxMembers),
                  normalize(trip?.description),
                  normalize(trip?.distance),
                  normalize(trip?.creator?._id || trip?.creator?.id || trip?.creator),
                  normalize(trip?.creator?.name || trip?.creatorName)
                ].join('|');

                if (serverKeys.has(tripKey)) {
                  continue;
                }

                try {
                  await tripsAPI.create({
                    title: trip.title,
                    from: trip.from,
                    to: trip.to,
                    fromData: trip.fromData,
                    toData: trip.toData,
                    date: trip.date,
                    maxMembers: trip.maxMembers,
                    transport: trip.transport,
                    description: trip.description || '',
                    distance: trip.distance,
                    isPublic: trip.isPublic !== false
                  });
                  serverKeys.add(tripKey);
                } catch (tripMigrationError) {
                  console.warn('⚠️ Could not migrate demo trip:', tripMigrationError.message);
                }
              }
            }

            console.log('✅ Demo account migrated to server account');
            return true;
          }
        } catch (migrationError) {
          console.warn('⚠️ Demo account migration failed:', migrationError.message);
        }

        return false;
      };
      
      console.log('👤 Current user:', user?.email, 'ID:', userId);
      console.log('🔑 Token:', token ? 'Present' : 'Missing');
      
      if (!userId) {
        console.log('👀 Guest mode active - loading public plans only');
      }
      
      // Check if using demo token - work in offline mode
      if (userId && token && token.startsWith('demo-token-')) {
        const migrated = await migrateDemoAccount();
        if (migrated) {
          console.log('🌐 Demo account upgraded, continuing with server sync...');
        } else {
          console.log('💾 Demo token detected - working in OFFLINE MODE with localStorage');
          // Load from localStorage
          const storedTrips = JSON.parse(localStorage.getItem('demo_trips') || '[]');
          const storedRides = JSON.parse(localStorage.getItem('demo_rides') || '[]');
          
          console.log('📊 Demo mode stats:');
          console.log('  - Total trips in storage:', storedTrips.length);
          console.log('  - Total rides in storage:', storedRides.length);
          console.log('  - Current userId:', userId);
          
          // Filter my trips - check both _id and id properties
          const myCreatedTrips = storedTrips.filter(trip => {
            const creatorId = trip.creator?._id || trip.creator?.id || trip.creator;
            const isMyTrip = creatorId === userId || creatorId === user.id || creatorId === user._id;
            return isMyTrip;
          });
          
          console.log('  - My trips:', myCreatedTrips.length);
          
          // Demo users should still see community plans from server if available.
          let publicTrips = storedTrips;
          try {
            const serverTrips = await tripsAPI.getAll();
            const serverTripList = Array.isArray(serverTrips) ? serverTrips : (serverTrips?.trips || []);
            publicTrips = dedupePlans([...(serverTripList || []), ...storedTrips]);
            console.log(`🌐 Loaded ${serverTripList.length} community trips for demo user`);
          } catch (communityTripError) {
            console.warn('⚠️ Could not load community trips in demo mode:', communityTripError.message);
            publicTrips = dedupePlans(storedTrips);
          }

          setPublicPlans(publicTrips);
          setMyTrips(dedupePlans(myCreatedTrips));
          setRideSharePosts(storedRides.map(ride => ({
            ...ride,
            isMyRide: (ride.driverId === userId || ride.driver === user?.name)
          })));
          setSentRequests([]);
          setReceivedRequests([]);
          setSentRideBookings([]);
          setReceivedRideBookings([]);
          console.log('✅ Loaded data from localStorage in demo mode');
          return;
        }
      }

      // Refresh user after possible migration
      user = currentUser || storage.getUser();
      userId = user?._id || user?.id;
      token = localStorage.getItem('token');

      console.log('👤 Current user:', user?.email, 'ID:', userId);
      console.log('🔑 Token:', token ? 'Present' : 'Missing');

      if (!userId) {
        console.log('👀 Guest mode active - loading public plans only');
      }

      // Check if using demo token - work in offline mode
      if (userId && token && token.startsWith('demo-token-')) {
        console.log('💾 Demo token detected - working in OFFLINE MODE with localStorage');
        // Load from localStorage
        const storedTrips = JSON.parse(localStorage.getItem('demo_trips') || '[]');
        const storedRides = JSON.parse(localStorage.getItem('demo_rides') || '[]');
        
        console.log('📊 Demo mode stats:');
        console.log('  - Total trips in storage:', storedTrips.length);
        console.log('  - Total rides in storage:', storedRides.length);
        console.log('  - Current userId:', userId);
        
        // Filter my trips - check both _id and id properties
        const myCreatedTrips = storedTrips.filter(trip => {
          const creatorId = trip.creator?._id || trip.creator?.id || trip.creator;
          const isMyTrip = creatorId === userId || creatorId === user.id || creatorId === user._id;
          return isMyTrip;
        });
        
        console.log('  - My trips:', myCreatedTrips.length);
        
        // Demo users should still see community plans from server if available.
        let publicTrips = storedTrips;
        try {
          const serverTrips = await tripsAPI.getAll();
          const serverTripList = Array.isArray(serverTrips) ? serverTrips : (serverTrips?.trips || []);
          publicTrips = dedupePlans([...(serverTripList || []), ...storedTrips]);
          console.log(`🌐 Loaded ${serverTripList.length} community trips for demo user`);
        } catch (communityTripError) {
          console.warn('⚠️ Could not load community trips in demo mode:', communityTripError.message);
          publicTrips = dedupePlans(storedTrips);
        }

        setPublicPlans(publicTrips);
        setMyTrips(dedupePlans(myCreatedTrips));
        setRideSharePosts(storedRides.map(ride => ({
          ...ride,
          isMyRide: (ride.driverId === userId || ride.driver === user?.name)
        })));
        setSentRequests([]);
        setReceivedRequests([]);
        setSentRideBookings([]);
        setReceivedRideBookings([]);
        console.log('✅ Loaded data from localStorage in demo mode');
        return;
      }

      // For authenticated users, refresh full profile fields so profile tabs auto-fill reliably.
      if (userId && token) {
        try {
          const freshUser = await authAPI.getCurrentUser();
          if (freshUser) {
            storage.setUser(freshUser);
            setCurrentUser(freshUser);
            user = freshUser;
            userId = freshUser._id || freshUser.id;
          }
        } catch (userError) {
          console.warn('⚠️ Could not refresh full user profile:', userError.message);
        }
      }
      
      // Fetch ALL public trips from the database
      try {
        console.log('📡 Fetching all trips from API...');
        const allTrips = await tripsAPI.getAll();
        const tripList = Array.isArray(allTrips) ? allTrips : (allTrips?.trips || []);
        const uniqueTripList = dedupePlans(tripList);
        console.log(`✅ Loaded ${uniqueTripList.length} public trips from database:`, uniqueTripList);
        setPublicPlans(uniqueTripList);
        
        // Filter my trips from all trips
        const myCreatedTrips = uniqueTripList.filter(trip => {
          const creatorId = trip.creator?._id || trip.creator?.id || trip.creator;
          return userId && creatorId === userId;
        });
        console.log(`📝 My trips: ${myCreatedTrips.length}`);
        setMyTrips(myCreatedTrips);
      } catch (tripError) {
        console.error('❌ Could not load trips:', tripError);
        console.error('Error details:', tripError.message);
        // Check if it's a token error - the API will handle logout
        if (tripError.message && tripError.message.includes('Token is not valid')) {
          console.warn('🔄 Token invalid - will logout automatically');
          return; // Don't continue loading if token is invalid
        }
        // Network error - working in offline mode
        if (tripError.name === 'TypeError' && tripError.message.includes('fetch')) {
          console.log('💾 Server not available - working in OFFLINE MODE with localStorage');
        }
        setPublicPlans([]);
        setMyTrips([]);
      }
      
      // Fetch ride share posts
      try {
        if (userId) {
          const rides = await rideShareAPI.getAll();
          console.log(`✅ Loaded ${rides.length} ride share posts`);
          setRideSharePosts((rides || []).map(ride => ({
            ...ride,
            isMyRide: (ride.driverId === userId || ride.driver === user?.name)
          })));
        } else {
          setRideSharePosts([]);
        }
      } catch (rideError) {
        console.warn('⚠️ Could not load rides:', rideError.message);
        setRideSharePosts([]);
      }
      
      // Fetch join requests
      try {
        if (userId) {
          const requests = await requestsAPI.getMy();
          setSentRequests(requests.sent || []);
          setReceivedRequests(requests.received || []);
        } else {
          setSentRequests([]);
          setReceivedRequests([]);
        }
      } catch (reqError) {
        console.warn('⚠️ Could not load requests:', reqError.message);
        setSentRequests([]);
        setReceivedRequests([]);
      }
      
      // Fetch ride bookings
      try {
        if (userId) {
          const bookings = await rideShareAPI.getMyBookings();
          setSentRideBookings(bookings.sent || []);
          setReceivedRideBookings(bookings.received || []);
        } else {
          setSentRideBookings([]);
          setReceivedRideBookings([]);
        }
      } catch (bookingError) {
        console.warn('⚠️ Could not load bookings:', bookingError.message);
        setSentRideBookings([]);
        setReceivedRideBookings([]);
      }
      
      console.log('✅ All app data loaded successfully');
    } catch (err) {
      console.error('❌ Error loading app data:', err);
      console.error('Full error:', err);
      // Set empty arrays on error to prevent blank screen
      setPublicPlans([]);
      setMyTrips([]);
      setRideSharePosts([]);
      setSentRequests([]);
      setReceivedRequests([]);
      setSentRideBookings([]);
      setReceivedRideBookings([]);
    } finally {
      setDataLoading(false);
    }
  };

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
    console.log('🔐 Checking authentication...');
    try {
      // Check localStorage for user data (synchronous)
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      if (token && userStr) {
        const user = JSON.parse(userStr);
        console.log('✅ User found in localStorage:', user.email);
        setCurrentUser(user);
        setIsGuestBrowsing(false);
        setLoading(false);
        
        // Request notification permission
        if ('Notification' in window && Notification.permission === 'default') {
          Notification.requestPermission();
        }
      } else {
        console.log('⚠️ Not logged in - enabling guest browsing mode');
        setCurrentUser(null);
        setIsGuestBrowsing(true); // Allow guest browsing
        setLoading(false);
      }
    } catch (err) {
      console.error('❌ Auth check error:', err);
      setLoading(false);
      setIsGuestBrowsing(true); // Fall back to guest mode on error
    }
  }, []);

  // Load data for authenticated and guest users
  useEffect(() => {
    if (!loading) {
      const userLabel = currentUser?.email || 'guest';
      console.log('🔄 useEffect: Loading data for:', userLabel, 'dataLoaded:', dataLoadedRef.current);
      // Only load if we haven't loaded yet
      if (!dataLoadedRef.current) {
        console.log('📊 useEffect: Calling loadAppData');
        dataLoadedRef.current = true;
        loadAppData().catch(err => {
          console.error('Failed to load app data:', err);
          dataLoadedRef.current = false; // Allow retry on error
        });
      } else {
        console.log('⏭️ useEffect: Data already loaded, skipping');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, loading]);

  // Universal auto-refresh for all sessions (including guest/demo and other browsers)
  useEffect(() => {
    if (loading) return;

    const intervalId = setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadAppData();
      }
    }, 5000);

    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  // Setup Socket.IO when user is authenticated
  useEffect(() => {
    if (currentUser) {
      // Connect to Socket.IO
      const socketUserId = currentUser?._id || currentUser?.id;
      socketService.connect(socketUserId);

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
        const senderId = (data?.message?.sender?._id || data?.message?.sender?.id || data?.message?.sender || '').toString();
        const currentId = (currentUser?._id || currentUser?.id || '').toString();
        if (data && data.message && senderId && senderId !== currentId) {
          const rawTripId = data.tripId || data.message.trip?._id || data.message.trip?.id || data.message.trip;
          const tripId = (rawTripId || '').toString();
          if (!tripId) {
            return;
          }
          console.log('📬 New message notification for trip:', tripId);
          
          // Only increment unread count if chat is not currently open for this trip
          const openChatId = (chatTrip?._id || chatTrip?.id || '').toString();
          if (!openChatId || openChatId !== tripId) {
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

  // Authentication handlers
  const handleLogin = (result) => {
    console.log('🔑 handleLogin called with:', result);
    storage.setToken(result.token);
    storage.setUser(result.user);
    setCurrentUser(result.user);
    setIsGuestBrowsing(false);
    // Reset the data loaded flag to ensure fresh load
    dataLoadedRef.current = false;
    // Call loadAppData after a brief delay to ensure state is updated
    setTimeout(() => {
      loadAppData();
    }, 100);
  };

  const handleSignup = (result) => {
    console.log('📝 handleSignup called with:', result);
    storage.setToken(result.token);
    storage.setUser(result.user);
    setCurrentUser(result.user);
    setIsGuestBrowsing(false);
    // Reset the data loaded flag to ensure fresh load
    dataLoadedRef.current = false;
    // Call loadAppData after a brief delay to ensure state is updated
    setTimeout(() => {
      loadAppData();
    }, 100);
  };

  const handleLogout = () => {
    authAPI.logout();
    setCurrentUser(null);
    setIsGuestBrowsing(true);
    dataLoadedRef.current = false;
    setPublicPlans([]);
    setSentRequests([]);
    setReceivedRequests([]);
    setMyTrips([]);
    setPage('home');
  };

  // Trip actions
  const handleJoinRequest = async (tripId) => {
    // In guest mode, show login prompt
    if (isGuestBrowsing && !currentUser) {
      setShowLoginPrompt(true);
      return;
    }
    
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
      const token = localStorage.getItem('token') || '';
      if (token.startsWith('demo-token-')) {
        const trip = publicPlans.find(t => t._id === tripId || t.id === tripId);
        const localRequest = {
          _id: `local_req_${Date.now()}`,
          trip: tripId,
          tripId,
          tripTitle: trip?.title || 'Trip',
          userName: currentUser?.name || 'User',
          creatorName: trip?.creator?.name || trip?.creatorName || 'Trip Creator',
          status: 'pending',
          createdAt: new Date().toISOString()
        };

        setSentRequests(prev => [localRequest, ...prev]);
        alert('✅ Join request sent successfully! (Demo mode)');
        return;
      }

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
        const requestTripId = (request?.trip?._id || request?.trip || request?.tripId || '').toString();
        const acceptedUser = request.user;

        // Update request status
        setReceivedRequests(prev => prev.map(r => 
          r._id === requestId ? { ...r, status: 'accepted' } : r
        ));
        
        // Add user to trip members in public plans
        setPublicPlans(prev => prev.map(trip => 
          (trip._id || trip.id || '').toString() === requestTripId ? 
            { ...trip, members: [...(trip.members || []), acceptedUser] } : trip
        ));
        
        // Update myTrips if it's my trip
        setMyTrips(prev => prev.map(trip => 
          (trip._id || trip.id || '').toString() === requestTripId ? 
            { ...trip, members: [...(trip.members || []), acceptedUser] } : trip
        ));

        // Keep the open members page updated when host accepts from there
        setSelectedTrip(prev => {
          if (!prev) return prev;
          const selectedTripId = (prev._id || prev.id || '').toString();
          if (!selectedTripId || selectedTripId !== requestTripId) return prev;

          const alreadyInMembers = (prev.members || []).some((member) => {
            const memberId = (member?._id || member?.id || member?.user?._id || member?.user?.id || member?.user || member || '').toString();
            const acceptedUserId = (acceptedUser?._id || acceptedUser?.id || acceptedUser || '').toString();
            return memberId && acceptedUserId && memberId === acceptedUserId;
          });

          if (alreadyInMembers) return prev;
          return {
            ...prev,
            members: [...(prev.members || []), acceptedUser]
          };
        });
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
        const removedUserId = (userId || '').toString();
        
        // Update local state immediately
        const updateTripMembers = (trip) => 
          trip._id === tripId ? 
            {
              ...trip,
              members: (trip.members || []).filter(m => {
                const memberId = (m?._id || m?.id || m?.user?._id || m?.user?.id || m?.user || m || '').toString();
                return memberId !== removedUserId;
              })
            } : trip;
        
        setPublicPlans(prev => prev.map(updateTripMembers));
        setMyTrips(prev => prev.map(updateTripMembers));
        
        // Update selectedTrip if we're on members page
        if (selectedTrip && selectedTrip._id === tripId) {
          setSelectedTrip(prev => ({
            ...prev,
            members: (prev.members || []).filter(m => {
              const memberId = (m?._id || m?.id || m?.user?._id || m?.user?.id || m?.user || m || '').toString();
              return memberId !== removedUserId;
            })
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

  const handleDeleteTrip = async (tripOrId) => {
    const tripId = typeof tripOrId === 'string' ? tripOrId : (tripOrId?._id || tripOrId?.id);
    const tripTitle = typeof tripOrId === 'string' ? 'this plan' : (tripOrId?.title || 'this plan');
    if (!tripId) {
      return;
    }

    if (!window.confirm(`Are you sure you want to delete "${tripTitle}"? This cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token') || '';
      if (token && !token.startsWith('demo-token-')) {
        await tripsAPI.delete(tripId);
      } else {
        const existingTrips = JSON.parse(localStorage.getItem('demo_trips') || '[]');
        const filteredTrips = existingTrips.filter((t) => (t._id || t.id) !== tripId);
        localStorage.setItem('demo_trips', JSON.stringify(filteredTrips));
      }

      setPublicPlans(prev => prev.filter((t) => (t._id || t.id) !== tripId));
      setMyTrips(prev => prev.filter((t) => (t._id || t.id) !== tripId));
      setSentRequests(prev => prev.filter((r) => {
        const reqTripId = r.trip?._id || r.trip || r.tripId;
        return reqTripId !== tripId;
      }));
      setReceivedRequests(prev => prev.filter((r) => {
        const reqTripId = r.trip?._id || r.trip || r.tripId;
        return reqTripId !== tripId;
      }));

      if (selectedTrip && (selectedTrip._id || selectedTrip.id) === tripId) {
        setSelectedTrip(null);
      }
      if (chatTrip && (chatTrip._id || chatTrip.id) === tripId) {
        setChatTrip(null);
      }

      await loadAppData();
      setPage('home');
      alert('Plan deleted successfully!');
    } catch (err) {
      alert('Error deleting plan: ' + err.message);
    }
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
      const user = currentUser || storage.getUser();
      const token = localStorage.getItem('token') || '';

      // Real accounts: create plan on server so it appears in all browsers/devices.
      if (token && !token.startsWith('demo-token-')) {
        const createdTrip = await tripsAPI.create(planData);
        setPublicPlans(prev => dedupePlans([createdTrip, ...prev]));

        const creatorId = createdTrip?.creator?._id || createdTrip?.creator?.id || createdTrip?.creator;
        if (creatorId && user && (creatorId === user._id || creatorId === user.id)) {
          setMyTrips(prev => dedupePlans([createdTrip, ...prev]));
        }

        await loadAppData();
        alert('Trip created successfully!');
        setPage('home');
        return;
      }

      // Demo users: fallback to local persistence.
      const newTrip = {
        _id: 'trip_' + Date.now(),
        ...planData,
        creator: {
          _id: user._id || user.id,
          name: user.name,
          email: user.email
        },
        members: [{
          _id: user._id || user.id,
          name: user.name,
          email: user.email
        }],
        likes: [],
        likesCount: 0,
        isLiked: false,
        createdAt: new Date().toISOString()
      };
      
      // Save to localStorage
      const existingTrips = JSON.parse(localStorage.getItem('demo_trips') || '[]');
      const dedupedTrips = dedupePlans([newTrip, ...existingTrips]);
      localStorage.setItem('demo_trips', JSON.stringify(dedupedTrips));
      
      // Update state immediately
      setPublicPlans(prev => dedupePlans([newTrip, ...prev]));
      setMyTrips(prev => [newTrip, ...prev]);
      
      console.log('✅ Trip created:', newTrip.title);
      
      alert('Trip created successfully!');
      setPage('home');
    } catch (err) {
      console.error('Error creating trip:', err);
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
      const user = currentUser || storage.getUser();
      const userId = user._id || user.id;
      
      // Load trips from localStorage
      const demoTrips = JSON.parse(localStorage.getItem('demo_trips') || '[]');
      
      // Update likes locally
      const updatedTrips = demoTrips.map(trip => {
        if (trip._id === tripId) {
          const likes = trip.likes || [];
          const isLiked = likes.includes(userId);
          
          return {
            ...trip,
            likes: isLiked 
              ? likes.filter(id => id !== userId)
              : [...likes, userId],
            likesCount: isLiked ? (trip.likesCount || 0) - 1 : (trip.likesCount || 0) + 1,
            isLiked: !isLiked
          };
        }
        return trip;
      });
      
      // Save back to localStorage
      localStorage.setItem('demo_trips', JSON.stringify(updatedTrips));
      
      // Update state
      setPublicPlans(dedupePlans(updatedTrips));
      setMyTrips(updatedTrips.filter(t => t.creator._id === userId || t.creator.id === userId));
      
      console.log('✅ Trip liked/unliked');
    } catch (err) {
      console.error('Error liking trip:', err);
      alert('Error: ' + err.message);
    }
  };

  // Handle posting a new ride share
  const handlePostRide = async (rideData) => {
    try {
      const user = currentUser || storage.getUser();
      const userId = user._id || user.id;
      
      const newRide = {
        _id: 'ride_' + Date.now(),
        id: 'ride_' + Date.now(),
        from: rideData.from,
        to: rideData.to,
        date: rideData.date,
        time: rideData.time || '09:00',
        seats: rideData.seats,
        price: rideData.price,
        vehicle: rideData.vehicle || 'Personal Vehicle',
        description: rideData.description || '',
        preferences: rideData.preferences || '',
        driver: user.name,
        driverId: userId,
        driverName: user.name,
        isMyRide: true,
        bookedSeats: 0,
        members: [{ _id: userId, name: user.name }],
        bookings: [],
        createdAt: new Date().toISOString()
      };
      
      // Save to localStorage
      const existingRides = JSON.parse(localStorage.getItem('demo_rides') || '[]');
      existingRides.unshift(newRide);
      localStorage.setItem('demo_rides', JSON.stringify(existingRides));
      
      // Add to state
      setRideSharePosts(prev => [newRide, ...prev]);
      
      console.log('✅ Ride posted:', newRide.from, '→', newRide.to);
      
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
    // In guest mode, show login prompt
    if (isGuestBrowsing && !currentUser) {
      setShowLoginPrompt(true);
      return;
    }
    
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
          <p className="mt-4 text-gray-600 text-xl">Loading TravelBuddy...</p>
        </div>
      </div>
    );
  }

  // Show auth pages ONLY if not logged in AND not browsing as guest
  if (!currentUser && !isGuestBrowsing) {
    if (authPage === 'signup') {
      return <SignupPage onSignup={handleSignup} onSwitchToLogin={() => setAuthPage('login')} />;
    }
    return <LoginPage onLogin={handleLogin} onSwitchToSignup={() => setAuthPage('signup')} />;
  }


  // User is authenticated - show main app
  const pendingRequestsCount = receivedRequests.filter(r => r.status === 'pending').length;
  const currentUserId = currentUser?._id;

  // Calculate joined trips (trips where user is a member but not the creator)
  const joinedTrips = currentUserId
    ? publicPlans.filter(trip => 
        trip.members?.some(member => member._id === currentUserId) && 
        trip.creator?._id !== currentUserId
      )
    : [];

  // Calculate pending trips (trips where user sent a request that is still pending)
  const pendingTrips = currentUserId
    ? publicPlans.filter(trip => {
        const pendingRequest = sentRequests.find(req => 
          req.trip === trip._id && req.status === 'pending'
        );
        return pendingRequest;
      })
    : [];

  const renderPage = () => {
    switch (page) {
      case 'home':
        return <HomePage publicPlans={publicPlans} rideSharePosts={rideSharePosts} currentUser={currentUser} onJoinRequest={handleJoinRequest} myRequests={sentRequests} onLikeTrip={handleLikeTrip} onManageMembers={handleManageMembers} onDeleteTrip={handleDeleteTrip} loadingActions={loadingActions} onOpenChat={handleOpenChat} unreadMessages={unreadMessages} sentRideBookings={sentRideBookings} onBookSeat={handleBookSeat} onLikeRide={handleLikeRide} setPage={setPage} setSelectedTrip={setSelectedTrip} isGuestBrowsing={isGuestBrowsing} onShowLoginPrompt={() => setShowLoginPrompt(true)} isDataLoading={dataLoading} />;
      case 'search':
        return <StorePage />;
      case 'create':
        return <CreatePage currentUser={currentUser} onCreatePlan={handleCreatePlan} setPage={setPage} />;
      case 'requests':
        return <RequestsPage receivedRequests={receivedRequests} sentRequests={sentRequests} onAcceptRequest={handleAcceptRequest} onRejectRequest={handleRejectRequest} currentUser={currentUser} loadingActions={loadingActions} setPage={setPage} />;
      case 'request':
        return <RequestsPage receivedRequests={receivedRequests} sentRequests={sentRequests} onAcceptRequest={handleAcceptRequest} onRejectRequest={handleRejectRequest} currentUser={currentUser} loadingActions={loadingActions} setPage={setPage} />;
      case 'members':
        return <MembersPage trip={selectedTrip} currentUser={currentUser} onRemoveMember={handleRemoveMember} onDeleteTrip={handleDeleteTrip} onBack={() => setPage('home')} receivedRequests={receivedRequests} onAcceptRequest={handleAcceptRequest} onRejectRequest={handleRejectRequest} loadingActions={loadingActions} />;
      case 'profile':
        return <ProfilePage currentUser={currentUser} myPlans={myTrips} joinedTrips={joinedTrips} pendingTrips={pendingTrips} onUpdateProfile={handleUpdateProfile} onLogout={handleLogout} onOpenChat={handleOpenChat} setPage={setPage} />;
      case 'settings':
        return <SettingsPage currentUser={currentUser} theme={theme} onToggleTheme={toggleTheme} setPage={setPage} onLogout={handleLogout} />;
      case 'location':
        return <LocationPage currentUser={currentUser} myPlans={myTrips} setPage={setPage} />;
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
      case 'chat':
        return <ChatListPage joinedTrips={joinedTrips} currentUser={currentUser} onOpenChat={handleOpenChat} myTrips={myTrips} setPage={setPage} />;
      default:
        return <HomePage publicPlans={publicPlans} rideSharePosts={rideSharePosts} currentUser={currentUser} onJoinRequest={handleJoinRequest} myRequests={sentRequests} onLikeTrip={handleLikeTrip} onManageMembers={handleManageMembers} onDeleteTrip={handleDeleteTrip} loadingActions={loadingActions} onOpenChat={handleOpenChat} unreadMessages={unreadMessages} sentRideBookings={sentRideBookings} onBookSeat={handleBookSeat} onLikeRide={handleLikeRide} setPage={setPage} setSelectedTrip={setSelectedTrip} isGuestBrowsing={isGuestBrowsing} onShowLoginPrompt={() => setShowLoginPrompt(true)} isDataLoading={dataLoading} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200 p-4 relative">
        <h1 className="text-2xl font-bold text-blue-600 text-center">🧳 TravelBuddy</h1>
        {/* Refresh Button */}
        <button
          onClick={() => {
            console.log('🔄 Manual refresh triggered');
            setRefreshing(true);
            dataLoadedRef.current = false; // Reset to allow reload
            loadAppData().then(() => {
              console.log('✅ Manual refresh complete');
              dataLoadedRef.current = true;
              setRefreshing(false);
            }).catch(err => {
              console.error('❌ Manual refresh failed:', err);
              setRefreshing(false);
            });
          }}
          disabled={refreshing}
          className={`absolute left-4 top-1/2 -translate-y-1/2 px-3 py-1.5 text-sm rounded-lg transition-colors ${refreshing ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
          title={refreshing ? "Refreshing..." : "Refresh all data"}
        >
          {refreshing ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin">⟳</span> Refreshing...
            </span>
          ) : (
            '🔄 Refresh'
          )}
        </button>
        {/* Requests & Theme Toggle Buttons */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <button
            onClick={() => {
              if (isGuestBrowsing && !currentUser) {
                setShowLoginPrompt(true);
              } else {
                setPage('requests');
              }
            }}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
            title="View Requests"
          >
            <RequestsIcon active={page === 'requests'} count={pendingRequestsCount} />
          </button>
          
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
          </button>
        </div>
      </div>

      <div className="pb-20">{renderPage()}</div>

      {/* Bottom Navigation - 5 Icons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="flex justify-around items-center py-2">
          <button onClick={() => setPage('home')} className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg ${page === 'home' ? 'bg-blue-600' : ''}`}>
            <HomeIcon active={page === 'home'} />
            <span className={`text-xs ${page === 'home' ? 'text-white' : 'text-gray-600'}`}>Home</span>
          </button>

          <button onClick={() => setPage('search')} className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg ${page === 'search' ? 'bg-blue-600' : ''}`}>
            <StoreIcon active={page === 'search'} />
            <span className={`text-xs ${page === 'search' ? 'text-white' : 'text-gray-600'}`}>Store</span>
          </button>

          <button 
            onClick={() => {
              if (isGuestBrowsing && !currentUser) {
                setShowLoginPrompt(true);
              } else {
                setPage('create');
              }
            }}
            className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg ${page === 'create' ? 'bg-blue-600' : ''}`}
          >
            <CreateIcon active={page === 'create'} />
            <span className={`text-xs ${page === 'create' ? 'text-white' : 'text-gray-600'}`}>Create</span>
          </button>

          <button 
            onClick={() => {
              if (isGuestBrowsing && !currentUser) {
                setShowLoginPrompt(true);
              } else {
                setPage('chat');
              }
            }}
            className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg ${page === 'chat' ? 'bg-blue-600' : ''}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-6 h-6 ${page === 'chat' ? 'text-white' : 'text-gray-400'}`}>
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
            </svg>
            <span className={`text-xs ${page === 'chat' ? 'text-white' : 'text-gray-600'}`}>Chat</span>
          </button>

          <button 
            onClick={() => {
              if (isGuestBrowsing && !currentUser) {
                setShowLoginPrompt(true);
              } else {
                setPage('profile');
              }
            }}
            className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg ${page === 'profile' ? 'bg-blue-600' : ''}`}
          >
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

      {/* Login Prompt Modal - Show when guest tries to access restricted features */}
      {showLoginPrompt && (
        <LoginPromptModal
          onLogin={() => {
            setShowLoginPrompt(false);
            setAuthPage('login');
            setIsGuestBrowsing(false);
            // This will trigger a re-render showing the login page
          }}
          onSignup={() => {
            setShowLoginPrompt(false);
            setAuthPage('signup');
            setIsGuestBrowsing(false);
          }}
          onDismiss={() => setShowLoginPrompt(false)}
        />
      )}
    </div>
  );
} 

export default App;
