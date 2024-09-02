"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = String(statusCode).startsWith("4") ? "error" : "failure";
        this.isOperational = true; // TODO: If not needed then remove
        // Set the prototype explicitly to maintain correct instanceof behavior
        Object.setPrototypeOf(this, AppError.prototype);
    }
}
exports.AppError = AppError;
