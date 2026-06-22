'use strict';

const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// ── Helper: Format validation errors ──────────────────────────────────────────
const formatValidationErrors = (errors) => {
  return errors
    .array()
    .map((e) => e.msg)
    .join('; ');
};

// ── Validation Rules ───────────────────────────────────────────────────────────
const registerValidationRules = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Please provide a valid email address.')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required.')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number.'),
  body('name')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters.')
    .escape(),
];

const loginValidationRules = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Please provide a valid email address.')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required.'),
];

// ── Utility: Generate JWT ──────────────────────────────────────────────────────
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d', algorithm: 'HS256' }
  );
};

// ── POST /api/auth/register ────────────────────────────────────────────────────
router.post('/register', registerValidationRules, async (req, res, next) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        success: false,
        error: {
          message: formatValidationErrors(errors),
          code: 'VALIDATION_ERROR',
        },
      });
    }

    const { email, password, name } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: {
          message: 'An account with this email address already exists.',
          code: 'EMAIL_ALREADY_EXISTS',
        },
      });
    }

    // Create user — password hashed via pre-save hook in User model
    const user = await User.create({
      email,
      password,
      name: name || '',
    });

    const token = generateToken(user._id.toString());

    return res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    return next(error);
  }
});

// ── POST /api/auth/login ───────────────────────────────────────────────────────
router.post('/login', loginValidationRules, async (req, res, next) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        success: false,
        error: {
          message: formatValidationErrors(errors),
          code: 'VALIDATION_ERROR',
        },
      });
    }

    const { email, password } = req.body;

    // Find user and explicitly include the password field (excluded by default)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      // Use a generic message to prevent user enumeration attacks
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid email or password.',
          code: 'INVALID_CREDENTIALS',
        },
      });
    }

    // Compare provided password against stored hash
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid email or password.',
          code: 'INVALID_CREDENTIALS',
        },
      });
    }

    const token = generateToken(user._id.toString());

    return res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
