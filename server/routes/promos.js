import express from 'express';
import PromoCode from '../models/PromoCode.js';
import Trip from '../models/Trip.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get active promo codes
router.get('/active', authMiddleware, async (req, res) => {
  try {
    const now = new Date();
    const promoCodes = await PromoCode.find({
      isActive: true,
      validFrom: { $lte: now },
      validUntil: { $gte: now },
      $expr: { $lt: ['$usedCount', '$usageLimit'] }
    }).select('-users');
    
    res.json(promoCodes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Validate promo code
router.post('/validate', authMiddleware, async (req, res) => {
  try {
    const { code, tripId } = req.body;
    
    const promoCode = await PromoCode.findOne({ 
      code: code.toUpperCase(),
      isActive: true 
    });
    
    if (!promoCode) {
      return res.status(404).json({ error: 'Invalid promo code' });
    }
    
    const now = new Date();
    if (now < promoCode.validFrom || now > promoCode.validUntil) {
      return res.status(400).json({ error: 'Promo code expired' });
    }
    
    if (promoCode.usedCount >= promoCode.usageLimit) {
      return res.status(400).json({ error: 'Promo code usage limit reached' });
    }
    
    // Check per-user limit
    const userUsage = promoCode.users.filter(u => u.user.toString() === req.userId).length;
    if (userUsage >= promoCode.perUserLimit) {
      return res.status(400).json({ error: 'You have already used this promo code' });
    }
    
    // Check if applicable for user type
    if (promoCode.applicableFor === 'new-users') {
      const User = mongoose.model('User');
      const user = await User.findById(req.userId);
      if (user.travelStats?.completedTrips > 0) {
        return res.status(400).json({ error: 'This promo code is only for new users' });
      }
    }
    
    // Get trip details for validation
    if (tripId) {
      const trip = await Trip.findById(tripId);
      if (!trip) {
        return res.status(404).json({ error: 'Trip not found' });
      }
      
      const tripCost = trip.pricing?.perPersonCost || 0;
      
      if (tripCost < promoCode.minTripValue) {
        return res.status(400).json({ 
          error: `Minimum trip value of ₹${promoCode.minTripValue} required` 
        });
      }
      
      // Calculate discount
      let discount = 0;
      if (promoCode.type === 'percentage') {
        discount = (tripCost * promoCode.value) / 100;
        if (promoCode.maxDiscount > 0) {
          discount = Math.min(discount, promoCode.maxDiscount);
        }
      } else if (promoCode.type === 'fixed') {
        discount = promoCode.value;
      }
      
      res.json({
        valid: true,
        code: promoCode.code,
        description: promoCode.description,
        type: promoCode.type,
        discount,
        finalPrice: Math.max(0, tripCost - discount)
      });
    } else {
      res.json({
        valid: true,
        code: promoCode.code,
        description: promoCode.description,
        type: promoCode.type
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Apply promo code to trip
router.post('/apply', authMiddleware, async (req, res) => {
  try {
    const { code, tripId } = req.body;
    
    const promoCode = await PromoCode.findOne({ 
      code: code.toUpperCase(),
      isActive: true 
    });
    
    if (!promoCode) {
      return res.status(404).json({ error: 'Invalid promo code' });
    }
    
    // Validate again
    const now = new Date();
    if (now < promoCode.validFrom || now > promoCode.validUntil) {
      return res.status(400).json({ error: 'Promo code expired' });
    }
    
    if (promoCode.usedCount >= promoCode.usageLimit) {
      return res.status(400).json({ error: 'Promo code usage limit reached' });
    }
    
    const userUsage = promoCode.users.filter(u => u.user.toString() === req.userId).length;
    if (userUsage >= promoCode.perUserLimit) {
      return res.status(400).json({ error: 'You have already used this promo code' });
    }
    
    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    
    const tripCost = trip.pricing?.perPersonCost || 0;
    
    if (tripCost < promoCode.minTripValue) {
      return res.status(400).json({ 
        error: `Minimum trip value of ₹${promoCode.minTripValue} required` 
      });
    }
    
    // Calculate discount
    let discount = 0;
    if (promoCode.type === 'percentage') {
      discount = (tripCost * promoCode.value) / 100;
      if (promoCode.maxDiscount > 0) {
        discount = Math.min(discount, promoCode.maxDiscount);
      }
    } else if (promoCode.type === 'fixed') {
      discount = promoCode.value;
    }
    
    // Record usage
    promoCode.users.push({
      user: req.userId,
      trip: tripId,
      discountAmount: discount
    });
    promoCode.usedCount += 1;
    await promoCode.save();
    
    res.json({
      success: true,
      discount,
      originalPrice: tripCost,
      finalPrice: Math.max(0, tripCost - discount)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's promo code history
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const promoCodes = await PromoCode.find({
      'users.user': req.userId
    }).select('code description type value users');
    
    const history = promoCodes.flatMap(promo => 
      promo.users
        .filter(u => u.user.toString() === req.userId)
        .map(u => ({
          code: promo.code,
          description: promo.description,
          type: promo.type,
          discount: u.discountAmount,
          trip: u.trip,
          usedAt: u.usedAt
        }))
    ).sort((a, b) => b.usedAt - a.usedAt);
    
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
