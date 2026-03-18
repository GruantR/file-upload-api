// src/routes/uploadRoutes.js
const express = require("express");
const router = express.Router();
const upload = require("../config/multer");
const uploadController = require("../controllers/uploadController");
const authMiddleware = require('../middleware/authMiddleware');

router.post("/", authMiddleware, upload.single("file"), uploadController.uploadFile);
router.get("/:uuid", uploadController.getFile.bind(uploadController));
router.get("/:uuid/download", uploadController.forceDownloadFile.bind(uploadController));
router.get("/",uploadController.getAllFiles);
router.delete("/:uuid", authMiddleware, uploadController.deleteFile.bind(uploadController));

module.exports = router;
