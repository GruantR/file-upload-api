// src/validatorsExpress/fileValidatorExpress.js

const { query, param, body } = require("express-validator");

class FileRoutesValidation {
  uploadFileValidation() {
    return [
      query("storage")
        .optional()
        .isIn(["local", "s3"])
        .withMessage("Storage must be 'local' or 's3'"),
    ];
  }

  uuidParamValidation() {
    return [param("uuid").isUUID().withMessage("Invalid UUID format")];
  }

  paginationValidation() {
    return [
      query("limit")
        .optional()
        .isInt({ min: 1, max: 1000 })
        .withMessage("Limit must be an integer between 1 and 1000"),
      query("offset")
        .optional()
        .isInt({ min: 0 })
        .withMessage("Offset must be a non-negative integer"),
    ];
  }

  fileRequiredValidation() {
    return [
      body("file").custom((value, { req }) => {
        if (!req.file) {
          throw new Error("File is required");
        }
        return true;
      }),
    ];
  }
}

module.exports = new FileRoutesValidation();