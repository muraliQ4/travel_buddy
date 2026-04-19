// Verification Service

import Verification from '../models/Verification.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import crypto from 'crypto';

export class VerificationService {
  /**
   * Send email verification code
   */
  async sendEmailVerification(userId, email) {
    try {
      const code = this.generateVerificationCode();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      const verification = new Verification({
        user: userId,
        type: 'email',
        status: 'pending',
        verificationCode: {
          code: code,
          sentAt: new Date(),
          expiresAt: expiresAt,
          attempts: 0
        }
      });

      await verification.save();

      // Send email (integrate with email service)
      await this.sendEmail(email, 'Email Verification', `Your verification code is: ${code}`);

      return {
        success: true,
        message: 'Verification code sent to email',
        verificationId: verification._id
      };
    } catch (error) {
      console.error('Email verification error:', error);
      return { success: false, message: 'Failed to send verification code' };
    }
  }

  /**
   * Send phone verification code
   */
  async sendPhoneVerification(userId, phone) {
    try {
      const code = this.generateVerificationCode();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      const verification = new Verification({
        user: userId,
        type: 'phone',
        status: 'pending',
        verificationCode: {
          code: code,
          sentAt: new Date(),
          expiresAt: expiresAt,
          attempts: 0
        }
      });

      await verification.save();

      // Send SMS (integrate with SMS service)
      await this.sendSMS(phone, `Your verification code is: ${code}. Valid for 10 minutes.`);

      return {
        success: true,
        message: 'Verification code sent to phone',
        verificationId: verification._id
      };
    } catch (error) {
      console.error('Phone verification error:', error);
      return { success: false, message: 'Failed to send verification code' };
    }
  }

  /**
   * Verify email/phone code
   */
  async verifyCode(verificationId, code, userId) {
    try {
      const verification = await Verification.findById(verificationId);

      if (!verification || verification.user.toString() !== userId.toString()) {
        return { success: false, message: 'Verification not found' };
      }

      if (verification.status !== 'pending') {
        return { success: false, message: 'Verification already processed' };
      }

      if (new Date() > verification.verificationCode.expiresAt) {
        verification.status = 'expired';
        await verification.save();
        return { success: false, message: 'Verification code expired' };
      }

      verification.verificationCode.attempts += 1;

      if (verification.verificationCode.attempts > 3) {
        verification.status = 'rejected';
        await verification.save();
        return { success: false, message: 'Too many attempts. Please request a new code.' };
      }

      if (verification.verificationCode.code !== code) {
        await verification.save();
        return { success: false, message: 'Invalid verification code' };
      }

      // Code is valid
      verification.status = 'approved';
      verification.reviewedAt = new Date();
      await verification.save();

      // Update user verification status
      const user = await User.findById(userId);
      if (verification.type === 'email') {
        user.verification.email = true;
      } else if (verification.type === 'phone') {
        user.verification.phone = true;
      }
      user.verification.verificationLevel = this.calculateVerificationLevel(user.verification);
      await user.save();

      // Award verification reward
      await this.awardVerificationReward(userId, verification.type);

      return {
        success: true,
        message: `${verification.type} verified successfully`,
        verificationLevel: user.verification.verificationLevel
      };
    } catch (error) {
      console.error('Code verification error:', error);
      return { success: false, message: 'Verification failed' };
    }
  }

  /**
   * Submit identity document for verification
   */
  async submitIdentityVerification(userId, documentType, documentNumber, images) {
    try {
      const verification = new Verification({
        user: userId,
        type: 'identity',
        status: 'in_review',
        documentType: documentType,
        documentNumber: documentNumber,
        documentImages: images,
        submittedAt: new Date()
      });

      await verification.save();

      // Notify admin for review
      await this.notifyAdminForReview(verification);

      return {
        success: true,
        message: 'Identity verification submitted for review',
        verificationId: verification._id
      };
    } catch (error) {
      console.error('Identity verification error:', error);
      return { success: false, message: 'Failed to submit verification' };
    }
  }

  /**
   * Submit selfie verification
   */
  async submitSelfieVerification(userId, selfieImage) {
    try {
      const verification = new Verification({
        user: userId,
        type: 'selfie',
        status: 'in_review',
        selfieImage: selfieImage,
        submittedAt: new Date()
      });

      await verification.save();

      // In production, use AI/ML for face matching
      // For now, require manual review
      await this.notifyAdminForReview(verification);

      return {
        success: true,
        message: 'Selfie verification submitted for review',
        verificationId: verification._id
      };
    } catch (error) {
      console.error('Selfie verification error:', error);
      return { success: false, message: 'Failed to submit verification' };
    }
  }

  /**
   * Submit background check request
   */
  async submitBackgroundCheck(userId) {
    try {
      const verification = new Verification({
        user: userId,
        type: 'background_check',
        status: 'pending',
        submittedAt: new Date()
      });

      await verification.save();

      // Integrate with background check service (e.g., Checkr, Onfido)
      // For now, mark as pending admin review
      await this.notifyAdminForReview(verification);

      return {
        success: true,
        message: 'Background check initiated',
        verificationId: verification._id
      };
    } catch (error) {
      console.error('Background check error:', error);
      return { success: false, message: 'Failed to initiate background check' };
    }
  }

