import { NextFunction, Request, Response } from "express";
import { User, IUser } from "../models/users";
import { UserSignup, UserType } from "../interface/user.interface";
import bcrypt from "bcrypt";
import * as yup from "yup";
import Address, { IAddress } from "../models/address";
import OTP from "../models/phoneotp";
import twilio from "twilio";
import { AppError } from "../utils/appError";
import { catchAsync } from "@Utils/responseUtils";
// Twilio configuration

const client = twilio(process.env.ACCOUNT_SID, process.env.AUTHTOKEN);

// Define schema for a single address
const addressSchema = yup.object().shape({
  street: yup.string().notRequired(),
  city: yup.string().notRequired(),
  state: yup.string().notRequired(),
  zipCode: yup.string().notRequired(),
  country: yup.string().notRequired(),
});

// Define schema for an array of addresses
const addressArraySchema = yup.array().of(addressSchema).notRequired();

const signupSchema = yup.object({
  username: yup.string().notRequired(),
  email: yup.string().email().notRequired(),
  password: yup
    .string()
    .matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/, {
      message:
        "Password must be at least 8 characters long, with at least one uppercase letter, one number, and one special character.",
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
  phone: yup.string().required(),
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
  const user = new User(userData);
  return user.save();
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

// Function to generate and send OTP
const sendOtp = async (phone: string): Promise<void> => {
  try {
    // Generate a random OTP (e.g., 6 digits)
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // Set OTP expiration time (e.g., 10 minutes)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Save OTP to database
    await OTP.findOneAndUpdate(
      { phone },
      { otp, expiresAt },
      { upsert: true, new: true }
    );

    // Send OTP via SMS
    await client.messages.create({
      body: `Your OTP code is: ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER, // Replace with your Twilio phone number
      to: phone,
    });

    console.log("OTP sent successfully");
  } catch (error) {
    console.error("Error sending OTP:", error);
  }
};

// Function to verify OTP
const verifyOtp = async (phone: string, otp: string): Promise<boolean> => {
  // Find OTP from database
  const otpRecord = await OTP.findOne({ phone, otp }).exec();
  if (!otpRecord) {
    throw new AppError("Invalid OTP or OTP has expired", 400);
  }

  if (new Date() > otpRecord.expiresAt) {
    throw new AppError("OTP has expired", 400);
  }
  return true;
};
// Export the functions
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
};
