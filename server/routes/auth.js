import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/auth.js';
import otpService from '../services/otpService.js';

const router = express.Router();

// Password strength validation
function validatePasswordStrength(password) {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const errors = [];
  if (password.length < minLength) {
    errors.push(`at least ${minLength} characters`);
  }
  if (!hasUpperCase) {
    errors.push('one uppercase letter');
  }
  if (!hasLowerCase) {
    errors.push('one lowercase letter');
  }
  if (!hasNumbers) {
    errors.push('one number');
  }
  if (!hasSpecialChar) {
    errors.push('one special character (!@#$%^&*...)');
  }

  return {
    isValid: errors.length === 0,
    errors,
    message: errors.length > 0 ? `Password must contain ${errors.join(', ')}` : 'Password is strong'
  };
}

// Register
router.post('/register',
  [
    body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('phone').trim().notEmpty().withMessage('Phone number is required'),
    body('phoneVerified').isBoolean().withMessage('Phone verification status is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, email, password, phone, phoneVerified } = req.body;

      // Validate password strength
      const passwordCheck = validatePasswordStrength(password);
      if (!passwordCheck.isValid) {
        return res.status(400).json({ 
          message: passwordCheck.message,
          errors: passwordCheck.errors
        });
      }

      // Verify phone was verified before registration
      if (!phoneVerified) {
        return res.status(400).json({ 
          message: 'Please verify your phone number before registering' 
        });
      }

      // Check if user exists with email
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists with this email' });
      }

      // Format phone number
      const formattedPhone = otpService.formatPhoneNumber(phone);

      // Check if phone is already registered
      const existingPhone = await User.findOne({ 
        phone: formattedPhone, 
        phoneVerified: true 
      });
      if (existingPhone) {
        return res.status(400).json({ 
          message: 'This phone number is already registered' 
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user
      const user = new User({
        name,
        email,
        password: hashedPassword,
        phone: formattedPhone,
        phoneVerified: true,
        phoneVerifiedAt: new Date()
      });

      await user.save();

      // Generate token
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

      res.status(201).json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          phoneVerified: user.phoneVerified,
          bio: user.bio,
          location: user.location,
          interests: user.interests
        }
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Login
router.post('/login',
  [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').exists().withMessage('Password is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Check if user exists
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Generate token
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

      res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          username: user.username,
          phone: user.phone,
          phoneVerified: user.phoneVerified,
          country: user.country,
          city: user.city,
          profilePhoto: user.profilePhoto,
          dateOfBirth: user.dateOfBirth,
          gender: user.gender,
          nationality: user.nationality,
          bio: user.bio,
          location: user.location,
          interests: user.interests,
          languages: user.languages,
          travelStyle: user.travelStyle,
          travelerType: user.travelerType,
          preferredDestinations: user.preferredDestinations,
          budgetRange: user.budgetRange,
          preferredSeason: user.preferredSeason,
          instagramHandle: user.instagramHandle
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Get current user
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { 
      name, 
      email,
      username,
      phone, 
      password,
      country,
      city,
      profilePhoto,
      dateOfBirth,
      gender,
      nationality,
      bio, 
      location, 
      interests,
      languages,
      travelStyle,
      travelerType,
      preferredDestinations,
      budgetRange,
      preferredSeason,
      instagramHandle
    } = req.body;

    // Check if email is being updated and is already taken
    if (email && email !== '') {
      const existingUser = await User.findOne({ 
        email: email.toLowerCase(), 
        _id: { $ne: req.userId } 
      });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    // Check if username is being updated and is already taken
    if (username && username !== '') {
      const existingUser = await User.findOne({ 
        username, 
        _id: { $ne: req.userId } 
      });
      if (existingUser) {
        return res.status(400).json({ message: 'Username already taken' });
      }
    }

    // Prepare update object - only include defined fields
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (username !== undefined) updateData.username = username;
    if (phone !== undefined) updateData.phone = phone;
    if (country !== undefined) updateData.country = country;
    if (city !== undefined) updateData.city = city;
    if (profilePhoto !== undefined) updateData.profilePhoto = profilePhoto;
    if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth;
    if (gender !== undefined) updateData.gender = gender;
    if (nationality !== undefined) updateData.nationality = nationality;
    if (bio !== undefined) updateData.bio = bio;
    if (location !== undefined) updateData.location = location;
    if (interests !== undefined) updateData.interests = interests;
    if (languages !== undefined) updateData.languages = languages;
    if (travelStyle !== undefined) updateData.travelStyle = travelStyle;
    if (travelerType !== undefined) updateData.travelerType = travelerType;
    if (preferredDestinations !== undefined) updateData.preferredDestinations = preferredDestinations;
    if (budgetRange !== undefined) updateData.budgetRange = budgetRange;
    if (preferredSeason !== undefined) updateData.preferredSeason = preferredSeason;
    if (instagramHandle !== undefined) updateData.instagramHandle = instagramHandle;

    // Hash password if provided
    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('✅ Profile updated successfully for user:', user._id);
    res.json(user);
  } catch (error) {
    console.error('❌ Update profile error:', error);
    
    // Handle specific MongoDB errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error: ' + Object.values(error.errors).map(e => e.message).join(', ')
      });
    }
    
    if (error.code === 11000) {
      // Duplicate key error
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists` 
      });
    }
    
    res.status(500).json({ 
      message: 'Error updating profile: ' + (error.message || 'Unknown error')
    });
  }
});

// Search users by name or location
router.get('/search', authMiddleware, async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.length < 2) {
      return res.json([]);
    }

    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { location: { $regex: query, $options: 'i' } }
      ]
    })
    .select('-password')
    .limit(10);

    res.json(users);
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user by ID
router.get('/user/:userId', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
