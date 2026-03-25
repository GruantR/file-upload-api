//src/storage/drivers/LocalStorage.js
const StorageInterface = require("../interfaces/StorageInterface");
const path = require("path");
const fs = require("fs").promises;
const uploadConfig = require("../../config/upload");

class LocalStorage extends StorageInterface {
  async save(file, fileData) {
    const tempPath = file.path; // path from multer
    const permanentPath = path.join(
      uploadConfig.absoluteUploadDir,
      file.filename,
    );
    await fs.copyFile(tempPath, permanentPath);
    await fs.unlink(tempPath);
    return permanentPath;
  }

  async getPath(fileName) {
    return path.join(uploadConfig.absoluteUploadDir, fileName);
  }

  async delete(fileName) {
    const filePath = await this.getPath(fileName);
    await fs.unlink(filePath);
    return true;
  }
}
module.exports = LocalStorage;
