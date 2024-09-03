import { NextFunction, Request, Response } from "express";
import { catchAsync, sendResponse } from "../utils/responseUtils";
import {
  emailOTPValidator,
  phoneNumberValidator,
  profileUpdateValidator,
} from "../utils/validator";
import { sendOtp } from "../services/user.service";
import { User } from "../models/users";
import { AppError } from "../utils/appError";
import bcrypt from "bcrypt";
import passport from "passport";
import generateSignedUrl from "../middleware/s3";
import { constants } from "../constants/user.constants";

// For signup with (email + password) or (phone)
const signup = catchAsync(
  async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    const { provider, email, password, phone } = request.body;

    // EMAIL + PASSWORD AUTH
    if (provider === "email") {
      // Validation logic in this strategy
      await emailOTPValidator
        .validate({ email, password })
        .catch((err) => next(new AppError(err.message, 500)));

      const existingUser = await User.findOne({ email }).exec();

      if (existingUser && existingUser.isVerified) {
        return next(
          new AppError(constants.ERROR_MSG.EMAIL_ALREADY_EXISTS, 400)
        );
      }

      // If the user exists but is not verified, allow to resend OTP
      if (existingUser && !existingUser.isVerified) {
        await sendOtp("email", email, null);
        return sendResponse(
          response,
          200,
          "Success",
          constants.SUCCESS_MSG.OTP_SENT_TO_EMAIL,
          {}
        );
      }

      // Handle password
      const saltRounds = 10;
      const salt = await bcrypt.genSalt(saltRounds);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Save user to db with isVerified:false
      const user = new User({
        email,
        password: hashedPassword,
      });

      await user.save().catch((err) => {
        return next(new AppError("Error saving user to the database", 500));
      });

      await sendOtp("email", email, null);
      sendResponse(
        response,
        200,
        "Success",
        constants.SUCCESS_MSG.OTP_SENT_TO_EMAIL,
        {}
      );
    }

    // PHONE NUMBER AUTH
    else if (provider === "phone") {
      // Validate query params
      await phoneNumberValidator
        .validate({ phone })
        .catch((err) => next(new AppError(err.message, 500)));

      const existingUser = await User.findOne({ phone }).exec();

      if (existingUser && existingUser.isVerified) {
        return next(
          new AppError(constants.ERROR_MSG.PHONE_ALREADY_EXISTS, 400)
        );
      }

      // If the user exists but is not verified, allow to resend OTP
      if (existingUser && !existingUser.isVerified) {
        await sendOtp("phone", null, phone);
        return sendResponse(
          response,
          200,
          "Success",
          constants.SUCCESS_MSG.OTP_SENT_TO_PHONE,
          {}
        );
      }

      // Save user to db with isVerified:false
      const user = new User({ phone });

      await user.save().catch((err) => {
        return next(new AppError("Error saving user to the database", 500));
      });

      await sendOtp("phone", null, phone);
      sendResponse(
        response,
        200,
        "Success",
        constants.SUCCESS_MSG.OTP_SENT_TO_PHONE,
        {}
      );
    } else {
      return next(new AppError(constants.ERROR_MSG.INVALID_PROVIDER, 400));
    }
  }
);

// Verify OTP for (email + password) or (phone)
const verifySignup = catchAsync(
  async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    const { provider, email, phone, otp } = request.body; // provider: email | phone

    if (provider === "email") {
      // Validation logic inside passport strategy
      passport.authenticate(
        "signup-email",
        (err: unknown, user: any, info: any) => {
          if (err) return next(err);
          if (!user) return next(err); // Handle failed login

          request.login(user, (err: unknown) => {
            if (err) return next(err);
            return sendResponse(
              response,
              200,
              "Success",
              constants.SUCCESS_MSG.LOGGED_IN,
              user
            );
          });
        }
      )(request, response, next);
    } else if (provider === "phone") {
      // Validation logic inside passport strategy
      passport.authenticate(
        "signup-phone",
        (err: unknown, user: any, info: any) => {
          if (err) return next(err);
          if (!user) return next(err); // Handle failed login

          request.login(user, (err: unknown) => {
            if (err) return next(err);
            return sendResponse(
              response,
              200,
              "Success",
              constants.SUCCESS_MSG.LOGGED_IN,
              user
            );
          });
        }
      )(request, response, next);
    } else {
      throw new AppError(constants.ERROR_MSG.INVALID_OTP_PROVIDER, 400);
    }
  }
);

