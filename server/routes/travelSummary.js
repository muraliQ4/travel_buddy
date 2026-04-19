import express from 'express';
import TravelSummary from '../models/TravelSummary.js';
import Trip from '../models/Trip.js';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Generate travel summary for user
router.post('/generate', authMiddleware, async (req, res) => {
  try {
    const { year } = req.body;
    const summaryYear = year || new Date().getFullYear();
    
    // Get all user's trips for the year
    const startDate = new Date(summaryYear, 0, 1);
    const endDate = new Date(summaryYear, 11, 31, 23, 59, 59);
    
    const userTrips = await Trip.find({
      $or: [
        { creator: req.userId },
        { 'members.user': req.userId }
      ],
      date: {
        $gte: startDate.toISOString().split('T')[0],
        $lte: endDate.toISOString().split('T')[0]
      }
    }).populate('members.user');
    
    const user = await User.findById(req.userId);
    
    // Calculate statistics
    const stats = {
      trips: {
        total: userTrips.length,
        asDriver: userTrips.filter(t => t.creator.toString() === req.userId).length,
        asPassenger: userTrips.filter(t => t.creator.toString() !== req.userId).length,
        completed: userTrips.filter(t => t.status === 'completed').length,
        canceled: userTrips.filter(t => t.status === 'canceled').length
      },
      distance: {
        total: 0,
        longest: 0,
        byTransport: {}
      },
      financial: {
        totalSpent: 0,
        totalEarned: 0,
        totalSaved: 0
      },
      environmental: {
        co2Saved: 0,
        fuelSaved: 0
      }
    };
    
    // Calculate detailed stats
    userTrips.forEach(trip => {
      const distance = parseFloat(trip.distance) || 0;
      stats.distance.total += distance;
      stats.distance.longest = Math.max(stats.distance.longest, distance);
      
      // By transport
      const transport = trip.transport || 'other';
      stats.distance.byTransport[transport] = (stats.distance.byTransport[transport] || 0) + distance;
      
      // Financial
      if (trip.creator.toString() === req.userId) {
        const totalPaid = trip.payments.reduce((sum, p) => sum + p.amount, 0);
        stats.financial.totalEarned += totalPaid;
      } else {
        const userPayment = trip.payments.find(p => p.user.toString() === req.userId);
        if (userPayment) {
          stats.financial.totalSpent += userPayment.amount;
        }
      }
      
      // Environmental
      if (trip.environmental) {
        stats.environmental.co2Saved += trip.environmental.carbonSaved || 0;
      }
    });
    
    stats.distance.average = stats.trips.total > 0 
      ? stats.distance.total / stats.trips.total 
      : 0;
    
    stats.financial.totalSaved = stats.financial.totalEarned - stats.financial.totalSpent;
    stats.environmental.treesEquivalent = Math.floor(stats.environmental.co2Saved / 21);
    stats.environmental.fuelSaved = stats.environmental.co2Saved / 2.31; // kg CO2 per liter
    
    // Top destinations
    const destinationMap = {};
    userTrips.forEach(trip => {
      const city = trip.to;
      if (!destinationMap[city]) {
        destinationMap[city] = { city, visits: 0, totalDistance: 0 };
      }
      destinationMap[city].visits += 1;
      destinationMap[city].totalDistance += parseFloat(trip.distance) || 0;
    });
    
    const topDestinations = Object.values(destinationMap)
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 10);
    
    // Monthly breakdown
    const monthlyStats = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      trips: 0,
      distance: 0,
      spent: 0,
      saved: 0
    }));
    
    userTrips.forEach(trip => {
      const month = new Date(trip.date).getMonth();
      monthlyStats[month].trips += 1;
      monthlyStats[month].distance += parseFloat(trip.distance) || 0;
    });
    
    // Create or update summary
    let summary = await TravelSummary.findOne({ 
      user: req.userId, 
      year: summaryYear 
    });
    
    if (!summary) {
      summary = new TravelSummary({ 
        user: req.userId, 
        year: summaryYear 
      });
    }
    
    summary.trips = stats.trips;
    summary.distance = stats.distance;
    summary.financial = stats.financial;
    summary.environmental = stats.environmental;
    summary.topDestinations = topDestinations;
    summary.monthlyStats = monthlyStats;
    summary.ratings = {
      averageReceived: user.rating?.average || 0,
      totalReceived: user.rating?.count || 0
    };
    summary.reportGenerated = true;
    summary.generatedAt = new Date();
    summary.updatedAt = new Date();
    
    await summary.save();
    
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's travel summary
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { year } = req.query;
    const summaryYear = year || new Date().getFullYear();
    
    let summary = await TravelSummary.findOne({
      user: req.userId,
      year: summaryYear
    });
    
    if (!summary) {
      return res.status(404).json({ error: 'Summary not found. Generate one first.' });
    }
    
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all years with summaries
router.get('/years', authMiddleware, async (req, res) => {
  try {
    const summaries = await TravelSummary.find({ user: req.userId })
      .select('year reportGenerated')
      .sort({ year: -1 });
    
    res.json(summaries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
