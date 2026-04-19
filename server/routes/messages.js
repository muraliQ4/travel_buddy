import express from 'express';
import mongoose from 'mongoose';
import { authMiddleware } from '../middleware/auth.js';
import Trip from '../models/Trip.js';
import User from '../models/User.js';

const router = express.Router();

// Message schema
const messageSchema = new mongoose.Schema({
  trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  messageType: { type: String, default: 'text' }, // text, image, file
  createdAt: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

// Get messages for a trip
router.get('/:tripId/messages', authMiddleware, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId);
    
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Check if user is a member of the trip (members is array of objects)
    const isMember = (
      trip.members && trip.members.some(member => member.user && member.user.toString() === req.userId)
    ) || trip.creator.toString() === req.userId;
    
    if (!isMember) {
      return res.status(403).json({ message: 'You are not a member of this trip' });
    }

    const messages = await Message.find({ trip: req.params.tripId })
      .populate('sender', 'name email')
      .sort({ createdAt: 1 })
      .limit(100); // Limit to last 100 messages

    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send a message to a trip
router.post('/:tripId/messages', authMiddleware, async (req, res) => {
  try {
    const { message, messageType = 'text' } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message cannot be empty' });
    }

    const trip = await Trip.findById(req.params.tripId);
    
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Check if user is a member of the trip (members is array of objects)
    const isMember = (
      trip.members && trip.members.some(member => member.user && member.user.toString() === req.userId)
    ) || trip.creator.toString() === req.userId;
    
    if (!isMember) {
      return res.status(403).json({ message: 'You are not a member of this trip' });
    }

    const newMessage = new Message({
      trip: req.params.tripId,
      sender: req.userId,
      message: message.trim(),
      messageType
    });

    await newMessage.save();

    // Populate sender info
    await newMessage.populate('sender', 'name email');

    // Emit real-time message to all trip participants via user rooms.
    // This ensures members receive notifications even if they haven't joined the trip room UI yet.
    const io = req.app.get('io');
    const roomName = `trip_${req.params.tripId}`;
    console.log(`📡 Emitting message for trip: ${roomName}`, {
      messageId: newMessage._id,
      sender: newMessage.sender.name,
      message: newMessage.message
    });
    
    // Build participant list: creator + all accepted members
    const participantIds = new Set();
    if (trip.creator) {
      participantIds.add(trip.creator.toString());
    }
    if (trip.members && Array.isArray(trip.members)) {
      trip.members.forEach((member) => {
        const memberUserId = member?.user?._id || member?.user?.id || member?.user || member?._id || member?.id || member;
        if (memberUserId) {
          participantIds.add(memberUserId.toString());
        }
      });
    }

    const payload = {
      tripId: req.params.tripId,
      message: newMessage
    };

    participantIds.forEach((userId) => {
      io.to(`user_${userId}`).emit('new-message', payload);
    });

    console.log(`📨 Message emitted to ${participantIds.size} participant user rooms for trip ${req.params.tripId}`);

    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a message (only sender or trip creator can delete)
router.delete('/:tripId/messages/:messageId', authMiddleware, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    const trip = await Trip.findById(req.params.tripId);
    
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Check if user can delete (sender or trip creator)
    const canDelete = message.sender.toString() === req.userId || trip.creator.toString() === req.userId;
    if (!canDelete) {
      return res.status(403).json({ message: 'Not authorized to delete this message' });
    }

    await Message.findByIdAndDelete(req.params.messageId);

    // Emit real-time message deletion
    const io = req.app.get('io');
    io.to(`trip_${req.params.tripId}`).emit('message-deleted', {
      messageId: req.params.messageId
    });

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;