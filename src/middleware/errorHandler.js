// src/middleware/errorHandler.js
const logger = require("../utils/logger");
const { ApiError } = require("../utils/errors");

const errorHandler = (err, req, res, next) => {
    if (process.env.NODE_ENV !== 'test') {
    logger.error(`${err.statusCode || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  }

  logger.error(
    `${err.statusCode || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`
  );

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.statusCode,
        message: err.message,
        type: err.name,
      },
    });
  }

  if (err.name === "SequelizeUniqueConstraintError") {
    return res.status(409).json({
      success: false,
      error: {
        code: 409,
        message: "Record already exists",
        type: "ConflictError",
      },
    });
  }

  if (err.name === "SequelizeConnectionError") {
    return res.status(503).json({
      success: false,
      error: {
        code: 503,
        message: "Database connection error",
        type: "DatabaseError",
      },
    });
  }

  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      error: {
        code: 400,
        message: "File too large. Maximum size is 5MB",
        type: "ValidationError",
      },
    });
  }

  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      error: {
        code: 401,
        message: "Invalid token",
        type: "JsonWebTokenError",
      },
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      error: {
        code: 401,
        message: "Token expired",
        type: "TokenExpiredError",
      },
    });
  }

  const statusCode = err.statusCode || 500;
  const message =
    process.env.NODE_ENV === "production"
      ? "Internal server error"
      : err.message;

  res.status(statusCode).json({
    success: false,
    error: {
      code: statusCode,
      message,
      type: err.name || "ServerError",
    },
  });
};

module.exports = errorHandler;