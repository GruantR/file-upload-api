//src/routes/index.js
const express = require('express');
const router = express.Router();
const File = require('../models/File');
const uploadRoutes = require('./uploadRoutes');


router.get("/", (req, res) => {
  res.send("Hello world");
});

router.get('/health', (req,res)=>{
    res.json({status: 'OK', timestamp: new Date().toISOString() })
});

router.get('/test-db', async (req, res) => {
  try {
    const count = await File.count();
    res.json({ 
      status: 'OK', 
      message: 'База данных работает',
      filesCount: count 
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      message: error.message 
    });
  }
});

router.use('/files',uploadRoutes);

module.exports = router;

