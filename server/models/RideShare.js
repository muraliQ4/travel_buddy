import mongoose from 'mongoose';

const rideShareSchema = new mongoose.Schema({
  from: { type: String, required: true },
  to: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  seats: { type: Number, required: true },
  price: { type: Number, required: true },
  vehicle: { type: String, required: true },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  driverName: { type: String, required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  verified: { type: Boolean, default: false },
  preferences: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt timestamp before saving
rideShareSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const RideShare = mongoose.model('RideShare', rideShareSchema);

export default RideShare;
