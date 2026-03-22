//src/middleware/errorHandler.js

const logger = require("../utils/logger");
const { ApiError } = require("../utils/errors");

const errorHandler = (err, req, res, next) => {
  // Логируем ошибку
  logger.error(
    `${err.statusCode || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`,
  );

  // Если это наша кастомная ошибка
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

  // Ошибки уникальности Sequelize
  if (err.name === "SequelizeUniqueConstraintError") {
    return res.status(409).json({
      success: false,
      error: {
        code: 409,
        message: "Запись с такими данными уже существует",
        type: "ConflictError",
      },
    });
  }
  // Ошибки подключения к БД
  if (err.name === "SequelizeConnectionError") {
    return res.status(503).json({
      success: false,
      error: {
        code: 503,
        message: "Сервис временно недоступен",
        type: "DatabaseError",
      },
    });
  }
  // Ошибки от multer
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      error: {
        code: 400,
        message: "Файл слишком большой. Максимальный размер 5MB",
        type: "ValidationError",
      },
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
        success: false,
        error: {
            code: 401,
            message: 'Недействительный токен',
            type: 'JsonWebTokenError'
        }
    });
}

if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
        success: false,
        error: {
            code: 401,
            message: 'Срок действия токена истёк',
            type: 'TokenExpiredError'
        }
    });
}
  // Любая другая ошибка (500)
  const statusCode = err.statusCode || 500;
  const message =
    process.env.NODE_ENV === "production"
      ? "Внутренняя ошибка сервера"
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