// Email Password login
const login = catchAsync(
  async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    const { provider, email, password, phone } = request.body; // provider: email | phone
    if (provider === "email") {
      passport.authenticate(
        "login-email",
        (err: unknown, user: any, info: any) => {
          if (err) return next(err);
          if (!user) return next(err); // Handle failed login

          request.login(user, (err: unknown) => {
            if (err) return next(err);
            return sendResponse(
              response,
              200,
              "Success",
              constants.SUCCESS_MSG.LOGGED_IN,
              user
            );
          });
        }
      )(request, response, next);
    } else if (provider === "phone") {
      const user = await User.findOne({
        phone: phone,
        isVerified: true,
      }).exec();

      if (!user) {
        throw new AppError(constants.ERROR_MSG.NO_SUCH_USER, 400);
      }

      await sendOtp("phone", null, phone);
      return sendResponse(
        response,
        200,
        "Success",
        constants.SUCCESS_MSG.OTP_SENT_TO_PHONE,
        user
      );
    } else {
      throw new AppError(constants.ERROR_MSG.INVALID_PROVIDER, 400);
    }
  }
);

// Login by phone otp confirmation
const verifyLogin = catchAsync(
  async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    const { provider, email, phone, otp } = request.body; // provider: email | phone

    passport.authenticate("login-phone", (err: any, user: any, info: any) => {
      if (err) return next(new AppError(err.message, 400));
      if (!user) return next(new AppError(info.message, 400)); // Handle failed login

      request.login(user, (err: unknown) => {
        if (err) return next(err);
        return sendResponse(
          response,
          200,
          "Success",
          constants.SUCCESS_MSG.LOGGED_IN,
          user
        );
      });
    })(request, response, next);
  }
);

// Get profile data
const getUser = catchAsync(
  async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    console.log("Req: ", request);

    let user = request.user;
    console.log("Req user: ", user);

    if (request.isAuthenticated()) {
      sendResponse(response, 200, "Success", "Authenticated", user);
    } else {
      sendResponse(response, 200, "Failed", "Not authenticated", {});
    }
  }
);

// Google signin
const googleSignIn = catchAsync(
  async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    console.log("Authenticating with gmail...");
    //await User.deleteMany({});
    passport.authenticate("google", { scope: ["profile", "email"] })(
      request,
      response,
      next
    );
  }
);

// Google signin callback, to be called when google signin is completed
const googleSignInCallback = catchAsync(
  async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    passport.authenticate(
      "google",
      (err: any, user: unknown, info: any) => {
        if (err) {
          console.error("Error:", err);
          return next(new AppError(err.message, 400));
        }
        if (!user) {
          console.log("No user found");
          return next(new AppError(info.message, 400));
        }

        request.logIn(user, (err) => {
          if (err) {
            console.error("Login error:", err);
            return next(new AppError(err.message, 400));
          }

          response.redirect(`http://localhost:3000?authSuccess=true`);
        });
      }
    )(request, response, next);
  }
);

// Logout
const logout = catchAsync(
  async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    request.logout((err) => {
      if (err) {
        return next(err);
      }
      request.session.destroy((err) => {
        if (err) {
          return next(err);
        }
        if (request.cookies["connect.sid"]) {
          response.clearCookie("connect.sid");
          sendResponse(
            response,
            200,
            "Success",
            constants.SUCCESS_MSG.LOGGED_OUT,
            {}
          );
        } else {
          throw new AppError(constants.ERROR_MSG.NOT_LOGGED_IN, 400);
        }
      });
    });
  }
);

// Update user
const updateUser = catchAsync(
  async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    const { _id, username, dateOfBirth, gender } = request.body;

    const validation = await profileUpdateValidator
      .validate({
        username,
        dateOfBirth,
        gender,
      })
      .catch((err) => next(new AppError(err.message, 400)));

    const user = await User.findByIdAndUpdate(
      _id,
      {
        username,
        dateOfBirth,
        gender,
      },
      { new: true }
    ).catch((err) => next(new AppError(err.message, 400)));

    sendResponse(
      response,
      200,
      "Success",
      "Profile updated successfully",
      user
    );
  }
);

