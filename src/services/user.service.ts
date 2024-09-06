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
import { passwordResetTemplate } from "../views/reset-password-template";
import fs from "fs";
import puppeteer from "puppeteer";
import path from "path";
dotenv.config();
// Twilio configuration
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
if (!accountSid || !authToken) {
  throw new Error(
    "Twilio account SID and auth token must be set in environment variables."
  );
}
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

const sayHello = (): { data: string } => ({
  data: "hello",
});

const createAddress = async (address: IAddress): Promise<IAddress[]> => {
  try {
    const addressResponse = await Address.insertMany(address);
    const addressIds = addressResponse.map((address) => address.id);
    return addressIds;
  } catch (error: any) {
    throw new AppError(error.message, 400);
  }
};

const createUser = async (userData: IUser): Promise<IUser> => {
  try {
    const user = new User(userData);
    return user.save();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    throw new AppError("Error occured while signing up user", 500);
  }
};

const validatePassword = async (
  inputPassword: string,
  storedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(inputPassword, storedPassword);
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
    await sendEmail(email, template, "Email Verification", "");
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
    await sendEmail(email!, template, "Email Verification", "");
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
  request: Request,
  response: Response,
  next: NextFunction
): Promise<CoTravellerType> => {
  const user = request.user as { id: string };
  const userId = user.id;

  const coTravellerData = request.body;
  const coTraveler = new CoTraveller({
    userId,
    ...coTravellerData,
  });
  return await coTraveler.save();
};

const updateCoTraveller = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<CoTravellerType | null> => {
  const coTravellerData = request.body;
  const updatedCoTraveler = await CoTraveller.findByIdAndUpdate(
    request.params.coTravellerId,
    coTravellerData,
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

const findCoTravellersByUserId = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<CoTravellerType[]> => {
  const user = request.user as { id: string }; // Explicitly tell TypeScript that user has an id field
  const userId = user.id;
  console.log(userId);
  return await CoTraveller.find({ userId }).exec();
};

const findCoTravellerById = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<CoTravellerType | null> => {
  return await CoTraveller.findById(request.params.coTravellerId).exec();
};

const deleteCoTraveller = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<CoTravellerType | null> => {
  return await CoTraveller.findByIdAndDelete(
    request.params.coTravellerId
  ).exec();
};
// Export the functions

const htmlToPdf = async (template: string, outputPath: string) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Set content with proper waitUntil to ensure styles are fully loaded
  await page.setContent(template, { waitUntil: "networkidle0" });

  // Save the PDF with printBackground enabled to include CSS backgrounds
  await page.pdf({
    path: outputPath,
    format: "A4",
    printBackground: true, // Ensure background colors and images are printed
  });

  console.log("PDF created at:", outputPath);
  await browser.close();
};



const sendEmail = async (
  email: string,
  body: string,
  subject: string,
  attachmentPath: string | null
): Promise<void> => {
  const client = await createClient();

  try {
    // Read the PDF file only if attachmentPath is provided
    let attachments = [];

    if (attachmentPath) {
      const pdfData = fs.readFileSync(path.resolve(attachmentPath)).toString("base64");
      attachments.push({
        "@odata.type": "#microsoft.graph.fileAttachment",
        name: path.basename(attachmentPath),
        contentBytes: pdfData,
        contentType: "application/pdf",
      });
    }

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
        attachments: attachments.length > 0 ? attachments : undefined,
      },
    });

    console.log("Mail Sent successfully.");
  } catch (error: any) {
    console.error("Error sending mail:", error);
    throw new AppError(error.message, 400);
  }
};

const forgotPassword = async (email: string): Promise<void> => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error(constants.ERROR_MSG.NO_SUCH_USER);
  }

  // Generate a reset token
  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now

  // Update user with reset token and expiry
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpiry = resetTokenExpiry;
  await user.save();

  // Create reset URL

  const resetUrl = `${constants.URL.RESET_URL}?token=${resetToken}`;
  const htmlContent = passwordResetTemplate(resetUrl);
  const client = await createClient();
  try {
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
  } catch (error: any) {
    throw new AppError(error.message, 400);
  }
};

const resetPassword = async (
  token: string,
  newPassword: string,
  confirmPassword: string
) => {
  if (newPassword !== confirmPassword) {
    throw new AppError(constants.ERROR_MSG.PASSWORDS_DO_NOT_MATCH, 400);
  }

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpiry: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError(constants.ERROR_MSG.INVALID_TOKEN, 400);
  }

  // Hash the new password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  // Update user's password and clear reset token and expiry
  user.password = hashedPassword;
  try {
    await User.updateOne(
      { _id: user._id },
      {
        $set: { password: hashedPassword },
        $unset: { resetPasswordToken: "", resetPasswordExpiry: "" },
      }
    );
  } catch (error: any) {
    throw new AppError(error.message, 400);
  }
};

export {
  sayHello,
  createUser,
  validatePassword,
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
  htmlToPdf
};
