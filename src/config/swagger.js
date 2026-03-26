const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "FileFlow Hub API",
      version: "1.0.0",
      description: "Hybrid file storage with S3 support",
    },
    servers: [
      {
        url: "http://localhost:3000/api",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        // Base error response
        BaseErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string" },
          },
          required: ["success", "message"],
        },
        // Validation error response (400)
        ValidationErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            error: {
              type: "object",
              properties: {
                code: { type: "number", example: 400 },
                message: { type: "string", example: "Invalid UUID format" },
                type: { type: "string", example: "ValidationError" },
              },
            },
          },
        },
        // Generic error response (401, 403, 404, 409)
        CustomErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            error: {
              type: "object",
              properties: {
                code: { type: "number", example: 404 },
                message: { type: "string", example: "File not found" },
                type: { type: "string", example: "NotFoundError" },
              },
            },
          },
        },
        // Server error response (500)
        ErrorWithTextResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            error: {
              type: "object",
              properties: {
                code: { type: "number", example: 500 },
                message: { type: "string", example: "Internal server error" },
                type: { type: "string", example: "ServerError" },
              },
            },
          },
        },
        // Rate limit error response (429)
        RateLimitErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            error: {
              type: "object",
              properties: {
                code: { type: "number", example: 429 },
                message: {
                  type: "string",
                  example: "Too many requests, please try again later. Try again in 45 seconds.",
                },
                type: { type: "string", example: "RateLimitError" },
              },
            },
          },
        },
        // Success responses
        RegisterSuccessResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "User successfully registered" },
            data: {
              type: "object",
              properties: {
                uuid: { type: "string", format: "uuid", example: "123e4567-e89b-12d3-a456-426614174000" },
                email: { type: "string", format: "email", example: "user@example.com" },
                createdAt: { type: "string", format: "date-time", example: "2026-03-25T10:00:00.000Z" },
              },
            },
          },
        },
        LoginSuccessResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Login successful" },
            data: {
              type: "object",
              properties: {
                accessToken: {
                  type: "string",
                  example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyVXVpZCI6IjEyM2U0NTY3LWU4OWItMTJkMy1hNDU2LTQyNjYxNDE3NDAwMCIsImlhdCI6MTc0Mjg5NjAwMCwiZXhwIjoxNzQyOTgxMjAwfQ.ABC123",
                },
                user: {
                  type: "object",
                  properties: {
                    uuid: { type: "string", format: "uuid", example: "123e4567-e89b-12d3-a456-426614174000" },
                    email: { type: "string", format: "email", example: "user@example.com" },
                  },
                },
              },
            },
          },
        },
        FileResponse: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            uuid: { type: "string", format: "uuid", example: "123e4567-e89b-12d3-a456-426614174000" },
            name: { type: "string", example: "photo.jpg" },
            size: { type: "integer", example: 271277 },
            type: { type: "string", example: "image/jpeg" },
            storedName: { type: "string", example: "1742901234567-123456789-photo.jpg" },
            createdAt: { type: "string", format: "date-time", example: "2026-03-25T10:00:00.000Z" },
            storageType: { type: "string", enum: ["localStorage", "s3Storage"], example: "localStorage" },
          },
        },
        FileListResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            files: {
              type: "array",
              items: { $ref: "#/components/schemas/FileResponse" },
            },
            pagination: {
              type: "object",
              properties: {
                total: { type: "integer", example: 42 },
                limit: { type: "integer", example: 10 },
                offset: { type: "integer", example: 0 },
                hasMore: { type: "boolean", example: true },
              },
            },
          },
        },
        DeleteFileResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            deleteFile: {
              type: "object",
              properties: {
                id: { type: "integer", example: 1 },
                name: { type: "string", example: "photo.jpg" },
                storedName: { type: "string", example: "1742901234567-123456789-photo.jpg" },
              },
            },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./src/routes/*.js", "./src/models/*.js"],
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };