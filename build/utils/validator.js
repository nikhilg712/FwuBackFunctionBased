"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.profileUpdateValidator = exports.phoneNumberValidator = exports.emailOTPValidator = void 0;
const yup = __importStar(require("yup"));
const validation_1 = require("./validation");
exports.emailOTPValidator = yup.object().shape({
    email: validation_1.emailValidation.required("Email is required"),
    password: validation_1.passwordValidation.required("Password is required"),
});
exports.phoneNumberValidator = yup.object().shape({
    phone: validation_1.phoneNumberValidation.required("Phone number is required"),
});
exports.profileUpdateValidator = yup.object().shape({
    _id: validation_1.objectIdValidation,
    username: validation_1.userNameValidation.required("Username is required"),
    dateOfBirth: validation_1.dobValidation.required("Date of birth is required"),
    gender: validation_1.genderValidation.required("Gender is required"),
});
