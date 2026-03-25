// src/validatorsExpress/authValidatorExpress.js
const { body } = require("express-validator");

class AuthRoutesValidation {
  registerValidation() {
    return [
      body("email")
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid email format")
        .normalizeEmail()
        .trim(),

      body("password")
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters"),
    ];
  }

  loginValidation() {
    return [
      body("email")
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid email format")
        .normalizeEmail()
        .trim(),

      body("password")
        .notEmpty()
        .withMessage("Password is required"),
    ];
  }
}

module.exports = new AuthRoutesValidation();