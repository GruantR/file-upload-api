//src/app.js 
// создание и настройка Express приложения

const express = require("express");
const errorHandler = require('./middleware/errorHandler');
const app = express();
const router = require('./routes/index')

app.use('/api',router)
app.use(errorHandler);


module.exports = app