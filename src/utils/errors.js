// src/utils/error.js

class ApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // чтобы отличать наши ошибки от системных
    Error.captureStackTrace(this, this.constructor);
  }
}
class NotFoundError extends ApiError {
    constructor(message = 'Ресурс не найден') {
        super(message, 404);
        this.name = 'NotFoundError';
    }
}

class ValidationError extends ApiError {
    constructor(message = 'Ошибка валидации') {
        super(message, 400);
        this.name = 'ValidationError';
    }
}

class UnauthorizedError extends ApiError {
    constructor(message = 'Не авторизован') {
        super(message, 401);
        this.name = 'UnauthorizedError';
    }
}

class ForbiddenError extends ApiError {
    constructor(message = 'Доступ запрещён') {
        super(message, 403);
        this.name = 'ForbiddenError';
    }
}

class ConflictError extends ApiError {
    constructor(message = 'Конфликт данных') {
        super(message, 409);
        this.name = 'ConflictError';
    }
}

module.exports = {
    ApiError,
    NotFoundError,
    ValidationError,
    UnauthorizedError,
    ForbiddenError,
    ConflictError
};