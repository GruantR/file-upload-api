//src/controllers/__tests__/authController.test.js
const request = require('../__helpers__/setup');

describe("Auth", () => {
  describe("POST /auth/register", () => {
    it("should register a new user", async () => {
      const response = await request.post("/api/auth/register").send({
        email: "test@example.com",
        password: "123456",
      });
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("User successfully registered");
      expect(response.body.data).toHaveProperty("uuid");
      expect(response.body.data.email).toBe("test@example.com");
      expect(response.body.data).not.toHaveProperty("password");
    });

    it("should return 409 if email already exists", async () => {
      const userData = {
        email: "duplicate@example.com",
        password: "123456",
      };
      await request.post("/api/auth/register").send(userData);
      const response = await request.post("/api/auth/register").send(userData);

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.error.type).toBe("ConflictError");
    });

    it("should return 400 if password is too short", async () => {
      const response = await request.post("/api/auth/register").send({
        email: "test@example.com",
        password: "123",
      });
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain("at least 6 characters");
      expect(response.body.error.type).toBe("ValidationError");
    });

    it("should return 400 if email is missing", async () => {
      const response = await request.post("/api/auth/register").send({
        password: "123456",
      });
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.type).toBe("ValidationError");
    });

    it("should return 400 if password is missing", async () => {
      const response = await request.post("/api/auth/register").send({
        email: "test@example.com",
      });
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.type).toBe("ValidationError");
    });
    it("should return 400 if email format is invalid", async () => {
      const response = await request.post("/api/auth/register").send({
        email: "invalid-email",
        password: "123456",
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.type).toBe("ValidationError");
    });
  });

  describe("POST /auth/login", () => {
    const createUser = async () => {
      await request.post("/api/auth/register").send({
        email: "login@example.com",
        password: "123456",
      });
    };

    it("should login successfully with valid credentials", async () => {
      await createUser();

      const response = await request.post("/api/auth/login").send({
        email: "login@example.com",
        password: "123456",
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Login successful");
      expect(response.body.data).toHaveProperty("accessToken");
      expect(response.body.data.user).toHaveProperty("uuid");
      expect(response.body.data.user.email).toBe("login@example.com");
    });

    it("should return 401 with wrong password", async () => {
      await createUser();

      const response = await request.post("/api/auth/login").send({
        email: "login@example.com",
        password: "wrongpassword",
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.type).toBe("UnauthorizedError");
      expect(response.body.error.message).toContain(
        "Invalid email or password",
      );
    });

    it("should return 401 with non-existent email", async () => {
      const response = await request.post("/api/auth/login").send({
        email: "nonexistent@example.com",
        password: "123456",
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.type).toBe("UnauthorizedError");
    });

    it("should return 400 if email is missing", async () => {
      const response = await request.post("/api/auth/login").send({
        password: "123456",
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.type).toBe("ValidationError");
    });

    it("should return 400 if password is missing", async () => {
      const response = await request.post("/api/auth/login").send({
        email: "test@example.com",
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.type).toBe("ValidationError");
    });
    it("should return 400 if email format is invalid", async () => {
      const response = await request.post("/api/auth/login").send({
        email: "invalid-email",
        password: "123456",
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.type).toBe("ValidationError");
    });
  });
  describe("POST /auth/refresh", () => {
    let refreshToken;

    beforeEach(async () => {
      // Регистрируем и логинимся перед каждым тестом
      await request.post("/api/auth/register").send({
        email: "refresh@example.com",
        password: "123456",
      });

      const loginRes = await request.post("/api/auth/login").send({
        email: "refresh@example.com",
        password: "123456",
      });

      // Сохраняем refreshToken из cookie
      refreshToken = loginRes.headers["set-cookie"][0]
        .split(";")[0]
        .split("=")[1];
    });

    it("should return new access token with valid refresh token", async () => {
      const response = await request
        .post("/api/auth/refresh")
        .set("Cookie", [`refreshToken=${refreshToken}`]);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Tokens successfully refreshed");
      expect(response.body.data).toHaveProperty("accessToken");
      expect(response.body.data.user).toHaveProperty("uuid");
    });

    it("should return 401 with invalid refresh token", async () => {
      const response = await request
        .post("/api/auth/refresh")
        .set("Cookie", ["refreshToken=invalid-token"]);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.type).toBe("UnauthorizedError");
    });
  });
  describe("POST /auth/logout", () => {
    let refreshToken;

    beforeEach(async () => {
      await request.post("/api/auth/register").send({
        email: "logout@example.com",
        password: "123456",
      });

      const loginRes = await request.post("/api/auth/login").send({
        email: "logout@example.com",
        password: "123456",
      });

      refreshToken = loginRes.headers["set-cookie"][0]
        .split(";")[0]
        .split("=")[1];
    });

    it("should logout successfully", async () => {
      const response = await request
        .post("/api/auth/logout")
        .set("Cookie", [`refreshToken=${refreshToken}`]);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Logout successful");
    });

    it("should invalidate refresh token after logout", async () => {
      // Логинимся
      const loginRes = await request.post("/api/auth/login").send({
        email: "logout@example.com",
        password: "123456",
      });
      const token = loginRes.headers["set-cookie"][0]
        .split(";")[0]
        .split("=")[1];

      // Выходим
      await request
        .post("/api/auth/logout")
        .set("Cookie", [`refreshToken=${token}`]);

      // Пытаемся обновить токен
      const refreshRes = await request
        .post("/api/auth/refresh")
        .set("Cookie", [`refreshToken=${token}`]);

      expect(refreshRes.status).toBe(401);
    });
  });
});
