import express from 'express';
import { body, validationResult } from 'express-validator';
import otpService from '../services/otpService.js';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/otp/send
 * Send OTP to phone number
 */
router.post('/send',
  [
    body('phone')
      .trim()
      .notEmpty()
      .withMessage('Phone number is required')
      .custom((value) => {
        if (!otpService.isValidPhoneNumber(value)) {
          throw new Error('Invalid phone number format');
        }
        return true;
      })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { phone } = req.body;
      const formattedPhone = otpService.formatPhoneNumber(phone);

      // Check if phone is already registered and verified
      const existingUser = await User.findOne({ 
        phone: formattedPhone, 
        phoneVerified: true 
      });
      
      if (existingUser) {
        return res.status(400).json({ 
          message: 'This phone number is already registered and verified' 
        });
      }

      // Send OTP
      const result = await otpService.sendOTP(formattedPhone);
      
      res.json({
        success: true,
        message: result.message,
        expiresIn: result.expiresIn,
        phone: formattedPhone
      });
    } catch (error) {
      console.error('Send OTP error:', error);
      res.status(500).json({ 
        message: error.message || 'Failed to send OTP' 
      });
    }
  }
);

/**
 * POST /api/otp/verify
 * Verify OTP for phone number
 */
router.post('/verify',
  [
    body('phone').trim().notEmpty().withMessage('Phone number is required'),
    body('otp')
      .trim()
      .notEmpty()
      .withMessage('OTP is required')
      .isLength({ min: 6, max: 6 })
      .withMessage('OTP must be 6 digits')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { phone, otp } = req.body;
      const formattedPhone = otpService.formatPhoneNumber(phone);

      // Verify OTP
      const result = otpService.verifyOTP(formattedPhone, otp);
      
      if (!result.success) {
        return res.status(400).json({ 
          success: false,
          message: result.message 
        });
      }

      res.json({
        success: true,
        message: result.message,
        phone: formattedPhone
      });
    } catch (error) {
      console.error('Verify OTP error:', error);
      res.status(500).json({ 
        message: 'Failed to verify OTP' 
      });
    }
  }
);

/**
 * POST /api/otp/resend
 * Resend OTP to phone number
 */
router.post('/resend',
  [
    body('phone').trim().notEmpty().withMessage('Phone number is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { phone } = req.body;
      const formattedPhone = otpService.formatPhoneNumber(phone);

      // Resend OTP
      const result = await otpService.resendOTP(formattedPhone);
      
      if (!result.success) {
        return res.status(400).json({ 
          success: false,
          message: result.message 
        });
      }

      res.json({
        success: true,
        message: result.message,
        expiresIn: result.expiresIn,
        phone: formattedPhone
      });
    } catch (error) {
      console.error('Resend OTP error:', error);
      res.status(500).json({ 
        message: error.message || 'Failed to resend OTP' 
      });
    }
  }
);

/**
 * POST /api/otp/verify-existing
 * Verify phone for existing logged-in user
 */
router.post('/verify-existing',
  authMiddleware,
  [
    body('phone').trim().notEmpty().withMessage('Phone number is required'),
    body('otp')
      .trim()
      .notEmpty()
      .withMessage('OTP is required')
      .isLength({ min: 6, max: 6 })
      .withMessage('OTP must be 6 digits')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { phone, otp } = req.body;
      const formattedPhone = otpService.formatPhoneNumber(phone);

      // Verify OTP
      const result = otpService.verifyOTP(formattedPhone, otp);
      
      if (!result.success) {
        return res.status(400).json({ 
          success: false,
          message: result.message 
        });
      }

      // Update user's phone and verification status
      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      user.phone = formattedPhone;
      user.phoneVerified = true;
      user.phoneVerifiedAt = new Date();
      await user.save();

      res.json({
        success: true,
        message: 'Phone number verified and updated successfully',
        user: {
          id: user._id,
          phone: user.phone,
          phoneVerified: user.phoneVerified
        }
      });
    } catch (error) {
      console.error('Verify existing user phone error:', error);
      res.status(500).json({ 
        message: 'Failed to verify phone number' 
      });
    }
  }
);

export default router;