const getAwsUrl = catchAsync(
  async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    const url = await generateSignedUrl().catch((err) =>
      next(new AppError(err.message, 500))
    );
    sendResponse(response, 200, "Success", "Aws url generated", url);
  }
);

export {
  signup,
  verifySignup,
  logout,
  getUser,
  login,
  verifyLogin,
  googleSignIn,
  googleSignInCallback,
  updateUser,
  getAwsUrl,
};

// OLD CODE
// import { NextFunction, Request, Response } from "express";
// import {
//   signupSchema,
//   createUser,
//   findUserByEmail,
//   findUserById,
//   findUserByUsername,
//   validatePassword,
//   createAddress,
//   forgotPassword,
//   findCoTravellersByUserId,
//   findCoTravellerById,
//   updateCoTraveller as updateCoTravelerRequest,
//   deleteCoTraveller as deleteCoTravellerRequest,
//   resetPassword,
//   sendOtp as sendOtpRequest,
//   sendEmailOtp as sendEmailOtpRequest,
//   verifyOtp as verifyOtpRequest,
//   verifyEmailOtp as verifyEmailOtpRequest,
//   createCoTraveller,
// } from "../services/user.service";
// import { constants } from "../constants/user.constants";
// import {
//   CoTravellerResponseType,
//   CoTravellerType,
//   OtpRequestEmailBody,
// } from "../interface/user.interface";
// import passport from "../middleware/passport";
// import {
//   LoginResponseType,
//   OtpRequestBody,
//   SignupResponseType,
//   UserResponseType,
//   UserSignup,
//   UserType,
// } from "../interface/user.interface";
// import { User, IUser } from "../models/users";
// import bcrypt from "bcrypt";
// import { AppError } from "../utils/appError";
// import { catchAsync, sendResponse } from "../utils/responseUtils";
// import { IAddress } from "../models/address";
// import * as yup from "yup";
// import { emailValidation, passwordValidation } from "@Utils/validation";
// import { emailOTPValidator } from "../utils/validator";

// const signup = catchAsync(
//   async (
//     request: Request,
//     response: Response,
//     next: NextFunction
//   ): Promise<void> => {
//     // Prepare response object
//     const returnObj: UserResponseType = {
//       data: {},
//       flag: true,
//       type: "",
//       message: "",
//     };
//     // Validate request body
//     //await signupSchema.validate(request.body, { abortEarly: false });

//     const {
//       username,
//       email,
//       password,
//       gender,
//       dateOfBirth,
//       passportNo,
//       passportExpiry,
//       passportIssuingCountry,
//       panNo,
//       nationality,
//       address,
//       phone,
//       userType,
//       profilePic,
//       wallet,
//       refCode,
//       deviceId,
//       deviceToken,
//       googleId,
//     }: IUser = request.body;

//     // Create new user
//     // Ensure required fields are provided
//     if (!phone) {
//       throw new AppError("Phone number is required", 400);
//     }

//     // Create address if address data is provided
//     let addressId: IAddress["_id"] | undefined;
//     if (address.length > 0) {
//       const addressData = await createAddress(address);
//       addressId = addressData;
//     }

//     // Check if user already exists
//     let hashedPassword: string | undefined;
//     if (email) {
//       const existingUser = await findUserByEmail(email);
//       if (existingUser) {
//         throw new AppError("Email already exists", 400);
//       }

//       // Encrypt password if provided
//       if (password) {
//         const saltRounds = 10;
//         const salt = await bcrypt.genSalt(saltRounds);
//         hashedPassword = await bcrypt.hash(password, salt);
//       }
//     }

