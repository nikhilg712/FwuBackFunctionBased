"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globalErrorHandler = (err, req, res, next) => {
    res.setHeader("Content-Type", "application/json");
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    }
    else {
        console.error("ERRORS:", err);
        res.status(500).json({
            status: "error",
            message: "Something went very wrong!",
        });
    }
};
exports.default = globalErrorHandler;
