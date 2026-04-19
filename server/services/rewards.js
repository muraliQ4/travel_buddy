// Rewards & Loyalty Service

import Reward from '../models/Reward.js';
import User from '../models/User.js';
import Trip from '../models/Trip.js';
import Notification from '../models/Notification.js';
import crypto from 'crypto';

export class RewardsService {
  /**
   * Award points for trip completion
   */
  async awardTripPoints(userId, tripId, role) {
    try {
      const trip = await Trip.findById(tripId);
      const user = await User.findById(userId);

      // Calculate points based on distance
      const distanceKm = parseFloat(trip.distance) || 0;
      const basePoints = Math.floor(distanceKm / 10); // 1 point per 10km
      const roleMultiplier = role === 'driver' ? 1.5 : 1.0;
      const points = Math.floor(basePoints * roleMultiplier);

      // Create reward
      const reward = new Reward({
        user: userId,
        type: 'trip_completion',
        title: 'Trip Completed',
        description: `Earned ${points} points for completing a ${distanceKm}km trip`,
        points: points,
        relatedTrip: tripId
      });

      await reward.save();

      // Update user points
      user.rewards.points += points;
      
      // Check and update tier
      const newTier = this.calculateTier(user.rewards.points);
      if (newTier !== user.rewards.tier) {
        await this.upgradeTier(userId, newTier);
      }

      await user.save();

      return {
        success: true,
        points: points,
        totalPoints: user.rewards.points,
        tier: user.rewards.tier
      };
    } catch (error) {
      console.error('Award trip points error:', error);
      return { success: false, message: 'Failed to award points' };
    }
  }

  /**
   * Award referral bonus
   */
  async awardReferralBonus(referrerId, newUserId) {
    try {
      const referrer = await User.findById(referrerId);
      const newUser = await User.findById(newUserId);

      // Award points to referrer
      const referralPoints = 500;
      const referralBonus = 100; // Cash bonus in INR

      const reward = new Reward({
        user: referrerId,
        type: 'referral',
        title: 'Referral Bonus',
        description: `${newUser.name} joined using your referral code!`,
        points: referralPoints,
        cashReward: referralBonus,
        relatedUser: newUserId
      });

      await reward.save();

      // Update referrer
      referrer.rewards.points += referralPoints;
      referrer.rewards.referralCount += 1;
      referrer.wallet.balance += referralBonus;
      referrer.wallet.transactions.push({
        type: 'reward',
        amount: referralBonus,
        description: 'Referral bonus',
        date: new Date()
      });

      await referrer.save();

      // Award welcome bonus to new user
      const welcomeReward = new Reward({
        user: newUserId,
        type: 'referral',
        title: 'Welcome Bonus',
        description: 'Welcome! Bonus for joining via referral',
        points: 100,
        cashReward: 50
      });

      await welcomeReward.save();

      newUser.rewards.points += 100;
      newUser.wallet.balance += 50;
      newUser.wallet.transactions.push({
        type: 'reward',
        amount: 50,
        description: 'Welcome bonus',
        date: new Date()
      });

      await newUser.save();

      // Notify both users
      await this.notifyReward(referrerId, reward);
      await this.notifyReward(newUserId, welcomeReward);

      return {
        success: true,
        referrerPoints: referralPoints,
        newUserPoints: 100
      };
    } catch (error) {
      console.error('Referral bonus error:', error);
      return { success: false, message: 'Failed to award referral bonus' };
    }
  }

  /**
   * Generate unique referral code
   */
  async generateReferralCode(userId) {
    const user = await User.findById(userId);

    if (user.rewards.referralCode) {
      return {
        success: true,
        referralCode: user.rewards.referralCode
      };
    }

    // Generate unique code
    let code;
    let isUnique = false;

    while (!isUnique) {
      code = this.createReferralCode(user.name);
      const existing = await User.findOne({ 'rewards.referralCode': code });
      if (!existing) isUnique = true;
    }

    user.rewards.referralCode = code;
    await user.save();

    return {
      success: true,
      referralCode: code
    };
  }

