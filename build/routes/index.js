"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const baseRoutes_1 = __importDefault(require("./baseRoutes"));
const homeRoutes_1 = __importDefault(require("../routes/homeRoutes"));
const userRoutes_1 = __importDefault(require("../routes/userRoutes"));
/**
 * Function to initialize all routes.
 *
 * @param app - The express application instance.
 */
const initializeRoutes = (app) => {
    //Set up routes
    app.use("/fwu/api/v1/", baseRoutes_1.default);
    app.use("/fwu/api/v1/home/", homeRoutes_1.default);
    app.use("/fwu/api/v1/user/", userRoutes_1.default);
};
exports.default = initializeRoutes;
