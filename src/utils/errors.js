// src/utils/errors.js
class ApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends ApiError {
  constructor(message = "Resource not found") {
    super(message, 404);
    this.name = "NotFoundError";
  }
}

class ValidationError extends ApiError {
  constructor(message = "Validation error") {
    super(message, 400);
    this.name = "ValidationError";
  }
}

class UnauthorizedError extends ApiError {
  constructor(message = "Unauthorized") {
    super(message, 401);
    this.name = "UnauthorizedError";
  }
}

class ForbiddenError extends ApiError {
  constructor(message = "Access forbidden") {
    super(message, 403);
    this.name = "ForbiddenError";
  }
}

class ConflictError extends ApiError {
  constructor(message = "Data conflict") {
    super(message, 409);
    this.name = "ConflictError";
  }
}

module.exports = {
  ApiError,
  NotFoundError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
};