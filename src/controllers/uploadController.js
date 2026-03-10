// src/controllers/uploadController.js
const path = require("path");
const UploadService = require("../services/uploadService");
const isValidUUID = require("../utils/validation");
const uploadConfig = require("../config/upload");

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

  async downloadFile(req, res) {
    try {
      const { uuid } = req.params;
      if (!isValidUUID(uuid)) {
        return res.status(400).json({ error: "Неверный формат UUID" });
      }
      const getFile = await UploadService.getFileByUuid(uuid);
      /* getFile — это объект с данными, включая поле path:
        getFile.path = "uploads/1772704928042-423144866--2026-03-04-130235-2.png"*/
      const absolutePath = path.join(
        uploadConfig.absoluteUploadDir,
        getFile.fileName,
      );
      res.sendFile(absolutePath);
    } catch (err) {
      res.status(404).json({ error: "Файл не найден" });
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