  /**
   * Admin approve/reject verification
   */
  async reviewVerification(verificationId, adminId, status, notes = '') {
    try {
      const verification = await Verification.findById(verificationId);

      if (!verification) {
        return { success: false, message: 'Verification not found' };
      }

      verification.status = status; // 'approved' or 'rejected'
      verification.reviewedAt = new Date();
      verification.reviewedBy = adminId;
      verification.notes = notes;

      if (status === 'rejected') {
        verification.rejectionReason = notes;
      }

      await verification.save();

      // Update user verification status
      const user = await User.findById(verification.user);
      
      if (status === 'approved') {
        if (verification.type === 'identity') {
          user.verification.identity.verified = true;
          user.verification.identity.documentType = verification.documentType;
          user.verification.identity.documentNumber = verification.documentNumber;
          user.verification.identity.verifiedAt = new Date();
        } else if (verification.type === 'selfie') {
          user.verification.selfie = true;
        } else if (verification.type === 'background_check') {
          user.verification.backgroundCheck.verified = true;
          user.verification.backgroundCheck.status = 'approved';
          user.verification.backgroundCheck.verifiedAt = new Date();
        }

        // Check if user qualifies for trusted traveler
        if (this.isTrustedTraveler(user.verification)) {
          user.verification.trustedTraveler = true;
        }

        user.verification.verificationLevel = this.calculateVerificationLevel(user.verification);
        
        // Award verification reward
        await this.awardVerificationReward(verification.user, verification.type);
      }

      await user.save();

      // Notify user
      await Notification.create({
        user: verification.user,
        type: 'verification_complete',
        title: status === 'approved' ? 'Verification Approved' : 'Verification Rejected',
        message: status === 'approved' 
          ? `Your ${verification.type} verification has been approved!`
          : `Your ${verification.type} verification was rejected. ${notes}`,
        priority: 'high'
      });

      return {
        success: true,
        message: `Verification ${status}`,
        verificationLevel: user.verification.verificationLevel
      };
    } catch (error) {
      console.error('Review verification error:', error);
      return { success: false, message: 'Failed to review verification' };
    }
  }

  /**
   * Calculate verification level (0-5)
   */
  calculateVerificationLevel(verification) {
    let level = 0;
    
    if (verification.email) level += 1;
    if (verification.phone) level += 1;
    if (verification.identity.verified) level += 1;
    if (verification.selfie) level += 1;
    if (verification.backgroundCheck.verified) level += 1;

    return level;
  }

  /**
   * Check if user qualifies as trusted traveler
   */
  isTrustedTraveler(verification) {
    return verification.email &&
           verification.phone &&
           verification.identity.verified &&
           verification.selfie &&
           verification.backgroundCheck.verified;
  }

  /**
   * Generate 6-digit verification code
   */
  generateVerificationCode() {
    return crypto.randomInt(100000, 999999).toString();
  }

  /**
   * Send email (placeholder)
   */
  async sendEmail(to, subject, body) {
    console.log(`[EMAIL to ${to}] ${subject}: ${body}`);
    // Integrate with email service (SendGrid, AWS SES, etc.)
  }

  /**
   * Send SMS (placeholder)
   */
  async sendSMS(phone, message) {
    console.log(`[SMS to ${phone}] ${message}`);
    // Integrate with SMS service (Twilio, AWS SNS, etc.)
  }

  /**
   * Notify admin for manual review
   */
  async notifyAdminForReview(verification) {
    console.log('[ADMIN] New verification request:', verification);
    // Send to admin dashboard/panel
  }

  /**
   * Award verification reward
   */
  async awardVerificationReward(userId, verificationType) {
    const Reward = (await import('../models/Reward.js')).default;
    
    const rewardPoints = {
      'email': 10,
      'phone': 10,
      'identity': 50,
      'selfie': 20,
      'background_check': 100
    };

    await Reward.create({
      user: userId,
      type: 'verification',
      title: `${verificationType} Verification Complete`,
      description: `Earned for completing ${verificationType} verification`,
      points: rewardPoints[verificationType] || 10
    });

    // Update user rewards points
    const user = await User.findById(userId);
    user.rewards.points += rewardPoints[verificationType] || 10;
    await user.save();
  }

  /**
   * Get user verifications
   */
  async getUserVerifications(userId) {
    const verifications = await Verification.find({ user: userId })
      .sort({ createdAt: -1 });

    return {
      success: true,
      verifications
    };
  }

  /**
   * Get pending verifications (admin)
   */
  async getPendingVerifications() {
    const verifications = await Verification.find({ status: 'in_review' })
      .populate('user', 'name email phone profilePhoto')
      .sort({ submittedAt: 1 });

    return {
      success: true,
      verifications
    };
  }
}

// Singleton instance
export const verificationService = new VerificationService();
