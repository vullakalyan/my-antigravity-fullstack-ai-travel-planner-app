'use strict';

const mongoose = require('mongoose');

const MAX_RETRY_ATTEMPTS = 5;
const RETRY_INTERVAL_MS = 5000;
const IS_DEV = process.env.NODE_ENV !== 'production';

let retryCount = 0;
let dbConnected = false;

/**
 * Establishes a MongoDB connection with connection pooling and automatic retry.
 * In development mode, connection failures are non-fatal — the server stays up
 * so the frontend pages load, and DB-dependent routes return a 503 error.
 */
const connectDB = async () => {
  let mongoURI = process.env.MONGO_URI;

  if (IS_DEV && (!mongoURI || mongoURI.includes('127.0.0.1') || mongoURI.includes('localhost'))) {
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      mongoURI = mongoServer.getUri();
      console.log(`[Database] Auto-started MongoMemoryServer at ${mongoURI}`);
    } catch (e) {
      console.warn('[Database] Failed to start MongoMemoryServer. Using fallback URI.');
    }
  }

  if (!mongoURI) {
    if (IS_DEV) {
      console.warn('[Database] MONGO_URI is not set. Running without database (dev mode).');
      return;
    }
    console.error('[Database] MONGO_URI environment variable is not set. Exiting.');
    process.exit(1);
  }

  // Connection options — pooling configuration
  const options = {
    maxPoolSize: 10,
    minPoolSize: 2,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 10000,
    heartbeatFrequencyMS: 10000,
  };

  try {
    const conn = await mongoose.connect(mongoURI, options);
    console.log(`[Database] MongoDB connected: ${conn.connection.host}`);
    console.log(`[Database] Database name: ${conn.connection.name}`);
    retryCount = 0;
    dbConnected = true;
  } catch (error) {
    console.error(
      `[Database] Connection failed (attempt ${retryCount + 1}/${MAX_RETRY_ATTEMPTS}):`,
      error.message
    );
    retryCount += 1;

    if (retryCount < MAX_RETRY_ATTEMPTS) {
      console.log(`[Database] Retrying in ${RETRY_INTERVAL_MS / 1000} seconds...`);
      setTimeout(connectDB, RETRY_INTERVAL_MS);
    } else {
      if (IS_DEV) {
        console.warn(
          '[Database] Could not connect to MongoDB after maximum attempts.\n' +
          '[Database] ⚠️  Running in NO-DATABASE mode (development only).\n' +
          '[Database] Auth and trip routes will return 503 until a DB is available.\n' +
          '[Database] To fix: install & start MongoDB locally, or set MONGO_URI to a MongoDB Atlas URL.'
        );
        // Don't exit — keep the server running so the frontend pages load
      } else {
        console.error('[Database] Maximum retry attempts reached. Exiting.');
        process.exit(1);
      }
    }
  }
};

// ── Mongoose Connection Event Handlers ────────────────────────────────────────
mongoose.connection.on('connected', () => {
  dbConnected = true;
  console.log('[Database] Mongoose connected to MongoDB.');
});

mongoose.connection.on('error', (err) => {
  console.error('[Database] Mongoose connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  dbConnected = false;
  console.warn('[Database] Mongoose disconnected. Attempting to reconnect...');
});

// Graceful shutdown — close connection when Node process exits
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('[Database] Connection closed due to application termination.');
  process.exit(0);
});

/**
 * Express middleware: returns 503 if the database is not connected.
 * Apply this before any route handler that needs DB access.
 */
const requireDB = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      error: {
        message:
          'The database is not available. Please ensure MongoDB is running, ' +
          'or set MONGO_URI to a MongoDB Atlas connection string in your backend/.env file.',
        code: 'DATABASE_UNAVAILABLE',
      },
    });
  }
  next();
};

module.exports = connectDB;
module.exports.requireDB = requireDB;
