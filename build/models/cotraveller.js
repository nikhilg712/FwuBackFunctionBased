"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoTraveller = void 0;
const mongoose_1 = require("mongoose");
const coTravellerSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    gender: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    passportNo: { type: String, required: true },
    passportExpiry: { type: Date, required: true },
    passportIssuingCountry: {
        countryCode: { type: String, required: true },
        countryName: { type: String, required: true },
    },
    panNo: { type: String, required: true },
    nationality: {
        countryCode: { type: String, required: true },
        countryName: { type: String, required: true },
    },
    address: [
        {
            street: { type: String, required: true },
            city: { type: String, required: true },
            state: { type: String, required: true },
            zipCode: { type: String, required: true },
            country: { type: String, required: true },
        },
    ],
    phone: { type: String, required: true },
    profilePic: { type: String },
}, { timestamps: true });
const CoTraveller = (0, mongoose_1.model)("CoTraveller", coTravellerSchema);
exports.CoTraveller = CoTraveller;
