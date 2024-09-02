"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuthenticated = void 0;
// Middleware to check if the user is authenticated
const isAuthenticated = (request, response, next) => {
    if (request.isAuthenticated()) {
        return next(); // User is authenticated, proceed to the next handler
    }
    else {
        response.status(401).json({
            status: "fail",
            message: "User is not authenticated",
        });
    }
};
exports.isAuthenticated = isAuthenticated;
