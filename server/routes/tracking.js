import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { gpsTrackingService } from '../services/gpsTracking.js';

const router = express.Router();

// Start tracking
router.post('/start', authMiddleware, async (req, res) => {
  try {
    const { tripId, location } = req.body;
    const result = gpsTrackingService.startTracking(tripId, location);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update location
router.post('/update', authMiddleware, async (req, res) => {
  try {
    const { tripId, location } = req.body;
    const result = gpsTrackingService.updateLocation(tripId, location);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Calculate ETA
router.post('/eta/calculate', authMiddleware, async (req, res) => {
  try {
    const { fromLat, fromLon, toLat, toLon, mode } = req.body;
    const result = await gpsTrackingService.calculateETA(fromLat, fromLon, toLat, toLon, mode);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get real-time ETA
router.get('/:tripId/eta', authMiddleware, async (req, res) => {
  try {
    const { tripId } = req.params;
    const { destinationLat, destinationLon } = req.query;
    const result = await gpsTrackingService.calculateRealTimeETA(
      tripId,
      parseFloat(destinationLat),
      parseFloat(destinationLon)
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Check route deviation
router.get('/:tripId/deviation', authMiddleware, async (req, res) => {
  try {
    const { tripId } = req.params;
    const { originalRoute } = req.query;
    const result = await gpsTrackingService.checkRouteDeviation(tripId, originalRoute);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Generate tracking link
router.post('/:tripId/link', authMiddleware, async (req, res) => {
  try {
    const { tripId } = req.params;
    const result = gpsTrackingService.generateTrackingLink(tripId, req.user._id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get tracking data
router.get('/:tripId/data', authMiddleware, async (req, res) => {
  try {
    const { tripId } = req.params;
    const result = gpsTrackingService.getTrackingData(tripId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Stop tracking
router.post('/:tripId/stop', authMiddleware, async (req, res) => {
  try {
    const { tripId } = req.params;
    const result = gpsTrackingService.stopTracking(tripId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Calculate speed
router.get('/:tripId/speed', authMiddleware, async (req, res) => {
  try {
    const { tripId } = req.params;
    const result = gpsTrackingService.calculateSpeed(tripId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
