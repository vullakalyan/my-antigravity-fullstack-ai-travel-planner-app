'use strict';

const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const { protect } = require('../middleware/authMiddleware');
const Trip = require('../models/Trip');
const { generateItinerary } = require('../services/claudeService');

const router = express.Router();

// All trip routes require authentication
router.use(protect);

// ── Helper: Format validation errors ──────────────────────────────────────────
const formatValidationErrors = (errors) => {
  return errors
    .array()
    .map((e) => e.msg)
    .join('; ');
};

// ── Validation Rules ───────────────────────────────────────────────────────────
const VALID_BUDGETS = ['budget', 'moderate', 'luxury'];
const VALID_INTERESTS = [
  'culture', 'food', 'nature', 'adventure', 'relaxation',
  'nightlife', 'shopping', 'history', 'art', 'family',
];

const tripInputValidation = [
  body('destination')
    .trim()
    .notEmpty().withMessage('Destination is required.')
    .isLength({ min: 2, max: 100 }).withMessage('Destination must be between 2 and 100 characters.'),
  body('numberOfDays')
    .notEmpty().withMessage('Number of days is required.')
    .isInt({ min: 1, max: 30 }).withMessage('Number of days must be an integer between 1 and 30.'),
  body('budget')
    .notEmpty().withMessage('Budget is required.')
    .isIn(VALID_BUDGETS).withMessage(`Budget must be one of: ${VALID_BUDGETS.join(', ')}.`),
  body('interests')
    .isArray({ min: 1, max: 10 }).withMessage('Interests must be an array with 1 to 10 items.')
    .custom((arr) => {
      const invalid = arr.filter((item) => !VALID_INTERESTS.includes(item));
      if (invalid.length > 0) {
        throw new Error(`Invalid interests: ${invalid.join(', ')}. Valid values: ${VALID_INTERESTS.join(', ')}.`);
      }
      return true;
    }),
];

const mongoIdParam = [
  param('id')
    .isMongoId().withMessage('Invalid trip ID format.'),
];

const paginationQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer.')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100.')
    .toInt(),
];

// ── POST /api/trips/generate ───────────────────────────────────────────────────
// Generate an itinerary via Claude — does NOT persist; persistence is via POST /api/trips
router.post('/generate', tripInputValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        success: false,
        error: { message: formatValidationErrors(errors), code: 'VALIDATION_ERROR' },
      });
    }

    const { destination, numberOfDays, budget, interests } = req.body;

    const itineraryData = await generateItinerary({
      destination,
      numberOfDays: parseInt(numberOfDays, 10),
      budget,
      interests,
    });

    return res.status(200).json({
      success: true,
      data: itineraryData,
    });
  } catch (error) {
    return next(error);
  }
});

// ── POST /api/trips ────────────────────────────────────────────────────────────
// Create and persist a trip (with or without generated itinerary data)
router.post(
  '/',
  [
    ...tripInputValidation,
    // Optional: accept pre-generated itinerary data
    body('itinerary').optional().isArray(),
    body('estimatedBudget').optional().isObject(),
    body('suggestedHotels').optional().isArray(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({
          success: false,
          error: { message: formatValidationErrors(errors), code: 'VALIDATION_ERROR' },
        });
      }

      const {
        destination,
        numberOfDays,
        budget,
        interests,
        itinerary,
        estimatedBudget,
        suggestedHotels,
      } = req.body;

      const trip = await Trip.create({
        owner: req.user.id,
        destination,
        numberOfDays: parseInt(numberOfDays, 10),
        budget,
        interests,
        itinerary: itinerary || [],
        estimatedBudget: estimatedBudget || null,
        suggestedHotels: suggestedHotels || [],
        status: itinerary && itinerary.length > 0 ? 'saved' : 'draft',
      });

      return res.status(201).json({
        success: true,
        data: trip,
      });
    } catch (error) {
      return next(error);
    }
  }
);

