// Analytics Service

import Analytics from '../models/Analytics.js';
import Trip from '../models/Trip.js';
import Payment from '../models/Payment.js';
import User from '../models/User.js';

export class AnalyticsService {
  /**
   * Generate analytics for user
   */
  async generateUserAnalytics(userId, period = 'monthly') {
    try {
      const { startDate, endDate } = this.getDateRange(period);

      const [tripStats, financialStats, environmentalStats, socialStats] = await Promise.all([
        this.calculateTripStats(userId, startDate, endDate),
        this.calculateFinancialStats(userId, startDate, endDate),
        this.calculateEnvironmentalImpact(userId, startDate, endDate),
        this.calculateSocialStats(userId, startDate, endDate)
      ]);

      const topRoutes = await this.getTopRoutes(userId, startDate, endDate);
      const timePatterns = await this.analyzeTimePatterns(userId, startDate, endDate);

      const analytics = new Analytics({
        user: userId,
        period: period,
        startDate: startDate,
        endDate: endDate,
        tripStats: tripStats,
        financialStats: financialStats,
        environmentalImpact: environmentalStats,
        socialStats: socialStats,
        topRoutes: topRoutes,
        timePatterns: timePatterns
      });

      await analytics.save();

      // Update user stats
      await this.updateUserStats(userId);

      return {
        success: true,
        analytics: analytics
      };
    } catch (error) {
      console.error('Analytics generation error:', error);
      return { success: false, message: 'Failed to generate analytics' };
    }
  }

  /**
   * Get date range for period
   */
  getDateRange(period) {
    const endDate = new Date();
    let startDate = new Date();

    switch (period) {
      case 'daily':
        startDate.setDate(endDate.getDate() - 1);
        break;
      case 'weekly':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'monthly':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case 'yearly':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      case 'all-time':
        startDate = new Date(0);
        break;
    }

    return { startDate, endDate };
  }

  /**
   * Calculate trip statistics
   */
  async calculateTripStats(userId, startDate, endDate) {
    const trips = await Trip.find({
      $or: [{ creator: userId }, { 'members.user': userId }],
      createdAt: { $gte: startDate, $lte: endDate }
    });

    const asDriver = trips.filter(t => t.creator.toString() === userId.toString());
    const asPassenger = trips.filter(t => 
      t.members.some(m => m.user && m.user.toString() === userId.toString())
    );

    const completedTrips = trips.filter(t => t.status === 'completed');
    const canceledTrips = trips.filter(t => t.status === 'canceled');

    const totalDistance = trips.reduce((sum, trip) => {
      const distance = parseFloat(trip.distance) || 0;
      return sum + distance;
    }, 0);

    const averageDistance = trips.length > 0 ? totalDistance / trips.length : 0;

    return {
      totalTrips: trips.length,
      asDriver: asDriver.length,
      asPassenger: asPassenger.length,
      completedTrips: completedTrips.length,
      canceledTrips: canceledTrips.length,
      totalDistance: totalDistance,
      averageDistance: averageDistance
    };
  }

  /**
   * Calculate financial statistics
   */
  async calculateFinancialStats(userId, startDate, endDate) {
    const payments = await Payment.find({
      user: userId,
      createdAt: { $gte: startDate, $lte: endDate }
    });

    const totalSpent = payments
      .filter(p => ['trip_payment', 'advance_payment'].includes(p.type))
      .reduce((sum, p) => sum + p.amount, 0);

    const totalRefunded = payments
      .filter(p => p.status === 'refunded')
      .reduce((sum, p) => sum + (p.refund.amount || 0), 0);

    const user = await User.findById(userId).select('wallet travelStats');
    const walletBalance = user.wallet.balance;

    // Estimate savings from carpooling (compared to solo travel)
    const totalSaved = user.travelStats.moneySaved || 0;

    const averageTripCost = payments.length > 0 ? totalSpent / payments.length : 0;

    return {
      totalSpent: totalSpent,
      totalEarned: 0, // Calculate if user is driver
      totalSaved: totalSaved,
      averageTripCost: averageTripCost,
      walletBalance: walletBalance
    };
  }

  /**
   * Calculate environmental impact
   */
  async calculateEnvironmentalImpact(userId, startDate, endDate) {
    const trips = await Trip.find({
      $or: [{ creator: userId }, { 'members.user': userId }],
      createdAt: { $gte: startDate, $lte: endDate },
      status: 'completed'
    });

    let totalCO2Saved = 0;

    trips.forEach(trip => {
      const distanceKm = parseFloat(trip.distance) || 0;
      const memberCount = trip.members.length + 1; // Including driver

      if (memberCount > 1) {
        // Average car emits 120g CO2 per km
        const soloEmissions = distanceKm * 0.12 * memberCount; // kg CO2
        const carpoolEmissions = distanceKm * 0.12; // kg CO2
        const saved = soloEmissions - carpoolEmissions;
        totalCO2Saved += saved;
      }
    });

    // 1 tree absorbs ~20kg CO2 per year
    const treesEquivalent = totalCO2Saved / 20;

    // Average fuel consumption: 15 km/L
    const totalDistance = trips.reduce((sum, t) => sum + (parseFloat(t.distance) || 0), 0);
    const fuelSaved = totalDistance / 15; // liters

    return {
      co2Saved: parseFloat(totalCO2Saved.toFixed(2)),
      treesEquivalent: parseFloat(treesEquivalent.toFixed(2)),
      fuelSaved: parseFloat(fuelSaved.toFixed(2))
    };
  }

