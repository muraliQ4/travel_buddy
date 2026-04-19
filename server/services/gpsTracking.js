// GPS Tracking & ETA Calculation Service

import axios from 'axios';

const GEOAPIFY_KEY = process.env.GEOAPIFY_API_KEY || 'demo';

export class GPSTrackingService {
  constructor() {
    this.activeTracking = new Map(); // Store active trip tracking sessions
  }

  /**
   * Start tracking a trip
   */
  startTracking(tripId, initialLocation) {
    this.activeTracking.set(tripId, {
      currentLocation: initialLocation,
      lastUpdated: new Date(),
      routeHistory: [{ ...initialLocation, timestamp: new Date() }],
      isActive: true
    });
    
    return {
      success: true,
      message: 'Tracking started',
      trackingId: tripId
    };
  }

  /**
   * Update current location for a trip
   */
  updateLocation(tripId, location) {
    const tracking = this.activeTracking.get(tripId);
    
    if (!tracking) {
      return { success: false, message: 'Tracking not found' };
    }

    tracking.currentLocation = location;
    tracking.lastUpdated = new Date();
    tracking.routeHistory.push({ ...location, timestamp: new Date() });

    this.activeTracking.set(tripId, tracking);

    return {
      success: true,
      location: tracking.currentLocation,
      lastUpdated: tracking.lastUpdated
    };
  }

  /**
   * Calculate ETA using Geoapify Routing API
   */
  async calculateETA(fromLat, fromLon, toLat, toLon, mode = 'drive') {
    try {
      const response = await axios.get(
        `https://api.geoapify.com/v1/routing`,
        {
          params: {
            waypoints: `${fromLat},${fromLon}|${toLat},${toLon}`,
            mode: mode, // drive, walk, bicycle, transit
            apiKey: GEOAPIFY_KEY
          }
        }
      );

      if (response.data && response.data.features && response.data.features.length > 0) {
        const route = response.data.features[0].properties;
        
        return {
          success: true,
          distance: route.distance, // meters
          duration: route.time, // seconds
          eta: new Date(Date.now() + route.time * 1000),
          distanceKm: (route.distance / 1000).toFixed(2),
          durationMinutes: Math.round(route.time / 60),
          geometry: response.data.features[0].geometry
        };
      }

      return { success: false, message: 'Route not found' };
    } catch (error) {
      console.error('ETA calculation error:', error);
      return { success: false, message: 'ETA calculation failed', error: error.message };
    }
  }

  /**
   * Calculate real-time ETA during trip
   */
  async calculateRealTimeETA(tripId, destinationLat, destinationLon) {
    const tracking = this.activeTracking.get(tripId);
    
    if (!tracking) {
      return { success: false, message: 'Tracking not found' };
    }

    const { lat, lon } = tracking.currentLocation;
    return await this.calculateETA(lat, lon, destinationLat, destinationLon);
  }

  /**
   * Check if route has deviated significantly
   */
  async checkRouteDeviation(tripId, originalRoute) {
    const tracking = this.activeTracking.get(tripId);
    
    if (!tracking) {
      return { success: false, message: 'Tracking not found' };
    }

    // Calculate distance from original route
    const { lat, lon } = tracking.currentLocation;
    
    // Simple deviation check - in production, use more sophisticated algorithms
    const deviationThreshold = 1000; // 1km in meters
    
    // This is a simplified check - should implement proper route deviation logic
    return {
      success: true,
      hasDeviated: false, // Implement actual logic
      deviationDistance: 0,
      estimatedDelay: 0
    };
  }

  /**
   * Generate shareable live tracking link
   */
  generateTrackingLink(tripId, userId) {
    const token = Buffer.from(`${tripId}:${userId}:${Date.now()}`).toString('base64');
    return {
      success: true,
      link: `${process.env.APP_URL || 'http://localhost:5000'}/track/${token}`,
      token: token
    };
  }

  /**
   * Get tracking data for a trip
   */
  getTrackingData(tripId) {
    const tracking = this.activeTracking.get(tripId);
    
    if (!tracking) {
      return { success: false, message: 'Tracking not found' };
    }

    return {
      success: true,
      data: {
        currentLocation: tracking.currentLocation,
        lastUpdated: tracking.lastUpdated,
        routeHistoryCount: tracking.routeHistory.length,
        isActive: tracking.isActive
      }
    };
  }

  /**
   * Stop tracking a trip
   */
  stopTracking(tripId) {
    const tracking = this.activeTracking.get(tripId);
    
    if (!tracking) {
      return { success: false, message: 'Tracking not found' };
    }

    tracking.isActive = false;
    this.activeTracking.set(tripId, tracking);

    return {
      success: true,
      message: 'Tracking stopped',
      finalLocation: tracking.currentLocation,
      totalPoints: tracking.routeHistory.length
    };
  }

  /**
   * Calculate distance between two points (Haversine formula)
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance; // km
  }

  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  /**
   * Get speed from last two points
   */
  calculateSpeed(tripId) {
    const tracking = this.activeTracking.get(tripId);
    
    if (!tracking || tracking.routeHistory.length < 2) {
      return { success: false, message: 'Insufficient data' };
    }

    const history = tracking.routeHistory;
    const latest = history[history.length - 1];
    const previous = history[history.length - 2];

    const distance = this.calculateDistance(
      previous.lat, previous.lon,
      latest.lat, latest.lon
    );

    const timeDiff = (latest.timestamp - previous.timestamp) / 1000 / 3600; // hours
    const speed = timeDiff > 0 ? distance / timeDiff : 0;

    return {
      success: true,
      speed: speed.toFixed(2), // km/h
      distance: (distance * 1000).toFixed(0) // meters
    };
  }
}

// Singleton instance
export const gpsTrackingService = new GPSTrackingService();
