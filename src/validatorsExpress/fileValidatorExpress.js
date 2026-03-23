//src/validatorsExpress/fileValidatorExpress.js

const { query, param, body } = require("express-validator");

class fileRoutesValidation {
  uploadFileValidation() {
    return [
      query("storage")
        .optional()
        .isIn(["local", "s3"])
        .withMessage("storage должен быть local или s3"),
    ];
  }
  uuidParamValidation() {
    return [param("uuid").isUUID().withMessage("Неверный формат UUID")];
  }
  paginationValidation() {
    return [
      query("limit")
        .optional()
        .isInt({ min: 1, max: 1000 })
        .withMessage("limit должен быть числом от 1 до 100"),

      query("offset")
        .optional()
        .isInt({ min: 0 })
        .withMessage("offset должен быть неотрицательным целым числом"),
    ];
  }
  fileRequiredValidation() {
    return [
      body("file").custom((value, { req }) => {
        if (!req.file) {
          throw new Error("Файл обязателен");
        }
        return true;
      }),
    ];
  }
}

module.exports = new fileRoutesValidation();