//     // Create new user
//     const newUser = await createUser({
//       username: username || "",
//       email: email || "",
//       password: hashedPassword,
//       gender: gender || "Male",
//       dateOfBirth: dateOfBirth || new Date(),
//       passportNo: passportNo || "",
//       passportExpiry: passportExpiry || new Date(),
//       passportIssuingCountry: passportIssuingCountry || undefined,
//       panNo: panNo || "",
//       nationality: nationality || undefined,
//       address: addressId || undefined,
//       phone: phone,
//       userType: userType || "Client",
//       profilePic: profilePic || "",
//       wallet: wallet || 0,
//       refCode: refCode || "",
//       deviceId: deviceId || "",
//       deviceToken: deviceToken || "",
//       googleId: googleId || "",
//     } as IUser);

//     returnObj.data = newUser;
//     returnObj.message = constants.SUCCESS_MSG.USER_CREATED;
//     // Send the response
//     sendResponse(response, 200, "Success", returnObj.message, returnObj.data);
//   }
// );

// const login = catchAsync(
//   async (
//     request: Request,
//     response: Response,
//     next: NextFunction
//   ): Promise<void> => {
//     const returnObj: LoginResponseType = {
//       data: {},
//       flag: true,
//       type: "",
//       message: "",
//     };

//     return new Promise((resolve, reject) => {
//       // eslint-disable-next-line @typescript-eslint/no-explicit-any
//       passport.authenticate("local", (err: unknown, user: any, info: any) => {
//         if (err) {
//           return reject(err);
//         }
//         if (!user) {
//           returnObj.data = info;
//           returnObj.message = constants.ERROR_MSG.LOGIN_FAILED;
//           returnObj.flag = false;
//           return response.status(401).json(returnObj); // Send response here
//         }

//         request.logIn(user, (err) => {
//           if (err) {
//             return reject(err);
//           }
//           returnObj.message = constants.SUCCESS_MSG.LOGGED_IN;
//           const data = {
//             _id: user._id,
//             username: user.username,
//             email: user.email,
//             gender: user.gender,
//             dateOfBirth: user.dateOfBirth,
//             passportNo: user.passportNo,
//             passportExpiry: user.passportExpiry,
//             passportIssuingCountry: user.passportIssuingCountry,
//             panNo: user.panNo,
//             nationality: user.nationality,
//             address: user.address,
//             phone: user.phone,
//             userType: user.userType,
//             profilePic: user.profilePic,
//             wallet: user.wallet,
//             refCode: user.refCode,
//             deviceId: user.deviceId,
//             deviceToken: user.deviceToken,
//           };
//           returnObj.data = data;
//           sendResponse(response, 200, "Success", "", returnObj.data); // Send response here
//         });
//       })(request, response, next);
//     });
//   }
// );

// const logout = catchAsync(
//   async (
//     request: Request,
//     response: Response,
//     next: NextFunction
//   ): Promise<void> => {
//     request.logout((err) => {
//       if (err) {
//         return next(err); // Pass error to Express error handler
//       }
//       response.clearCookie("connect.sid", { path: "/" });
//       sendResponse(response, 200, "Success", "User LoggedOut Successfully", {});
//     });
//   }
// );

// const getProfile = async (
//   request: Request,
//   response: Response,
//   next: NextFunction
// ): Promise<UserResponseType> => {
//   const returnObj: UserResponseType = {
//     data: {},
//     flag: true,
//     type: "",
//     message: "",
//   };

//   if (request.isAuthenticated()) {
//     returnObj.data = request.user;
//     returnObj.message = constants.SUCCESS_MSG.PROTECTED_ROUTE;
//   } else {
//     returnObj.message = constants.ERROR_MSG.UNAUTHORIZED;
//   }

//   sendResponse(response, 200, "Success", returnObj.message, returnObj.data);
//   return returnObj;
// };

// const loginByPhone = catchAsync(
//   async (
//     request: Request,
//     response: Response,
//     next: NextFunction
//   ): Promise<void> => {
//     const returnObj = {
//       data: {},
//       flag: true,
//       type: "",
//       message: "",
//     };

//     passport.authenticate(
//       "otp",
//       (err: unknown, user: IUser | false, info: object) => {
//         if (err) {
//           return next(err);
//         }
//         // if (!user) {
//         //   returnObj.data = info;
//         //   returnObj.message = constants.ERROR_MSG.LOGIN_FAILED;
//         //   returnObj.flag = false;
//         //   return sendResponse(
//         //     response,
//         //     401,
//         //     "Failure",
//         //     constants.ERROR_MSG.LOGIN_FAILED,
//         //     {}
//         //   );
//         // }

