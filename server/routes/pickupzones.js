import express from 'express';
import PickupZone from '../models/PickupZone.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get all verified pickup zones
router.get('/', async (req, res) => {
  try {
    const { city, type } = req.query;
    const filter = { verified: true, isActive: true };
    
    if (city) filter['location.city'] = new RegExp(city, 'i');
    if (type) filter.type = type;
    
    const zones = await PickupZone.find(filter)
      .select('-reportedIssues')
      .sort({ usageCount: -1, averageRating: -1 });
    
    res.json(zones);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Find nearby pickup zones
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lon, radius = 5000 } = req.query; // radius in meters
    
    if (!lat || !lon) {
      return res.status(400).json({ error: 'Latitude and longitude required' });
    }
    
    const zones = await PickupZone.find({
      verified: true,
      isActive: true,
      coordinates: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lon), parseFloat(lat)]
          },
          $maxDistance: parseInt(radius)
        }
      }
    }).limit(20);
    
    res.json(zones);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get zone by ID
router.get('/:id', async (req, res) => {
  try {
    const zone = await PickupZone.findById(req.params.id);
    if (!zone) {
      return res.status(404).json({ error: 'Pickup zone not found' });
    }
    
    res.json(zone);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new pickup zone (requires auth)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, type, location, description, directions, landmarks, amenities } = req.body;
    
    const zone = new PickupZone({
      name,
      type,
      location,
      coordinates: {
        type: 'Point',
        coordinates: [location.lon, location.lat]
      },
      description,
      directions,
      landmarks: landmarks || [],
      amenities: amenities || {},
      verifiedBy: req.userId,
      verified: false // Needs admin approval
    });
    
    await zone.save();
    res.json(zone);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rate pickup zone
router.post('/:id/rate', authMiddleware, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    
    const zone = await PickupZone.findById(req.params.id);
    if (!zone) {
      return res.status(404).json({ error: 'Pickup zone not found' });
    }
    
    // Check if user already rated
    const existingRating = zone.ratings.find(r => r.user.toString() === req.userId);
    if (existingRating) {
      existingRating.rating = rating;
      existingRating.comment = comment || '';
      existingRating.date = new Date();
    } else {
      zone.ratings.push({
        user: req.userId,
        rating,
        comment: comment || ''
      });
    }
    
    // Recalculate average rating
    const totalRating = zone.ratings.reduce((sum, r) => sum + r.rating, 0);
    zone.averageRating = totalRating / zone.ratings.length;
    
    await zone.save();
    res.json(zone);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Report issue with pickup zone
router.post('/:id/report', authMiddleware, async (req, res) => {
  try {
    const { issue } = req.body;
    
    const zone = await PickupZone.findById(req.params.id);
    if (!zone) {
      return res.status(404).json({ error: 'Pickup zone not found' });
    }
    
    zone.reportedIssues.push({
      user: req.userId,
      issue
    });
    
    await zone.save();
    res.json({ success: true, message: 'Issue reported successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Increment usage count
router.post('/:id/use', authMiddleware, async (req, res) => {
  try {
    const zone = await PickupZone.findById(req.params.id);
    if (!zone) {
      return res.status(404).json({ error: 'Pickup zone not found' });
    }
    
    zone.usageCount += 1;
    await zone.save();
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
