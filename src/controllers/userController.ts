import { NextFunction, Request, Response } from "express";
import {
  signupSchema,
  createUser,
  findUserByEmail,
  findUserById,
  findUserByUsername,
  validatePassword,
  createAddress,
  sendOtp as sendOtpRequest,
  verifyOtp as verifyOtpRequest,
} from "../services/user.service";
import { constants } from "../constants/user.constants";
import passport from "../middleware/passport";
import {
  LoginResponseType,
  OtpRequestBody,
  SignupResponseType,
  UserResponseType,
  UserSignup,
  UserType,
} from "../interface/user.interface";
import { User, IUser } from "../models/users";
import bcrypt from "bcrypt";
import { AppError } from "../utils/appError";
import { catchAsync, sendResponse } from "../utils/responseUtils";
import { IAddress } from "../models/address";

/**
 * @function signup
 * @description Creates a new user.
 * @param {Request} request - The Express request object.
 * @param {Response} response - The Express response object.
 * @param {NextFunction} next - The Express next function.
 * @returns {Promise<SignupResponseType>} - A promise that resolves to the signup response object.
 */

const signup = catchAsync(
  async (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    // Prepare response object
    const returnObj: UserResponseType = {
      data: {},
      flag: true,
      type: "",
      message: "",
    };
    // Validate request body
    //await signupSchema.validate(request.body, { abortEarly: false });

    const {
      username,
      email,
      password,
      gender,
      dateOfBirth,
      passportNo,
      passportExpiry,
      passportIssuingCountry,
      panNo,
      nationality,
      address,
      phone,
      userType,
      profilePic,
      wallet,
      refCode,
      deviceId,
      deviceToken,
      googleId,
    }: IUser = request.body;

    // Create new user
    // Ensure required fields are provided
    if (!phone) {
      throw new AppError("Phone number is required", 400);
    }

    // Create address if address data is provided
    let addressId: IAddress["_id"] | undefined;
    if (address.length > 0) {
      const addressData = await createAddress(address);
      addressId = addressData;
    }

    // Check if user already exists
    let hashedPassword: string | undefined;
    if (email) {
      const existingUser = await findUserByEmail(email);
      if (existingUser) {
        throw new AppError("Email already exists", 400);
      }

      // Encrypt password if provided
      if (password) {
        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        hashedPassword = await bcrypt.hash(password, salt);
      }
    }

    // Create new user
    const newUser = await createUser({
      username: username || "",
      email: email || "",
      password: hashedPassword,
      gender: gender || "Male",
      dateOfBirth: dateOfBirth || new Date(),
      passportNo: passportNo || "",
      passportExpiry: passportExpiry || new Date(),
      passportIssuingCountry: passportIssuingCountry || undefined,
      panNo: panNo || "",
      nationality: nationality || undefined,
      address: addressId || undefined,
      phone: phone,
      userType: userType || "Client",
      profilePic: profilePic || "",
      wallet: wallet || 0,
      refCode: refCode || "",
      deviceId: deviceId || "",
      deviceToken: deviceToken || "",
      googleId: googleId || "",
    } as IUser);

    returnObj.data = newUser;
    returnObj.message = constants.SUCCESS_MSG.USER_CREATED;
    // Send the response
    sendResponse(response, 200, "Success", returnObj.message, returnObj.data);
  },
);

/**
 * @function login
 * @description Verifies the credentials entered by the users and logs them in.
 * @param {Request} request - The Express request object.
 * @param {Response} response - The Express response object.
 * @param {NextFunction} next - The Express next function.
 * @returns {Promise<LoginResponseType>} - A promise that resolves to the login response object.
 */
const login = catchAsync(
  async (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    const returnObj: LoginResponseType = {
      data: {},
      flag: true,
      type: "",
      message: "",
    };

    return new Promise((resolve, reject) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      passport.authenticate("local", (err: unknown, user: any, info: any) => {
        if (err) {
          return reject(err);
        }
        if (!user) {
          returnObj.data = info;
          returnObj.message = constants.ERROR_MSG.LOGIN_FAILED;
          returnObj.flag = false;
          return response.status(401).json(returnObj); // Send response here
        }

        request.logIn(user, (err) => {
          if (err) {
            return reject(err);
          }
          returnObj.message = constants.SUCCESS_MSG.LOGGED_IN;
          const data = {
            _id: user._id,
            username: user.username,
            email: user.email,
            gender: user.gender,
            dateOfBirth: user.dateOfBirth,
            passportNo: user.passportNo,
            passportExpiry: user.passportExpiry,
            passportIssuingCountry: user.passportIssuingCountry,
            panNo: user.panNo,
            nationality: user.nationality,
            address: user.address,
            phone: user.phone,
            userType: user.userType,
            profilePic: user.profilePic,
            wallet: user.wallet,
            refCode: user.refCode,
            deviceId: user.deviceId,
            deviceToken: user.deviceToken,
          };
          returnObj.data = data;
          sendResponse(response, 200, "Success", "", returnObj.data); // Send response here
        });
      })(request, response, next);
    });
  },
);

/**
 * @function logout
 * @description Logs out the user and clears the assigned cookie.
 * @param {Request} request - The Express request object.
 * @param {Response} response - The Express response object.
 * @param {NextFunction} next - The Express next function.
 * @returns {Promise<void>} - A promise that resolves when the logout operation is complete.
 */
