import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// Get user's emergency contacts
router.get('/', authMiddleware, async (req, res) => {
  try {
    console.log('📋 Fetching contacts for user:', req.userId);
    const user = await User.findById(req.userId).select('emergencyContacts');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    console.log('✅ Found', user.emergencyContacts.length, 'contacts');
    res.json({ success: true, contacts: user.emergencyContacts || [] });
  } catch (error) {
    console.error('❌ Error fetching contacts:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add emergency contact
router.post('/add', authMiddleware, async (req, res) => {
  try {
    console.log('📝 Adding emergency contact for user:', req.userId);
    console.log('📝 Request body:', req.body);
    
    const { name, phone, relationship, isPrimary } = req.body;
    
    if (!name || !phone) {
      console.log('❌ Validation failed: name or phone missing');
      return res.status(400).json({ success: false, message: 'Name and phone are required' });
    }

    const user = await User.findById(req.userId);
    
    if (!user) {
      console.log('❌ User not found:', req.userId);
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    console.log('✅ User found:', user.name);
    
    // If this is set as primary, remove primary from others
    if (isPrimary) {
      user.emergencyContacts.forEach(contact => {
        contact.isPrimary = false;
      });
    }

    user.emergencyContacts.push({
      name,
      phone,
      relationship: relationship || '',
      isPrimary: isPrimary || false
    });

    await user.save();
    
    console.log('✅ Emergency contact added successfully');
    console.log('📋 Total contacts:', user.emergencyContacts.length);

    res.json({ 
      success: true, 
      message: 'Emergency contact added',
      contacts: user.emergencyContacts 
    });
  } catch (error) {
    console.error('❌ Error adding emergency contact:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update emergency contact
router.put('/:contactId', authMiddleware, async (req, res) => {
  try {
    console.log('✏️ Updating contact:', req.params.contactId);
    const { contactId } = req.params;
    const { name, phone, relationship, isPrimary } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    const contact = user.emergencyContacts.id(contactId);

    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }

    // If this is set as primary, remove primary from others
    if (isPrimary) {
      user.emergencyContacts.forEach(c => {
        if (c._id.toString() !== contactId) {
          c.isPrimary = false;
        }
      });
    }

    if (name) contact.name = name;
    if (phone) contact.phone = phone;
    if (relationship !== undefined) contact.relationship = relationship;
    if (isPrimary !== undefined) contact.isPrimary = isPrimary;

    await user.save();
    
    console.log('✅ Contact updated successfully');

    res.json({ 
      success: true, 
      message: 'Emergency contact updated',
      contacts: user.emergencyContacts 
    });
  } catch (error) {
    console.error('❌ Error updating contact:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete emergency contact
router.delete('/:contactId', authMiddleware, async (req, res) => {
  try {
    console.log('🗑️ Deleting contact:', req.params.contactId);
    const { contactId } = req.params;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    user.emergencyContacts.pull(contactId);

    await user.save();
    
    console.log('✅ Contact deleted successfully');

    res.json({ 
      success: true, 
      message: 'Emergency contact deleted',
      contacts: user.emergencyContacts 
    });
  } catch (error) {
    console.error('❌ Error deleting contact:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Set/toggle primary contact
router.post('/:contactId/set-primary', authMiddleware, async (req, res) => {
  try {
    console.log('⭐ Toggling primary contact:', req.params.contactId);
    const { contactId } = req.params;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    const targetContact = user.emergencyContacts.id(contactId);
    if (!targetContact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }
    
    // If already primary, remove primary status; otherwise set as primary
    const isCurrentlyPrimary = targetContact.isPrimary;
    
    // Remove primary from all contacts
    user.emergencyContacts.forEach(contact => {
      contact.isPrimary = false;
    });
    
    // If it wasn't primary before, make it primary
    if (!isCurrentlyPrimary) {
      targetContact.isPrimary = true;
      console.log('✅ Contact set as primary');
    } else {
      console.log('✅ Primary status removed');
    }

    await user.save();

    res.json({ 
      success: true, 
      message: isCurrentlyPrimary ? 'Primary status removed' : 'Primary contact updated',
      contacts: user.emergencyContacts 
    });
  } catch (error) {
    console.error('❌ Error toggling primary:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