//         request.logIn(user, (err) => {
//           if (err) {
//             return next(err);
//           }
//           if (!user) {
//             returnObj.data = info;
//             returnObj.message = constants.ERROR_MSG.LOGIN_FAILED;
//             returnObj.flag = false;
//             return sendResponse(
//               response,
//               401,
//               "Failure",
//               constants.ERROR_MSG.LOGIN_FAILED,
//               {}
//             );
//           }
//           returnObj.message = constants.SUCCESS_MSG.LOGGED_IN;
//           const data = {
//             _id: user?._id || "",
//           };
//           returnObj.data = data;
//           // return sendResponse(response, 200, "Success", "", returnObj.data);
//         });
//       }
//     )(request, response, next);
//     return sendResponse(response, 200, "Success", "", returnObj.data);
//   }
// );

// // const sendEmailOtp = catchAsync(
// //   async (
// //     request: Request,
// //     response: Response,
// //     next: NextFunction
// //   ): Promise<void> => {
// //     const { email, password } = request.body;

// //     // Validate query params
// //     await emailOTPValidator.validate({
// //       email: email,
// //       password: password,
// //     });

// //     // If we are here, it means validation was successful

// //     // Handle email
// //     const existingUser = await findUserByEmail(email);
// //     // if (existingUser) {
// //     //   throw new AppError(
// //     //     "A user with provided email address already exists",
// //     //     400
// //     //   );
// //     // }

// //     // Handle password
// //     const saltRounds = 10;
// //     const salt = await bcrypt.genSalt(saltRounds);
// //     const hashedPassword = await bcrypt.hash(password, salt);

// //     // Save user to db with isVerified:false in db as default value in model
// //     const user = new User({
// //       email: email,
// //       password: hashedPassword,
// //     });
// //     //await user.save();

// //     // Send OTP for confirmation
// //     await sendEmailOtpRequest(email);
// //     sendResponse(response, 200, "Success", "Otp Sent Successfully", {});
// //   }
// // );

// const sendOtp = catchAsync(
//   async (
//     request: Request,
//     response: Response,
//     next: NextFunction
//   ): Promise<void> => {
//     const { type, data } = request.body; // type: email or phone, value: user@gmail.com or phn num
//     if (type === "email") {
//       const { email, password } = request.body;

//       // Validate query params
//       await emailOTPValidator.validate({
//         email: email,
//         password: password,
//       });

//       // If we are here, it means validation was successful

//       // Handle email
//       const existingUser = await findUserByEmail(email);
//       // if (existingUser) {
//       //   throw new AppError(
//       //     "A user with provided email address already exists",
//       //     400
//       //   );
//       // }

//       // Handle password
//       const saltRounds = 10;
//       const salt = await bcrypt.genSalt(saltRounds);
//       const hashedPassword = await bcrypt.hash(password, salt);

//       // Save user to db with isVerified:false in db as default value in model
//       const user = new User({
//         email: email,
//         password: hashedPassword,
//       });
//       //await user.save();

//       // Send OTP for confirmation
//       await sendEmailOtpRequest(email);
//       sendResponse(response, 200, "Success", "Otp Sent Successfully", {});
//     } else if (type === "phone") {
//       await sendOtpRequest(data);
//       sendResponse(response, 200, "Success", "Otp Sent Successfully", {});
//     } else {
//     }
//   }
// );

// const forgotPasswordController = catchAsync(
//   async (
//     request: Request,
//     response: Response,
//     next: NextFunction
//   ): Promise<void> => {
//     const { email } = request.body;
//     await forgotPassword(email);
//     sendResponse(
//       response,
//       200,
//       "Success",
//       "Password reset link sent to your email",
//       {}
//     );
//   }
// );

// const resetPasswordController = catchAsync(
//   async (request: Request, response: Response, next: NextFunction) => {
//     const { token } = request.query;
//     const { newPassword, confirmPassword } = request.body;

//     if (!token || !newPassword || !confirmPassword) {
//       return sendResponse(
//         response,
//         400,
//         "Error",
//         "All fields are required.",
//         {}
//       );
//     }

