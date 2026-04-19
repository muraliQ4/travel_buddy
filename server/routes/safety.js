import express from 'express';
import { SafetyAlert, NightSafety } from '../models/SafetyAlert.js';
import Trip from '../models/Trip.js';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Create safety alert
router.post('/alerts', authMiddleware, async (req, res) => {
  try {
    const { tripId, type, severity, title, description, location, deviationDetails } = req.body;
    
    const alert = new SafetyAlert({
      trip: tripId,
      user: req.userId,
      type,
      severity: severity || 'medium',
      title,
      description,
      location,
      deviationDetails
    });
    
    await alert.save();
    
    // Notify all trip members
    const trip = await Trip.findById(tripId).populate('members.user creator');
    const io = req.app.get('io');
    
    if (trip) {
      const allUsers = [trip.creator, ...trip.members.map(m => m.user)];
      allUsers.forEach(user => {
        if (user && user._id.toString() !== req.userId) {
          io.to(`user_${user._id}`).emit('safety-alert', alert);
        }
      });
    }
    
    res.json(alert);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get alerts for a trip
router.get('/alerts/trip/:tripId', authMiddleware, async (req, res) => {
  try {
    const alerts = await SafetyAlert.find({ trip: req.params.tripId })
      .populate('user', 'name profilePhoto')
      .sort({ createdAt: -1 });
    
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Acknowledge alert
router.put('/alerts/:id/acknowledge', authMiddleware, async (req, res) => {
  try {
    const alert = await SafetyAlert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    
    alert.status = 'acknowledged';
    alert.actions.push({
      action: 'acknowledged',
      performedBy: req.userId
    });
    
    await alert.save();
    res.json(alert);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create night safety monitoring
router.post('/night-safety', authMiddleware, async (req, res) => {
  try {
    const { tripId, emergencyContacts, checkpoints } = req.body;
    
    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    
    // Check if it's a night trip
    const departureHour = parseInt(trip.departureTime.split(':')[0]);
    const isNightTrip = departureHour >= 22 || departureHour < 6;
    
    const nightSafety = new NightSafety({
      trip: tripId,
      user: req.userId,
      isNightTrip,
      monitoring: {
        emergencyContacts: emergencyContacts || []
      },
      checkpoints: checkpoints || []
    });
    
    await nightSafety.save();
    res.json(nightSafety);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update checkpoint status
router.put('/night-safety/:id/checkpoint/:checkpointIndex', authMiddleware, async (req, res) => {
  try {
    const { status, actualTime } = req.body;
    
    const nightSafety = await NightSafety.findById(req.params.id);
    if (!nightSafety) {
      return res.status(404).json({ error: 'Night safety record not found' });
    }
    
    if (nightSafety.user.toString() !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const checkpoint = nightSafety.checkpoints[req.params.checkpointIndex];
    if (!checkpoint) {
      return res.status(404).json({ error: 'Checkpoint not found' });
    }
    
    checkpoint.status = status;
    checkpoint.actualTime = actualTime || new Date();
    
    // Calculate delay
    if (checkpoint.actualTime > checkpoint.expectedTime) {
      checkpoint.delay = Math.floor((checkpoint.actualTime - checkpoint.expectedTime) / 60000);
    }
    
    nightSafety.monitoring.lastCheckIn = new Date();
    await nightSafety.save();
    
    res.json(nightSafety);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get night safety status
router.get('/night-safety/trip/:tripId', authMiddleware, async (req, res) => {
  try {
    const nightSafety = await NightSafety.findOne({ 
      trip: req.params.tripId,
      status: { $in: ['active', 'emergency'] }
    });
    
    res.json(nightSafety || null);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
