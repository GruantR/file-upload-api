//src/validatorsExpress/authValidatorExpress.js
const { body } = require("express-validator");

class authRoutesValidation {
  registerValidation() {
    return [
      body("email")
        .notEmpty()
        .withMessage("Email обязателен")
        .isEmail()
        .withMessage("Некорректный формат email")
        .normalizeEmail()
        .trim(),

      body("password")
        .notEmpty()
        .withMessage("Пароль обязателен")
        .isLength({ min: 6 })
        .withMessage("Пароль должен быть минимум 6 символов"),
    ];
  }
  loginValidation() {
    return [
      body("email")
        .notEmpty()
        .withMessage("Email обязателен")
        .isEmail()
        .withMessage("Некорректный формат email")
        .normalizeEmail()
        .trim(),

      body("password").notEmpty().withMessage("Пароль обязателен"),
    ];
  }
}
module.exports = new authRoutesValidation();
