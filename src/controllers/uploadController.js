// src/controllers/uploadController.js
const path = require("path");
const UploadService = require("../services/uploadService");
const isValidUUID = require("../utils/validation");
const uploadConfig = require("../config/upload");
const getStorage = require("../storage/index");

class UploadController {
  async uploadFile(req, res) {
    try {
      const savedFile = await UploadService.saveFile(req.file);
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
      res.status(500).json({ error: "Ошибка при сохранении файла" });
    }
  }

  async _getFileAndStorage(uuid) {
    if (!isValidUUID(uuid)) {
      throw new Error("Неверный формат UUID");
    }
    const storage = getStorage();
    const getFile = await UploadService.getFileByUuid(uuid);
    return { storage, getFile };
  }

  

  async getFile(req, res) {
    try {
      const { uuid } = req.params;
      const {storage, getFile} = await this._getFileAndStorage(uuid)
      if (storage.constructor.name === "S3Storage") {
        //Узнаём, какой класс у storage
        const stream = await storage.getStream(getFile.fileName);
        if (!stream) {
          throw new Error("Не удалось получить поток файла из S3");
        }
        res.setHeader("Content-Type", getFile.mimetype);
        res.setHeader("Content-Disposition", `inline; filename="${getFile.originalName}"`);
        stream.pipe(res); // Направляет поток из MinIO прямо в ответ клиенту
      } else {
        const absolutePath = await storage.getPath(getFile.fileName);
        res.sendFile(absolutePath);
      }
    } catch (err) {
      console.error("🔥 Реальная ошибка:", err);
      res.status(500).json({ error: err.message });
    }
  }

  async forceDownloadFile(req, res) {
    try {
        const { uuid } = req.params;
        const { storage, getFile } = await this._getFileAndStorage(uuid);
        
        if (storage.constructor.name === 'S3Storage') {
            const stream = await storage.getStream(getFile.fileName);
            res.setHeader('Content-Type', getFile.mimetype);
            res.setHeader('Content-Disposition', `attachment; filename="${getFile.originalName}"`);
            stream.pipe(res);
        } else {
            const absolutePath = await storage.getPath(getFile.fileName);
            res.download(absolutePath, getFile.originalName);
        }
    } catch (err) {
        res.status(404).json({ error: err.message });
    }
}

  async getAllFiles(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const offset = parseInt(req.query.offset) || 0;
      const { allFiles, total } = await UploadService.getAllFiles(
        limit,
        offset,
      );
      const formattedFiles = allFiles.map((item) => ({
        id: item.id,
        uuid: item.uuid,
        name: item.originalName,
        size: item.size,
        type: item.mimetype,
        storedName: item.fileName,
        createdAt: item.createdAt,
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
      res.status(404).json({ error: "Ошибка при чтении файлов" });
    }
  }

  async deleteFile(req, res) {
    try {
      const { uuid } = req.params;
      if (!isValidUUID(uuid)) {
        return res.status(400).json({ error: "Неверный формат UUID" });
      }
      const deleteFile = await UploadService.deleteFile(uuid);
      res.json({
        success: true,
        deleteFile: deleteFile,
      });
    } catch (err) {
      res.status(404).json({ error: "Ошибка удаления файла" });
    }
  }
}
module.exports = new UploadController();
