import express from 'express';
import mongoose from 'mongoose';
import { authMiddleware } from '../middleware/auth.js';
import RideShare from '../models/RideShare.js';
import RideBooking from '../models/RideBooking.js';
import User from '../models/User.js';

const router = express.Router();

// Message schema for ride share
const rideShareMessageSchema = new mongoose.Schema({
  ride: { type: mongoose.Schema.Types.ObjectId, ref: 'RideShare', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  messageType: { type: String, default: 'text' }, // text, image, file
  createdAt: { type: Date, default: Date.now }
});

const RideShareMessage = mongoose.model('RideShareMessage', rideShareMessageSchema);

// Get all ride shares
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { search, from, to } = req.query;
    
    let query = { status: 'active' };
    
    if (search) {
      query.$or = [
        { from: { $regex: search, $options: 'i' } },
        { to: { $regex: search, $options: 'i' } },
        { driverName: { $regex: search, $options: 'i' } }
      ];
    }

    if (from) {
      query.from = { $regex: from, $options: 'i' };
    }

    if (to) {
      query.to = { $regex: to, $options: 'i' };
    }

    const rides = await RideShare.find(query)
      .populate('driver', 'name email profilePhoto phone')
      .populate('members', 'name email profilePhoto phone')
      .sort({ date: 1 })
      .limit(50);

    res.json(rides);
  } catch (error) {
    console.error('Get ride shares error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get my ride offers (posted by me)
router.get('/my-offers', authMiddleware, async (req, res) => {
  try {
    const rides = await RideShare.find({ driver: req.userId })
      .populate('members', 'name email profilePhoto phone')
      .sort({ date: 1 });

    res.json(rides);
  } catch (error) {
    console.error('Get my ride offers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get my bookings (rides I joined)
router.get('/my-bookings', authMiddleware, async (req, res) => {
  try {
    const rides = await RideShare.find({ 
      members: req.userId,
      driver: { $ne: req.userId }
    })
      .populate('driver', 'name email profilePhoto phone')
      .populate('members', 'name email profilePhoto phone')
      .sort({ date: 1 });

    res.json(rides);
  } catch (error) {
    console.error('Get my bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create ride share
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { from, to, date, time, seats, price, vehicle, preferences, description } = req.body;

    const user = await User.findById(req.userId);

    const ride = new RideShare({
      from,
      to,
      date,
      time,
      seats,
      price,
      vehicle,
      driver: req.userId,
      driverName: user.name,
      members: [req.userId],
      preferences: preferences || '',
      description: description || '',
      likes: []
    });

    await ride.save();

    const populatedRide = await RideShare.findById(ride._id)
      .populate('driver', 'name email profilePhoto phone')
      .populate('members', 'name email profilePhoto phone');

    res.status(201).json(populatedRide);
  } catch (error) {
    console.error('Create ride share error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send booking request
router.post('/:rideId/request', authMiddleware, async (req, res) => {
  try {
    const { seats = 1 } = req.body;
    
    const ride = await RideShare.findById(req.params.rideId);
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    // Check if already a member
    if (ride.members.includes(req.userId)) {
      return res.status(400).json({ message: 'You are already a member of this ride' });
    }

    // Check if already requested
    const existingBooking = await RideBooking.findOne({
      ride: req.params.rideId,
      user: req.userId,
      status: 'pending'
    });

    if (existingBooking) {
      return res.status(400).json({ message: 'You have already requested to join this ride' });
    }

    const user = await User.findById(req.userId);

    const booking = new RideBooking({
      ride: req.params.rideId,
      rideName: `${ride.from} → ${ride.to}`,
      user: req.userId,
      userName: user.name,
      driver: ride.driver,
      driverName: ride.driverName,
      seats: seats,
      status: 'pending'
    });

    await booking.save();

    // Emit real-time event to driver
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${ride.driver}`).emit('new-ride-booking', {
        booking,
        type: 'received'
      });
    }

    res.status(201).json(booking);
  } catch (error) {
    console.error('Send booking request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get received booking requests (for rides I'm driving)
router.get('/bookings/received', authMiddleware, async (req, res) => {
  try {
    const bookings = await RideBooking.find({ driver: req.userId })
      .populate('user', 'name email profilePhoto phone')
      .populate('ride', 'from to date time vehicle price')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    console.error('Get received bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get sent booking requests (requests I made)
router.get('/bookings/sent', authMiddleware, async (req, res) => {
  try {
    const bookings = await RideBooking.find({ user: req.userId })
      .populate('ride', 'from to date time vehicle price driverName')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    console.error('Get sent bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Accept booking request
router.put('/bookings/:bookingId/accept', authMiddleware, async (req, res) => {
  try {
    const booking = await RideBooking.findById(req.params.bookingId);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.driver.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to accept this booking' });
    }

    const ride = await RideShare.findById(booking.ride);
    
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    // Check if ride is full
    if (ride.members.length >= ride.seats) {
      return res.status(400).json({ message: 'This ride is already full' });
    }

    // Check if user is already a member
    if (ride.members.includes(booking.user)) {
      return res.status(400).json({ message: 'User is already a member of this ride' });
    }

    // Add user to ride members
    ride.members.push(booking.user);
    await ride.save();

    // Update booking status
    booking.status = 'accepted';
    await booking.save();

    // Emit real-time events
    const io = req.app.get('io');
    if (io) {
      // Notify the user who sent the request
      io.to(`user_${booking.user}`).emit('ride-booking-accepted', {
        booking,
        ride
      });
      
      // Notify all users viewing this ride
      io.to(`ride_${ride._id}`).emit('ride-updated', {
        rideId: ride._id,
        type: 'member-added'
      });
    }

    res.json(booking);
  } catch (error) {
    console.error('Accept booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reject booking request
router.put('/bookings/:bookingId/reject', authMiddleware, async (req, res) => {
  try {
    const booking = await RideBooking.findById(req.params.bookingId);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.driver.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to reject this booking' });
    }

    booking.status = 'rejected';
    await booking.save();

    // Emit real-time event to the user who sent the request
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${booking.user}`).emit('ride-booking-rejected', {
        booking
      });
    }

    res.json(booking);
  } catch (error) {
    console.error('Reject booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Join ride (keeping for backward compatibility, but now requires accepted booking)
router.post('/:rideId/join', authMiddleware, async (req, res) => {
  try {
    const ride = await RideShare.findById(req.params.rideId);

    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    // Check if user has an accepted booking
    const acceptedBooking = await RideBooking.findOne({
      ride: req.params.rideId,
      user: req.userId,
      status: 'accepted'
    });

    if (!acceptedBooking && ride.driver.toString() !== req.userId) {
      return res.status(403).json({ message: 'You must have an accepted booking request to join this ride' });
    }

    if (ride.members.includes(req.userId)) {
      return res.status(400).json({ message: 'You are already a member of this ride' });
    }

    if (ride.members.length >= ride.seats) {
      return res.status(400).json({ message: 'This ride is full' });
    }

    ride.members.push(req.userId);
    await ride.save();

    const populatedRide = await RideShare.findById(ride._id)
      .populate('driver', 'name email profilePhoto phone')
      .populate('members', 'name email profilePhoto phone');

    // Emit real-time event
    const io = req.app.get('io');
    io.to(`ride_${req.params.rideId}`).emit('ride-updated', {
      rideId: req.params.rideId,
      type: 'member-joined'
    });

    res.json(populatedRide);
  } catch (error) {
    console.error('Join ride error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Leave ride
router.post('/:rideId/leave', authMiddleware, async (req, res) => {
  try {
    const ride = await RideShare.findById(req.params.rideId);

    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    if (ride.driver.toString() === req.userId) {
      return res.status(400).json({ message: 'Driver cannot leave their own ride' });
    }

    if (!ride.members.includes(req.userId)) {
      return res.status(400).json({ message: 'You are not a member of this ride' });
    }

    ride.members = ride.members.filter(memberId => memberId.toString() !== req.userId);
    await ride.save();

    // Emit real-time event
    const io = req.app.get('io');
    io.to(`ride_${req.params.rideId}`).emit('ride-updated', {
      rideId: req.params.rideId,
      type: 'member-left'
    });

    res.json({ message: 'Left ride successfully' });
  } catch (error) {
    console.error('Leave ride error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete ride share
router.delete('/:rideId', authMiddleware, async (req, res) => {
  try {
    const ride = await RideShare.findById(req.params.rideId);

    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    if (ride.driver.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this ride' });
    }

    await RideShare.findByIdAndDelete(req.params.rideId);
    await RideShareMessage.deleteMany({ ride: req.params.rideId });

    res.json({ message: 'Ride deleted successfully' });
  } catch (error) {
    console.error('Delete ride error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get messages for a ride
router.get('/:rideId/messages', authMiddleware, async (req, res) => {
  try {
    const ride = await RideShare.findById(req.params.rideId);
    
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    // Check if user is a member of the ride
    const isMember = ride.members.includes(req.userId) || ride.driver.toString() === req.userId;
    if (!isMember) {
      return res.status(403).json({ message: 'You are not a member of this ride' });
    }

    const messages = await RideShareMessage.find({ ride: req.params.rideId })
      .populate('sender', 'name email profilePhoto')
      .sort({ createdAt: 1 })
      .limit(100); // Limit to last 100 messages

    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send a message to a ride
router.post('/:rideId/messages', authMiddleware, async (req, res) => {
  try {
    const { message, messageType = 'text' } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message cannot be empty' });
    }

    const ride = await RideShare.findById(req.params.rideId);
    
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    // Check if user is a member of the ride
    const isMember = ride.members.includes(req.userId) || ride.driver.toString() === req.userId;
    if (!isMember) {
      return res.status(403).json({ message: 'You are not a member of this ride' });
    }

    const newMessage = new RideShareMessage({
      ride: req.params.rideId,
      sender: req.userId,
      message: message.trim(),
      messageType
    });

    await newMessage.save();

    // Populate sender info
    await newMessage.populate('sender', 'name email profilePhoto');

    // Emit real-time message to all ride members
    const io = req.app.get('io');
    const roomName = `ride_${req.params.rideId}`;
    console.log(`📡 Emitting ride message to room: ${roomName}`, {
      messageId: newMessage._id,
      sender: newMessage.sender.name,
      message: newMessage.message
    });
    
    // Emit to all users in the ride room
    io.to(roomName).emit('new-ride-message', {
      message: newMessage
    });
    
    console.log(`📨 Ride message emitted to room ${roomName}`);

    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Send ride message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a message (only sender or ride driver can delete)
router.delete('/:rideId/messages/:messageId', authMiddleware, async (req, res) => {
  try {
    const message = await RideShareMessage.findById(req.params.messageId);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    const ride = await RideShare.findById(req.params.rideId);
    
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    // Check if user can delete (sender or ride driver)
    const canDelete = message.sender.toString() === req.userId || ride.driver.toString() === req.userId;
    if (!canDelete) {
      return res.status(403).json({ message: 'Not authorized to delete this message' });
    }

    await RideShareMessage.findByIdAndDelete(req.params.messageId);

    // Emit real-time message deletion
    const io = req.app.get('io');
    io.to(`ride_${req.params.rideId}`).emit('ride-message-deleted', {
      messageId: req.params.messageId
    });

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete ride message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
