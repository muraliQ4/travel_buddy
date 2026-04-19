// Payment & Wallet Service

import Payment from '../models/Payment.js';
import User from '../models/User.js';
import Trip from '../models/Trip.js';
import Notification from '../models/Notification.js';

export class PaymentService {
  /**
   * Process trip payment
   */
  async processTripPayment(tripId, userId, amount, method) {
    try {
      const payment = new Payment({
        trip: tripId,
        user: userId,
        amount: amount,
        type: 'trip_payment',
        method: method,
        status: 'pending'
      });

      await payment.save();

      // Process payment based on method
      let result;
      if (method === 'wallet') {
        result = await this.processWalletPayment(userId, amount, payment._id);
      } else if (method === 'cash') {
        result = await this.processCashPayment(payment._id);
      } else {
        result = await this.processOnlinePayment(payment, method);
      }

      if (result.success) {
        payment.status = 'completed';
        payment.paidAt = new Date();
        payment.transactionId = result.transactionId || `TXN${Date.now()}`;
        await payment.save();

        // Update trip payment tracking
        await this.updateTripPayment(tripId, userId, amount, method, payment._id);

        // Notify driver
        await this.notifyPaymentReceived(tripId, userId, amount);
      } else {
        payment.status = 'failed';
        await payment.save();
      }

      return {
        success: result.success,
        message: result.message,
        paymentId: payment._id,
        transactionId: payment.transactionId
      };
    } catch (error) {
      console.error('Payment processing error:', error);
      return { success: false, message: 'Payment processing failed' };
    }
  }

  /**
   * Process wallet payment
   */
  async processWalletPayment(userId, amount, paymentId) {
    try {
      const user = await User.findById(userId);

      if (user.wallet.balance < amount) {
        return { success: false, message: 'Insufficient wallet balance' };
      }

      // Deduct from wallet
      user.wallet.balance -= amount;
      user.wallet.transactions.push({
        type: 'debit',
        amount: amount,
        description: 'Trip payment',
        date: new Date()
      });

      await user.save();

      return {
        success: true,
        message: 'Payment processed via wallet',
        transactionId: `WAL${Date.now()}`
      };
    } catch (error) {
      console.error('Wallet payment error:', error);
      return { success: false, message: 'Wallet payment failed' };
    }
  }

  /**
   * Process cash payment
   */
  async processCashPayment(paymentId) {
    // Cash payment - mark as completed when driver confirms
    return {
      success: true,
      message: 'Cash payment recorded',
      transactionId: `CASH${Date.now()}`
    };
  }

  /**
   * Process online payment (UPI, Card, NetBanking)
   */
  async processOnlinePayment(payment, method) {
    // Integrate with payment gateway (Razorpay, Stripe, PayU, etc.)
    console.log(`[PAYMENT] Processing ${method} payment:`, payment);

    // Simulate payment gateway response
    const gatewayResponse = {
      success: true,
      transactionId: `${method.toUpperCase()}${Date.now()}`,
      gatewayOrderId: `ORD${Date.now()}`,
      timestamp: new Date()
    };

    payment.gatewayResponse = gatewayResponse;
    await payment.save();

    return {
      success: true,
      message: 'Online payment processed',
      transactionId: gatewayResponse.transactionId
    };
  }

  /**
   * Update trip payment tracking
   */
  async updateTripPayment(tripId, userId, amount, method, paymentId) {
    const trip = await Trip.findById(tripId);

    if (!trip) return;

    const existingPayment = trip.payments.find(p => 
      p.user.toString() === userId.toString()
    );

    if (existingPayment) {
      existingPayment.status = 'completed';
      existingPayment.paidAt = new Date();
      existingPayment.transactionId = paymentId;
    } else {
      trip.payments.push({
        user: userId,
        amount: amount,
        status: 'completed',
        method: method,
        transactionId: paymentId,
        paidAt: new Date()
      });
    }

    await trip.save();
  }

  /**
   * Request refund
   */
  async requestRefund(paymentId, userId, reason) {
    try {
      const payment = await Payment.findById(paymentId);

      if (!payment || payment.user.toString() !== userId.toString()) {
        return { success: false, message: 'Payment not found' };
      }

      if (payment.status !== 'completed') {
        return { success: false, message: 'Cannot refund incomplete payment' };
      }

      payment.refund.requested = true;
      payment.refund.requestedAt = new Date();
      payment.refund.reason = reason;
      payment.refund.status = 'pending';
      payment.refund.amount = payment.amount; // Full refund by default

      await payment.save();

      // Notify admin for review
      console.log('[REFUND REQUEST]', payment);

      await Notification.create({
        user: userId,
        type: 'refund_requested',
        title: 'Refund Requested',
        message: `Your refund request for ₹${payment.amount} is being reviewed`,
        priority: 'medium'
      });

      return {
        success: true,
        message: 'Refund request submitted',
        paymentId: payment._id
      };
    } catch (error) {
      console.error('Refund request error:', error);
      return { success: false, message: 'Failed to request refund' };
    }
  }

