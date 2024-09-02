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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmailOtp = exports.sendEmail = exports.deleteCoTraveller = exports.findCoTravellersByUserId = exports.findCoTravellerById = exports.updateCoTraveller = exports.createCoTraveller = exports.resetPassword = exports.forgotPassword = exports.verifyOtp = exports.sendOtp = exports.createAddress = exports.signupSchema = exports.validatePassword = exports.createUser = exports.sayHello = void 0;
const users_1 = require("../models/users");
const cotraveller_1 = require("../models/cotraveller");
const bcrypt_1 = __importDefault(require("bcrypt"));
const yup = __importStar(require("yup"));
const address_1 = __importDefault(require("../models/address"));
const twilio_1 = __importDefault(require("twilio"));
const crypto_1 = __importDefault(require("crypto"));
const appError_1 = require("../utils/appError");
const dotenv_1 = __importDefault(require("dotenv"));
const microsoft_graph_client_1 = require("@microsoft/microsoft-graph-client");
const user_constants_1 = require("../constants/user.constants");
const otp_1 = __importDefault(require("../models/otp"));
const otp_template_1 = require("../views/otp-template");
const reset_password_template_1 = require("../views/reset-password-template");
dotenv_1.default.config();
// Twilio configuration
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
if (!accountSid || !authToken) {
    throw new Error("Twilio account SID and auth token must be set in environment variables.");
}
const client = (0, twilio_1.default)(accountSid, authToken);
const TENANT_ID = process.env.TENANT_ID;
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const getAccessToken = async () => {
    const url = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`;
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            grant_type: "client_credentials",
            client_id: CLIENT_ID || "",
            client_secret: CLIENT_SECRET || "",
            scope: "https://graph.microsoft.com/.default",
        }),
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await response.json();
    return data.access_token;
};
const createClient = async () => {
    const accessToken = await getAccessToken();
    return microsoft_graph_client_1.Client.init({
        authProvider: (done) => {
            done(null, accessToken);
        },
    });
};
// Define schema for a single address
const addressSchema = yup.object().shape({
    street: yup.string().notRequired(),
    city: yup.string().notRequired(),
    state: yup.string().notRequired(),
    zipCode: yup.string().notRequired(),
    country: yup.string().notRequired(),
});
const passwordSchema = yup.string().required("Password is required");
const userSchema = yup.object().shape({
    password: yup.string().required("User password is not set"),
});
// Define schema for an array of addresses
const addressArraySchema = yup.array().of(addressSchema).notRequired();
const signupSchema = yup.object({
    username: yup.string().notRequired(),
    email: yup.string().email().notRequired(),
    password: yup
        .string()
        .matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/, {
        message: user_constants_1.constants.PASSWORD_VALIDATION,
    })
        .notRequired(),
    gender: yup.string().oneOf(["Male", "Female", "Other"]).notRequired(),
    dateOfBirth: yup.date().notRequired(),
    passportNo: yup.string().notRequired(),
    passportExpiry: yup.date().notRequired(),
    passportIssuingCountry: yup.string().notRequired(),
    panNo: yup.string().notRequired(),
    nationality: yup.string().notRequired(),
    address: addressArraySchema,
    phone: yup.string().notRequired(),
    userType: yup.string().oneOf(["Admin", "Client"]).notRequired(),
    profilePic: yup.string().notRequired(),
    wallet: yup.number().notRequired(),
    refCode: yup.string().notRequired(),
    deviceId: yup.string().notRequired(),
    deviceToken: yup.string().notRequired(),
    googleId: yup.string().notRequired(),
});
exports.signupSchema = signupSchema;
/**
 * @function sayHello
 * @description Returns a greeting message.
 * @returns {object} - An object containing the greeting message.
 */
const sayHello = () => ({
    data: "hello",
});
exports.sayHello = sayHello;
const createAddress = async (address) => {
    const addressResponse = await address_1.default.insertMany(address);
    const addressIds = addressResponse.map((address) => address.id);
    return addressIds;
};
exports.createAddress = createAddress;
/**
 * @function createUser
 * @description Creates a new user in the database.
 * @param {UserType} userData - The user data to create.
 * @returns {Promise<UserType>} - A promise that resolves to the created user object.
 */
const createUser = async (userData) => {
    try {
        const user = new users_1.User(userData);
        return user.save();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }
    catch (err) {
        throw new appError_1.AppError("Error occured while signing up user", 500);
    }
};
exports.createUser = createUser;
/**
 * @function validatePassword
 * @description Validates the password entered by the user with the password stored in the database.
 * @param {string} inputPassword - The password entered by the user.
 * @param {string} storedPassword - The hashed password stored in the database.
 * @returns {Promise<boolean>} - A promise that resolves to a boolean indicating whether the password is valid.
 */
const validatePassword = async (inputPassword, storedPassword) => {
    return bcrypt_1.default.compare(inputPassword, storedPassword);
};
exports.validatePassword = validatePassword;
const sendEmailOtp = async (email) => {
    try {
        const otpValue = Math.floor(1000 + Math.random() * 9000).toString(); // Generate Random 6 digit number
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); //  Set OTP expiration time (e.g., 10 minutes)
        // Save OTP to database
        let otp = new otp_1.default({
            type: "email",
            email: email,
            otp: otpValue,
            expiresAt: expiresAt,
        });
        await otp.save();
        // Send OTP via Email
        let template = (0, otp_template_1.generateOTPTemplate)(otpValue);
        await sendEmail(email, template, "Email Verification");
        console.log("OTP sent successfully");
    }
    catch (error) {
        console.error("Error sending OTP:", error);
        throw new appError_1.AppError("Some problem with otp-sending", 400);
    }
};
exports.sendEmailOtp = sendEmailOtp;
// Function to generate and send OTP
const sendOtp = async (provider, email, phone) => {
    //await OTP.deleteMany({})
    if (provider === "email") {
        const otpValue = Math.floor(1000 + Math.random() * 9000).toString(); // Generate Random 6 digit number
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); //  Set OTP expiration time (e.g., 10 minutes)
        // Save OTP to database
        let otp = new otp_1.default({
            type: "email",
            email: email,
            otp: otpValue,
            expiresAt: expiresAt,
        });
        await otp.save();
        // Send OTP via Email
        let template = (0, otp_template_1.generateOTPTemplate)(otpValue);
        await sendEmail(email, template, "Email Verification");
        console.log("OTP sent successfully");
    }
    else if (provider === "phone") {
        const otpValue = Math.floor(1000 + Math.random() * 9000).toString(); // Generate Random 6 digit number
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); //  Set OTP expiration time (e.g., 10 minutes)
        // Save OTP to database
        let otp = new otp_1.default({
            type: "phone",
            phone: phone,
            otp: otpValue,
            expiresAt: expiresAt,
        });
        await otp.save();
        // Send OTP via SMS
        let otpResponse = await client.messages.create({
            body: `Dear Customer,
    
    Thank you for choosing Flew With Us. Your One-Time Password (OTP) for authentication is: ${otp.otp}
    
    This OTP is valid for the next 10 minutes. If you did not request this, please disregard this message.
    
    Best regards,
    The Flew With Us Team`,
            from: process.env.TWILIO_PHONE_NUMBER, // Replace with your Twilio phone number
            to: phone,
        });
        console.log("OTP sent successfully");
        console.log("OTP response: ", otpResponse);
    }
    else {
        throw new appError_1.AppError("Invalid auth provider", 400);
    }
};
exports.sendOtp = sendOtp;
// const verifyEmailOtp = async (email: string, otp: string): Promise<boolean> => {
//   // Find the newest OTP of a user
//   const otpRecord = await OTP.findOne().sort({ createdAt: -1 }).exec();
//   if (!otpRecord) {
//     throw new AppError("No OTP found for the provided email", 400);
//   } else if (otpRecord.otp !== otp) {
//     throw new AppError("Invalid OTP, Please try again", 400);
//   } else if (new Date().getTime() - otpRecord.expiresAt.getTime() > 0) {
//     throw new AppError("OTP Expired, Please try again", 400);
//   } else {
//     return true;
//   }
// };
// Function to verify OTP for email or phone
const verifyOtp = async (checkFor, data, otp) => {
    let otpRecord;
    if (checkFor === "email") {
        otpRecord = await otp_1.default.findOne({ email: data })
            .sort({ createdAt: -1 })
            .exec();
    }
    else if (checkFor === "phone") {
        otpRecord = await otp_1.default.findOne({ phone: data })
            .sort({ createdAt: -1 })
            .exec();
    }
    else {
        throw new appError_1.AppError("Invalid data type", 400);
    }
    if (!otpRecord) {
        throw new appError_1.AppError("No OTP found for the provided email", 400);
    }
    else if (otpRecord.otp !== otp) {
        throw new appError_1.AppError("Invalid OTP, Please try again", 400);
    }
    else if (new Date().getTime() - otpRecord.expiresAt.getTime() > 0) {
        throw new appError_1.AppError("OTP Expired, Please try again", 400);
    }
    else {
        return true;
    }
};
exports.verifyOtp = verifyOtp;
const createCoTraveller = async (userId, coTravelerData) => {
    const coTraveler = new cotraveller_1.CoTraveller({
        userId,
        ...coTravelerData,
    });
    return await coTraveler.save();
};
exports.createCoTraveller = createCoTraveller;
const updateCoTraveller = async (id, coTravelerData) => {
    const updatedCoTraveler = await cotraveller_1.CoTraveller.findByIdAndUpdate(id, coTravelerData, {
        new: true,
    }).exec();
    if (!updatedCoTraveler) {
        // Handle the case where no co-traveler was found
        return null; // Or throw an error if that's preferred
    }
    return updatedCoTraveler;
};
exports.updateCoTraveller = updateCoTraveller;
const findCoTravellersByUserId = async (userId) => {
    return await cotraveller_1.CoTraveller.find({ userId }).exec();
};
exports.findCoTravellersByUserId = findCoTravellersByUserId;
const findCoTravellerById = async (id) => {
    return await cotraveller_1.CoTraveller.findById(id).exec();
};
exports.findCoTravellerById = findCoTravellerById;
const deleteCoTraveller = async (id) => {
    return await cotraveller_1.CoTraveller.findByIdAndDelete(id).exec();
};
exports.deleteCoTraveller = deleteCoTraveller;
// Export the functions
const sendEmail = async (email, body, subject) => {
    const client = await createClient();
    await client.api("/users/support@flewwithus.com/sendMail").post({
        message: {
            subject: subject,
            body: {
                contentType: "HTML",
                content: body,
            },
            toRecipients: [
                {
                    emailAddress: {
                        address: email,
                    },
                },
            ],
        },
    });
};
exports.sendEmail = sendEmail;
const forgotPassword = async (email) => {
    const user = await users_1.User.findOne({ email });
    if (!user) {
        throw new Error(user_constants_1.constants.ERROR_MSG.NO_SUCH_USER);
    }
    // Generate a reset token
    const resetToken = crypto_1.default.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now
    // Update user with reset token and expiry
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiry = resetTokenExpiry;
    await user.save();
    // Create reset URL
    const resetUrl = `${user_constants_1.constants.URL.RESET_URL}?token=${resetToken}`;
    const htmlContent = (0, reset_password_template_1.passwordResetTemplate)(resetUrl);
    const client = await createClient();
    await client.api("/users/support@flewwithus.com/sendMail").post({
        message: {
            subject: "Reset Password",
            body: {
                contentType: "HTML",
                content: htmlContent,
            },
            toRecipients: [
                {
                    emailAddress: {
                        address: email,
                    },
                },
            ],
        },
    });
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (token, newPassword, confirmPassword) => {
    if (newPassword !== confirmPassword) {
        throw new appError_1.AppError(user_constants_1.constants.ERROR_MSG.PASSWORDS_DO_NOT_MATCH, 400);
    }
    const user = await users_1.User.findOne({
        resetPasswordToken: token,
        resetPasswordExpiry: { $gt: Date.now() },
    });
    if (!user) {
        throw new appError_1.AppError(user_constants_1.constants.ERROR_MSG.INVALID_TOKEN, 400);
    }
    // Hash the new password
    const salt = await bcrypt_1.default.genSalt(10);
    const hashedPassword = await bcrypt_1.default.hash(newPassword, salt);
    // Update user's password and clear reset token and expiry
    user.password = hashedPassword;
    await users_1.User.updateOne({ _id: user._id }, {
        $set: { password: hashedPassword },
        $unset: { resetPasswordToken: "", resetPasswordExpiry: "" },
    });
};
exports.resetPassword = resetPassword;
