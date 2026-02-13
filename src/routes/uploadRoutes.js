// src/routes/uploadRoutes.js
const express = require("express");
const router = express.Router();
const upload = require("../config/multer");
const uploadController = require("../controllers/uploadController");

router.post("/", upload.single("file"), uploadController.uploadFile);

module.exports = router;
