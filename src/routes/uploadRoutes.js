// src/routes/uploadRoutes.js
const express = require("express");
const router = express.Router();
const upload = require("../config/multer");
const uploadController = require("../controllers/uploadController");

router.post("/", upload.single("file"), uploadController.uploadFile);
router.get("/:uuid",uploadController.downloadFile);
router.get("/",uploadController.getAllFiles);
router.delete("/:uuid",uploadController.deleteFile);

module.exports = router;
