"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendApiRequest = sendApiRequest;
const axios_1 = __importDefault(require("axios"));
async function sendApiRequest({ url, method = "POST", // Default method to POST
data, headers = {
    "content-type": "application/json", // Default headers to content-type JSON
}, // Default headers to an empty object
 }) {
    const options = {
        url,
        method,
        headers,
        data,
    };
    try {
        const response = await (0, axios_1.default)(options);
        return response;
    }
    catch (err) {
        console.error("Error Response:", err.response ? err.response.data : err.message);
        throw err; // Re-throw the error to be handled by the caller
    }
}
