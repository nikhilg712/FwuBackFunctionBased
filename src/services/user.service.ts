import { NextFunction, Request, Response } from "express";
import { User, IUser } from "../models/users";
import { CoTraveller, ICoTraveller } from "../models/cotraveller";
import {
  UserSignup,
  UserType,
  CoTravellerType,
} from "../interface/user.interface";
import bcrypt from "bcrypt";
import * as yup from "yup";
import Address, { IAddress } from "../models/address";
import twilio from "twilio";
import crypto from "crypto";
import { AppError } from "../utils/appError";
import dotenv from "dotenv";
import { Client } from "@microsoft/microsoft-graph-client";
import { constants } from "../constants/user.constants";
import OTP from "../models/otp";
import { generateOTPTemplate } from "../views/otp-template";

dotenv.config();
// Twilio configuration
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);
const TENANT_ID = process.env.TENANT_ID;
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

const getAccessToken = async (): Promise<string> => {
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
  const data: any = await response.json();

  return data.access_token;
};

const createClient = async (): Promise<Client> => {
  const accessToken = await getAccessToken();
  return Client.init({
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
      message: constants.PASSWORD_VALIDATION,
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

/**
 * @function sayHello
 * @description Returns a greeting message.
 * @returns {object} - An object containing the greeting message.
 */
const sayHello = (): { data: string } => ({
  data: "hello",
});

const createAddress = async (address: IAddress): Promise<IAddress[]> => {
  const addressResponse = await Address.insertMany(address);
  const addressIds = addressResponse.map((address) => address.id);
  return addressIds;
};

/**
 * @function createUser
 * @description Creates a new user in the database.
 * @param {UserType} userData - The user data to create.
 * @returns {Promise<UserType>} - A promise that resolves to the created user object.
 */
const createUser = async (userData: IUser): Promise<IUser> => {
  try {
    const user = new User(userData);
    return user.save();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    throw new AppError("Error occured while signing up user", 500);
  }
};

/**
 * @function findUserByUsername
 * @description Retrieves user details from the database by username.
 * @param {string} username - The username of the user to retrieve.
 * @returns {Promise<UserType | null>} - A promise that resolves to the user object or null if not found.
 */
const findUserByUsername = async (username: string): Promise<IUser | null> => {
  return User.findOne({ username }).exec();
};

/**
 * @function findUserByEmail
 * @description Retrieves user details from the database by email.
 * @param {string} email - The email of the user to retrieve.
 * @returns {Promise<UserType | null>} - A promise that resolves to the user object or null if not found.
 */
const findUserByEmail = async (email: string): Promise<IUser | null> => {
  return User.findOne({ email }).exec();
};

/**
 * @function validatePassword
 * @description Validates the password entered by the user with the password stored in the database.
 * @param {string} inputPassword - The password entered by the user.
 * @param {string} storedPassword - The hashed password stored in the database.
 * @returns {Promise<boolean>} - A promise that resolves to a boolean indicating whether the password is valid.
 */
const validatePassword = async (
  inputPassword: string,
  storedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(inputPassword, storedPassword);
};

/**
 * @function findUserById
 * @description Retrieves user details from the database by ID.
 * @param {string} id - The ID of the user to retrieve.
 * @returns {Promise<UserType | null>} - A promise that resolves to the user object or null if not found.
 */
const findUserById = async (id: string): Promise<IUser | null> => {
  return User.findById(id).exec();
};

const sendEmailOtp = async (email: string): Promise<void> => {
  try {
    const otpValue = Math.floor(1000 + Math.random() * 9000).toString(); // Generate Random 6 digit number
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); //  Set OTP expiration time (e.g., 10 minutes)

    // Save OTP to database
    let otp = new OTP({
      type: "email",
      email: email,
      otp: otpValue,
      expiresAt: expiresAt,
    });
    await otp.save();

    // Send OTP via Email
    let template = generateOTPTemplate(otpValue);
    await sendEmail(email, template, "Email Verification");
    console.log("OTP sent successfully");
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw new AppError("Some problem with otp-sending", 400);
  }
};

// Function to generate and send OTP
const sendOtp = async (
  provider: string,
  email: string | null,
  phone: string | null
): Promise<void> => {
  //await OTP.deleteMany({})
  if (provider === "email") {
    const otpValue = Math.floor(1000 + Math.random() * 9000).toString(); // Generate Random 6 digit number
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); //  Set OTP expiration time (e.g., 10 minutes)

    // Save OTP to database
    let otp = new OTP({
      type: "email",
      email: email,
      otp: otpValue,
      expiresAt: expiresAt,
    });
    await otp.save();

    // Send OTP via Email
    let template = generateOTPTemplate(otpValue);
    await sendEmail(email!, template, "Email Verification");
    console.log("OTP sent successfully");
  } else if (provider === "phone") {
    const otpValue = Math.floor(1000 + Math.random() * 9000).toString(); // Generate Random 6 digit number
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); //  Set OTP expiration time (e.g., 10 minutes)

    // Save OTP to database
    let otp = new OTP({
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
      to: phone!,
    });

    console.log("OTP sent successfully");
    console.log("OTP response: ", otpResponse);
  } else {
    throw new AppError("Invalid auth provider", 400);
  }
};

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
const verifyOtp = async (
  checkFor: string,
  data: string,
  otp: string
): Promise<boolean> => {
  let otpRecord;
  if (checkFor === "email") {
    otpRecord = await OTP.findOne({ email: data })
      .sort({ createdAt: -1 })
      .exec();
  } else if (checkFor === "phone") {
    otpRecord = await OTP.findOne({ phone: data })
      .sort({ createdAt: -1 })
      .exec();
  } else {
    throw new AppError("Invalid data type", 400);
  }

  if (!otpRecord) {
    throw new AppError("No OTP found for the provided email", 400);
  } else if (otpRecord.otp !== otp) {
    throw new AppError("Invalid OTP, Please try again", 400);
  } else if (new Date().getTime() - otpRecord.expiresAt.getTime() > 0) {
    throw new AppError("OTP Expired, Please try again", 400);
  } else {
    return true;
  }
};

