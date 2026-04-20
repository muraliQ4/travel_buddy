// API client for backend communication
const BACKEND_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/api\/?$/, '').replace(/\/+$/, '');
const API_URL = `${BACKEND_BASE_URL}/api`;

// Helper to get auth token
const getAuthToken = () => localStorage.getItem('token');

// Helper for authenticated requests
const authHeader = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getAuthToken()}`
});

// Helper for routes that can be called by guest or authenticated users
const optionalAuthHeader = () => {
  const token = getAuthToken();
  return token
    ? { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
    : { 'Content-Type': 'application/json' };
};

// Handle 401 Unauthorized errors (invalid/expired token)
// Only logout on actual auth errors, not on network errors
const handle401Error = (error, statusCode) => {
  // Check if this is a demo token - don't logout for demo tokens
  const token = getAuthToken();
  if (token && token.startsWith('demo-token-')) {
    console.warn('⚠️ Demo token detected - working in offline mode');
    return false; // Don't logout for demo tokens
  }
  
  // Only clear storage if we got an actual 401 response from server
  // Don't clear on network errors (server not running)
  if (statusCode === 401 && error.message && (error.message.includes('Token is not valid') || error.message.includes('not valid') || error.message.includes('unauthorized'))) {
    console.warn('⚠️ Invalid token detected - logging out...');
    storage.clear();
    window.location.reload();
    return true;
  }
  return false;
};

// Auth API
export const authAPI = {
  register: async (name, email, password, phone, phoneVerified) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, phone, phoneVerified })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Registration failed');
    return data;
  },

  login: async (email, password) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Login failed');
    return data;
  },

  getCurrentUser: async () => {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: authHeader()
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 401) {
          handle401Error(new Error(data.message), response.status);
        }
        throw new Error(data.message || 'Failed to get user');
      }
      return data;
    } catch (error) {
      // Network errors - don't logout
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        console.warn('⚠️ Server not available, using cached user');
        throw error;
      }
      throw error;
    }
  },

  updateProfile: async (profileData) => {
    const response = await fetch(`${API_URL}/auth/profile`, {
      method: 'PUT',
      headers: authHeader(),
      body: JSON.stringify(profileData)
    });
    
    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Server error: Expected JSON response but got ' + contentType);
    }
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to update profile');
    return data;
  },

  searchUsers: async (query) => {
    const response = await fetch(`${API_URL}/auth/search?query=${encodeURIComponent(query)}`, {
      headers: authHeader()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to search users');
    return data;
  },

  logout: () => {
    storage.clear();
  }
};

// Trips API
export const tripsAPI = {
  getAll: async (search = '') => {
    try {
      const url = search ? `${API_URL}/trips?search=${encodeURIComponent(search)}` : `${API_URL}/trips`;
      const response = await fetch(url, {
        headers: optionalAuthHeader()
      });
      
      // Check if we can parse the response
      if (!response.ok) {
        const data = await response.json().catch(() => ({ message: 'Server error' }));
        if (response.status === 401) {
          handle401Error(new Error(data.message), response.status);
        }
        throw new Error(data.message || 'Failed to get trips');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      // Network errors (server not running) - don't logout
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        console.warn('⚠️ Server not available, working in offline mode');
        throw error;
      }
      // Only handle 401 errors, not network errors
      throw error;
    }
  },

  getMyTrips: async () => {
    const response = await fetch(`${API_URL}/trips/my-trips`, {
      headers: authHeader()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to get trips');
    return data;
  },

  getUserTrips: async (userId) => {
    const response = await fetch(`${API_URL}/trips/user/${userId}`, {
      headers: authHeader()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to get trips');
    return data;
  },

  create: async (tripData) => {
    const response = await fetch(`${API_URL}/trips`, {
      method: 'POST',
      headers: authHeader(),
      body: JSON.stringify(tripData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to create trip');
    return data;
  },

  like: async (tripId) => {
    const response = await fetch(`${API_URL}/trips/${tripId}/like`, {
      method: 'POST',
      headers: authHeader()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to like trip');
    return data;
  },

  delete: async (tripId) => {
    const response = await fetch(`${API_URL}/trips/${tripId}`, {
      method: 'DELETE',
      headers: authHeader()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to delete trip');
    return data;
  },

  removeMember: async (tripId, userId) => {
    const response = await fetch(`${API_URL}/trips/${tripId}/remove-member`, {
      method: 'POST',
      headers: authHeader(),
      body: JSON.stringify({ userId })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to remove member');
    return data;
  }
};

// Requests API
export const requestsAPI = {
  send: async (tripId) => {
    const response = await fetch(`${API_URL}/requests`, {
      method: 'POST',
      headers: authHeader(),
      body: JSON.stringify({ tripId })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to send request');
    return data;
  },

  getMy: async () => {
    try {
      const [sent, received] = await Promise.all([
        requestsAPI.getSent(),
        requestsAPI.getReceived()
      ]);
      return { sent, received };
    } catch (error) {
      console.error('Error getting my requests:', error);
      return { sent: [], received: [] };
    }
  },

  getReceived: async () => {
    try {
      const response = await fetch(`${API_URL}/requests/received`, {
        headers: authHeader()
      });
      
      if (!response.ok) {
        const data = await response.json().catch(() => ({ message: 'Server error' }));
        if (response.status === 401) {
          handle401Error(new Error(data.message), response.status);
        }
        throw new Error(data.message || 'Failed to get received requests');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      // Network errors - don't logout
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        console.warn('⚠️ Server not available for requests');
        return [];
      }
      throw error;
    }
  },

  getSent: async () => {
    try {
      const response = await fetch(`${API_URL}/requests/sent`, {
        headers: authHeader()
      });
      
      if (!response.ok) {
        const data = await response.json().catch(() => ({ message: 'Server error' }));
        if (response.status === 401) {
          handle401Error(new Error(data.message), response.status);
        }
        throw new Error(data.message || 'Failed to get requests');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      // Network errors - don't logout
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        console.warn('⚠️ Server not available for requests');
        return [];
      }
      throw error;
    }
  },

  accept: async (requestId) => {
    const response = await fetch(`${API_URL}/requests/${requestId}/accept`, {
      method: 'PUT',
      headers: authHeader()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to accept request');
    return data;
  },

  reject: async (requestId) => {
    const response = await fetch(`${API_URL}/requests/${requestId}/reject`, {
      method: 'PUT',
      headers: authHeader()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to reject request');
    return data;
  }
};

// Storage helpers
export const storage = {
  setToken: (token) => localStorage.setItem('token', token),
  getToken: () => localStorage.getItem('token'),
  removeToken: () => localStorage.removeItem('token'),
  setUser: (user) => localStorage.setItem('user', JSON.stringify(user)),
  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  removeUser: () => localStorage.removeItem('user'),
  clear: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

// Verification API
export const verificationAPI = {
  sendEmailVerification: async (email) => {
    const response = await fetch(`${API_URL}/verification/email/send`, {
      method: 'POST',
      headers: authHeader(),
      body: JSON.stringify({ email })
    });
    return await response.json();
  },

  sendPhoneVerification: async (phone) => {
    const response = await fetch(`${API_URL}/verification/phone/send`, {
      method: 'POST',
      headers: authHeader(),
      body: JSON.stringify({ phone })
    });
    return await response.json();
  },

  verifyCode: async (verificationId, code) => {
    const response = await fetch(`${API_URL}/verification/code/verify`, {
      method: 'POST',
      headers: authHeader(),
      body: JSON.stringify({ verificationId, code })
    });
    return await response.json();
  },

  submitIdentity: async (documentType, documentNumber, images) => {
    const response = await fetch(`${API_URL}/verification/identity/submit`, {
      method: 'POST',
      headers: authHeader(),
      body: JSON.stringify({ documentType, documentNumber, images })
    });
    return await response.json();
  },

  submitSelfie: async (selfieImage) => {
    const response = await fetch(`${API_URL}/verification/selfie/submit`, {
      method: 'POST',
      headers: authHeader(),
      body: JSON.stringify({ selfieImage })
    });
    return await response.json();
  },

  requestBackgroundCheck: async () => {
    const response = await fetch(`${API_URL}/verification/background-check/submit`, {
      method: 'POST',
      headers: authHeader()
    });
    return await response.json();
  },

  getMyVerifications: async () => {
    const response = await fetch(`${API_URL}/verification/my-verifications`, {
      headers: authHeader()
    });
    return await response.json();
  }
};

// Payment API
export const paymentAPI = {
  processTripPayment: async (tripId, amount, method) => {
    const response = await fetch(`${API_URL}/payment/trip/pay`, {
      method: 'POST',
      headers: authHeader(),
      body: JSON.stringify({ tripId, amount, method })
    });
    return await response.json();
  },

  requestRefund: async (paymentId, reason) => {
    const response = await fetch(`${API_URL}/payment/${paymentId}/refund/request`, {
      method: 'POST',
      headers: authHeader(),
      body: JSON.stringify({ reason })
    });
    return await response.json();
  },

  getPaymentHistory: async (limit = 50) => {
    const response = await fetch(`${API_URL}/payment/history?limit=${limit}`, {
      headers: authHeader()
    });
    return await response.json();
  },

  getWalletBalance: async () => {
    const response = await fetch(`${API_URL}/payment/wallet/balance`, {
      headers: authHeader()
    });
    return await response.json();
  },

  addMoneyToWallet: async (amount, method) => {
    const response = await fetch(`${API_URL}/payment/wallet/add`, {
      method: 'POST',
      headers: authHeader(),
      body: JSON.stringify({ amount, method })
    });
    return await response.json();
  },

  calculateSplitPayment: async (totalCost, members, splitMethod = 'equal') => {
    const response = await fetch(`${API_URL}/payment/split/calculate`, {
      method: 'POST',
      headers: authHeader(),
      body: JSON.stringify({ totalCost, members, splitMethod })
    });
    return await response.json();
  }
};

// Emergency API
export const emergencyAPI = {
  triggerSOS: async (tripId, type, location, description) => {
    const response = await fetch(`${API_URL}/emergency/sos/trigger`, {
      method: 'POST',
      headers: authHeader(),
      body: JSON.stringify({ tripId, type, location, description })
    });
    return await response.json();
  },

  acknowledgeEmergency: async (emergencyId) => {
    const response = await fetch(`${API_URL}/emergency/${emergencyId}/acknowledge`, {
      method: 'POST',
      headers: authHeader()
    });
    return await response.json();
  },

  resolveEmergency: async (emergencyId, resolution) => {
    const response = await fetch(`${API_URL}/emergency/${emergencyId}/resolve`, {
      method: 'POST',
      headers: authHeader(),
      body: JSON.stringify({ resolution })
    });
    return await response.json();
  },

  uploadEmergencyPhoto: async (emergencyId, photoUrl) => {
    const response = await fetch(`${API_URL}/emergency/${emergencyId}/photo/upload`, {
      method: 'POST',
      headers: authHeader(),
      body: JSON.stringify({ photoUrl })
    });
    return await response.json();
  },

  getMyEmergencies: async () => {
    const response = await fetch(`${API_URL}/emergency/my-emergencies`, {
      headers: authHeader()
    });
    return await response.json();
  }
};

// Tracking API
export const trackingAPI = {
  startTracking: async (tripId, location) => {
    const response = await fetch(`${API_URL}/tracking/start`, {
      method: 'POST',
      headers: authHeader(),
      body: JSON.stringify({ tripId, location })
    });
    return await response.json();
  },

  updateLocation: async (tripId, location) => {
    const response = await fetch(`${API_URL}/tracking/update`, {
      method: 'POST',
      headers: authHeader(),
      body: JSON.stringify({ tripId, location })
    });
    return await response.json();
  },

  calculateETA: async (fromLat, fromLon, toLat, toLon, mode = 'drive') => {
    const response = await fetch(`${API_URL}/tracking/eta/calculate`, {
      method: 'POST',
      headers: authHeader(),
      body: JSON.stringify({ fromLat, fromLon, toLat, toLon, mode })
    });
    return await response.json();
  },

  getRealTimeETA: async (tripId, destinationLat, destinationLon) => {
    const response = await fetch(
      `${API_URL}/tracking/${tripId}/eta?destinationLat=${destinationLat}&destinationLon=${destinationLon}`,
      { headers: authHeader() }
    );
    return await response.json();
  },

  generateTrackingLink: async (tripId) => {
    const response = await fetch(`${API_URL}/tracking/${tripId}/link`, {
      method: 'POST',
      headers: authHeader()
    });
    return await response.json();
  },

  getTrackingData: async (tripId) => {
    const response = await fetch(`${API_URL}/tracking/${tripId}/data`, {
      headers: authHeader()
    });
    return await response.json();
  },

  stopTracking: async (tripId) => {
    const response = await fetch(`${API_URL}/tracking/${tripId}/stop`, {
      method: 'POST',
      headers: authHeader()
    });
    return await response.json();
  }
};

// Rewards API
export const rewardsAPI = {
  generateReferralCode: async () => {
    const response = await fetch(`${API_URL}/rewards/referral/generate`, {
      method: 'POST',
      headers: authHeader()
    });
    return await response.json();
  },

  applyReferralCode: async (referralCode) => {
    const response = await fetch(`${API_URL}/rewards/referral/apply`, {
      method: 'POST',
      headers: authHeader(),
      body: JSON.stringify({ referralCode })
    });
    return await response.json();
  },

  redeemPoints: async (points, rewardType) => {
    const response = await fetch(`${API_URL}/rewards/points/redeem`, {
      method: 'POST',
      headers: authHeader(),
      body: JSON.stringify({ points, rewardType })
    });
    return await response.json();
  },

  subscribe: async (planType, duration) => {
    const response = await fetch(`${API_URL}/rewards/subscribe`, {
      method: 'POST',
      headers: authHeader(),
      body: JSON.stringify({ planType, duration })
    });
    return await response.json();
  },

  getSummary: async () => {
    const response = await fetch(`${API_URL}/rewards/summary`, {
      headers: authHeader()
    });
    return await response.json();
  }
};

// Analytics API
export const analyticsAPI = {
  getDashboard: async (period = 'monthly') => {
    const response = await fetch(`${API_URL}/analytics/dashboard?period=${period}`, {
      headers: authHeader()
    });
    return await response.json();
  },

  generateAnalytics: async (period = 'monthly') => {
    const response = await fetch(`${API_URL}/analytics/generate`, {
      method: 'POST',
      headers: authHeader(),
      body: JSON.stringify({ period })
    });
    return await response.json();
  },

  getCarbonFootprint: async () => {
    const response = await fetch(`${API_URL}/analytics/carbon-footprint`, {
      headers: authHeader()
    });
    return await response.json();
  }
};

// OTP API
export const otpAPI = {
  sendOTP: async (phone) => {
    const response = await fetch(`${API_URL}/otp/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to send OTP');
    return data;
  },

  verifyOTP: async (phone, otp) => {
    const response = await fetch(`${API_URL}/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to verify OTP');
    return data;
  },

  resendOTP: async (phone) => {
    const response = await fetch(`${API_URL}/otp/resend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to resend OTP');
    return data;
  }
};

export const rideShareAPI = {
  getAll: async () => {
    try {
      const response = await fetch(`${API_URL}/rideshare`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          const data = await response.json().catch(() => ({ message: 'Unauthorized' }));
          handle401Error(new Error(data.message), response.status);
        }
        throw new Error('Failed to fetch rides');
      }
      
      return await response.json();
    } catch (error) {
      // Network errors - don't logout
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        console.warn('⚠️ Server not available for rides');
        return [];
      }
      throw error;
    }
  },

  getMyOffers: async () => {
    const response = await fetch(`${API_URL}/rideshare/my-offers`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch my rides');
    return response.json();
  },

  getMyBookings: async () => {
    try {
      const response = await fetch(`${API_URL}/rideshare/my-bookings`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          const data = await response.json().catch(() => ({ message: 'Unauthorized' }));
          handle401Error(new Error(data.message), response.status);
        }
        throw new Error('Failed to fetch my bookings');
      }
      
      return await response.json();
    } catch (error) {
      // Network errors - don't logout
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        console.warn('⚠️ Server not available for bookings');
        return { sent: [], received: [] };
      }
      throw error;
    }
  },

  create: async (rideData) => {
    const response = await fetch(`${API_URL}/rideshare`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(rideData)
    });
    if (!response.ok) throw new Error('Failed to create ride');
    return response.json();
  },

  join: async (rideId) => {
    const response = await fetch(`${API_URL}/rideshare/${rideId}/join`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to join ride');
    return response.json();
  },

  leave: async (rideId) => {
    const response = await fetch(`${API_URL}/rideshare/${rideId}/leave`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to leave ride');
    return response.json();
  },

  delete: async (rideId) => {
    const response = await fetch(`${API_URL}/rideshare/${rideId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to delete ride');
    return response.json();
  },

  getMessages: async (rideId) => {
    const response = await fetch(`${API_URL}/rideshare/${rideId}/messages`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch messages');
    return response.json();
  },

  sendMessage: async (rideId, message) => {
    const response = await fetch(`${API_URL}/rideshare/${rideId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ message })
    });
    if (!response.ok) throw new Error('Failed to send message');
    return response.json();
  },

  // Booking requests
  sendBookingRequest: async (rideId, seats = 1) => {
    const response = await fetch(`${API_URL}/rideshare/${rideId}/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ seats })
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Failed to send booking request');
    }
    return response.json();
  },

  getSentBookings: async () => {
    const response = await fetch(`${API_URL}/rideshare/bookings/sent`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch sent bookings');
    return response.json();
  },

  getReceivedBookings: async () => {
    const response = await fetch(`${API_URL}/rideshare/bookings/received`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch received bookings');
    return response.json();
  },

  acceptBooking: async (bookingId) => {
    const response = await fetch(`${API_URL}/rideshare/bookings/${bookingId}/accept`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Failed to accept booking');
    }
    return response.json();
  },

  rejectBooking: async (bookingId) => {
    const response = await fetch(`${API_URL}/rideshare/bookings/${bookingId}/reject`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Failed to reject booking');
    }
    return response.json();
  }
};