  /**
   * Create referral code from name
   */
  createReferralCode(name) {
    const cleanName = name.replace(/[^a-zA-Z]/g, '').toUpperCase().substring(0, 6);
    const random = crypto.randomInt(1000, 9999);
    return `${cleanName}${random}`;
  }

  /**
   * Apply referral code
   */
  async applyReferralCode(userId, referralCode) {
    try {
      const referrer = await User.findOne({ 'rewards.referralCode': referralCode });

      if (!referrer) {
        return { success: false, message: 'Invalid referral code' };
      }

      if (referrer._id.toString() === userId.toString()) {
        return { success: false, message: 'Cannot use your own referral code' };
      }

      const user = await User.findById(userId);

      if (user.rewards.referredBy) {
        return { success: false, message: 'Referral code already applied' };
      }

      user.rewards.referredBy = referrer._id;
      await user.save();

      // Award bonuses
      await this.awardReferralBonus(referrer._id, userId);

      return {
        success: true,
        message: 'Referral code applied successfully',
        referrerName: referrer.name
      };
    } catch (error) {
      console.error('Apply referral code error:', error);
      return { success: false, message: 'Failed to apply referral code' };
    }
  }

  /**
   * Calculate tier based on points
   */
  calculateTier(points) {
    if (points >= 10000) return 'Platinum';
    if (points >= 5000) return 'Gold';
    if (points >= 2000) return 'Silver';
    return 'Bronze';
  }

  /**
   * Upgrade user tier
   */
  async upgradeTier(userId, newTier) {
    const user = await User.findById(userId);
    const oldTier = user.rewards.tier;
    user.rewards.tier = newTier;

    // Award tier badge
    const badge = {
      name: `${newTier} Member`,
      icon: this.getTierIcon(newTier),
      earnedAt: new Date(),
      description: `Upgraded to ${newTier} tier`
    };

    user.rewards.badges.push(badge);
    await user.save();

    // Notify user
    await Notification.create({
      user: userId,
      type: 'reward_earned',
      title: '🎉 Tier Upgraded!',
      message: `Congratulations! You've been upgraded from ${oldTier} to ${newTier} tier!`,
      priority: 'high'
    });

    return {
      success: true,
      oldTier: oldTier,
      newTier: newTier
    };
  }

  /**
   * Get tier icon
   */
  getTierIcon(tier) {
    const icons = {
      'Bronze': '🥉',
      'Silver': '🥈',
      'Gold': '🥇',
      'Platinum': '💎'
    };
    return icons[tier] || '🏅';
  }

  /**
   * Award badge
   */
  async awardBadge(userId, badgeName, description) {
    const user = await User.findById(userId);

    // Check if badge already exists
    const existingBadge = user.rewards.badges.find(b => b.name === badgeName);
    if (existingBadge) {
      return { success: false, message: 'Badge already earned' };
    }

    const badge = {
      name: badgeName,
      icon: this.getBadgeIcon(badgeName),
      earnedAt: new Date(),
      description: description
    };

    user.rewards.badges.push(badge);
    await user.save();

    // Create reward entry
    const reward = new Reward({
      user: userId,
      type: 'milestone',
      title: `Badge Earned: ${badgeName}`,
      description: description,
      points: 100,
      badge: badge
    });

    await reward.save();

    // Notify user
    await this.notifyReward(userId, reward);

    return {
      success: true,
      badge: badge
    };
  }

  /**
   * Get badge icon
   */
  getBadgeIcon(badgeName) {
    const icons = {
      'Early Bird': '🌅',
      'Night Owl': '🦉',
      'Eco Warrior': '🌱',
      'Social Butterfly': '🦋',
      'Road Master': '🛣️',
      'Safety Champion': '🛡️',
      'Verified Pro': '✅',
      'Review Master': '⭐'
    };
    return icons[badgeName] || '🏆';
  }

