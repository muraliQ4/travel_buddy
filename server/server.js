import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/auth.js';
import tripRoutes from './routes/trips.js';
import requestRoutes from './routes/requests.js';
import messageRoutes from './routes/messages.js';
import verificationRoutes from './routes/verification.js';
import paymentRoutes from './routes/payment.js';
import emergencyRoutes from './routes/emergency.js';
import emergencyContactsRoutes from './routes/emergencyContacts.js';
import trackingRoutes from './routes/tracking.js';
import rewardsRoutes from './routes/rewards.js';
import analyticsRoutes from './routes/analytics.js';
import helpRoutes from './routes/help.js';
import insuranceRoutes from './routes/insurance.js';
import promoRoutes from './routes/promos.js';
import safetyRoutes from './routes/safety.js';
import weatherRoutes from './routes/weather.js';
import pickupZonesRoutes from './routes/pickupzones.js';
import checkinRoutes from './routes/checkin.js';
import travelSummaryRoutes from './routes/travelSummary.js';
import kidsModeRoutes from './routes/kidsMode.js';
import pricingRoutes from './routes/pricing.js';
import otpRoutes from './routes/otp.js';
import rideShareRoutes from './routes/rideShare.js';
import { access } from 'fs';

dotenv.config();

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOriginValidator = (origin, callback) => {
  // Allow non-browser requests (curl/Postman/mobile apps)
  if (!origin) {
    callback(null, true);
    return;
  }

  if (allowedOrigins.includes(origin)) {
    callback(null, true);
    return;
  }

  callback(new Error(`Not allowed by CORS: ${origin}`));
};

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: corsOriginValidator,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Make io available to routes
app.set('io', io);

// Middleware
app.use(cors({
  origin: corsOriginValidator,
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
 .then(() => console.log('✅ Connected to MongoDB'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/trips', messageRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/emergency-contacts', emergencyContactsRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/rewards', rewardsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/help', helpRoutes);
app.use('/api/insurance', insuranceRoutes);
app.use('/api/promos', promoRoutes);
app.use('/api/safety', safetyRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/pickup-zones', pickupZonesRoutes);
app.use('/api/checkin', checkinRoutes);
app.use('/api/travel-summary', travelSummaryRoutes);
app.use('/api/kids-mode', kidsModeRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/rideshare', rideShareRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date() });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('👤 User connected:', socket.id);
  
  // Join user to their personal room
  socket.on('join-user', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined their room`);
  });
  
  // Join user to trip room for real-time updates
  socket.on('join-trip', (tripId) => {
    const roomName = `trip_${tripId}`;
    socket.join(roomName);
    console.log(`✅ User ${socket.id} joined trip room: ${roomName}`);
    
    // Confirm room membership
    const rooms = Array.from(socket.rooms);
    console.log(`📍 Socket ${socket.id} is now in rooms:`, rooms);
  });
  
  // Join user to ride room for real-time updates
  socket.on('join-ride', (rideId) => {
    const roomName = `ride_${rideId}`;
    socket.join(roomName);
    console.log(`✅ User ${socket.id} joined ride room: ${roomName}`);
    
    // Confirm room membership
    const rooms = Array.from(socket.rooms);
    console.log(`📍 Socket ${socket.id} is now in rooms:`, rooms);
  });
  
  socket.on('disconnect', () => {
    console.log('👤 User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔗 Socket.IO enabled for real-time updates`);
});