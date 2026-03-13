//src/controllers/authController.js

const authService = require("../services/authService");
const { ValidationError } = require("../utils/errors");

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
      const tokenAndUser = await authService.authenticateUser({ email, password });
      const {token, user} = tokenAndUser;
      res.status(200).json({
        success: true,
        message: "Успешный вход в систему",
        data: { token, user },
      })

    } catch (err) {
      next(err);
    }
  }
}

module.exports = new authController();
