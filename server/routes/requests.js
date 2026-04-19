import express from 'express';
import Request from '../models/Request.js';
import Trip from '../models/Trip.js';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Send join request
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { tripId } = req.body;

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Check if already a member (members is array of objects with user field)
    const isAlreadyMember = trip.members && trip.members.some(
      member => member.user && member.user.toString() === req.userId
    );
    
    if (isAlreadyMember) {
      return res.status(400).json({ message: 'You are already a member of this trip' });
    }

    // Check if already requested
    const existingRequest = await Request.findOne({
      trip: tripId,
      user: req.userId,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'You have already requested to join this trip' });
    }

    const user = await User.findById(req.userId);

    const request = new Request({
      trip: tripId,
      tripTitle: trip.title,
      user: req.userId,
      userName: user.name,
      creator: trip.creator,
      creatorName: trip.creatorName,
      status: 'pending'
    });

    await request.save();

    // Emit real-time event to trip creator
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${trip.creator}`).emit('new-request', {
        request,
        type: 'received'
      });
    }

    res.status(201).json(request);
  } catch (error) {
    console.error('Send request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get received requests (for trips I created)
router.get('/received', authMiddleware, async (req, res) => {
  try {
    const requests = await Request.find({ creator: req.userId })
      .populate('user', 'name email location')
      .populate('trip', 'title from to date')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error('Get received requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get sent requests (requests I made)
router.get('/sent', authMiddleware, async (req, res) => {
  try {
    const requests = await Request.find({ user: req.userId })
      .populate('trip', 'title from to date')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error('Get sent requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Accept request
router.put('/:requestId/accept', authMiddleware, async (req, res) => {
  try {
    console.log('Accept request - RequestId:', req.params.requestId, 'UserId:', req.userId);
    
    // Validate requestId format
    if (!req.params.requestId || req.params.requestId.length !== 24) {
      console.error('Invalid requestId format:', req.params.requestId);
      return res.status(400).json({ message: 'Invalid request ID format' });
    }

    const request = await Request.findById(req.params.requestId);
    console.log('Found request:', request ? 'Yes' : 'No');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    console.log('Request creator:', request.creator, 'Current user:', req.userId);
    
    if (request.creator.toString() !== req.userId) {
      console.error('Not authorized - Creator:', request.creator, 'User:', req.userId);
      return res.status(403).json({ message: 'Not authorized to accept this request' });
    }

    console.log('Looking for trip:', request.trip);
    const trip = await Trip.findById(request.trip);
    console.log('Found trip:', trip ? 'Yes' : 'No');

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Check if trip is full
    const currentMemberCount = trip.members ? trip.members.length : 0;
    if (currentMemberCount >= trip.maxMembers) {
      console.error('Trip is full - Current:', currentMemberCount, 'Max:', trip.maxMembers);
      return res.status(400).json({ message: 'Trip is already full' });
    }

    // Check if user is already a member
    const isAlreadyMember = trip.members && trip.members.some(member => {
      if (!member || !member.user) return false;
      const memberId = member.user?._id || member.user;
      const requestUserId = request.user?._id || request.user;
      if (!memberId || !requestUserId) return false;
      return memberId.toString() === requestUserId.toString();
    });
    
    if (isAlreadyMember) {
      console.error('User is already a member');
      return res.status(400).json({ message: 'User is already a member of this trip' });
    }

    // Add user to trip members with proper structure
    if (!trip.members) {
      trip.members = [];
    }
    trip.members.push({
      user: request.user,
      joinedAt: new Date(),
      status: 'confirmed',
      seatCount: 1,
      pickupPoint: '',
      dropPoint: ''
    });
    console.log('Saving trip with new member...');
    await trip.save();

    // Update request status
    request.status = 'accepted';
    console.log('Saving request with accepted status...');
    await request.save();

    // Emit real-time events
    const io = req.app.get('io');
    if (io) {
      // Notify the user who sent the request
      io.to(`user_${request.user}`).emit('request-accepted', {
        request,
        trip: trip
      });
      
      // Notify all users viewing this trip
      io.to(`trip_${trip._id}`).emit('trip-updated', {
        tripId: trip._id,
        newMember: request.user,
        type: 'member-added'
      });
      console.log('Real-time events emitted');
    }

    console.log('Request accepted successfully');
    res.json(request);
  } catch (error) {
    console.error('Accept request error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Server error', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
});

// Reject request
router.put('/:requestId/reject', authMiddleware, async (req, res) => {
  try {
    console.log('Reject request - RequestId:', req.params.requestId, 'UserId:', req.userId);
    
    // Validate requestId format
    if (!req.params.requestId || req.params.requestId.length !== 24) {
      console.error('Invalid requestId format:', req.params.requestId);
      return res.status(400).json({ message: 'Invalid request ID format' });
    }

    const request = await Request.findById(req.params.requestId);
    console.log('Found request:', request ? 'Yes' : 'No');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    console.log('Request creator:', request.creator, 'Current user:', req.userId);
    
    if (request.creator.toString() !== req.userId) {
      console.error('Not authorized - Creator:', request.creator, 'User:', req.userId);
      return res.status(403).json({ message: 'Not authorized to reject this request' });
    }

    request.status = 'rejected';
    console.log('Saving request with rejected status...');
    await request.save();

    // Emit real-time event to the user who sent the request
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${request.user}`).emit('request-rejected', {
        request
      });
      console.log('Real-time event emitted');
    }

    console.log('Request rejected successfully');
    res.json(request);
  } catch (error) {
    console.error('Reject request error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
