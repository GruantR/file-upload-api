// src/routes/uploadRoutes.js
const express = require("express");
const router = express.Router();
const upload = require("../config/multer");
const uploadController = require("../controllers/uploadController");
const authMiddleware = require("../middleware/authMiddleware");
const fileValidator = require("../validatorsExpress/fileValidatorExpress");
const validate = require("../middleware/validateExpress");
const rateLimiter = require("../middleware/rateLimiter");

router.post(
  "/",
  authMiddleware,
  rateLimiter({ windowMs: 60 * 1000, max: 10 }),
  upload.single("file"),
  fileValidator.fileRequiredValidation(),
  fileValidator.uploadFileValidation(),
  validate,
  uploadController.uploadFile,
);
router.get(
  "/:uuid",
  authMiddleware,
  fileValidator.uuidParamValidation(),
  validate,
  uploadController.getFile.bind(uploadController),
);
router.get(
  "/",
  authMiddleware,
  fileValidator.paginationValidation(),
  validate,
  uploadController.getAllFiles,
);
router.delete(
  "/:uuid",
  authMiddleware,
  fileValidator.uuidParamValidation(),
  validate,
  uploadController.deleteFile.bind(uploadController),
);

module.exports = router;
