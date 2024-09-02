"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.constants = void 0;
exports.constants = {
    ERROR_TYPE: {
        ERROR: "ERROR",
    },
    URL: {
        RESET_URL: "http://localhost:8000/fwu/api/v1/user/reset-password/",
    },
    ERROR_MSG: {
        NO_SUCH_USER: "No User Found",
        UNABLE_TO_CREATE_USER: "Error Creating User",
        EMAIL_ALREADY_EXISTS: "A user with provided Email Address already exists",
        PHONE_ALREADY_EXISTS: "A user with provided Phone Number address already exists",
        LOGIN_FAILED: "Login Failed",
        UNAUTHORIZED: "unauthorized",
        INCORRECT_EMAIL: "Incorrect Email",
        NOT_AUTHENTICATED: "User Not Authenticated",
        INCORRECT_PASSWORD: "Incorrect Password",
        COTRAVELLER_NOT_FOUND: "Co-Traveler Not Found",
        INVALID_PROVIDER: "Invalid authentication provider",
        INVALID_OTP_PROVIDER: "Invalid OTP Provider",
        UNABLE_TO_UPDATE_USER: "User Not Updated",
        PASSWORDS_DO_NOT_MATCH: "Passwords do not match",
        INVALID_TOKEN: "Invalid or expired token"
    },
    SUCCESS_MSG: {
        USER_CREATED: "User Created Successfully",
        LOGGED_IN: "Logged in Successfully",
        PROTECTED_ROUTE: "This is a protected route",
        LOGGED_OUT: "Successfully Logged Out",
        COTRAVELLER_CREATED: "Co-Traveller Created Successfully",
        COTRAVELLER_FETCHED: "Co-Traveller Fetched Successfully",
        COTRAVELLER_DELETED: "Co-Traveller Deleted Successfully",
        OTP_SENT_TO_EMAIL: "Otp Sent Successfully to Email",
        OTP_SENT_TO_PHONE: "Otp Sent Successfully to Phone",
        AUTHENTICATED: "Authenticated",
        PROFILE_UPDATED: "Profile updated successfully",
    },
    ACCOUNT_NOT_FOUND: "ACCOUNT_NOT_FOUND",
    USER_TYPE_INDIVIDUAL: "Individual",
    USER_TYPE_AGENT: "AGENT",
    PASSWORD_VALIDATION: "Password must be at least 8 characters long, with at least one uppercase letter, one number, and one special character.",
};
