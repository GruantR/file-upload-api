//src/app.js 
// создание и настройка Express приложения

const express = require("express");
const app = express();
const router = require('./routes/index')

app.use('/api',router)



module.exports = app