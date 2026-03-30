// src/server.js
// Server startup only

require("dotenv").config();
const { initializeDatabase } = require("./models/index");
const app = require("./app");
const logger = require('./utils/logger');

const fs = require("fs").promises;

const PORT = process.env.PORT;
const UPLOADS_DIR = "./uploads";

async function ensureUploadsFolder() {
  try {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
    logger.info(`Uploads folder ${UPLOADS_DIR} created successfully`);
  } catch (err) {
    if (err.code === "EEXIST") {
      logger.info(`Uploads folder ${UPLOADS_DIR} already exists`);
    } else {
      logger.error("Error creating uploads folder:", err.message);
      throw err;
    }
  }
}

async function startServer() {
  try {
    await ensureUploadsFolder();

    // Docker "depends_on" doesn't guarantee DB readiness, so retry briefly.
    const maxAttempts = 10;
    const delayMs = 2000;
    let dbConnected = false;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      dbConnected = await initializeDatabase();
      if (dbConnected) break;
      logger.warn(`Waiting for database... (attempt ${attempt}/${maxAttempts})`);
      await new Promise((r) => setTimeout(r, delayMs));
    }

    if (!dbConnected) {
      throw new Error("Failed to connect to database");
    }

    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`📁 Database: ${process.env.DB_NAME}`);
    });
  } catch (err) {
    logger.error("❌ Server startup error:", err);
    logger.error("   Check:");
    logger.error("   1. Is PostgreSQL running?");
    logger.error("   2. Are the login/password correct in .env?");
    logger.error("   3. Does database", process.env.DB_NAME, "exist?");
    process.exit(1);
  }
}

startServer();