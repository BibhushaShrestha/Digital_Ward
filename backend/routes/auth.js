import express from 'express';
import { body, validationResult } from 'express-validator';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { sendEmail } from '../utils/email.js';
import { sendSMS } from '../utils/sms.js';

const router = express.Router();

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', [
  body('firstName').trim().isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters'),
  body('lastName').trim().isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters'),
  body('citizenshipNumber').matches(/^\d{1,2}-\d{4}-\d{5}$/).withMessage('Citizenship number must be in format: XX-XXXX-XXXXX'),
  body('mobileNumber').matches(/^(\+977)?[9][6-9]\d{8}$/).withMessage('Please enter a valid Nepali mobile number'),
  body('email').optional().isEmail().withMessage('Please enter a valid email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('dateOfBirth').isISO8601().withMessage('Please enter a valid date of birth'),
  body('gender').isIn(['male', 'female', 'other']).withMessage('Please select a valid gender'),
  body('address.province').notEmpty().withMessage('Province is required'),
  body('address.district').notEmpty().withMessage('District is required'),
  body('address.municipality').notEmpty().withMessage('Municipality is required'),
  body('address.ward').isInt({ min: 1, max: 35 }).withMessage('Ward must be between 1 and 35'),
  body('address.streetAddress').notEmpty().withMessage('Street address is required')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }

  const {
    firstName,
    lastName,
    citizenshipNumber,
    mobileNumber,
    email,
    password,
    dateOfBirth,
    gender,
    address
  } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [
      { citizenshipNumber },
      { mobileNumber },
      ...(email ? [{ email }] : [])
    ]
  });

  if (existingUser) {
    res.status(400);
    throw new Error('User already exists with this citizenship number, mobile number, or email');
  }

  // Create user
  const user = await User.create({
    firstName,
    lastName,
    citizenshipNumber,
    mobileNumber,
    email,
    password,
    dateOfBirth,
    gender,
    address,
    fullName: `${firstName} ${lastName}`
  });

  // Generate verification tokens
  if (email) {
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = emailVerificationToken;
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  }

  if (mobileNumber) {
    const mobileVerificationOTP = Math.floor(100000 + Math.random() * 900000).toString();
    user.mobileVerificationOTP = mobileVerificationOTP;
    user.mobileVerificationExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  }

  await user.save();

  // Send verification messages
  if (email) {
    await sendEmail({
      email: user.email,
      subject: 'Verify Your Email - Ward Connect Nepal',
      message: `Please verify your email by clicking this link: ${process.env.FRONTEND_URL}/verify-email/${emailVerificationToken}`
    });
  }

  if (mobileNumber) {
    await sendSMS({
      to: mobileNumber,
      message: `Your OTP for Ward Connect Nepal is: ${mobileVerificationOTP}. Valid for 10 minutes.`
    });
  }

  // Generate token
  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    message: 'User registered successfully. Please verify your contact information.',
    data: {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isMobileVerified: user.isMobileVerified
      },
      token
    }
  });
}));

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', [
  body('loginType').isIn(['citizenship', 'mobile', 'email']).withMessage('Invalid login type'),
  body('password').notEmpty().withMessage('Password is required')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }

  const { loginType, citizenshipNumber, mobileNumber, email, password, otp } = req.body;

  let user;

  // Find user based on login type
  switch (loginType) {
    case 'citizenship':
      if (!citizenshipNumber) {
        res.status(400);
        throw new Error('Citizenship number is required');
      }
      user = await User.findOne({ citizenshipNumber }).select('+password');
      break;
    case 'mobile':
      if (!mobileNumber) {
        res.status(400);
        throw new Error('Mobile number is required');
      }
      user = await User.findOne({ mobileNumber }).select('+password');
      break;
    case 'email':
      if (!email) {
        res.status(400);
        throw new Error('Email is required');
      }
      user = await User.findOne({ email }).select('+password');
      break;
    default:
      res.status(400);
      throw new Error('Invalid login type');
  }

  if (!user) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  // Check if account is locked
  if (user.isLocked()) {
    res.status(423);
    throw new Error('Account is temporarily locked due to multiple failed login attempts');
  }

  // For mobile login with OTP
  if (loginType === 'mobile' && otp) {
    if (!user.mobileVerificationOTP || user.mobileVerificationOTP !== otp) {
      await user.incLoginAttempts();
      res.status(401);
      throw new Error('Invalid OTP');
    }

    if (user.mobileVerificationExpires < Date.now()) {
      res.status(401);
      throw new Error('OTP has expired');
    }

    // Clear OTP after successful verification
    user.mobileVerificationOTP = undefined;
    user.mobileVerificationExpires = undefined;
    user.isMobileVerified = true;
  } else {
    // Password-based login
    if (!password) {
      res.status(400);
      throw new Error('Password is required');
    }

    const isMatch = await user.correctPassword(password, user.password);
    if (!isMatch) {
      await user.incLoginAttempts();
      res.status(401);
      throw new Error('Invalid credentials');
    }
  }

  // Reset login attempts on successful login
  await user.resetLoginAttempts();

  // Update last login
  user.lastLoginAt = new Date();
  await user.save();

  // Generate token
  const token = generateToken(user._id);

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        role: user.role,
        permissions: user.permissions,
        isEmailVerified: user.isEmailVerified,
        isMobileVerified: user.isMobileVerified,
        address: user.address
      },
      token
    }
  });
}));

