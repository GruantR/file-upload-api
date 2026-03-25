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
                message: { type: "string" },
                type: { type: "string", example: "ValidationError" },
              },
            },
          },
        },
        // Generic error response (409, 401, 403, 404)
        CustomErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            error: {
              type: "object",
              properties: {
                code: { type: "number" },
                message: { type: "string" },
                type: { type: "string" },
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
                message: { type: "string" },
                type: { type: "string", example: "ServerError" },
              },
            },
          },
        },
        RegisterSuccessResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: {
              type: "string",
              example: "User successfully registered",
            },
            data: {
              type: "object",
              properties: {
                uuid: { type: "string", format: "uuid" },
                email: { type: "string", format: "email" },
                createdAt: { type: "string", format: "date-time" },
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
                  example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                },
                user: {
                  type: "object",
                  properties: {
                    uuid: { type: "string", format: "uuid" },
                    email: { type: "string", format: "email" },
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
            uuid: {
              type: "string",
              format: "uuid",
              example: "123e4567-e89b-12d3-a456-426614174000",
            },
            name: { type: "string", example: "photo.jpg" },
            size: { type: "integer", example: 271277 },
            type: { type: "string", example: "image/jpeg" },
            storedName: {
              type: "string",
              example: "1742901234567-123456789-photo.jpg",
            },
            createdAt: { type: "string", format: "date-time" },
            storageType: {
              type: "string",
              enum: ["localStorage", "s3Storage"],
              example: "localStorage",
            },
          },
        },
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
                  example:
                    "Too many requests, please try again later. Try again in 45 seconds.",
                },
                type: { type: "string", example: "RateLimitError" },
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