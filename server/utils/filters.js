// Advanced filtering utilities

/**
 * Apply advanced filters to trip query
 */
export const applyAdvancedFilters = (filters) => {
  const query = {};

  // Women-only rides
  if (filters.womenOnly) {
    query.womenOnly = true;
  }

  // Verified users only
  if (filters.verifiedOnly) {
    query['verificationRequired.emailVerified'] = true;
    query['verificationRequired.phoneVerified'] = true;
  }

  // Minimum rating
  if (filters.minimumRating) {
    query.averageRating = { $gte: filters.minimumRating };
  }

  // Vehicle type
  if (filters.vehicleType) {
    query['vehicleInfo.type'] = filters.vehicleType;
  }

  // Amenities
  if (filters.amenities && filters.amenities.length > 0) {
    filters.amenities.forEach(amenity => {
      query[`vehicleInfo.amenities.${amenity}`] = true;
    });
  }

  // Preferences
  if (filters.smoking) {
    query['preferences.smoking'] = filters.smoking;
  }

  if (filters.music) {
    query['preferences.music'] = filters.music;
  }

  if (filters.pets) {
    query['preferences.pets'] = filters.pets;
  }

  if (filters.luggage) {
    query['preferences.luggage'] = filters.luggage;
  }

  // AC preference
  if (filters.ac !== undefined) {
    query['preferences.ac'] = filters.ac;
  }

  // Auto-accept trips
  if (filters.instantBooking) {
    query.autoAccept = true;
  }

  // Insurance covered
  if (filters.insuranceCovered) {
    query['insurance.covered'] = true;
  }

  // Price range
  if (filters.minPrice || filters.maxPrice) {
    query['pricing.perPersonCost'] = {};
    if (filters.minPrice) {
      query['pricing.perPersonCost'].$gte = filters.minPrice;
    }
    if (filters.maxPrice) {
      query['pricing.perPersonCost'].$lte = filters.maxPrice;
    }
  }

  // Departure time range
  if (filters.departureTime) {
    // e.g., "morning", "afternoon", "evening", "night"
    const timeRanges = {
      'morning': { $gte: '06:00', $lte: '12:00' },
      'afternoon': { $gte: '12:00', $lte: '18:00' },
      'evening': { $gte: '18:00', $lte: '22:00' },
      'night': { $gte: '22:00', $lte: '06:00' }
    };

    if (timeRanges[filters.departureTime]) {
      query.departureTime = timeRanges[filters.departureTime];
    }
  }

  // Available seats
  if (filters.requiredSeats) {
    // Need to calculate available seats
    // This would require aggregation in actual implementation
  }

  // Distance range
  if (filters.minDistance || filters.maxDistance) {
    // This requires parsing the distance string
    // Implement based on your distance format
  }

  return query;
};

/**
 * Sort trips based on user preferences
 */
export const getSortOptions = (sortBy) => {
  const sortOptions = {
    'newest': { createdAt: -1 },
    'price-low': { 'pricing.perPersonCost': 1 },
    'price-high': { 'pricing.perPersonCost': -1 },
    'rating': { averageRating: -1 },
    'distance': { distance: 1 },
    'departure-time': { departureTime: 1 }
  };

  return sortOptions[sortBy] || { createdAt: -1 };
};

/**
 * Filter trips based on user preferences stored in profile
 */
export const filterByUserPreferences = async (trips, userId) => {
  const User = (await import('../models/User.js')).default;
  const user = await User.findById(userId).select('preferences');

  if (!user || !user.preferences) return trips;

  return trips.filter(trip => {
    // Women-only preference
    if (user.preferences.womenOnlyRides && !trip.womenOnly) {
      return false;
    }

    // Verified users only preference
    if (user.preferences.verifiedOnly) {
      // Check if trip creator is verified
      // This would require population in actual implementation
    }

    // Smoking preference
    if (user.preferences.smoking === 'no-smoking' && 
        trip.preferences.smoking === 'allowed') {
      return false;
    }

    // Pets preference
    if (user.preferences.pets === 'no-pets' && 
        trip.preferences.pets === 'allowed') {
      return false;
    }

    // Music preference
    if (user.preferences.music === 'no-music' && 
        trip.preferences.music === 'allowed') {
      return false;
    }

    return true;
  });
};

/**
 * Get filter options for UI
 */
export const getFilterOptions = () => {
  return {
    vehicleTypes: ['car', 'bike', 'suv', 'van', 'bus'],
    amenities: ['ac', 'bluetooth', 'charger', 'wifi', 'waterBottles'],
    smokingOptions: ['allowed', 'not-allowed'],
    musicOptions: ['allowed', 'not-allowed', 'flexible'],
    petsOptions: ['allowed', 'not-allowed'],
    luggageOptions: ['small-only', 'medium', 'large'],
    departureTimeOptions: ['morning', 'afternoon', 'evening', 'night'],
    sortOptions: [
      { value: 'newest', label: 'Newest First' },
      { value: 'price-low', label: 'Price: Low to High' },
      { value: 'price-high', label: 'Price: High to Low' },
      { value: 'rating', label: 'Highest Rated' },
      { value: 'distance', label: 'Shortest Distance' },
      { value: 'departure-time', label: 'Earliest Departure' }
    ]
  };
};

/**
 * Match user with compatible trips
 */
export const matchUserWithTrips = async (userId, trips) => {
  const User = (await import('../models/User.js')).default;
  const user = await User.findById(userId).select('preferences travelStyle travelerType');

  // Calculate compatibility score for each trip
  const scoredTrips = trips.map(trip => {
    let score = 0;

    // Preference matching
    if (user.preferences.smoking === trip.preferences.smoking) score += 10;
    if (user.preferences.music === trip.preferences.music) score += 10;
    if (user.preferences.pets === trip.preferences.pets) score += 10;
    if (user.preferences.ac === trip.preferences.ac) score += 5;

    // Travel style matching (would need to populate creator data)
    // if (user.travelStyle === trip.creator.travelStyle) score += 15;

    return {
      trip: trip,
      compatibilityScore: score
    };
  });

  // Sort by compatibility score
  scoredTrips.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

  return scoredTrips;
};
