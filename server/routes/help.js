import express from 'express';
import { HelpCenter, SupportTicket } from '../models/HelpCenter.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get all FAQs
router.get('/faqs', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category, isActive: true } : { isActive: true };
    
    const faqs = await HelpCenter.find(filter)
      .sort({ priority: -1, helpful: -1, views: -1 });
    
    res.json(faqs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get FAQ by ID
router.get('/faqs/:id', async (req, res) => {
  try {
    const faq = await HelpCenter.findById(req.params.id);
    if (!faq) {
      return res.status(404).json({ error: 'FAQ not found' });
    }
    
    // Increment view count
    faq.views += 1;
    await faq.save();
    
    res.json(faq);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark FAQ as helpful/not helpful
router.post('/faqs/:id/feedback', authMiddleware, async (req, res) => {
  try {
    const { helpful } = req.body;
    const faq = await HelpCenter.findById(req.params.id);
    
    if (!faq) {
      return res.status(404).json({ error: 'FAQ not found' });
    }
    
    if (helpful) {
      faq.helpful += 1;
    } else {
      faq.notHelpful += 1;
    }
    
    await faq.save();
    res.json(faq);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create support ticket
router.post('/tickets', authMiddleware, async (req, res) => {
  try {
    const { trip, category, priority, subject, description, attachments } = req.body;
    
    const ticket = new SupportTicket({
      user: req.userId,
      trip,
      category,
      priority: priority || 'medium',
      subject,
      description,
      attachments: attachments || []
    });
    
    await ticket.save();
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's support tickets
router.get('/tickets', authMiddleware, async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ user: req.userId })
      .populate('trip', 'title from to date')
      .sort({ createdAt: -1 });
    
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get ticket by ID
router.get('/tickets/:id', authMiddleware, async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id)
      .populate('trip', 'title from to date');
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    if (ticket.user.toString() !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add response to ticket
router.post('/tickets/:id/response', authMiddleware, async (req, res) => {
  try {
    const { message, attachments } = req.body;
    const ticket = await SupportTicket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    if (ticket.user.toString() !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    ticket.responses.push({
      from: 'user',
      message,
      attachments: attachments || []
    });
    
    ticket.updatedAt = new Date();
    await ticket.save();
    
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Close ticket
router.put('/tickets/:id/close', authMiddleware, async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    if (ticket.user.toString() !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    ticket.status = 'closed';
    ticket.updatedAt = new Date();
    await ticket.save();
    
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