//     if (typeof token !== "string") {
//       return sendResponse(response, 400, "Error", "Invalid token", {});
//     }

//     await resetPassword(token, newPassword, confirmPassword);
//     sendResponse(
//       response,
//       200,
//       "Success",
//       "Password has been reset successfully. Please login.",
//       {}
//     );
//   }
// );

// const verifyEmailOtp = catchAsync(
//   async (
//     request: Request,
//     response: Response,
//     next: NextFunction
//   ): Promise<void> => {
//     const { email, otp }: OtpRequestEmailBody = request.body;
//     const verified: boolean = await verifyOtpRequest(email, otp);
//     if (!verified) {
//       return sendResponse(
//         response,
//         400,
//         "Failure",
//         "Otp not verified Successfully",
//         {}
//       );
//     }
//     const user = await User.findOneAndUpdate(
//       { email },
//       { isVerified: true },
//       { new: true }
//     );

//     return new Promise((resolve, reject) => {
//       // eslint-disable-next-line @typescript-eslint/no-explicit-any
//       passport.authenticate("local", (err: unknown, user: any, info: any) => {
//         if (err) {
//           return reject(err);
//         }
//         if (!user) {
//           returnObj.data = info;
//           returnObj.message = constants.ERROR_MSG.LOGIN_FAILED;
//           returnObj.flag = false;
//           return response.status(401).json(returnObj); // Send response here
//         }

//         request.logIn(user, (err) => {
//           if (err) {
//             return reject(err);
//           }
//           returnObj.message = constants.SUCCESS_MSG.LOGGED_IN;
//           returnObj.data = user;
//           sendResponse(response, 200, "Success", "", returnObj.data); // Send response here
//         });
//       })(request, response, next);
//     });
//   }
// );

// const signupByEmail = catchAsync(
//   async (
//     request: Request,
//     response: Response,
//     next: NextFunction
//   ): Promise<void> => {
//     const returnObj = {
//       data: {},
//       flag: true,
//       type: "",
//       message: "",
//     };

//     const { email, password } = request.body;
//     let hashedPassword: string | undefined;
//     if (email) {
//       const existingUser = await findUserByEmail(email);
//       if (existingUser) {
//         throw new AppError("Email already exists", 400);
//       }

//       // Encrypt password if provided
//       if (password) {
//         const saltRounds = 10;
//         const salt = await bcrypt.genSalt(saltRounds);
//         hashedPassword = await bcrypt.hash(password, salt);
//       }
//     }
//     const user = await new User({
//       email: email,
//       password: hashedPassword,
//     }).save();

//     return new Promise((resolve, reject) => {
//       // eslint-disable-next-line @typescript-eslint/no-explicit-any
//       passport.authenticate("local", (err: unknown, user: any, info: any) => {
//         if (err) {
//           return reject(err);
//         }
//         if (!user) {
//           returnObj.data = info;
//           returnObj.message = constants.ERROR_MSG.LOGIN_FAILED;
//           returnObj.flag = false;
//           return response.status(401).json(returnObj); // Send response here
//         }

//         request.logIn(user, (err) => {
//           if (err) {
//             return reject(err);
//           }
//           returnObj.message = constants.SUCCESS_MSG.LOGGED_IN;
//           returnObj.data = user;
//           sendResponse(response, 200, "Success", "", returnObj.data); // Send response here
//         });
//       })(request, response, next);
//     });
//   }
// );

// const verifyOtp = catchAsync(
//   async (
//     request: Request,
//     response: Response,
//     next: NextFunction
//   ): Promise<void> => {
//     const returnObj = {
//       data: {},
//       flag: true,
//       type: "",
//       message: "",
//     };

//     const { phone, otp }: OtpRequestBody = request.body;
//     const verified: boolean = await verifyOtpRequest(phone, otp);
//     if (!verified) {
//       return sendResponse(
//         response,
//         400,
//         "Failure",
//         "Otp not verified Successfully",
//         {}
//       );
//     }
//     passport.authenticate(
//       "otp",
//       (err: unknown, user: IUser | false, info: object) => {
//         if (err) {
//           return next(err);
//         }

