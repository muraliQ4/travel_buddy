import express from 'express';
import KidsMode from '../models/KidsMode.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get user's kids mode settings
router.get('/', authMiddleware, async (req, res) => {
  try {
    let kidsMode = await KidsMode.findOne({ user: req.userId });
    
    if (!kidsMode) {
      kidsMode = new KidsMode({ user: req.userId });
      await kidsMode.save();
    }
    
    res.json(kidsMode);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Enable/disable kids mode
router.put('/toggle', authMiddleware, async (req, res) => {
  try {
    const { enabled } = req.body;
    
    let kidsMode = await KidsMode.findOne({ user: req.userId });
    
    if (!kidsMode) {
      kidsMode = new KidsMode({ user: req.userId, enabled });
    } else {
      kidsMode.enabled = enabled;
      kidsMode.updatedAt = new Date();
    }
    
    await kidsMode.save();
    res.json(kidsMode);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add family member
router.post('/family', authMiddleware, async (req, res) => {
  try {
    const { name, relationship, age, dateOfBirth, specialNeeds, photo } = req.body;
    
    let kidsMode = await KidsMode.findOne({ user: req.userId });
    
    if (!kidsMode) {
      kidsMode = new KidsMode({ user: req.userId });
    }
    
    kidsMode.familyMembers.push({
      name,
      relationship,
      age,
      dateOfBirth,
      specialNeeds,
      photo
    });
    
    kidsMode.updatedAt = new Date();
    await kidsMode.save();
    
    res.json(kidsMode);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add child
router.post('/children', authMiddleware, async (req, res) => {
  try {
    const {
      name, age, dateOfBirth, needsBoosterSeat, needsCarSeat,
      allergies, medicalConditions, favoriteActivities, emergencyContact
    } = req.body;
    
    let kidsMode = await KidsMode.findOne({ user: req.userId });
    
    if (!kidsMode) {
      kidsMode = new KidsMode({ user: req.userId });
    }
    
    kidsMode.children.push({
      name,
      age,
      dateOfBirth,
      needsBoosterSeat,
      needsCarSeat,
      allergies: allergies || [],
      medicalConditions: medicalConditions || [],
      favoriteActivities: favoriteActivities || [],
      emergencyContact: emergencyContact || {}
    });
    
    kidsMode.updatedAt = new Date();
    await kidsMode.save();
    
    res.json(kidsMode);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update safety preferences
router.put('/safety', authMiddleware, async (req, res) => {
  try {
    const safetyPreferences = req.body;
    
    let kidsMode = await KidsMode.findOne({ user: req.userId });
    
    if (!kidsMode) {
      kidsMode = new KidsMode({ user: req.userId });
    }
    
    kidsMode.safetyPreferences = {
      ...kidsMode.safetyPreferences,
      ...safetyPreferences
    };
    
    kidsMode.updatedAt = new Date();
    await kidsMode.save();
    
    res.json(kidsMode);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update vehicle requirements
router.put('/vehicle-requirements', authMiddleware, async (req, res) => {
  try {
    const vehicleRequirements = req.body;
    
    let kidsMode = await KidsMode.findOne({ user: req.userId });
    
    if (!kidsMode) {
      kidsMode = new KidsMode({ user: req.userId });
    }
    
    kidsMode.vehicleRequirements = {
      ...kidsMode.vehicleRequirements,
      ...vehicleRequirements
    };
    
    kidsMode.updatedAt = new Date();
    await kidsMode.save();
    
    res.json(kidsMode);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add trusted driver
router.post('/trusted-drivers', authMiddleware, async (req, res) => {
  try {
    const { driverId, notes } = req.body;
    
    let kidsMode = await KidsMode.findOne({ user: req.userId });
    
    if (!kidsMode) {
      kidsMode = new KidsMode({ user: req.userId });
    }
    
    // Check if driver already trusted
    const alreadyTrusted = kidsMode.trustedDrivers.some(
      td => td.driver.toString() === driverId
    );
    
    if (alreadyTrusted) {
      return res.status(400).json({ error: 'Driver already in trusted list' });
    }
    
    kidsMode.trustedDrivers.push({
      driver: driverId,
      notes: notes || ''
    });
    
    kidsMode.updatedAt = new Date();
    await kidsMode.save();
    
    // Populate driver details
    await kidsMode.populate('trustedDrivers.driver', 'name profilePhoto rating');
    
    res.json(kidsMode);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove trusted driver
router.delete('/trusted-drivers/:driverId', authMiddleware, async (req, res) => {
  try {
    const kidsMode = await KidsMode.findOne({ user: req.userId });
    
    if (!kidsMode) {
      return res.status(404).json({ error: 'Kids mode not found' });
    }
    
    kidsMode.trustedDrivers = kidsMode.trustedDrivers.filter(
      td => td.driver.toString() !== req.params.driverId
    );
    
    kidsMode.updatedAt = new Date();
    await kidsMode.save();
    
    res.json(kidsMode);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
