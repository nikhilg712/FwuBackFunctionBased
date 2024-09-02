"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
// Define the route handler function
const index = async (req, res, next) => {
    res.send("hi BaseRoute");
};
// Create a function to initialize the routes and return the router
const createBaseRouter = () => {
    const router = (0, express_1.Router)();
    // Set up the routes
    router.get("/", index);
    return router;
};
exports.default = createBaseRouter;
