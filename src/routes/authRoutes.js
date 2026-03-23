//src/routes/authRoutes

const authController = require("../controllers/authController");
const authValidator = require("../validatorsExpress/authValidatorExpress");
const rateLimiter = require("../middleware/rateLimiter");
const validate = require("../middleware/validateExpress");

const express = require("express");
const router = express.Router();

router.post(
  "/register",
  rateLimiter({ windowMs: 60 * 60 * 1000, max: 3 }),
  authValidator.registerValidation(),
  validate,
  authController.createUser,
);
router.post(
  "/login",
    rateLimiter({ windowMs: 60 * 1000, max: 5 }),
  authValidator.loginValidation(),
  validate,
  authController.loginUser,
);
router.post("/refresh", authController.refreshTokens);
router.post("/logout", authController.logout);

module.exports = router;