// ── GET /api/trips ─────────────────────────────────────────────────────────────
// List authenticated user's trips — paginated
router.get('/', paginationQuery, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        success: false,
        error: { message: formatValidationErrors(errors), code: 'VALIDATION_ERROR' },
      });
    }

    const page = req.query.page || 1;
    const limit = req.query.limit || 20;
    const skip = (page - 1) * limit;

    const [trips, totalCount] = await Promise.all([
      Trip.find({ owner: req.user.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-__v')
        .lean(),
      Trip.countDocuments({ owner: req.user.id }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return res.status(200).json({
      success: true,
      data: {
        trips,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    return next(error);
  }
});

// ── GET /api/trips/:id ─────────────────────────────────────────────────────────
// Retrieve single trip — returns 404 if not found OR not owned (avoids leaking existence)
router.get('/:id', mongoIdParam, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        success: false,
        error: { message: formatValidationErrors(errors), code: 'VALIDATION_ERROR' },
      });
    }

    const trip = await Trip.findOne({
      _id: req.params.id,
      owner: req.user.id,
    }).select('-__v').lean();

    if (!trip) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Trip not found.',
          code: 'TRIP_NOT_FOUND',
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: trip,
    });
  } catch (error) {
    return next(error);
  }
});

// ── PUT /api/trips/:id ─────────────────────────────────────────────────────────
// Update a trip — ownership verified
router.put(
  '/:id',
  [
    ...mongoIdParam,
    body('destination')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 }).withMessage('Destination must be between 2 and 100 characters.'),
    body('numberOfDays')
      .optional()
      .isInt({ min: 1, max: 30 }).withMessage('Number of days must be an integer between 1 and 30.'),
    body('budget')
      .optional()
      .isIn(VALID_BUDGETS).withMessage(`Budget must be one of: ${VALID_BUDGETS.join(', ')}.`),
    body('interests')
      .optional()
      .isArray({ min: 1, max: 10 }).withMessage('Interests must be an array with 1 to 10 items.'),
    body('itinerary').optional().isArray(),
    body('estimatedBudget').optional().isObject(),
    body('suggestedHotels').optional().isArray(),
    body('status')
      .optional()
      .isIn(['draft', 'generated', 'saved']).withMessage('Status must be draft, generated, or saved.'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({
          success: false,
          error: { message: formatValidationErrors(errors), code: 'VALIDATION_ERROR' },
        });
      }

      // Build update object — only include fields that were provided
      const allowedFields = [
        'destination', 'numberOfDays', 'budget', 'interests',
        'itinerary', 'estimatedBudget', 'suggestedHotels', 'status',
      ];
      const updates = {};
      allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      });

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({
          success: false,
          error: { message: 'No valid fields to update.', code: 'NO_UPDATE_FIELDS' },
        });
      }

      const trip = await Trip.findOneAndUpdate(
        { _id: req.params.id, owner: req.user.id },
        { $set: updates },
        { new: true, runValidators: true }
      ).select('-__v').lean();

      if (!trip) {
        return res.status(404).json({
          success: false,
          error: { message: 'Trip not found.', code: 'TRIP_NOT_FOUND' },
        });
      }

      return res.status(200).json({
        success: true,
        data: trip,
      });
    } catch (error) {
      return next(error);
    }
  }
);

// ── DELETE /api/trips/:id ──────────────────────────────────────────────────────
// Delete a trip — ownership verified
router.delete('/:id', mongoIdParam, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        success: false,
        error: { message: formatValidationErrors(errors), code: 'VALIDATION_ERROR' },
      });
    }

    const trip = await Trip.findOneAndDelete({
      _id: req.params.id,
      owner: req.user.id,
    });

    if (!trip) {
      return res.status(404).json({
        success: false,
        error: { message: 'Trip not found.', code: 'TRIP_NOT_FOUND' },
      });
    }

    return res.status(200).json({
      success: true,
      data: { message: 'Trip deleted successfully.', id: req.params.id },
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
