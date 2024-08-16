import { NextFunction, Request, Response } from "express";
import {
  createUser,
  findUserByEmail,
  findUserById,
  findUserByUsername,
  validatePassword,
} from "../services/user.service";
import { constants } from "../constants/user.constants";
import passport from "../middleware/passport";
import {
  LoginResponseType,
  SignupResponseType,
  UserResponseType,
  UserType,
} from "../interface/user.interface";
import { User, IUser } from "../models/users";
import bcrypt from "bcrypt";
import { AppError } from "../utils/appError";
import { catchAsync, sendResponse } from "../utils/responseUtils";

/**
 * @function signup
 * @description Creates a new user.
 * @param {Request} request - The Express request object.
 * @param {Response} response - The Express response object.
 * @param {NextFunction} next - The Express next function.
 * @returns {Promise<SignupResponseType>} - A promise that resolves to the signup response object.
 */

const signup = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> => {
  // Helper function to send responses

  // Main function logic
  const { username, email, password, ...rest } = request.body;

  try {
    // TODO: Valid using yup or zod
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      throw new AppError(constants.ERROR_MSG.EMAIL_ALREADY_EXISTS, 400);
    }

    const newUser: UserType = await createUser({
      username,
      email,
      password,
      ...rest,
    });

    const returnObj: SignupResponseType = {
      data: [newUser], // TODO: Handle array and objects
      flag: true, // TODO: Remove and use http status codes instead
      type: "",
      message: "",
    };

    // Send the response using the helper function
    sendResponse(response, 200, "Success", "", returnObj.data);
  } catch (error) {
    if (error instanceof Error) {
      // If error is an instance of Error, you can access error.message safely
      next(new AppError(error.message, 400)); // Use next() to pass error to the global error handler
    } else {
      // Handle other types of errors or fallback
      next(new AppError("An unknown error occurred", 500));
    }
  }
};

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
    next: NextFunction
  ): Promise<void> => {
    const returnObj: LoginResponseType = {
      data: [],
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
          returnObj.data = user;
          sendResponse(response, 200, "Success", "", returnObj.data); // Send response here
        });
      })(request, response, next);
    });
  }
);

// /**
//  * @function logout
//  * @description Logs out the user and clears the assigned cookie.
//  * @param {Request} request - The Express request object.
//  * @param {Response} response - The Express response object.
//  * @param {NextFunction} next - The Express next function.
//  * @returns {Promise<void>} - A promise that resolves when the logout operation is complete.
//  */
// const logout = (
//   request: Request,
//   response: Response,
//   next: NextFunction
// ): Promise<void> => {
//   return new Promise((resolve, reject) => {
//     request.logout((err) => {
//       if (err) {
//         return reject(err);
//       }
//       response.clearCookie("connect.sid", { path: "/" });
//       resolve();
//     });
//   });
// };

// /**
//  * @function getProfile
//  * @description Retrieves the profile of the authenticated user.
//  * @param {Request} request - The Express request object.
//  * @param {Response} response - The Express response object.
//  * @param {NextFunction} next - The Express next function.
//  * @returns {Promise<UserResponseType>} - A promise that resolves to the user response object.
//  */
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

//   return returnObj;
// };

export {
  signup,
  login,
  // ,logout, getProfile
};
