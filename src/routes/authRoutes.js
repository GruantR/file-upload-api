// src/routes/authRoutes.js
const authController = require("../controllers/authController");
const authValidator = require("../validatorsExpress/authValidatorExpress");
const rateLimiter = require("../middleware/rateLimiter");
const validate = require("../middleware/validateExpress");
const express = require("express");
const router = express.Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *                 description: User's email
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: password123
 *                 description: Password (minimum 6 characters)
 *     responses:
 *       201:
 *         description: User successfully registered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RegisterSuccessResponse'
 *             example:
 *               success: true
 *               message: User successfully registered
 *               data:
 *                 uuid: 123e4567-e89b-12d3-a456-426614174000
 *                 email: user@example.com
 *                 createdAt: 2026-03-25T10:00:00.000Z
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *             examples:
 *               invalidEmail:
 *                 summary: Invalid email format
 *                 value:
 *                   success: false
 *                   error:
 *                     code: 400
 *                     message: Invalid email format
 *                     type: ValidationError
 *               shortPassword:
 *                 summary: Password too short
 *                 value:
 *                   success: false
 *                   error:
 *                     code: 400
 *                     message: Password must be at least 6 characters
 *                     type: ValidationError
 *       409:
 *         description: User already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CustomErrorResponse'
 *             example:
 *               success: false
 *               error:
 *                 code: 409
 *                 message: User with this email already exists
 *                 type: ConflictError
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorWithTextResponse'
 *             example:
 *               success: false
 *               error:
 *                 code: 500
 *                 message: Internal server error
 *                 type: ServerError
 */
router.post(
  "/register",
  rateLimiter({ windowMs: 60 * 60 * 1000, max: 100 }),
  authValidator.registerValidation(),
  validate,
  authController.createUser
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *                 description: User's email
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: password123
 *                 description: Password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginSuccessResponse'
 *             example:
 *               success: true
 *               message: Login successful
 *               data:
 *                 accessToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyVXVpZCI6IjEyM2U0NTY3LWU4OWItMTJkMy1hNDU2LTQyNjYxNDE3NDAwMCIsImlhdCI6MTc0Mjg5NjAwMCwiZXhwIjoxNzQyOTgxMjAwfQ.ABC123
 *                 user:
 *                   uuid: 123e4567-e89b-12d3-a456-426614174000
 *                   email: user@example.com
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *             examples:
 *               missingEmail:
 *                 summary: Email missing
 *                 value:
 *                   success: false
 *                   error:
 *                     code: 400
 *                     message: Email is required
 *                     type: ValidationError
 *               missingPassword:
 *                 summary: Password missing
 *                 value:
 *                   success: false
 *                   error:
 *                     code: 400
 *                     message: Password is required
 *                     type: ValidationError
 *               invalidEmail:
 *                 summary: Invalid email format
 *                 value:
 *                   success: false
 *                   error:
 *                     code: 400
 *                     message: Invalid email format
 *                     type: ValidationError
 *               shortPassword:
 *                 summary: Password too short
 *                 value:
 *                   success: false
 *                   error:
 *                     code: 400
 *                     message: Password must be at least 6 characters
 *                     type: ValidationError
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CustomErrorResponse'
 *             example:
 *               success: false
 *               error:
 *                 code: 401
 *                 message: Invalid email or password
 *                 type: UnauthorizedError
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorWithTextResponse'
 *             example:
 *               success: false
 *               error:
 *                 code: 500
 *                 message: Internal server error
 *                 type: ServerError
 */
router.post(
  "/login",
  rateLimiter({ windowMs: 60 * 1000, max: 100 }),
  authValidator.loginValidation(),
  validate,
  authController.loginUser
);

router.post("/refresh", authController.refreshTokens);
router.post("/logout", authController.logout);

module.exports = router;