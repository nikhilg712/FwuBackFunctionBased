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
exports.objectIdValidation = exports.genderValidation = exports.dobValidation = exports.userNameValidation = exports.phoneNumberValidation = exports.passwordValidation = exports.emailValidation = void 0;
const yup = __importStar(require("yup"));
exports.emailValidation = yup.string().email("Invalid email format");
exports.passwordValidation = yup
    .string()
    .min(4, "Password must be at least 4 characters long");
const phoneNumberRegex = /^(?:\(\d{3}\)\s?\d{3}-\d{4}|\d{10}|\+\d{1,4}\s?\d{10})$/;
exports.phoneNumberValidation = yup
    .string()
    .matches(phoneNumberRegex, "Invalid phone number format");
exports.userNameValidation = yup
    .string()
    .matches(/^[a-zA-Z0-9_]+$/, "Name can only contain letters, numbers, and underscores");
exports.dobValidation = yup.date();
exports.genderValidation = yup
    .string()
    .oneOf(["Male", "Female", "Other"], "Invalid gender value");
exports.objectIdValidation = yup
    .string()
    .matches(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId format");
