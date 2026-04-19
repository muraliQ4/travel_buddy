import mongoose from 'mongoose';

const rideBookingSchema = new mongoose.Schema({
  ride: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RideShare',
    required: true
  },
  rideName: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  driverName: {
    type: String,
    required: true
  },
  seats: {
    type: Number,
    default: 1,
    min: 1
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp before saving
rideBookingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
rideBookingSchema.index({ user: 1, ride: 1 });
rideBookingSchema.index({ driver: 1, status: 1 });

const RideBooking = mongoose.model('RideBooking', rideBookingSchema);

export default RideBooking;
