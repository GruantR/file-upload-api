//src/services/authService.js
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { ConflictError, UnauthorizedError } = require("../utils/errors");

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
  async authenticateUser(userEmailAndPassword) {
    const { email, password } = userEmailAndPassword;
    const normalizedEmail = email.trim().toLocaleLowerCase();
    const user = await User.findOne({ where: { email: normalizedEmail } });
    if (!user) {
      throw new UnauthorizedError("Неверный email или пароль");
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError("Неверный email или пароль");
    }
    const token = jwt.sign(
      { userUuid: user.uuid },
      process.env.SECRET_KEY,
      { expiresIn: "7d" },
    );
    return {
      token,
      user: {
        uuid: user.uuid,
        email: user.email,
      },
    };
  }
}

module.exports = new authService();
