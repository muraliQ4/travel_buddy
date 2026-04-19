import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { analyticsService } from '../services/analytics.js';

const router = express.Router();

// Get analytics dashboard
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const { period } = req.query;
    const result = await analyticsService.getDashboard(req.user._id, period || 'monthly');
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Generate analytics
router.post('/generate', authMiddleware, async (req, res) => {
  try {
    const { period } = req.body;
    const result = await analyticsService.generateUserAnalytics(req.user._id, period || 'monthly');
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get carbon footprint report
router.get('/carbon-footprint', authMiddleware, async (req, res) => {
  try {
    const result = await analyticsService.getCarbonFootprintReport(req.user._id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
