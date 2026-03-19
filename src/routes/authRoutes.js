//src/routes/authRoutes

const authController = require('../controllers/authController');
const authValidator = require('../validatorsExpress/authValidatorExpress');
const validate = require('../middleware/validateExpress');

const express = require("express");
const router = express.Router();

router.post('/register', authValidator.registerValidation(), validate, authController.createUser);
router.post('/login', authValidator.loginValidation(), validate, authController.loginUser)
router.post('/refresh', authController.refreshTokens);
router.post('/logout', authController.logout);

module.exports = router;