//src/routes/authRoutes

const authController = require('../controllers/authController');

const express = require("express");
const router = express.Router();

router.post('/register', authController.createUser);
router.post('/login', authController.loginUser)

module.exports = router;