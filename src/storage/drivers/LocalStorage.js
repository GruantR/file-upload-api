//src/storage/drivers/LocalStorage.js
const StorageInterface = require('../interfaces/StarageInterface');
const path = require('path');
const fs = require('fs').promises;
const uploadConfig = require('../../config/upload');

class LocalStorage extends StorageInterface {
    async save(file,fileData) {
        // file уже сохранён multer'ом, просто возвращаем путь
        return path.join(uploadConfig.absoluteUploadDir, file.fileName)
    }

    async getPath(fileName){
        return path.join(uploadConfig.absoluteUploadDir, fileName);
    }

    async delete(fileName) {
          const filePath = await this.getPath(fileName);
        await fs.unlink(filePath);
        return true;
    }
}
module.exports = LocalStorage;