import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { verificationService } from '../services/verification.js';

const router = express.Router();

// Send email verification code
router.post('/email/send', authMiddleware, async (req, res) => {
  try {
    const { email } = req.body;
    const result = await verificationService.sendEmailVerification(req.user._id, email);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Send phone verification code
router.post('/phone/send', authMiddleware, async (req, res) => {
  try {
    const { phone } = req.body;
    const result = await verificationService.sendPhoneVerification(req.user._id, phone);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Verify code (email/phone)
router.post('/code/verify', authMiddleware, async (req, res) => {
  try {
    const { verificationId, code } = req.body;
    const result = await verificationService.verifyCode(verificationId, code, req.user._id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Submit identity verification
router.post('/identity/submit', authMiddleware, async (req, res) => {
  try {
    const { documentType, documentNumber, images } = req.body;
    const result = await verificationService.submitIdentityVerification(
      req.user._id,
      documentType,
      documentNumber,
      images
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Submit selfie verification
router.post('/selfie/submit', authMiddleware, async (req, res) => {
  try {
    const { selfieImage } = req.body;
    const result = await verificationService.submitSelfieVerification(req.user._id, selfieImage);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Submit background check request
router.post('/background-check/submit', authMiddleware, async (req, res) => {
  try {
    const result = await verificationService.submitBackgroundCheck(req.user._id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user verifications
router.get('/my-verifications', authMiddleware, async (req, res) => {
  try {
    const result = await verificationService.getUserVerifications(req.user._id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Get pending verifications
router.get('/pending', authMiddleware, async (req, res) => {
  try {
    // Add admin check middleware here
    const result = await verificationService.getPendingVerifications();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Review verification
router.post('/:verificationId/review', authMiddleware, async (req, res) => {
  try {
    // Add admin check middleware here
    const { verificationId } = req.params;
    const { status, notes } = req.body;
    const result = await verificationService.reviewVerification(
      verificationId,
      req.user._id,
      status,
      notes
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
