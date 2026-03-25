// src/controllers/authController.js
const authService = require("../services/authService");
const { ValidationError, UnauthorizedError } = require("../utils/errors");

class AuthController {
  async createUser(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        throw new ValidationError("Email and password are required");
      }
      const createdUser = await authService.createUser({ email, password });
      const userJSON = createdUser.toJSON();
      const { password: pwd, ...userWithoutPassword } = userJSON;
      return res.status(201).json({
        success: true,
        message: "User successfully registered",
        data: userWithoutPassword,
      });
    } catch (err) {
      next(err);
    }
  }

  async loginUser(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        throw new ValidationError("Email and password are required");
      }
      const userAgent = req.headers["user-agent"];
      const tokensAndUser = await authService.authenticateUser({
        email,
        password,
        userAgent,
      });
      const { accessToken, refreshToken, user } = tokensAndUser;
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });
      res.status(200).json({
        success: true,
        message: "Login successful",
        data: { accessToken, user },
      });
    } catch (err) {
      next(err);
    }
  }

  async refreshTokens(req, res, next) {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        throw new UnauthorizedError("Refresh token missing");
      }

      const userAgent = req.headers["user-agent"];
      const tokensAndUser = await authService.refreshTokens(
        refreshToken,
        userAgent
      );
      const { accessToken, refreshToken: newRefreshToken, user } = tokensAndUser;
      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });
      res.status(200).json({
        success: true,
        message: "Tokens successfully refreshed",
        data: { accessToken, user },
      });
    } catch (err) {
      next(err);
    }
  }

  async logout(req, res, next) {
    try {
      const refreshToken = req.cookies.refreshToken;
      await authService.logout(refreshToken);
      res.clearCookie("refreshToken");
      res.json({
        success: true,
        message: "Logout successful",
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();