  /**
   * Process refund (admin)
   */
  async processRefund(paymentId, adminId, approved, refundAmount) {
    try {
      const payment = await Payment.findById(paymentId);

      if (!payment) {
        return { success: false, message: 'Payment not found' };
      }

      if (!approved) {
        payment.refund.status = 'rejected';
        await payment.save();

        await Notification.create({
          user: payment.user,
          type: 'refund_processed',
          title: 'Refund Rejected',
          message: 'Your refund request has been rejected',
          priority: 'high'
        });

        return { success: true, message: 'Refund rejected' };
      }

      payment.refund.status = 'approved';
      payment.refund.amount = refundAmount;
      payment.status = 'refunded';

      // Process refund to wallet or original payment method
      if (payment.method === 'wallet') {
        await this.refundToWallet(payment.user, refundAmount, paymentId);
      } else {
        await this.refundToOriginalMethod(payment, refundAmount);
      }

      payment.refund.status = 'processed';
      payment.refund.processedAt = new Date();
      payment.refund.refundTransactionId = `REF${Date.now()}`;

      await payment.save();

      await Notification.create({
        user: payment.user,
        type: 'refund_processed',
        title: 'Refund Processed',
        message: `₹${refundAmount} has been refunded to your account`,
        priority: 'high'
      });

      return {
        success: true,
        message: 'Refund processed successfully',
        refundAmount: refundAmount
      };
    } catch (error) {
      console.error('Refund processing error:', error);
      return { success: false, message: 'Failed to process refund' };
    }
  }

  /**
   * Refund to wallet
   */
  async refundToWallet(userId, amount, paymentId) {
    const user = await User.findById(userId);
    
    user.wallet.balance += amount;
    user.wallet.transactions.push({
      type: 'refund',
      amount: amount,
      description: 'Trip cancellation refund',
      date: new Date()
    });

    await user.save();
  }

  /**
   * Refund to original payment method
   */
  async refundToOriginalMethod(payment, amount) {
    // Integrate with payment gateway refund API
    console.log(`[REFUND] Processing refund of ₹${amount} for payment ${payment._id}`);
  }

  /**
   * Apply penalty for late cancellation
   */
  async applyPenalty(userId, tripId, amount, reason) {
    try {
      const payment = new Payment({
        trip: tripId,
        user: userId,
        amount: amount,
        type: 'penalty',
        method: 'wallet',
        status: 'completed'
      });

      await payment.save();

      // Deduct from wallet
      const user = await User.findById(userId);
      user.wallet.balance -= amount;
      user.wallet.transactions.push({
        type: 'penalty',
        amount: amount,
        description: reason,
        tripId: tripId,
        date: new Date()
      });

      user.travelStats.lateCancellations += 1;
      await user.save();

      await Notification.create({
        user: userId,
        type: 'penalty_applied',
        title: 'Penalty Applied',
        message: `A penalty of ₹${amount} has been charged for ${reason}`,
        priority: 'high',
        relatedTrip: tripId
      });

      return {
        success: true,
        message: 'Penalty applied',
        amount: amount
      };
    } catch (error) {
      console.error('Penalty application error:', error);
      return { success: false, message: 'Failed to apply penalty' };
    }
  }

  /**
   * Add money to wallet
   */
  async addMoneyToWallet(userId, amount, method) {
    try {
      const user = await User.findById(userId);

      // Process payment for wallet recharge
      const payment = new Payment({
        trip: null,
        user: userId,
        amount: amount,
        type: 'wallet_recharge',
        method: method,
        status: 'completed',
        paidAt: new Date(),
        transactionId: `WAL${Date.now()}`
      });

      await payment.save();

      // Credit to wallet
      user.wallet.balance += amount;
      user.wallet.transactions.push({
        type: 'credit',
        amount: amount,
        description: 'Wallet recharge',
        date: new Date()
      });

      await user.save();

      return {
        success: true,
        message: 'Money added to wallet',
        newBalance: user.wallet.balance
      };
    } catch (error) {
      console.error('Wallet recharge error:', error);
      return { success: false, message: 'Failed to add money to wallet' };
    }
  }

  /**
   * Calculate split payment
   */
  calculateSplitPayment(totalCost, members, splitMethod = 'equal') {
    const memberCount = members.length;

    if (splitMethod === 'equal') {
      const perPersonCost = (totalCost / memberCount).toFixed(2);
      return members.map(member => ({
        user: member,
        amount: parseFloat(perPersonCost)
      }));
    }

    // Add more split methods (distance-based, custom, etc.)
    return [];
  }

  /**
   * Get payment history for user
   */
  async getPaymentHistory(userId, limit = 50) {
    const payments = await Payment.find({ user: userId })
      .populate('trip', 'title from to date')
      .sort({ createdAt: -1 })
      .limit(limit);

    return {
      success: true,
      payments
    };
  }

  /**
   * Get wallet balance
   */
  async getWalletBalance(userId) {
    const user = await User.findById(userId).select('wallet');
    
    return {
      success: true,
      balance: user.wallet.balance,
      currency: user.wallet.currency
    };
  }

  /**
   * Notify payment received
   */
  async notifyPaymentReceived(tripId, userId, amount) {
    const trip = await Trip.findById(tripId);
    
    await Notification.create({
      user: trip.creator,
      type: 'payment_received',
      title: 'Payment Received',
      message: `You received ₹${amount} for your trip`,
      priority: 'medium',
      relatedTrip: tripId,
      relatedUser: userId
    });
  }
}

// Singleton instance
export const paymentService = new PaymentService();
