'use strict';

const mongoose = require('mongoose');

// ── Sub-schema: Activity ───────────────────────────────────────────────────────
const activitySchema = new mongoose.Schema(
  {
    time: {
      type: String,
      required: [true, 'Activity time is required'],
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Activity title is required'],
      trim: true,
      maxlength: [200, 'Activity title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Activity description is required'],
      trim: true,
      maxlength: [1000, 'Activity description cannot exceed 1000 characters'],
    },
    estimatedCost: {
      type: Number,
      required: [true, 'Estimated cost is required'],
      min: [0, 'Estimated cost cannot be negative'],
    },
  },
  { _id: true }
);

// ── Sub-schema: Day Itinerary ──────────────────────────────────────────────────
const dayItinerarySchema = new mongoose.Schema(
  {
    day: {
      type: Number,
      required: [true, 'Day number is required'],
      min: [1, 'Day must be at least 1'],
    },
    title: {
      type: String,
      required: [true, 'Day title is required'],
      trim: true,
      maxlength: [200, 'Day title cannot exceed 200 characters'],
    },
    activities: {
      type: [activitySchema],
      validate: {
        validator: (arr) => arr.length >= 1,
        message: 'Each day must have at least one activity',
      },
    },
  },
  { _id: true }
);

// ── Sub-schema: Budget Breakdown ───────────────────────────────────────────────
const budgetBreakdownSchema = new mongoose.Schema(
  {
    accommodation: { type: Number, required: true, min: 0 },
    food: { type: Number, required: true, min: 0 },
    activities: { type: Number, required: true, min: 0 },
    transport: { type: Number, required: true, min: 0 },
    misc: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

// ── Sub-schema: Estimated Budget ──────────────────────────────────────────────
const estimatedBudgetSchema = new mongoose.Schema(
  {
    total: {
      type: Number,
      required: [true, 'Total budget estimate is required'],
      min: [0, 'Total budget cannot be negative'],
    },
    breakdown: {
      type: budgetBreakdownSchema,
      required: [true, 'Budget breakdown is required'],
    },
  },
  { _id: false }
);

// ── Sub-schema: Suggested Hotel ───────────────────────────────────────────────
const hotelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Hotel name is required'],
      trim: true,
      maxlength: [200, 'Hotel name cannot exceed 200 characters'],
    },
    priceRange: {
      type: String,
      required: [true, 'Price range is required'],
      trim: true,
    },
    rating: {
      type: Number,
      required: [true, 'Hotel rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    description: {
      type: String,
      required: [true, 'Hotel description is required'],
      trim: true,
      maxlength: [500, 'Hotel description cannot exceed 500 characters'],
    },
  },
  { _id: true }
);

// ── Main Trip Schema ───────────────────────────────────────────────────────────
const VALID_BUDGETS = ['budget', 'moderate', 'luxury'];
const VALID_INTERESTS = [
  'culture',
  'food',
  'nature',
  'adventure',
  'relaxation',
  'nightlife',
  'shopping',
  'history',
  'art',
  'family',
];

const tripSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Trip owner is required'],
      index: true,
    },

    // ── Trip Input Fields ──────────────────────────────────────────────────────
    destination: {
      type: String,
      required: [true, 'Destination is required'],
      trim: true,
      minlength: [2, 'Destination must be at least 2 characters'],
      maxlength: [100, 'Destination cannot exceed 100 characters'],
    },
    numberOfDays: {
      type: Number,
      required: [true, 'Number of days is required'],
      min: [1, 'Trip must be at least 1 day'],
      max: [30, 'Trip cannot exceed 30 days'],
      validate: {
        validator: Number.isInteger,
        message: 'Number of days must be an integer',
      },
    },
    budget: {
      type: String,
      required: [true, 'Budget type is required'],
      enum: {
        values: VALID_BUDGETS,
        message: `Budget must be one of: ${VALID_BUDGETS.join(', ')}`,
      },
    },
    interests: {
      type: [String],
      required: [true, 'At least one interest is required'],
      validate: [
        {
          validator: (arr) => arr.length >= 1 && arr.length <= 10,
          message: 'Interests must contain between 1 and 10 items',
        },
        {
          validator: (arr) => arr.every((item) => VALID_INTERESTS.includes(item)),
          message: `Each interest must be one of: ${VALID_INTERESTS.join(', ')}`,
        },
      ],
    },

    // ── Claude-Generated Fields ────────────────────────────────────────────────
    itinerary: {
      type: [dayItinerarySchema],
      default: [],
    },
    estimatedBudget: {
      type: estimatedBudgetSchema,
      default: null,
    },
    suggestedHotels: {
      type: [hotelSchema],
      default: [],
    },

    // ── Status Tracking ────────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ['draft', 'generated', 'saved'],
      default: 'draft',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ── Indexes ────────────────────────────────────────────────────────────────────
// Compound index for fetching a user's trips sorted by creation date
tripSchema.index({ owner: 1, createdAt: -1 });

const Trip = mongoose.model('Trip', tripSchema);

module.exports = Trip;
module.exports.VALID_BUDGETS = VALID_BUDGETS;
module.exports.VALID_INTERESTS = VALID_INTERESTS;
