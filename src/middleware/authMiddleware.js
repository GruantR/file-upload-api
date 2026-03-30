// src/middleware/authMiddleware.js

const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { UnauthorizedError } = require("../utils/errors");

const authorizeToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedError("Authentication required");
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
      throw new UnauthorizedError("Token missing");
    }
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
    const userFromDecodedToken = await User.findOne({
      where: { uuid: decodedToken.userUuid },
    });
    if (!userFromDecodedToken) {
      throw new UnauthorizedError("User not found");
    }
    req.user = userFromDecodedToken;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = authorizeToken;