// src/controllers/uploadController.js
const path = require("path");
const UploadService = require("../services/uploadService");
const isValidUUID = require("../utils/validationUUID");
const uploadConfig = require("../config/upload");
const { getStorageByType, getStorage } = require("../storage/index");
const { ValidationError, ForbiddenError } = require("../utils/errors");

class UploadController {
  async uploadFile(req, res, next) {
    try {
      const savedFile = await UploadService.saveFile(
        req.file,
        req.user.id,
        req.query.storage,
      );
      return res.json({
        success: true,
        file: {
          id: savedFile.id,
          uuid: savedFile.uuid,
          name: savedFile.originalName,
          size: savedFile.size,
          type: savedFile.mimetype,
          storedName: savedFile.fileName,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async _getFileAndStorage(uuid) {
    if (!isValidUUID(uuid)) {
      throw new ValidationError("Неверный формат UUID");
    }
    const getFile = await UploadService.getFileByUuid(uuid);
    const storage = getStorageByType(getFile.storageType);
    return { storage, getFile };
  }

  async getFile(req, res, next) {
    try {
      const { uuid } = req.params;
      const userId = req.user.id;

      const { storage, getFile } = await this._getFileAndStorage(uuid);
      if (userId !== getFile.userId && req.user.role !== "admin") {
        throw new ForbiddenError("Доступ запрещён");
      }
      if (storage.constructor.name === "S3Storage") {
        //Узнаём, какой класс у storage
        const stream = await storage.getStream(getFile.fileName);
        if (!stream) {
          throw new Error("Не удалось получить поток файла из S3");
        }
        res.setHeader("Content-Type", getFile.mimetype);
        res.setHeader(
          "Content-Disposition",
          `inline; filename="${getFile.originalName}"`,
        );
        stream.pipe(res); // Направляет поток из MinIO прямо в ответ клиенту
      } else {
        const absolutePath = await storage.getPath(getFile.fileName);
        res.sendFile(absolutePath);
      }
    } catch (err) {
      next(err);
    }
  }

  async forceDownloadFile(req, res, next) {
    try {
      const { uuid } = req.params;
      const userId = req.user.id;
      const { storage, getFile } = await this._getFileAndStorage(uuid);
      if (userId !== getFile.userId && req.user.role !== "admin") {
        throw new ForbiddenError("Доступ запрещён");
      }
      if (storage.constructor.name === "S3Storage") {
        const stream = await storage.getStream(getFile.fileName);
        res.setHeader("Content-Type", getFile.mimetype);
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${getFile.originalName}"`,
        );
        stream.pipe(res);
      } else {
        const absolutePath = await storage.getPath(getFile.fileName);
        res.download(absolutePath, getFile.originalName);
      }
    } catch (err) {
      next(err);
    }
  }

  async getAllFiles(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const offset = parseInt(req.query.offset) || 0;
      const userId = req.user.id;
      let isAdmin = false;
      if (req.user.role === "admin") {
        isAdmin = true;
      }
      const { allFiles, total } = await UploadService.getAllFiles(
        limit,
        offset,
        isAdmin,
        userId,
      );
      const formattedFiles = allFiles.map((item) => ({
        id: item.id,
        uuid: item.uuid,
        name: item.originalName,
        size: item.size,
        type: item.mimetype,
        storedName: item.fileName,
        createdAt: item.createdAt,
        storageType: item.storageType,
      }));
      res.json({
        success: true,
        files: formattedFiles,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteFile(req, res, next) {
    try {
      const { uuid } = req.params;
      const userId = req.user.id;
      const { storage, getFile } = await this._getFileAndStorage(uuid);
      if (userId !== getFile.userId && req.user.role !== "admin") {
        throw new ForbiddenError("Доступ запрещён");
      }
      const deleteFile = await UploadService.deleteFile(
        uuid,
        getFile.storageType,
      );
      res.json({
        success: true,
        deleteFile: deleteFile,
      });
    } catch (err) {
      next(err);
    }
  }
}
module.exports = new UploadController();
