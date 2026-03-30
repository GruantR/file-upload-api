// src/app.js
// Express application setup and configuration

const express = require("express");
const path = require("path");
const errorHandler = require('./middleware/errorHandler');
const app = express();
const router = require('./routes/index');
const cookieParser = require('cookie-parser');
// Dev frontends (Live Server, etc.) — must match browser Origin for CORS + cookies.
const ALLOWED_DEV_ORIGINS = new Set([
    "http://127.0.0.1:5500",
    "http://localhost:5500",
]);
const { swaggerUi, specs } = require('./config/swagger');
const frontendRoot = path.resolve(__dirname, "..", "frontend");

app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && ALLOWED_DEV_ORIGINS.has(origin)) {
        res.header("Access-Control-Allow-Origin", origin);
    }
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

app.use('/api', router);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Serve demo front-end from the same origin as the API.
app.use(express.static(frontendRoot));
app.get("/", (req, res) => res.sendFile(path.join(frontendRoot, "index.html")));
app.use(errorHandler);

module.exports = app;