const logout = catchAsync(
  async (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    request.logout((err) => {
      if (err) {
        return next(err); // Pass error to Express error handler
      }
      response.clearCookie("connect.sid", { path: "/" });
      sendResponse(response, 200, "Success", "User LoggedOut Successfully", {});
    });
  },
);

/**
 * @function getProfile
 * @description Retrieves the profile of the authenticated user.
 * @param {Request} request - The Express request object.
 * @param {Response} response - The Express response object.
 * @param {NextFunction} next - The Express next function.
 * @returns {Promise<UserResponseType>} - A promise that resolves to the user response object.
 */
const getProfile = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<UserResponseType> => {
  const returnObj: UserResponseType = {
    data: {},
    flag: true,
    type: "",
    message: "",
  };

  if (request.isAuthenticated()) {
    returnObj.data = request.user;
    returnObj.message = constants.SUCCESS_MSG.PROTECTED_ROUTE;
  } else {
    returnObj.message = constants.ERROR_MSG.UNAUTHORIZED;
  }

  sendResponse(response, 200, "Success", returnObj.message, returnObj.data);
  return returnObj;
};

const loginByPhone = catchAsync(
  async (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    const returnObj = {
      data: {},
      flag: true,
      type: "",
      message: "",
    };

    passport.authenticate(
      "otp",
      (err: unknown, user: IUser | false, info: object) => {
        if (err) {
          return next(err);
        }
        // if (!user) {
        //   returnObj.data = info;
        //   returnObj.message = constants.ERROR_MSG.LOGIN_FAILED;
        //   returnObj.flag = false;
        //   return sendResponse(
        //     response,
        //     401,
        //     "Failure",
        //     constants.ERROR_MSG.LOGIN_FAILED,
        //     {}
        //   );
        // }

        request.logIn(user, (err) => {
          if (err) {
            return next(err);
          }
          if (!user) {
            returnObj.data = info;
            returnObj.message = constants.ERROR_MSG.LOGIN_FAILED;
            returnObj.flag = false;
            return sendResponse(
              response,
              401,
              "Failure",
              constants.ERROR_MSG.LOGIN_FAILED,
              {},
            );
          }
          returnObj.message = constants.SUCCESS_MSG.LOGGED_IN;
          const data = {
            _id: user?._id || "",
          };
          returnObj.data = data;
          // return sendResponse(response, 200, "Success", "", returnObj.data);
        });
      },
    )(request, response, next);
    return sendResponse(response, 200, "Success", "", returnObj.data);
  },
);

const sendOtp = catchAsync(
  async (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    const returnObj = {
      data: {},
      flag: true,
      type: "",
      message: "",
    };

    const { phone } = request.body;
    await sendOtpRequest(phone);
    sendResponse(response, 200, "Success", "Otp Sent Successfully", {});
  },
);

const verifyOtp = catchAsync(
  async (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    const returnObj = {
      data: {},
      flag: true,
      type: "",
      message: "",
    };

    const { phone, otp }: OtpRequestBody = request.body;
    const verified: boolean = await verifyOtpRequest(phone, otp);
    if (!verified) {
      return sendResponse(
        response,
        400,
        "Failure",
        "Otp not verified Successfully",
        {},
      );
    }
    passport.authenticate(
      "otp",
      (err: unknown, user: IUser | false, info: object) => {
        if (err) {
          return next(err);
        }

        request.logIn(user, (err) => {
          if (err) {
            return next(err);
          }
          if (!user) {
            returnObj.data = info;
            returnObj.message = constants.ERROR_MSG.LOGIN_FAILED;
            returnObj.flag = false;
            return sendResponse(
              response,
              401,
              "Failure",
              constants.ERROR_MSG.LOGIN_FAILED,
              {},
            );
          }
          returnObj.message = constants.SUCCESS_MSG.LOGGED_IN;
          const data = {
            _id: user?._id || "",
          };
          returnObj.data = data;
          // return sendResponse(response, 200, "Success", "", returnObj.data);
        });
      },
    )(request, response, next);
    return sendResponse(response, 200, "Success", "", returnObj.data);
  },
);
const googleAuth = catchAsync(
  async (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    passport.authenticate(
      "google",
      { scope: ["profile", "email"] }, // Ensure scope is correctly set
    )(request, response, next);
  },
);

const googleAuthCallback = catchAsync(
  async (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    passport.authenticate(
      "google",
      async (err: Error | null, user: IUser | false, info: object) => {
        if (err) {
          console.error("Google authentication error:", err); // Log the error
          return new AppError("Google Authentication Error", 400);
        }
        if (!user) {
          console.log("Authentication failed:", info); // Log failure info
          return sendResponse(
            response,
            401,
            "Failure",
            constants.ERROR_MSG.LOGIN_FAILED,
            {},
          );
        }

        request.logIn(user, (err) => {
          if (err) {
            console.error("Error logging in user:", err); // Log login error
            return next(err);
          }

          const data = {
            _id: user._id,
            username: user.username,
            email: user.email,
            // Other user details
          };

          return sendResponse(response, 200, "Success", "", data);
        });
      },
    )(request, response, next);
  },
);

export {
  signup,
  login,
  logout,
  getProfile,
  loginByPhone,
  sendOtp,
  verifyOtp,
  googleAuth,
  googleAuthCallback,
};
