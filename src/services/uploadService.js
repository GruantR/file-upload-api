// src/services/uploadService.js
const sequelize = require("../config/database");
const File = require("../models/File");
const CleanupLog = require("../models/CleanupLog");
const path = require("path");
const fs = require("fs").promises;
const logger = require("../utils/logger");
const uploadConfig = require("../config/upload");
const redis = require("../config/redis");

const { getStorageByType, getStorage } = require("../storage/index");
const { NotFoundError } = require("../utils/errors");

class UploadService {
  async saveFile(file, userId, storageOption) {
    try {
      const storageType = storageOption === "s3" ? "s3Storage" : "localStorage";
      const storage = getStorageByType(storageType);

      const savedFile = await File.create({
        fileName: file.filename,
        userId: userId,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        extension: path.extname(file.originalname).replace(".", ""),
        storageType: storageType,
      });
      await storage.save(file, savedFile);
      try {
        // Удаляем кэш этого пользователя
        const userKeys = await redis.keys(`files:${userId}:*`);
        if (userKeys.length) {
          await redis.del(userKeys);
          logger.info(`🧹 Кэш пользователя ${userId} очищен (новая загрузка)`);
        }
        // Удаляем кэш админа (если есть)
        const adminKeys = await redis.keys("files:admin:*");
        if (adminKeys.length) {
          await redis.del(adminKeys);
          logger.info("🧹 Кэш админа очищен");
        }
      } catch (redisError) {
        logger.error("Ошибка при очистке кэша:", redisError.message);
      }
      return savedFile;
    } catch (err) {
      throw err;
    }
  }

  async getFileByUuid(uuid) {
    try {
      const getFile = await File.findOne({ where: { uuid } });
      if (!getFile) {
        throw new NotFoundError("Файл не найден");
      }
      return getFile;
    } catch (err) {
      throw err;
    }
  }

  async getAllFiles(limit, offset, isAdmin, userId) {
    try {
      // Пытаемся использовать Redis
      const userPart = isAdmin ? "admin" : userId;
      const cacheKey = `files:${userPart}:offset:${offset}:limit:${limit}`;

      try {
        const cachedData = await redis.get(cacheKey);
        if (cachedData) {
          logger.info("📦 Данные из Redis кэша");
          return JSON.parse(cachedData);
        }
      } catch (redisError) {
        logger.error("Redis error, falling back to DB:", redisError.message);
        // Просто идём дальше в БД
      }

      logger.info("🔄 Данных нет в кэше или Redis недоступен, идём в БД");

      const where = isAdmin ? {} : { userId };
      const allFiles = await File.findAll({
        where,
        limit,
        offset,
        order: [["createdAt", "DESC"]],
      });
      const total = await File.count();
      const result = { allFiles, total };

      // Пытаемся сохранить в Redis, но не критично
      try {
        await redis.setex(cacheKey, 300, JSON.stringify(result));
      } catch (redisError) {
        logger.error("Failed to save to Redis:", redisError.message);
      }

      return result;
    } catch (dbError) {
      // Ошибка БД — это критично
      throw dbError;
    }
  }

  async deleteFile(uuid, storageType) {
    let transaction;
    const storage = getStorageByType(storageType);

    try {
      transaction = await sequelize.transaction();
      const getFile = await File.findOne({
        where: { uuid },
        transaction, // ← добавляем транзакцию
        lock: true, // ← блокируем запись
      });
      if (!getFile) {
        await transaction.rollback();
        throw new NotFoundError("Файл не найден");
      }
      const absolutePath = await storage.getPath(getFile.fileName);

      await getFile.destroy({
        transaction,
      });
      await transaction.commit();

      try {
        await storage.delete(getFile.fileName);

        logger.info(`✅ Файл удалён: ${absolutePath}`);
      } catch (unlinkError) {
        await CleanupLog.create({
          fileUuid: getFile.uuid,
          storedName: getFile.fileName,
          errorMessage: unlinkError.message,
          status: "pending",
        });
      }
      const userId = getFile.userId;
      try {
        // Удаляем кэш этого пользователя
        const userKeys = await redis.keys(`files:${userId}:*`);
        if (userKeys.length) {
          await redis.del(userKeys);
          logger.info(`🧹 Кэш пользователя ${userId} очищен (новая загрузка)`);
        }
        // Удаляем кэш админа (если есть)
        const adminKeys = await redis.keys("files:admin:*");
        if (adminKeys.length) {
          await redis.del(adminKeys);
          logger.info("🧹 Кэш админа очищен");
        }
      } catch (redisError) {
        logger.error("Ошибка при очистке кэша:", redisError.message);
      }

      return {
        id: getFile.id,
        name: getFile.originalName,
        storedName: getFile.fileName,
      };
    } catch (err) {
      if (transaction) {
        await transaction.rollback();
      }
      logger.warn(`🔄 Транзакция отменена для uuid ${uuid}`);
      throw err;
    }
  }
}

module.exports = new UploadService();