//         request.logIn(user, (err) => {
//           if (err) {
//             return next(err);
//           }
//           if (!user) {
//             returnObj.data = info;
//             returnObj.message = constants.ERROR_MSG.LOGIN_FAILED;
//             returnObj.flag = false;
//             return sendResponse(
//               response,
//               401,
//               "Failure",
//               constants.ERROR_MSG.LOGIN_FAILED,
//               {}
//             );
//           }
//           returnObj.message = constants.SUCCESS_MSG.LOGGED_IN;
//           const data = {
//             _id: user?._id || "",
//           };
//           returnObj.data = data;
//           // return sendResponse(response, 200, "Success", "", returnObj.data);
//         });
//       }
//     )(request, response, next);
//     return sendResponse(response, 200, "Success", "", returnObj.data);
//   }
// );

// const googleAuth = catchAsync(
//   async (
//     request: Request,
//     response: Response,
//     next: NextFunction
//   ): Promise<void> => {
//     passport.authenticate(
//       "google",
//       { scope: ["profile", "email"] } // Ensure scope is correctly set
//     )(request, response, next);
//   }
// );

// const googleAuthCallback = catchAsync(
//   async (
//     request: Request,
//     response: Response,
//     next: NextFunction
//   ): Promise<void> => {
//     passport.authenticate(
//       "google",
//       async (err: Error | null, user: IUser | false, info: object) => {
//         if (err) {
//           console.error("Google authentication error:", err); // Log the error
//           return new AppError("Google Authentication Error", 400);
//         }
//         if (!user) {
//           console.log("Authentication failed:", info); // Log failure info
//           return sendResponse(
//             response,
//             401,
//             "Failure",
//             constants.ERROR_MSG.LOGIN_FAILED,
//             {}
//           );
//         }

//         request.logIn(user, (err) => {
//           if (err) {
//             console.error("Error logging in user:", err); // Log login error
//             return next(err);
//           }

//           const data = {
//             _id: user._id,
//             username: user.username,
//             email: user.email,
//             // Other user details
//           };

//           return sendResponse(response, 200, "Success", "", data);
//         });
//       }
//     )(request, response, next);
//   }
// );

// const newCoTraveller = catchAsync(
//   async (
//     request: Request,
//     response: Response,
//     next: NextFunction
//   ): Promise<void> => {
//     passport.authenticate(
//       "google",
//       async (err: Error | null, user: IUser | false, info: object) => {
//         if (err) {
//           console.error("Google authentication error:", err); // Log the error
//           return new AppError("Google Authentication Error", 400);
//         }
//         if (!user) {
//           console.log("Authentication failed:", info); // Log failure info
//           return sendResponse(
//             response,
//             401,
//             "Failure",
//             constants.ERROR_MSG.LOGIN_FAILED,
//             {}
//           );
//         }

//         request.logIn(user, (err) => {
//           if (err) {
//             console.error("Error logging in user:", err); // Log login error
//             return next(err);
//           }

//           const data = {
//             _id: user._id,
//             username: user.username,
//             email: user.email,
//             // Other user details
//           };

//           return sendResponse(response, 200, "Success", "", data);
//         });
//       }
//     )(request, response, next);
//     const returnObj: CoTravellerResponseType = {
//       data: {},
//       flag: true,
//       type: "",
//       message: "",
//     };

//     if (request.isAuthenticated()) {
//       const user = request.user as { id: string };
//       const userId = user.id;
//       console.log(userId);

//       const coTraveler = await createCoTraveller(userId, request.body);
//       returnObj.data = coTraveler;
//       returnObj.message = constants.SUCCESS_MSG.COTRAVELLER_CREATED;
//     } else {
//       returnObj.message = constants.ERROR_MSG.NOT_AUTHENTICATED;
//     }
//     return sendResponse(
//       response,
//       200,
//       "Success",
//       returnObj.message,
//       returnObj.data
//     );
//   }
// );

// const updateCoTraveller = catchAsync(
//   async (
//     request: Request,
//     response: Response,
//     next: NextFunction
//   ): Promise<void> => {
//     const returnObj: CoTravellerResponseType = {
//       data: {},
//       flag: true,
//       type: "",
//       message: "",
//     };

