// src/controllers/uploadController.js
const UploadService = require('../services/uploadService');

class UploadController {
    async uploadFile (req,res) {
        const file = await UploadService.saveFile(req.file)
        // как нам из file вытянуть теперь id записи?

        return res.json(req.file)
    }

}
module.exports = new UploadController();