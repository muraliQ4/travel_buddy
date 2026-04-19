import mongoose from 'mongoose';

// Help Center & FAQs (Feature H)
const helpCenterSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ['booking', 'payment', 'safety', 'account', 'technical', 'general'],
    required: true
  },
  question: {
    type: String,
    required: true
  },
  answer: {
    type: String,
    required: true
  },
  tags: [{
    type: String
  }],
  helpful: {
    type: Number,
    default: 0
  },
  notHelpful: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  priority: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
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

const supportTicketSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  trip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip'
  },
  category: {
    type: String,
    enum: ['booking-issue', 'payment-issue', 'safety-concern', 'driver-issue', 'passenger-issue', 'technical', 'other'],
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  subject: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  attachments: [{
    url: { type: String },
    type: { type: String },
    filename: { type: String }
  }],
  status: {
    type: String,
    enum: ['open', 'in-progress', 'resolved', 'closed'],
    default: 'open'
  },
  responses: [{
    from: { type: String, enum: ['user', 'support'], required: true },
    message: { type: String, required: true },
    attachments: [{ type: String }],
    timestamp: { type: Date, default: Date.now }
  }],
  assignedTo: {
    type: String,
    default: ''
  },
  resolvedAt: {
    type: Date
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

const HelpCenter = mongoose.model('HelpCenter', helpCenterSchema);
const SupportTicket = mongoose.model('SupportTicket', supportTicketSchema);

export { HelpCenter, SupportTicket };
