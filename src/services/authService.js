// src/services/authService.js
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { ConflictError, UnauthorizedError } = require("../utils/errors");
const RefreshToken = require("../models/RefreshToken");
const redis = require("../config/redis");
const logger = require("../utils/logger");

class AuthService {
  async createUser(userData) {
    try {
      const { email, password } = userData;
      const normalizedEmail = email.trim().toLowerCase();
      const existingUser = await User.findOne({
        where: { email: normalizedEmail },
      });

      if (existingUser) {
        throw new ConflictError("User with this email already exists");
      }
      
      const user = await User.create({
        email: normalizedEmail,
        password,
        role: "user",
      });
      
      return user;
    } catch (err) {
      throw err;
    }
  }

  async authenticateUser({ email, password, userAgent }) {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ where: { email: normalizedEmail } });
    
    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid email or password");
    }
    
    const refreshToken = crypto.randomBytes(40).toString("hex");
    const accessToken = jwt.sign(
      { userUuid: user.uuid },
      process.env.SECRET_KEY,
      { expiresIn: "15m" }
    );
    
    // Save to Redis (non-critical)
    try {
      const key = `refresh:${refreshToken}`;
      const value = JSON.stringify({
        userId: user.id,
        userAgent: userAgent || null,
        createdAt: new Date().toISOString(),
      });
      await redis.setex(key, 30 * 24 * 60 * 60, value);
    } catch (err) {
      logger.error("Failed to save refresh token to Redis:", err.message);
    }
    
    // Save to PostgreSQL (primary storage)
    await RefreshToken.create({
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      userAgent: userAgent || null,
    });

    return {
      accessToken,
      refreshToken,
      user: {
        uuid: user.uuid,
        email: user.email,
      },
    };
  }

  async refreshTokens(refreshToken, userAgent) {
    let tokenData = null;
    let user = null;
    
    // Try Redis first (fast path)
    try {
      const key = `refresh:${refreshToken}`;
      const data = await redis.get(key);
      if (data) {
        tokenData = JSON.parse(data);
      }
    } catch (err) {
      logger.error("Redis error, falling back to PostgreSQL:", err.message);
    }
    
    // Fallback to PostgreSQL if Redis failed or not found
    if (!tokenData) {
      const dbToken = await RefreshToken.findOne({ where: { token: refreshToken } });
      if (!dbToken) {
        throw new UnauthorizedError("Invalid refresh token");
      }
      if (dbToken.expiresAt && new Date(dbToken.expiresAt) < new Date()) {
        await RefreshToken.destroy({ where: { token: refreshToken } });
        throw new UnauthorizedError("Refresh token expired");
      }
      tokenData = {
        userId: dbToken.userId,
        userAgent: dbToken.userAgent,
        createdAt: dbToken.createdAt,
      };
    }
    
    user = await User.findByPk(tokenData.userId);
    if (!user) {
      throw new UnauthorizedError("User not found");
    }
    
    // Generate new tokens
    const newRefreshToken = crypto.randomBytes(40).toString("hex");
    const newAccessToken = jwt.sign(
      { userUuid: user.uuid },
      process.env.SECRET_KEY,
      { expiresIn: "15m" }
    );
    
    // Delete old token from both stores
    try {
      await redis.del(`refresh:${refreshToken}`);
    } catch (err) {
      logger.error("Failed to delete from Redis:", err.message);
    }
    await RefreshToken.destroy({ where: { token: refreshToken } });
    
    // Save new token to both stores
    try {
      const newKey = `refresh:${newRefreshToken}`;
      const newValue = JSON.stringify({
        userId: user.id,
        userAgent: userAgent || null,
        createdAt: new Date().toISOString(),
      });
      await redis.setex(newKey, 30 * 24 * 60 * 60, newValue);
    } catch (err) {
      logger.error("Failed to save new token to Redis:", err.message);
    }
    
    await RefreshToken.create({
      userId: user.id,
      token: newRefreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      userAgent: userAgent || null,
    });
    
    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        uuid: user.uuid,
        email: user.email,
      },
    };
  }

  async logout(refreshToken) {
    if (refreshToken) {
      try {
        await redis.del(`refresh:${refreshToken}`);
      } catch (err) {
        logger.error("Failed to delete from Redis:", err.message);
      }
      await RefreshToken.destroy({ where: { token: refreshToken } });
    }
    return true;
  }
}

module.exports = new AuthService();