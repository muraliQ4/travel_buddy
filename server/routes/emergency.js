import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { emergencyService } from '../services/emergency.js';

const router = express.Router();

// Trigger SOS alert
router.post('/sos/trigger', authMiddleware, async (req, res) => {
  try {
    const { tripId, type, location, description } = req.body;
    const result = await emergencyService.triggerSOS(tripId, req.userId, type, location, description);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
// Quick SOS trigger without trip (for general emergencies)
router.post('/sos/quick-trigger', authMiddleware, async (req, res) => {
  try {
    const { type, location, description } = req.body;
    const result = await emergencyService.triggerQuickSOS(req.userId, type, location, description);
    res.json(result);
  } catch (error) {
    console.error('Quick SOS error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});
// Acknowledge emergency
router.post('/:emergencyId/acknowledge', authMiddleware, async (req, res) => {
  try {
    const { emergencyId } = req.params;
    const result = await emergencyService.acknowledgeEmergency(emergencyId, req.userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Resolve emergency
router.post('/:emergencyId/resolve', authMiddleware, async (req, res) => {
  try {
    const { emergencyId } = req.params;
    const { resolution } = req.body;
    const result = await emergencyService.resolveEmergency(emergencyId, req.userId, resolution);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Start audio recording
router.post('/:emergencyId/audio/start', authMiddleware, async (req, res) => {
  try {
    const { emergencyId } = req.params;
    const result = await emergencyService.startAudioRecording(emergencyId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Upload emergency photo
router.post('/:emergencyId/photo/upload', authMiddleware, async (req, res) => {
  try {
    const { emergencyId } = req.params;
    const { photoUrl } = req.body;
    const result = await emergencyService.uploadEmergencyPhoto(emergencyId, photoUrl);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Upload emergency video
router.post('/:emergencyId/video/upload', authMiddleware, async (req, res) => {
  try {
    const { emergencyId } = req.params;
    const { videoUrl, duration, thumbnail } = req.body;
    const result = await emergencyService.uploadEmergencyVideo(emergencyId, videoUrl, duration, thumbnail);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Start live location tracking
router.post('/:emergencyId/tracking/start', authMiddleware, async (req, res) => {
  try {
    const { emergencyId } = req.params;
    const result = await emergencyService.startLiveTracking(emergencyId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update live location
router.post('/:emergencyId/tracking/update', authMiddleware, async (req, res) => {
  try {
    const { emergencyId } = req.params;
    const { location } = req.body;
    const result = await emergencyService.updateLiveLocation(emergencyId, location);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Stop live tracking
router.post('/:emergencyId/tracking/stop', authMiddleware, async (req, res) => {
  try {
    const { emergencyId } = req.params;
    const result = await emergencyService.stopLiveTracking(emergencyId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Set geofence
router.post('/:emergencyId/geofence/set', authMiddleware, async (req, res) => {
  try {
    const { emergencyId } = req.params;
    const { radius } = req.body;
    const result = await emergencyService.setGeofence(emergencyId, radius);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Report geofence breach
router.post('/:emergencyId/geofence/breach', authMiddleware, async (req, res) => {
  try {
    const { emergencyId } = req.params;
    const { location } = req.body;
    const result = await emergencyService.reportGeofenceBreach(emergencyId, location);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get active emergencies (admin/support)
router.get('/active', authMiddleware, async (req, res) => {
  try {
    // Add admin/support check middleware
    const result = await emergencyService.getActiveEmergencies();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user emergency history
router.get('/my-emergencies', authMiddleware, async (req, res) => {
  try {
    const result = await emergencyService.getUserEmergencies(req.userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Activate panic button with countdown
router.post('/:emergencyId/panic/activate', authMiddleware, async (req, res) => {
  try {
    const { emergencyId } = req.params;
    const { countdown } = req.body;
    const result = await emergencyService.activatePanicButton(emergencyId, countdown);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Cancel panic button
router.post('/:emergencyId/panic/cancel', authMiddleware, async (req, res) => {
  try {
    const { emergencyId } = req.params;
    const result = await emergencyService.cancelPanicButton(emergencyId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Set safe word
router.post('/:emergencyId/safeword/set', authMiddleware, async (req, res) => {
  try {
    const { emergencyId } = req.params;
    const { word } = req.body;
    const result = await emergencyService.setSafeWord(emergencyId, word);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Verify safe word
router.post('/:emergencyId/safeword/verify', authMiddleware, async (req, res) => {
  try {
    const { emergencyId } = req.params;
    const { word } = req.body;
    const result = await emergencyService.verifySafeWord(emergencyId, word);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Schedule fake call
router.post('/:emergencyId/fakecall/schedule', authMiddleware, async (req, res) => {
  try {
    const { emergencyId } = req.params;
    const { delayMinutes, callerName, reason } = req.body;
    const result = await emergencyService.scheduleFakeCall(emergencyId, delayMinutes, callerName, reason);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Execute fake call
router.post('/:emergencyId/fakecall/execute', authMiddleware, async (req, res) => {
  try {
    const { emergencyId } = req.params;
    const result = await emergencyService.executeFakeCall(emergencyId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Setup check-in
router.post('/:emergencyId/checkin/setup', authMiddleware, async (req, res) => {
  try {
    const { emergencyId } = req.params;
    const { interval, autoTriggerAfter } = req.body;
    const result = await emergencyService.setupCheckIn(emergencyId, interval, autoTriggerAfter);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Perform check-in
router.post('/:emergencyId/checkin/perform', authMiddleware, async (req, res) => {
  try {
    const { emergencyId } = req.params;
    const result = await emergencyService.performCheckIn(emergencyId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Find nearby facilities
router.post('/:emergencyId/facilities/find', authMiddleware, async (req, res) => {
  try {
    const { emergencyId } = req.params;
    const { location } = req.body;
    const result = await emergencyService.findNearbyFacilities(emergencyId, location);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update medical info
router.post('/:emergencyId/medical/update', authMiddleware, async (req, res) => {
  try {
    const { emergencyId } = req.params;
    const { medicalInfo } = req.body;
    const result = await emergencyService.updateMedicalInfo(emergencyId, medicalInfo);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add timeline event
router.post('/:emergencyId/timeline/add', authMiddleware, async (req, res) => {
  try {
    const { emergencyId } = req.params;
    const { event, details } = req.body;
    const result = await emergencyService.addTimelineEvent(emergencyId, event, details, 'user');
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get emergency details
router.get('/:emergencyId/details', authMiddleware, async (req, res) => {
  try {
    const { emergencyId } = req.params;
    const result = await emergencyService.getEmergencyDetails(emergencyId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
