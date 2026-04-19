import express from 'express';
import Insurance from '../models/Insurance.js';
import Trip from '../models/Trip.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get insurance options for a trip
router.get('/options/:tripId', authMiddleware, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    
    // Calculate insurance options based on trip details
    const tripCost = trip.pricing?.perPersonCost || 0;
    const distance = parseFloat(trip.distance) || 0;
    
    const options = [
      {
        type: 'cancellation',
        name: 'Cancellation Insurance',
        description: 'Get full refund if you cancel for any reason',
        premium: Math.max(50, tripCost * 0.1),
        coverageAmount: tripCost,
        coverage: {
          cancellation: true,
          medicalEmergency: false,
          accidentalDamage: false,
          delayCompensation: false,
          luggageLoss: false,
          personalAccident: false
        }
      },
      {
        type: 'journey',
        name: 'Journey Insurance',
        description: 'Protection during your journey including medical emergencies',
        premium: Math.max(100, tripCost * 0.15),
        coverageAmount: tripCost * 2,
        coverage: {
          cancellation: false,
          medicalEmergency: true,
          accidentalDamage: true,
          delayCompensation: true,
          luggageLoss: false,
          personalAccident: true
        }
      },
      {
        type: 'comprehensive',
        name: 'Comprehensive Insurance',
        description: 'Complete protection including cancellation, journey, and luggage',
        premium: Math.max(150, tripCost * 0.2),
        coverageAmount: tripCost * 3,
        coverage: {
          cancellation: true,
          medicalEmergency: true,
          accidentalDamage: true,
          delayCompensation: true,
          luggageLoss: true,
          personalAccident: true
        }
      }
    ];
    
    res.json(options);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Purchase insurance
router.post('/purchase', authMiddleware, async (req, res) => {
  try {
    const { tripId, type, premium, coverageAmount, coverage } = req.body;
    
    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    
    // Generate policy number
    const policyNumber = `POL-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    const insurance = new Insurance({
      user: req.userId,
      trip: tripId,
      type,
      policyNumber,
      premium,
      coverageAmount,
      coverage,
      startDate: new Date(trip.date),
      endDate: new Date(new Date(trip.date).getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days after trip
    });
    
    await insurance.save();
    
    // Update trip insurance status
    trip.insurance.covered = true;
    trip.insurance.provider = 'TravelBuddy Insurance';
    trip.insurance.policyNumber = policyNumber;
    trip.insurance.coverageAmount = coverageAmount;
    await trip.save();
    
    res.json(insurance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's insurances
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const insurances = await Insurance.find({ user: req.userId })
      .populate('trip', 'title from to date')
      .sort({ createdAt: -1 });
    
    res.json(insurances);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// File insurance claim
router.post('/:id/claim', authMiddleware, async (req, res) => {
  try {
    const { reason, amount, documents } = req.body;
    
    const insurance = await Insurance.findById(req.params.id);
    if (!insurance) {
      return res.status(404).json({ error: 'Insurance not found' });
    }
    
    if (insurance.user.toString() !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    if (insurance.status !== 'active') {
      return res.status(400).json({ error: 'Insurance is not active' });
    }
    
    insurance.claims.push({
      reason,
      amount,
      documents: documents || []
    });
    
    insurance.status = 'claimed';
    await insurance.save();
    
    res.json(insurance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