  /**
   * Calculate social statistics
   */
  async calculateSocialStats(userId, startDate, endDate) {
    const trips = await Trip.find({
      $or: [{ creator: userId }, { 'members.user': userId }],
      createdAt: { $gte: startDate, $lte: endDate }
    });

    const uniquePartners = new Set();
    trips.forEach(trip => {
      if (trip.creator.toString() !== userId.toString()) {
        uniquePartners.add(trip.creator.toString());
      }
      trip.members.forEach(member => {
        if (member.user && member.user.toString() !== userId.toString()) {
          uniquePartners.add(member.user.toString());
        }
      });
    });

    const user = await User.findById(userId).select('rating rewards');

    return {
      uniqueTravelPartners: uniquePartners.size,
      averageRating: user.rating.average,
      totalReviews: user.rating.count,
      referralsMade: user.rewards.referralCount
    };
  }

  /**
   * Get top routes
   */
  async getTopRoutes(userId, startDate, endDate) {
    const trips = await Trip.find({
      $or: [{ creator: userId }, { 'members.user': userId }],
      createdAt: { $gte: startDate, $lte: endDate },
      status: 'completed'
    });

    const routeMap = {};

    trips.forEach(trip => {
      const key = `${trip.from}-${trip.to}`;
      if (!routeMap[key]) {
        routeMap[key] = {
          from: trip.from,
          to: trip.to,
          count: 0,
          totalDistance: 0,
          totalCost: 0
        };
      }

      routeMap[key].count += 1;
      routeMap[key].totalDistance += parseFloat(trip.distance) || 0;
      
      const userPayment = trip.payments.find(p => 
        p.user && p.user.toString() === userId.toString()
      );
      if (userPayment) {
        routeMap[key].totalCost += userPayment.amount || 0;
      }
    });

    const topRoutes = Object.values(routeMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(route => ({
        from: route.from,
        to: route.to,
        count: route.count,
        totalDistance: route.totalDistance,
        averageCost: route.count > 0 ? route.totalCost / route.count : 0
      }));

    return topRoutes;
  }

  /**
   * Analyze time patterns
   */
  async analyzeTimePatterns(userId, startDate, endDate) {
    const trips = await Trip.find({
      $or: [{ creator: userId }, { 'members.user': userId }],
      createdAt: { $gte: startDate, $lte: endDate }
    });

    const dayCount = {};
    const hourCount = {};
    const monthCount = {};

    trips.forEach(trip => {
      const tripDate = new Date(trip.date);
      const dayName = tripDate.toLocaleDateString('en-US', { weekday: 'long' });
      const month = tripDate.toLocaleDateString('en-US', { month: 'long' });
      
      dayCount[dayName] = (dayCount[dayName] || 0) + 1;
      monthCount[month] = (monthCount[month] || 0) + 1;

      if (trip.departureTime) {
        const hour = parseInt(trip.departureTime.split(':')[0]);
        hourCount[hour] = (hourCount[hour] || 0) + 1;
      }
    });

    const mostActiveDay = Object.keys(dayCount).reduce((a, b) => 
      dayCount[a] > dayCount[b] ? a : b, '');

    const mostActiveHour = Object.keys(hourCount).reduce((a, b) => 
      hourCount[a] > hourCount[b] ? a : b, 0);

    const peakMonths = Object.entries(monthCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([month]) => month);

    return {
      mostActiveDay: mostActiveDay,
      mostActiveHour: parseInt(mostActiveHour),
      peakTravelMonths: peakMonths
    };
  }

  /**
   * Update user stats summary
   */
  async updateUserStats(userId) {
    const { startDate, endDate } = this.getDateRange('all-time');
    
    const [tripStats, financialStats, environmentalStats] = await Promise.all([
      this.calculateTripStats(userId, startDate, endDate),
      this.calculateFinancialStats(userId, startDate, endDate),
      this.calculateEnvironmentalImpact(userId, startDate, endDate)
    ]);

    const user = await User.findById(userId);
    
    user.travelStats.completedTrips = tripStats.completedTrips;
    user.travelStats.canceledTrips = tripStats.canceledTrips;
    user.travelStats.totalDistance = tripStats.totalDistance;
    user.travelStats.totalCO2Saved = environmentalStats.co2Saved;
    user.travelStats.moneySaved = financialStats.totalSaved;

    await user.save();
  }

  /**
   * Get user analytics dashboard
   */
  async getDashboard(userId, period = 'monthly') {
    const latestAnalytics = await Analytics.findOne({ user: userId, period: period })
      .sort({ createdAt: -1 });

    if (!latestAnalytics) {
      return await this.generateUserAnalytics(userId, period);
    }

    return {
      success: true,
      analytics: latestAnalytics
    };
  }

  /**
   * Get carbon footprint report
   */
  async getCarbonFootprintReport(userId) {
    const { startDate, endDate } = this.getDateRange('all-time');
    const environmentalStats = await this.calculateEnvironmentalImpact(userId, startDate, endDate);
    
    return {
      success: true,
      report: {
        co2Saved: environmentalStats.co2Saved,
        treesEquivalent: environmentalStats.treesEquivalent,
        fuelSaved: environmentalStats.fuelSaved,
        comparisonToAverage: environmentalStats.co2Saved / 12 // Monthly average
      }
    };
  }
}

// Singleton instance
export const analyticsService = new AnalyticsService();
