//src/services/authService.js
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { ConflictError, UnauthorizedError } = require("../utils/errors");
const RefreshToken = require('../models/RefreshToken');

class authService {
  async createUser(userData) {
    try {
      const { email, password } = userData;
      const normalizedEmail = email.trim().toLocaleLowerCase();
      const existingUser = await User.findOne({
        where: { email: normalizedEmail },
      });

      if (existingUser) {
        throw new ConflictError('"Пользователь с таким email уже существует"');
      }
      const user = await User.create({
        email: normalizedEmail,
        password,
      });
      return user;
    } catch (err) {
      throw err;
    }
  }
  async authenticateUser(authenticateUser) {
    const { email, password, userAgent } = authenticateUser;
    const normalizedEmail = email.trim().toLocaleLowerCase();
    const user = await User.findOne({ where: { email: normalizedEmail } });
    if (!user) {
      throw new UnauthorizedError("Неверный email или пароль");
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError("Неверный email или пароль");
    }
    const refreshToken = crypto.randomBytes(40).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
        const token = jwt.sign({ userUuid: user.uuid }, process.env.SECRET_KEY, {
      expiresIn: "1m",
    });
    await RefreshToken.create({
      userId: user.id,
      token: refreshToken,
      expiresAt: expiresAt,
      userAgent: userAgent || null,
    })

    return {
      accessToken: token,
      refreshToken: refreshToken,
      user: {
        uuid: user.uuid,
        email: user.email,
      },
    };
  }

  async refreshTokens(refreshToken, userAgent) {
    const tokenByBase = await RefreshToken.findOne({where: {token: refreshToken}})
    if (!tokenByBase) {
      throw new UnauthorizedError("токен отсутсвует в базе");
    };
      if (new Date() > tokenByBase.expiresAt) {
      throw new UnauthorizedError("токен истёк");
    };
    const user = await User.findByPk(tokenByBase.userId);
    const newRefreshToken = crypto.randomBytes(40).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    const token = jwt.sign({ userUuid: user.uuid }, process.env.SECRET_KEY, {
      expiresIn: "1m",
    });
    await tokenByBase.destroy()
    await RefreshToken.create({
      userId: user.id,
      token: newRefreshToken,
      expiresAt: expiresAt,
      userAgent: userAgent || null,
    })
        return {
      accessToken: token,
      refreshToken: newRefreshToken,
      user: {
        uuid: user.uuid,
        email: user.email,
      },
    };
  }
}

module.exports = new authService();
