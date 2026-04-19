import express from 'express';
import PriceAIService from '../services/priceAI.js';
import Trip from '../models/Trip.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get AI-suggested price for a trip
router.post('/suggest', authMiddleware, async (req, res) => {
  try {
    const tripDetails = req.body;
    
    if (!tripDetails.transport || !tripDetails.distance || !tripDetails.maxMembers) {
      return res.status(400).json({ 
        error: 'Transport, distance, and maxMembers are required' 
      });
    }
    
    const priceSuggestion = PriceAIService.calculateSuggestedPrice(tripDetails);
    
    res.json(priceSuggestion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get dynamic pricing for existing trip
router.get('/dynamic/:tripId', authMiddleware, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId);
    
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    
    // Calculate time until trip
    const tripDate = new Date(trip.date);
    const [hours, minutes] = (trip.departureTime || '09:00').split(':');
    tripDate.setHours(parseInt(hours), parseInt(minutes));
    
    const timeUntilTrip = (tripDate - new Date()) / (1000 * 60 * 60); // in hours
    
    // Get demand metrics (you can enhance this with actual view/booking tracking)
    const demand = {
      views: trip.views || 0,
      bookings: trip.members?.length || 0,
      timeUntilTrip
    };
    
    const basePrice = trip.pricing?.perPersonCost || 0;
    const dynamicPricing = PriceAIService.calculateDynamicPrice(basePrice, demand);
    
    res.json({
      currentPrice: basePrice,
      ...dynamicPricing,
      tripId: trip._id,
      tripTitle: trip.title
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Compare prices for similar routes
router.post('/compare', authMiddleware, async (req, res) => {
  try {
    const { from, to, date } = req.body;
    
    if (!from || !to) {
      return res.status(400).json({ error: 'From and to locations are required' });
    }
    
    // Find similar trips
    const similarTrips = await Trip.find({
      from: { $regex: from, $options: 'i' },
      to: { $regex: to, $options: 'i' },
      date: { $gte: new Date().toISOString().split('T')[0] },
      isPublic: true,
      status: 'upcoming'
    }).select('title from to distance transport pricing creatorName date departureTime')
      .limit(10);
    
    if (similarTrips.length === 0) {
      return res.json({
        message: 'No similar trips found',
        averagePrice: null,
        trips: []
      });
    }
    
    // Calculate average price
    const prices = similarTrips
      .map(t => t.pricing?.perPersonCost)
      .filter(p => p > 0);
    
    const averagePrice = prices.length > 0
      ? Math.ceil(prices.reduce((sum, p) => sum + p, 0) / prices.length)
      : null;
    
    const minPrice = prices.length > 0 ? Math.min(...prices) : null;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : null;
    
    res.json({
      averagePrice,
      minPrice,
      maxPrice,
      totalTrips: similarTrips.length,
      trips: similarTrips,
      priceRange: averagePrice ? `₹${minPrice} - ₹${maxPrice}` : 'N/A'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get price history for a route
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const { from, to } = req.query;
    
    if (!from || !to) {
      return res.status(400).json({ error: 'From and to locations are required' });
    }
    
    // Get completed trips for this route
    const historicalTrips = await Trip.find({
      from: { $regex: from, $options: 'i' },
      to: { $regex: to, $options: 'i' },
      status: 'completed'
    }).select('date pricing transport distance')
      .sort({ date: -1 })
      .limit(50);
    
    // Group by month
    const monthlyPrices = {};
    historicalTrips.forEach(trip => {
      const month = trip.date.substring(0, 7); // YYYY-MM
      if (!monthlyPrices[month]) {
        monthlyPrices[month] = [];
      }
      if (trip.pricing?.perPersonCost) {
        monthlyPrices[month].push(trip.pricing.perPersonCost);
      }
    });
    
    // Calculate averages
    const priceHistory = Object.entries(monthlyPrices).map(([month, prices]) => ({
      month,
      averagePrice: Math.ceil(prices.reduce((sum, p) => sum + p, 0) / prices.length),
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
      tripCount: prices.length
    })).sort((a, b) => a.month.localeCompare(b.month));
    
    res.json({
      route: { from, to },
      history: priceHistory,
      totalTrips: historicalTrips.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
