// src/middleware/validateExpress.js
const { validationResult } = require("express-validator");

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            error: {
                code: 400,
                message: errors.array().map(err => err.msg).join(', '),
                type: "ValidationError"
            }
        });
    }
    
    next();
};

module.exports = handleValidationErrors;