//     if (request.isAuthenticated()) {
//       const coTraveller = await findCoTravellerById(
//         request.params.coTravellerId
//       );
//       if (!coTraveller) {
//         returnObj.message = constants.ERROR_MSG.COTRAVELLER_NOT_FOUND;
//         return sendResponse(response, 200, "Failure", returnObj.message, {});
//       }
//       const updatedCoTraveller = await updateCoTravelerRequest(
//         request.params.coTravellerId,
//         request.body
//       );
//       returnObj.data = updatedCoTraveller || {};
//       returnObj.message = constants.SUCCESS_MSG.COTRAVELLER_CREATED;
//     } else {
//       returnObj.message = constants.ERROR_MSG.NOT_AUTHENTICATED;
//     }
//     return sendResponse(
//       response,
//       200,
//       "Success",
//       returnObj.message,
//       returnObj.data
//     );
//   }
// );

// const deleteCoTraveller = catchAsync(
//   async (
//     request: Request,
//     response: Response,
//     next: NextFunction
//   ): Promise<void> => {
//     const returnObj: CoTravellerResponseType = {
//       data: {},
//       flag: true,
//       type: "",
//       message: "",
//     };

//     if (request.isAuthenticated()) {
//       // Await the result from getCoTravellerById
//       // eslint-disable-next-line @typescript-eslint/no-explicit-any
//       const coTraveller: any = await findCoTravellerById(
//         request.params.coTravellerId
//       );
//       if (!coTraveller) {
//         returnObj.message = constants.ERROR_MSG.COTRAVELLER_NOT_FOUND;
//         return sendResponse(
//           response,
//           404, // Not Found
//           "Failure",
//           returnObj.message,
//           {}
//         );
//       }
//       await deleteCoTravellerRequest(request.params.coTravellerId);
//       const user = request.user as { id: string }; // Explicitly tell TypeScript that user has an id field
//       const userId = user.id;
//       console.log(userId);
//       const coTravelers = await findCoTravellersByUserId(userId);
//       returnObj.data = coTravelers;
//       returnObj.message = constants.SUCCESS_MSG.COTRAVELLER_DELETED;
//     } else {
//       returnObj.flag = false;
//       returnObj.message = constants.ERROR_MSG.NOT_AUTHENTICATED;
//     }
//     return sendResponse(
//       response,
//       200,
//       "Success",
//       returnObj.message,
//       returnObj.data
//     );
//   }
// );

// const getCotravellers = catchAsync(
//   async (
//     request: Request,
//     response: Response,
//     next: NextFunction
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   ): Promise<any> => {
//     const returnObj: CoTravellerResponseType = {
//       data: {},
//       flag: true,
//       type: "",
//       message: "",
//     };

//     if (request.isAuthenticated()) {
//       const user = request.user as { id: string }; // Explicitly tell TypeScript that user has an id field
//       const userId = user.id;
//       console.log(userId);
//       const coTravelers = await findCoTravellersByUserId(userId);
//       if (!coTravelers || coTravelers.length == 0) {
//         returnObj.message = constants.ERROR_MSG.COTRAVELLER_NOT_FOUND;
//         return sendResponse(
//           response,
//           404, // Not Found
//           "Failure",
//           returnObj.message,
//           {}
//         );
//       }
//       returnObj.data = coTravelers;
//       returnObj.message = constants.SUCCESS_MSG.COTRAVELLER_FETCHED;
//     } else {
//       returnObj.message = constants.ERROR_MSG.NOT_AUTHENTICATED;
//     }
//     return sendResponse(
//       response,
//       200,
//       "Success",
//       returnObj.message,
//       returnObj.data
//     );
//   }
// );

// export {
//   signup,
//   login,
//   logout,
//   getProfile,
//   loginByPhone,
//   sendOtp,
//   verifyOtp,
//   googleAuth,
//   googleAuthCallback,
//   forgotPasswordController,
//   resetPasswordController,
//   updateCoTraveller,
//   newCoTraveller,
//   deleteCoTraveller,
//   getCotravellers,
//   sendEmailOtp,
//   verifyEmailOtp,
//   signupByEmail,
// };