// @desc    Send OTP for mobile verification
// @route   POST /api/auth/send-otp
// @access  Public
router.post('/send-otp', [
  body('mobileNumber').matches(/^(\+977)?[9][6-9]\d{8}$/).withMessage('Please enter a valid Nepali mobile number')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }

  const { mobileNumber } = req.body;

  const user = await User.findOne({ mobileNumber });
  if (!user) {
    res.status(404);
    throw new Error('User not found with this mobile number');
  }

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.mobileVerificationOTP = otp;
  user.mobileVerificationExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  await user.save();

  // Send SMS
  await sendSMS({
    to: mobileNumber,
    message: `Your OTP for Ward Connect Nepal is: ${otp}. Valid for 10 minutes.`
  });

  res.json({
    success: true,
    message: 'OTP sent successfully'
  });
}));

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
router.get('/verify-email/:token', asyncHandler(async (req, res) => {
  const { token } = req.params;

  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationExpires: { $gt: Date.now() }
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired verification token');
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;

  await user.save();

  res.json({
    success: true,
    message: 'Email verified successfully'
  });
}));

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password', [
  body('email').isEmail().withMessage('Please enter a valid email address')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }

  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error('User not found with this email address');
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  user.passwordResetToken = resetToken;
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  await user.save();

  // Send email
  await sendEmail({
    email: user.email,
    subject: 'Password Reset Request - Ward Connect Nepal',
    message: `You requested a password reset. Click this link to reset your password: ${process.env.FRONTEND_URL}/reset-password/${resetToken}`
  });

  res.json({
    success: true,
    message: 'Password reset email sent'
  });
}));

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
// @access  Public
router.post('/reset-password/:token', [
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }

  const { token } = req.params;
  const { password } = req.body;

  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired reset token');
  }

  // Set new password
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  res.json({
    success: true,
    message: 'Password reset successful'
  });
}));

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  res.json({
    success: true,
    data: {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        role: user.role,
        permissions: user.permissions,
        isEmailVerified: user.isEmailVerified,
        isMobileVerified: user.isMobileVerified,
        address: user.address,
        profilePicture: user.profilePicture,
        preferences: user.preferences,
        lastLoginAt: user.lastLoginAt
      }
    }
  });
}));

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', protect, [
  body('firstName').optional().trim().isLength({ min: 2, max: 50 }),
  body('lastName').optional().trim().isLength({ min: 2, max: 50 }),
  body('email').optional().isEmail(),
  body('mobileNumber').optional().matches(/^(\+977)?[9][6-9]\d{8}$/),
  body('address.streetAddress').optional().notEmpty()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }

  const user = await User.findById(req.user.id);

  const { firstName, lastName, email, mobileNumber, address, preferences } = req.body;

  // Update fields
  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (email && email !== user.email) {
    // Check if email is already taken
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400);
      throw new Error('Email is already in use');
    }
    user.email = email;
    user.isEmailVerified = false;
  }
  if (mobileNumber && mobileNumber !== user.mobileNumber) {
    // Check if mobile is already taken
    const existingUser = await User.findOne({ mobileNumber });
    if (existingUser) {
      res.status(400);
      throw new Error('Mobile number is already in use');
    }
    user.mobileNumber = mobileNumber;
    user.isMobileVerified = false;
  }
  if (address) user.address = { ...user.address, ...address };
  if (preferences) user.preferences = { ...user.preferences, ...preferences };

  // Update full name if first or last name changed
  if (firstName || lastName) {
    user.fullName = `${user.firstName} ${user.lastName}`;
  }

  await user.save();

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        role: user.role,
        permissions: user.permissions,
        isEmailVerified: user.isEmailVerified,
        isMobileVerified: user.isMobileVerified,
        address: user.address,
        profilePicture: user.profilePicture,
        preferences: user.preferences
      }
    }
  });
}));

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
router.put('/change-password', protect, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }

  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  const isMatch = await user.correctPassword(currentPassword, user.password);
  if (!isMatch) {
    res.status(401);
    throw new Error('Current password is incorrect');
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
}));

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', protect, asyncHandler(async (req, res) => {
  // In a more complex implementation, you might want to blacklist the token
  // For now, we'll just return a success message
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
}));

export default router;
