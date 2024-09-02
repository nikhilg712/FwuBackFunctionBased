"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Airport = void 0;
const mongoose_1 = require("mongoose");
// Define the schema for the Airport document
const airportSchema = new mongoose_1.Schema({
    CITYNAME: { type: String, required: true, index: true }, // search indexed
    CITYCODE: { type: String, required: true },
    COUNTRYCODE: { type: String, required: true },
    COUNTRYNAME: { type: String, required: true },
    AIRPORTCODE: { type: String, required: true },
    AIRPORTNAME: { type: String, required: false },
}, { timestamps: true, _id: true });
// Create and export the Airport model
const Airport = (0, mongoose_1.model)("Airport", airportSchema);
exports.Airport = Airport;
