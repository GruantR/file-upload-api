// src/services/uploadService.js
const File = require('../models/File');
const path = require('path');

class UploadService {
    async saveFile(file){
        try{
            const savedFile = await File.create({
                fileName: file.filename,
                originalName: file.originalname,
                size: file.size,
                mimetype: file.mimetype,
                path:file.path,
                extension: path.extname()
            })
            return savedFile
        }
        catch(err){

        }
    }
};

module.exports = new UploadService();