import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { rewardsService } from '../services/rewards.js';

const router = express.Router();

// Generate referral code
router.post('/referral/generate', authMiddleware, async (req, res) => {
  try {
    const result = await rewardsService.generateReferralCode(req.user._id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Apply referral code
router.post('/referral/apply', authMiddleware, async (req, res) => {
  try {
    const { referralCode } = req.body;
    const result = await rewardsService.applyReferralCode(req.user._id, referralCode);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Redeem points
router.post('/points/redeem', authMiddleware, async (req, res) => {
  try {
    const { points, rewardType } = req.body;
    const result = await rewardsService.redeemPoints(req.user._id, points, rewardType);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Subscribe to plan
router.post('/subscribe', authMiddleware, async (req, res) => {
  try {
    const { planType, duration } = req.body;
    const result = await rewardsService.subscribeToPlan(req.user._id, planType, duration);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get rewards summary
router.get('/summary', authMiddleware, async (req, res) => {
  try {
    const result = await rewardsService.getRewardsSummary(req.user._id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Award trip points (called internally after trip completion)
router.post('/trip/award', authMiddleware, async (req, res) => {
  try {
    const { tripId, role } = req.body;
    const result = await rewardsService.awardTripPoints(req.user._id, tripId, role);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
