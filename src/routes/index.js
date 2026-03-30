// src/routes/index.js
const express = require('express');
const router = express.Router();
const { sequelize } = require('../models');
const redis = require('../config/redis');
const uploadRoutes = require('./uploadRoutes');
const authRoutes = require('./authRoutes');

router.get("/", (req, res) => {
  res.send("Hello world");
});

router.get('/health', async (req, res) => {
  // Health should NOT depend on existing tables.
  // We only check DB connectivity (authenticate) and optionally Redis (ping).
  const timestamp = new Date().toISOString();

  let dbOk = false;
  let redisOk = true;
  let dbError = null;
  let redisError = null;

  try {
    await sequelize.authenticate();
    dbOk = true;
  } catch (err) {
    dbOk = false;
    dbError = err?.message || String(err);
  }

  if (dbOk) {
    try {
      await redis.ping();
      redisOk = true;
    } catch (err) {
      redisOk = false;
      redisError = err?.message || String(err);
    }
  }

  const payload = {
    status: dbOk ? 'OK' : 'ERROR',
    timestamp,
  };

  // Keep response compact; include diagnostics only when something is wrong.
  if (!dbOk) {
    payload.details = { db: dbError };
  } else if (!redisOk) {
    payload.details = { redis: redisError };
  }

  return res.json(payload);
});

router.get('/test-db', async (req, res) => {
  try {
    const File = require('../models/File');
    const count = await File.count();
    res.json({ 
      status: 'OK', 
      message: 'Database is working',
      filesCount: count 
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      message: error.message 
    });
  }
});

router.use('/files', uploadRoutes);
router.use('/auth', authRoutes);

module.exports = router;