"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
// Define the enum for gender
var Gender;
(function (Gender) {
    Gender["Male"] = "Male";
    Gender["Female"] = "Female";
    Gender["Other"] = "Other";
})(Gender || (Gender = {}));
// Create the schema with the IUser type
const userSchema = new mongoose_1.Schema({
    username: { type: String, unique: false, defaultValue: "" },
    email: { type: String, unique: false },
    password: { type: String },
    gender: {
        type: String,
        enum: Object.values(Gender),
        defaultValue: Gender.Male,
    },
    dateOfBirth: { type: Date },
    passportNo: { type: String },
    passportExpiry: { type: Date },
    passportIssuingCountry: { type: String },
    panNo: { type: String },
    nationality: { type: String },
    address: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Address" }],
    phone: { type: String },
    userType: { type: String, enum: ["Admin", "Client"], default: "Client" },
    profilePic: { type: String },
    wallet: { type: Number, default: 0 },
    refCode: { type: String },
    deviceId: { type: String },
    deviceToken: { type: String },
    googleId: { type: String, unique: false },
    resetPasswordExpiry: { type: Number },
    resetPasswordToken: { type: String },
    isVerified: { type: Boolean, default: false },
}, { timestamps: true });
const User = (0, mongoose_1.model)("User", userSchema);
exports.User = User;
