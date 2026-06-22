'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const BCRYPT_SALT_ROUNDS = 10;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
      default: '',
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address',
      ],
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      // Never select password by default
      select: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ── Pre-save Hook: Hash Password ───────────────────────────────────────────────
userSchema.pre('save', async function hashPassword(next) {
  // Only hash the password when it has been modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(BCRYPT_SALT_ROUNDS);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (error) {
    return next(error);
  }
});

// ── Instance Method: Compare Password ─────────────────────────────────────────
userSchema.methods.comparePassword = async function comparePassword(candidatePassword) {
  // 'this.password' is not selected by default — caller must explicitly select it
  return bcrypt.compare(candidatePassword, this.password);
};

// ── Transform: Remove sensitive fields from JSON output ───────────────────────
userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.password;
    return ret;
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
