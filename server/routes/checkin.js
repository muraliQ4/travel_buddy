import express from 'express';
import CheckIn from '../models/CheckIn.js';
import Trip from '../models/Trip.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Generate QR code for trip check-in
router.post('/generate-qr', authMiddleware, async (req, res) => {
  try {
    const { tripId } = req.body;
    
    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    
    // Verify user is part of the trip
    const isMember = trip.members.some(m => m.user.toString() === req.userId) ||
                     trip.creator.toString() === req.userId;
    
    if (!isMember) {
      return res.status(403).json({ error: 'You are not a member of this trip' });
    }
    
    const qrCode = CheckIn.generateQRCode(tripId, req.userId);
    
    res.json({ 
      qrCode,
      tripId,
      userId: req.userId,
      expiresIn: '24h'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check in to trip
router.post('/checkin', authMiddleware, async (req, res) => {
  try {
    const { tripId, method, qrCode, location } = req.body;
    
    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    
    // Verify user is part of the trip
    const memberIndex = trip.members.findIndex(m => m.user.toString() === req.userId);
    const isCreator = trip.creator.toString() === req.userId;
    
    if (memberIndex === -1 && !isCreator) {
      return res.status(403).json({ error: 'You are not a member of this trip' });
    }
    
    // Check if already checked in
    const existingCheckIn = await CheckIn.findOne({
      trip: tripId,
      user: req.userId
    });
    
    if (existingCheckIn) {
      return res.status(400).json({ error: 'Already checked in' });
    }
    
    // Determine expected time
    const tripDate = new Date(trip.date);
    const [hours, minutes] = trip.departureTime.split(':');
    tripDate.setHours(parseInt(hours), parseInt(minutes));
    
    const checkIn = new CheckIn({
      trip: tripId,
      user: req.userId,
      method: method || 'manual',
      qrCode,
      location,
      expectedTime: tripDate
    });
    
    // Determine status
    const now = new Date();
    const diffMinutes = (now - tripDate) / 60000;
    
    if (diffMinutes < -15) {
      checkIn.status = 'early';
    } else if (diffMinutes <= 15) {
      checkIn.status = 'on-time';
    } else if (diffMinutes <= 60) {
      checkIn.status = 'late';
      checkIn.delay = Math.floor(diffMinutes);
    } else {
      checkIn.status = 'no-show';
      checkIn.delay = Math.floor(diffMinutes);
    }
    
    await checkIn.save();
    
    // Update trip member status
    if (memberIndex !== -1) {
      trip.members[memberIndex].status = 'confirmed';
      await trip.save();
    }
    
    // Notify other trip members
    const io = req.app.get('io');
    io.to(`trip_${tripId}`).emit('user-checked-in', {
      userId: req.userId,
      status: checkIn.status,
      time: checkIn.checkInTime
    });
    
    res.json(checkIn);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify check-in by QR code
router.post('/verify-qr', authMiddleware, async (req, res) => {
  try {
    const { qrCode, tripId } = req.body;
    
    // Validate QR code format
    if (!qrCode.startsWith('TRAVELBUDDY-')) {
      return res.status(400).json({ error: 'Invalid QR code' });
    }
    
    const parts = qrCode.split('-');
    if (parts.length !== 4) {
      return res.status(400).json({ error: 'Invalid QR code format' });
    }
    
    const [, qrTripId, qrUserId, timestamp] = parts;
    
    // Verify trip ID matches
    if (qrTripId !== tripId) {
      return res.status(400).json({ error: 'QR code does not match this trip' });
    }
    
    // Check QR code age (valid for 24 hours)
    const qrAge = Date.now() - parseInt(timestamp);
    if (qrAge > 24 * 60 * 60 * 1000) {
      return res.status(400).json({ error: 'QR code expired' });
    }
    
    res.json({ 
      valid: true,
      userId: qrUserId,
      tripId: qrTripId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get check-ins for a trip
router.get('/trip/:tripId', authMiddleware, async (req, res) => {
  try {
    const checkIns = await CheckIn.find({ trip: req.params.tripId })
      .populate('user', 'name profilePhoto')
      .sort({ checkInTime: -1 });
    
    res.json(checkIns);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's check-in history
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const checkIns = await CheckIn.find({ user: req.userId })
      .populate('trip', 'title from to date')
      .sort({ checkInTime: -1 })
      .limit(50);
    
    res.json(checkIns);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
