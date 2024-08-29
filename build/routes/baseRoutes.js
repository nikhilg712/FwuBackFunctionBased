"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const baseRouter = (0, express_1.Router)();
// Initialize routes function
const initializeRoutes = (router) => {
    const path = "/";
    // // Define routes
    router.get(`${path}`, (request, response) => {
        response.send("Base routes");
    });
};
initializeRoutes(baseRouter);
exports.default = baseRouter;
