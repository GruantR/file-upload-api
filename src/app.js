//src/app.js 
// создание и настройка Express приложения

const express = require("express");
const errorHandler = require('./middleware/errorHandler');
const app = express();
const router = require('./routes/index');
const cookieParser = require('cookie-parser');
const FRONTEND_URL = 'http://127.0.0.1:5500';

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', FRONTEND_URL);
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api',router)
app.use(errorHandler);


module.exports = app