  /**
   * Redeem points
   */
  async redeemPoints(userId, points, rewardType) {
    try {
      const user = await User.findById(userId);

      if (user.rewards.points < points) {
        return { success: false, message: 'Insufficient points' };
      }

      let cashValue = 0;
      
      // Conversion rate: 100 points = ₹10
      cashValue = Math.floor(points / 10);

      // Deduct points
      user.rewards.points -= points;
      
      // Credit to wallet
      user.wallet.balance += cashValue;
      user.wallet.transactions.push({
        type: 'reward',
        amount: cashValue,
        description: `Redeemed ${points} points`,
        date: new Date()
      });

      await user.save();

      // Create reward entry
      const reward = new Reward({
        user: userId,
        type: 'redemption',
        title: 'Points Redeemed',
        description: `Redeemed ${points} points for ₹${cashValue}`,
        points: -points,
        cashReward: cashValue,
        redeemed: true,
        redeemedAt: new Date()
      });

      await reward.save();

      await Notification.create({
        user: userId,
        type: 'reward_earned',
        title: 'Points Redeemed',
        message: `Successfully redeemed ${points} points for ₹${cashValue}`,
        priority: 'medium'
      });

      return {
        success: true,
        pointsRedeemed: points,
        cashValue: cashValue,
        remainingPoints: user.rewards.points
      };
    } catch (error) {
      console.error('Redeem points error:', error);
      return { success: false, message: 'Failed to redeem points' };
    }
  }

  /**
   * Award eco warrior badge
   */
  async checkEcoWarrior(userId) {
    const user = await User.findById(userId);

    if (user.travelStats.totalCO2Saved >= 100) { // 100kg CO2 saved
      await this.awardBadge(userId, 'Eco Warrior', 'Saved 100kg of CO2 by carpooling!');
    }
  }

  /**
   * Award streak bonus
   */
  async awardStreakBonus(userId, streakDays) {
    const bonusPoints = streakDays * 10;

    const reward = new Reward({
      user: userId,
      type: 'streak',
      title: `${streakDays}-Day Streak!`,
      description: `Maintained a ${streakDays}-day travel streak`,
      points: bonusPoints
    });

    await reward.save();

    const user = await User.findById(userId);
    user.rewards.points += bonusPoints;
    await user.save();

    await this.notifyReward(userId, reward);
  }

  /**
   * Subscribe to premium plan
   */
  async subscribeToPlan(userId, planType, duration) {
    const user = await User.findById(userId);

    const plans = {
      'premium': { price: 299, duration: 30, benefits: ['Zero commission', 'Priority support', 'Exclusive badges'] },
      'enterprise': { price: 999, duration: 90, benefits: ['All Premium benefits', 'Business travel perks', 'Dedicated account manager'] }
    };

    const plan = plans[planType];
    if (!plan) {
      return { success: false, message: 'Invalid plan' };
    }

    // Process payment
    if (user.wallet.balance < plan.price) {
      return { success: false, message: 'Insufficient balance' };
    }

    user.wallet.balance -= plan.price;
    user.wallet.transactions.push({
      type: 'debit',
      amount: plan.price,
      description: `${planType} subscription`,
      date: new Date()
    });

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + plan.duration);

    user.subscription = {
      plan: planType,
      startDate: startDate,
      endDate: endDate,
      autoRenew: false,
      benefits: plan.benefits
    };

    await user.save();

    await Notification.create({
      user: userId,
      type: 'subscription_activated',
      title: 'Subscription Activated',
      message: `Your ${planType} plan is now active!`,
      priority: 'high'
    });

    return {
      success: true,
      plan: planType,
      endDate: endDate,
      benefits: plan.benefits
    };
  }

  /**
   * Get user rewards summary
   */
  async getRewardsSummary(userId) {
    const user = await User.findById(userId).select('rewards subscription');
    const rewards = await Reward.find({ user: userId, redeemed: false })
      .sort({ createdAt: -1 })
      .limit(20);

    return {
      success: true,
      points: user.rewards.points,
      tier: user.rewards.tier,
      badges: user.rewards.badges,
      referralCode: user.rewards.referralCode,
      referralCount: user.rewards.referralCount,
      subscription: user.subscription,
      recentRewards: rewards
    };
  }

  /**
   * Notify user of reward
   */
  async notifyReward(userId, reward) {
    await Notification.create({
      user: userId,
      type: 'reward_earned',
      title: reward.title,
      message: reward.description,
      data: { points: reward.points, cashReward: reward.cashReward },
      priority: 'medium'
    });
  }
}

// Singleton instance
export const rewardsService = new RewardsService();
