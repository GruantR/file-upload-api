// src/services/uploadService.js
const sequelize = require("../config/database");
const File = require("../models/File");
const CleanupLog = require("../models/CleanupLog");
const path = require("path");
const fs = require("fs").promises;
const logger = require("../utils/logger");
const uploadConfig = require("../config/upload");
const redis = require("../config/redis");

const { getStorageByType } = require("../storage/index");
const { NotFoundError } = require("../utils/errors");
const ensureS3Bucket = require("../config/ensureS3Bucket");

class UploadService {
  async saveFile(file, userId, storageOption) {
    try {
      const storageType = storageOption === "s3" ? "s3Storage" : "localStorage";
      const storage = getStorageByType(storageType);
      // Ensure bucket exists only when uploading to S3/MinIO.
      if (storageType === "s3Storage") {
        await ensureS3Bucket();
      }

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
        const userKeys = await redis.keys(`files:${userId}:*`);
        if (userKeys.length) {
          await redis.del(userKeys);
          logger.info(`🧹 Cache for user ${userId} cleared (new upload)`);
        }
        const adminKeys = await redis.keys("files:admin:*");
        if (adminKeys.length) {
          await redis.del(adminKeys);
          logger.info("🧹 Admin cache cleared");
        }
      } catch (redisError) {
        logger.error("Error clearing cache:", redisError.message);
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
        throw new NotFoundError("File not found");
      }
      return getFile;
    } catch (err) {
      throw err;
    }
  }

  async getAllFiles(limit, offset, isAdmin, userId) {
    try {
      const userPart = isAdmin ? "admin" : userId;
      const cacheKey = `files:${userPart}:offset:${offset}:limit:${limit}`;

      try {
        const cachedData = await redis.get(cacheKey);
        if (cachedData) {
          logger.info("📦 Data from Redis cache");
          return JSON.parse(cachedData);
        }
      } catch (redisError) {
        logger.error("Redis error, falling back to DB:", redisError.message);
      }

      logger.info("🔄 Cache miss or Redis unavailable, querying DB");

      const where = isAdmin ? {} : { userId };
      const allFiles = await File.findAll({
        where,
        limit,
        offset,
        order: [["createdAt", "DESC"]],
      });
      const total = await File.count();
      const result = { allFiles, total };

      try {
        await redis.setex(cacheKey, 300, JSON.stringify(result));
      } catch (redisError) {
        logger.error("Failed to save to Redis:", redisError.message);
      }

      return result;
    } catch (dbError) {
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
        transaction,
        lock: true,
      });
      if (!getFile) {
        await transaction.rollback();
        throw new NotFoundError("File not found");
      }
      const absolutePath = await storage.getPath(getFile.fileName);

      await getFile.destroy({
        transaction,
      });
      await transaction.commit();

      try {
        await storage.delete(getFile.fileName);
        logger.info(`✅ File deleted: ${absolutePath}`);
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
        const userKeys = await redis.keys(`files:${userId}:*`);
        if (userKeys.length) {
          await redis.del(userKeys);
          logger.info(`🧹 Cache for user ${userId} cleared (file deletion)`);
        }
        const adminKeys = await redis.keys("files:admin:*");
        if (adminKeys.length) {
          await redis.del(adminKeys);
          logger.info("🧹 Admin cache cleared");
        }
      } catch (redisError) {
        logger.error("Error clearing cache:", redisError.message);
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
      logger.warn(`🔄 Transaction rolled back for uuid ${uuid}`);
      throw err;
    }
  }
}

module.exports = new UploadService();