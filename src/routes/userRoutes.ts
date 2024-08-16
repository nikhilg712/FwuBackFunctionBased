import { NextFunction, Request, Response, Router } from "express";
import {
  signup,
  login,
  // logout,
  // getProfile,
} from "../controllers/userController";
import passport from "passport";

const userRouter = Router();
// Initialize routes function
const initializeRoutes = (router: Router) => {
  const path = "/";

  // // Define routes
  // router.get(`${path}profile`, getProfile);
  router.post(`${path}signup`, signup);
  router.post(
    `${path}login`,
    passport.authenticate("local", { session: true }),
    login
  );
  // router.post(`${path}logout`, logout);

  // Add other routes if needed
  // router.delete(`${path}deleteUser`, APP.MIDDLEWARES.AUTH, deleteUser);
};

initializeRoutes(userRouter);

// Define route handlers
// const handleSignup = async (
//   request: Request,
//   response: Response,
//   next: NextFunction
// ) => {
//   try {
//     const result = await signup(request, response, next);
//     sendResponse(response, 200, "Success", result?.message, result?.data);
//   } catch (err: unknown) {
//     if (err instanceof Error) {
//       throw new AppError(err.message, 400);
//     } else {
//       // Handle the case where the error is not an instance of Error
//       throw new AppError("An unknown error occurred", 400);
//     }
//   }
// };

// const handleLogin = async (
//   request: Request,
//   response: Response,
//   next: NextFunction
// ) => {
//   try {
//     const result = await controllerLogin(request, response, next);
//     if (!result.flag) {
//       APP.GLOBALS.FN.customisedErrorResponse(
//         request,
//         response,
//         result.type,
//         result.message
//       );
//     } else {
//       APP.GLOBALS.FN.successResponse(
//         request,
//         response,
//         result.data,
//         result?.message
//       );
//     }
//   } catch (err: any) {
//     APP.GLOBALS.FN.errorResponse(request, response, 400, err);
//   }
// };

// const handleLogout = async (
//   request: Request,
//   response: Response,
//   next: NextFunction
// ) => {
//   try {
//     await controllerLogout(request, response, next);
//     response.json({ message: constants.SUCCESS_MSG.LOGGED_OUT });
//   } catch (err: any) {
//     response.status(400).json({ message: err.message });
//   }
// };

// const handleGetProfile = async (
//   request: Request,
//   response: Response,
//   next: NextFunction
// ) => {
//   try {
//     const result = await controllerGetProfile(request, response, next);
//     if (!result.flag) {
//       APP.GLOBALS.FN.customisedErrorResponse(
//         request,
//         response,
//         result.type,
//         result.message
//       );
//     } else {
//       APP.GLOBALS.FN.successResponse(
//         request,
//         response,
//         result.data,
//         result?.message
//       );
//     }
//   } catch (err: any) {
//     APP.GLOBALS.FN.errorResponse(request, response, 400, err);
//   }
// };

// const isAuthenticated = (
//   request: Request,
//   response: Response,
//   next: NextFunction
// ) => {
//   if (request.isAuthenticated()) {
//     return next();
//   } else {
//     response.status(401).json({ message: constants.ERROR_MSG.UNAUTHORIZED });
//   }
// };

// Export the initialized router

export default userRouter;
