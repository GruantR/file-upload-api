// src/services/uploadService.js
const sequelize = require("../config/database");
const File = require("../models/File");
const CleanupLog = require("../models/CleanupLog");
const path = require("path");
const fs = require("fs").promises;
const logger = require("../utils/logger");
const uploadConfig = require("../config/upload");

class UploadService {
  async saveFile(file) {
    try {
      const savedFile = await File.create({
        fileName: file.filename,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        extension: path.extname(file.originalname).replace(".", ""),
      });
      return savedFile;
    } catch (err) {
      throw err;
    }
  }

  async getFileByUuid(uuid) {
    try {
      const getFile = await File.findOne({ where: { uuid } });
      if (!getFile) {
        throw new Error("Файл не найден");
      }
      return getFile;
    } catch (err) {
      throw err;
    }
  }
  async getAllFiles(limit, offset) {
    try {
      const allFiles = await File.findAll({
        limit:limit,
        offset: offset,
        order: [['createdAt', 'DESC']]
      });
      const total = await File.count();
      return {allFiles, total};

      
    } catch (err) {
      throw err;
    }
  }
  async deleteFile(uuid) {
    let transaction;
    try {
      transaction = await sequelize.transaction();
      const getFile = await File.findOne({
        where: { uuid },
        transaction, // ← добавляем транзакцию
        lock: true, // ← блокируем запись
      });
      if (!getFile) {
        await transaction.rollback();
        throw new Error("Файл не найден");
      }
      const absolutePath = path.join(
        uploadConfig.absoluteUploadDir,
        getFile.fileName,
      );

      await getFile.destroy({
        transaction,
      });
      await transaction.commit();

      try {
        await fs.unlink(absolutePath);
        logger.info(`✅ Файл удалён: ${absolutePath}`);
      } catch (unlinkError) {
        await CleanupLog.create({
          fileUuid: getFile.uuid,
          storedName: getFile.fileName,
          errorMessage: unlinkError.message,
          status: "pending",
        });
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
