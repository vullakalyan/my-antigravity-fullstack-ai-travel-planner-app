'use strict';

/**
 * Centralized Express error handler.
 * Maps various error types to appropriate HTTP status codes and
 * always responds with the standard shape:
 *   { success: false, error: { message: string, code: string } }
 *
 * NOTE: Never log or expose sensitive data (passwords, tokens) here.
 */
const errorHandler = (err, req, res, _next) => {
  // Default values
  let statusCode = err.statusCode || 500;
  let message = err.message || 'An unexpected error occurred.';
  let code = err.code || 'INTERNAL_SERVER_ERROR';

  // ── Mongoose Validation Error ────────────────────────────────────────────────
  if (err.name === 'ValidationError') {
    statusCode = 422;
    code = 'VALIDATION_ERROR';
    // Collect all validation messages into one readable string
    const messages = Object.values(err.errors).map((e) => e.message);
    message = messages.join('; ');
  }

  // ── Mongoose Cast Error (invalid ObjectId) ───────────────────────────────────
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 400;
    code = 'INVALID_ID';
    message = `Invalid resource ID format: ${err.value}`;
  }

  // ── MongoDB Duplicate Key Error ──────────────────────────────────────────────
  if (err.code === 11000) {
    statusCode = 409;
    code = 'DUPLICATE_FIELD';
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const value = err.keyValue ? err.keyValue[field] : '';
    message = `An account with that ${field} (${value}) already exists.`;
  }

  // ── JWT Errors (should be handled upstream, but catch here as safety net) ────
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    code = 'TOKEN_INVALID';
    message = 'Authentication token is invalid.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    code = 'TOKEN_EXPIRED';
    message = 'Authentication token has expired.';
  }

  // ── CORS Errors ──────────────────────────────────────────────────────────────
  if (message.startsWith('CORS policy does not allow')) {
    statusCode = 403;
    code = 'CORS_FORBIDDEN';
  }

  // ── Log Server Errors (5xx only, never log req body to avoid leaking PII) ────
  if (statusCode >= 500) {
    console.error(
      `[ErrorHandler] ${statusCode} ${code} — ${req.method} ${req.url} — ${message}`,
      // Stack only in development
      process.env.NODE_ENV === 'development' ? err.stack : ''
    );
  }

  // ── Send Response ─────────────────────────────────────────────────────────────
  return res.status(statusCode).json({
    success: false,
    error: {
      message,
      code,
    },
  });
};

module.exports = errorHandler;
