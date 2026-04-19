import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { paymentService } from '../services/payment.js';

const router = express.Router();

// Process trip payment
router.post('/trip/pay', authMiddleware, async (req, res) => {
  try {
    const { tripId, amount, method } = req.body;
    const result = await paymentService.processTripPayment(tripId, req.user._id, amount, method);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Request refund
router.post('/:paymentId/refund/request', authMiddleware, async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { reason } = req.body;
    const result = await paymentService.requestRefund(paymentId, req.user._id, reason);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Process refund
router.post('/:paymentId/refund/process', authMiddleware, async (req, res) => {
  try {
    // Add admin check middleware
    const { paymentId } = req.params;
    const { approved, refundAmount } = req.body;
    const result = await paymentService.processRefund(paymentId, req.user._id, approved, refundAmount);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get payment history
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const { limit } = req.query;
    const result = await paymentService.getPaymentHistory(req.user._id, parseInt(limit) || 50);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get wallet balance
router.get('/wallet/balance', authMiddleware, async (req, res) => {
  try {
    const result = await paymentService.getWalletBalance(req.user._id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add money to wallet
router.post('/wallet/add', authMiddleware, async (req, res) => {
  try {
    const { amount, method } = req.body;
    const result = await paymentService.addMoneyToWallet(req.user._id, amount, method);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Calculate split payment
router.post('/split/calculate', authMiddleware, async (req, res) => {
  try {
    const { totalCost, members, splitMethod } = req.body;
    const result = paymentService.calculateSplitPayment(totalCost, members, splitMethod);
    res.json({ success: true, splitPayments: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
