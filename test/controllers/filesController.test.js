// test/controllers/filesController.test.js
const request = require("../__helpers__/setup");
const path = require("path");

describe("File", () => {
  let accessToken;
  const userData = {
    email: "files@example.com",
    password: "123456",
  };

  beforeAll(async () => {
    await request.post("/api/auth/register").send(userData);
    const loginData = await request.post("/api/auth/login").send(userData);
    accessToken = loginData.body.data.accessToken;
  });

  describe("POST /files", () => {
    it("should upload a file successfully", async () => {
      const response = await request
        .post("/api/files?storage=local")
        .set("Authorization", `Bearer ${accessToken}`)
        .attach(
          "file",
          path.join(__dirname, '../__fixtures__/test-image.jpg'),
        );

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.file).toHaveProperty("uuid");
      expect(response.body.file.name).toBe("test-image.jpg");
    });
  });
  describe("GET /files", () => {
    it("should return list of files with pagination", async () => {
      const response = await request
        .get("/api/files")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.files)).toBe(true);
      expect(response.body.pagination).toHaveProperty("total");
      expect(response.body.pagination).toHaveProperty("limit");
      expect(response.body.pagination).toHaveProperty("offset");
    });
  });
  describe("GET /files/:uuid", () => {
    let fileUuid;
    const nonExistentUuid = "a3bb7f8d-8f4e-4a1c-9b2e-7d3f5a6c8e9d";

    beforeAll(async () => {
      const uploadRes = await request
        .post("/api/files?storage=local")
        .set("Authorization", `Bearer ${accessToken}`)
        .attach(
          "file",
          path.join(__dirname, '../__fixtures__/test-image.jpg'),
        );
      fileUuid = uploadRes.body.file.uuid;
    });

    it("should get file by uuid", async () => {
      const response = await request
        .get(`/api/files/${fileUuid}`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
    });

    it("should return 404 for non-existent uuid", async () => {
      const response = await request
        .get(`/api/files/${nonExistentUuid}`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(404);
    });
  });
});
