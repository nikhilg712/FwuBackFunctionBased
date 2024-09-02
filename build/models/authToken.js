"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const authtokenSchema = new mongoose_1.Schema({
    ipAddress: { type: String, required: true, index: true }, // search indexed
    tokenId: { type: String, required: true },
    MemberId: { type: String, required: true },
    AgencyId: { type: String, required: true },
}, { timestamps: true, _id: true });
const AuthToken = (0, mongoose_1.model)("AuthToken", authtokenSchema);
exports.default = AuthToken;
