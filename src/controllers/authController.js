//src/controllers/authController.js

const authService = require("../services/authService");
const { ValidationError, UnauthorizedError } = require("../utils/errors");

class authController {
  async createUser(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        throw new ValidationError("Email и пароль обязательны!");
      }
      const createdUser = await authService.createUser({ email, password });
      const userJSON = createdUser.toJSON();
      const { password: pwd, ...userWithoutPassword } = userJSON;
      return res.status(201).json({
        success: true,
        message: "Пользователь успешно зарегистрирован",
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
        throw new ValidationError("Email и пароль обязательны!");
      }
      const userAgent = req.headers["user-agent"];
      const tokensAndUser = await authService.authenticateUser({
        email,
        password,
        userAgent,
      });
      const { accessToken, refreshToken, user } = tokensAndUser;
      //Устанавливаем httpOnly куку с refresh-токеном
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true, // ❌ Недоступно из JavaScript (защита от XSS)
        secure: process.env.NODE_ENV === "production", // true только в production (HTTPS)
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 дней в миллисекундах
      });
      res.status(200).json({
        success: true,
        message: "Успешный вход в систему",
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
        throw new UnauthorizedError("Refresh token отсутствует");
      }

      const userAgent = req.headers["user-agent"];
      const tokensAndUser = await authService.refreshTokens(
        refreshToken,
        userAgent,
      );
      const {
        accessToken,
        refreshToken: newRefreshToken,
        user,
      } = tokensAndUser;
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
      res.status(200).json({
        success: true,
        message: "Токены успешно обновлены",
        data: { accessToken, user },
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new authController();
