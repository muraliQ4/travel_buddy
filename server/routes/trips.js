import express from 'express';
import Trip from '../models/Trip.js';
import Request from '../models/Request.js';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get all public trips (public route; auth optional for isLiked)
router.get('/', async (req, res) => {
  try {
    const { search, location } = req.query;
    const token = req.header('Authorization')?.replace('Bearer ', '');
    let userId = null;

    if (token) {
      try {
        const jwt = (await import('jsonwebtoken')).default;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.userId;
      } catch {
        userId = null;
      }
    }
    
    let query = { isPublic: true };
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { from: { $regex: search, $options: 'i' } },
        { to: { $regex: search, $options: 'i' } },
        { creatorName: { $regex: search, $options: 'i' } }
      ];
    }

    const trips = await Trip.find(query)
      .populate('creator', 'name email location profilePhoto bio')
      .populate('members', 'name email phone dateOfBirth gender nationality country city location profilePhoto bio username travelerType interests languages travelStyle preferredDestinations budgetRange preferredSeason instagramHandle createdAt')
      .sort({ createdAt: -1 })
      .limit(50);

    // Add likes count
    const tripsWithLikes = trips.map(trip => ({
      ...trip.toObject(),
      likesCount: trip.likes.length,
      isLiked: userId ? trip.likes.includes(userId) : false
    }));

    res.json(tripsWithLikes);
  } catch (error) {
    console.error('Get trips error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get my trips (created by me)
router.get('/my-trips', authMiddleware, async (req, res) => {
  try {
    const trips = await Trip.find({ creator: req.userId })
      .populate('members', 'name email phone dateOfBirth gender nationality country city location profilePhoto bio username travelerType interests languages travelStyle preferredDestinations budgetRange preferredSeason instagramHandle createdAt')
      .sort({ createdAt: -1 });

    const tripsWithLikes = trips.map(trip => ({
      ...trip.toObject(),
      likesCount: trip.likes.length
    }));

    res.json(tripsWithLikes);
  } catch (error) {
    console.error('Get my trips error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get trips by user ID
router.get('/user/:userId', authMiddleware, async (req, res) => {
  try {
    const trips = await Trip.find({ 
      creator: req.params.userId,
      isPublic: true 
    })
    .populate('creator', 'name email location profilePhoto bio')
    .populate('members', 'name email phone dateOfBirth gender nationality country city location profilePhoto bio username travelerType interests languages travelStyle preferredDestinations budgetRange preferredSeason instagramHandle createdAt')
    .sort({ createdAt: -1 });

    const tripsWithLikes = trips.map(trip => ({
      ...trip.toObject(),
      likesCount: trip.likes.length,
      isLiked: trip.likes.includes(req.userId)
    }));

    res.json(tripsWithLikes);
  } catch (error) {
    console.error('Get user trips error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create trip
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, from, to, fromData, toData, date, maxMembers, transport, description, distance, isPublic } = req.body;

    const user = await User.findById(req.userId);

    const trip = new Trip({
      title,
      from,
      to,
      fromData,
      toData,
      date,
      maxMembers,
      transport,
      description,
      distance,
      creator: req.userId,
      creatorName: user.name,
      members: [{
        user: req.userId,
        joinedAt: new Date(),
        status: 'confirmed',
        seatCount: 1,
        pickupPoint: '',
        dropPoint: ''
      }],
      isPublic,
      likes: []
    });

    await trip.save();

    res.status(201).json(trip);
  } catch (error) {
    console.error('Create trip error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Like/Unlike trip
router.post('/:tripId/like', authMiddleware, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId);

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    const likeIndex = trip.likes.indexOf(req.userId);

    if (likeIndex > -1) {
      // Unlike
      trip.likes.splice(likeIndex, 1);
    } else {
      // Like
      trip.likes.push(req.userId);
    }

    await trip.save();

    res.json({ 
      likesCount: trip.likes.length,
      isLiked: trip.likes.includes(req.userId)
    });
  } catch (error) {
    console.error('Like trip error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove member from trip
router.post('/:tripId/remove-member', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.body;
    const trip = await Trip.findById(req.params.tripId);

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Only trip creator can remove members
    if (trip.creator.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to remove members from this trip' });
    }

    // Cannot remove the creator
    if (userId === req.userId) {
      return res.status(400).json({ message: 'Cannot remove yourself as creator' });
    }

    // Check if user is actually a member (members is array of objects)
    const isMember = trip.members && trip.members.some(
      member => member.user && member.user.toString() === userId
    );
    
    if (!isMember) {
      return res.status(400).json({ message: 'User is not a member of this trip' });
    }

    // Remove user from members array
    trip.members = trip.members.filter(
      member => member.user && member.user.toString() !== userId
    );
    await trip.save();

    // Also remove any accepted requests from this user
    await Request.deleteMany({ 
      trip: req.params.tripId, 
      user: userId,
      status: 'accepted'
    });

    // Emit real-time events
    const io = req.app.get('io');
    
    // Notify the removed user
    io.to(`user_${userId}`).emit('member-removed', {
      tripId: req.params.tripId,
      tripTitle: trip.title
    });
    
    // Notify all users viewing this trip
    io.to(`trip_${req.params.tripId}`).emit('trip-updated', {
      tripId: req.params.tripId,
      removedMember: userId,
      type: 'member-removed'
    });

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete trip
router.delete('/:tripId', authMiddleware, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId);

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    if (trip.creator.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this trip' });
    }

    await Trip.findByIdAndDelete(req.params.tripId);
    await Request.deleteMany({ trip: req.params.tripId });

    res.json({ message: 'Trip deleted successfully' });
  } catch (error) {
    console.error('Delete trip error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
