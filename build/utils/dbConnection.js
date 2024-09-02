"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
mongoose_1.default.set("strictQuery", false);
const dbConnection = async () => {
    const url = process.env.MONGODB_URI;
    if (!url) {
        throw new Error("MONGODB_URI is not defined in the environment variables");
    }
    try {
        await mongoose_1.default.connect(url);
        console.log("DB connected successfully for FWU DATABASE");
    }
    catch (error) {
        if (error instanceof Error) {
            console.error("Error connecting to the database:", error.message);
        }
        else {
            console.error("An unknown error occurred");
            // TODO: throw error
        }
    }
};
exports.default = dbConnection;