const createCoTraveller = async (
  userId: string,
  coTravelerData: object
): Promise<CoTravellerType> => {
  const coTraveler = new CoTraveller({
    userId,
    ...coTravelerData,
  });
  return await coTraveler.save();
};

/**
 * @function updateCoTraveler
 * @description Updates a co-traveler by ID.
 * @param {string} id - The ID of the co-traveler to update.
 * @param {Partial<CoTraveller>} coTravelerData - The co-traveler data to update.
 * @returns {Promise<CoTraveller | null>} - A promise that resolves to the updated co-traveler object or null if not found.
 */
const updateCoTraveller = async (
  id: string,
  coTravelerData: CoTravellerType
): Promise<CoTravellerType | null> => {
  const updatedCoTraveler = await CoTraveller.findByIdAndUpdate(
    id,
    coTravelerData,
    {
      new: true,
    }
  ).exec();

  if (!updatedCoTraveler) {
    // Handle the case where no co-traveler was found
    return null; // Or throw an error if that's preferred
  }

  return updatedCoTraveler;
};

/**
 * @function findCoTravelersByUserId
 * @description Retrieves co-travelers by user ID.
 * @param {string} userId - The ID of the user to retrieve co-travelers for.
 * @returns {Promise<CoTraveller[]>} - A promise that resolves to an array of co-travelers.
 */

const findCoTravellersByUserId = async (
  userId: string
): Promise<CoTravellerType[]> => {
  return await CoTraveller.find({ userId }).exec();
};

/**
 * @function findCoTravelerById
 * @description Retrieves a co-traveler by ID.
 * @param {string} id - The ID of the co-traveler to retrieve.
 * @returns {Promise<CoTraveller | null>} - A promise that resolves to the co-traveler object or null if not found.
 */

const findCoTravellerById = async (
  id: string
): Promise<CoTravellerType | null> => {
  return await CoTraveller.findById(id).exec();
};

/**
 * @function deleteCoTraveler
 * @description Deletes a co-traveler by ID.
 * @param {string} id - The ID of the co-traveler to delete.
 * @returns {Promise<CoTraveller | null>} - A promise that resolves to the deleted co-traveler object or null if not found.
 */

const deleteCoTraveller = async (
  id: string
): Promise<CoTravellerType | null> => {
  return await CoTraveller.findByIdAndDelete(id).exec();
};
// Export the functions

const sendEmail = async (
  email: string,
  body: string,
  subject: string
): Promise<void> => {
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

const forgotPassword = async (email: string): Promise<void> => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User doesn't exist");
  }

  // Generate a reset token
  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now

  // Update user with reset token and expiry
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpiry = resetTokenExpiry;
  await user.save();

  // Create reset URL
  const resetUrl = `http://localhost:8000/fwu/api/v1/user/reset-password/?token=${resetToken}`;
  const htmlContent = `
    <p>Click the link below to reset your password:</p>
    <p><a href="${resetUrl}">Click here</a></p>
  `;
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

const resetPassword = async (
  token: string,
  newPassword: string,
  confirmPassword: string
) => {
  if (newPassword !== confirmPassword) {
    throw new AppError("Passwords do not match", 400);
  }

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpiry: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError("Invalid or expired token", 400);
  }

  // Hash the new password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  // Update user's password and clear reset token and expiry
  user.password = hashedPassword;
  await User.updateOne(
    { _id: user._id },
    {
      $set: { password: hashedPassword },
      $unset: { resetPasswordToken: "", resetPasswordExpiry: "" },
    }
  );
};

export {
  sayHello,
  createUser,
  findUserByUsername,
  findUserByEmail,
  validatePassword,
  findUserById,
  signupSchema,
  createAddress,
  sendOtp,
  verifyOtp,
  forgotPassword,
  resetPassword,
  createCoTraveller,
  updateCoTraveller,
  findCoTravellerById,
  findCoTravellersByUserId,
  deleteCoTraveller,
  sendEmail,
  sendEmailOtp,
};
