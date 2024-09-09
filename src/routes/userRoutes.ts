import { NextFunction, Request, Response, Router } from "express";
import {
  signup,
  verifySignup,
  logout,
  getUser,
  login,
  verifyLogin,
  googleSignIn,
  googleSignInCallback,
  updateUser,
  deleteCoTraveller,
  updateCoTraveller,
  newCoTraveller,
  getCotravellers,
  uploadProfilePic,
} from "../controllers/userController";
import passport from "passport";
import { isAuthenticated } from "../middleware/authenticate";

const userRouter = Router();
// Initialize routes function
const initializeRoutes = (router: Router) => {
  const path = "/";

  // // Define routes

  router.post(`${path}signup`, signup);
  router.post(`${path}verify-signup`, verifySignup);
  router.post(`${path}login`, login);
  router.post(`${path}verify-login`, verifyLogin);
  router.post(`${path}logout`, logout);
  router.get(`${path}get-user`, getUser);
  router.get(`${path}google-signin`, googleSignIn);
  router.get(`${path}auth/google/callback`, googleSignInCallback);
  router.post(`${path}update`, uploadProfilePic, isAuthenticated, updateUser);

  // router.get(`${path}profile`, isAuthenticated, getProfile);
  // router.get("/auth/google", googleAuth);

  // // Callback route for Google to redirect to
  // router.get(
  //   "/auth/google/callback",
  //   passport.authenticate("google"),
  //   googleAuthCallback,
  // );

  router.get(`${path}cotravellers`, isAuthenticated, getCotravellers);

  // router.post(`${path}signupByEmail`, signupByEmail);
  // router.post(
  //   `${path}login`,
  //   passport.authenticate("local", { session: true }),
  //   login,
  // );

  // router.post(`${path}logout`, logout);
  // router.post(`${path}loginByPhone`, loginByPhone);
  // router.post(`${path}send-otp`, sendOtp);
  // router.post(`${path}verify-otp`, verifyOtp);
  // router.post(`${path}send-email-otp`, sendEmailOtp);
  // router.post(`${path}verify-email-otp`, verifyEmailOtp);
  // router.post(`${path}forgot-password`, forgotPasswordController);
  // router.post(`${path}reset-password`, resetPasswordController);
  router.post(`${path}cotravellers`, isAuthenticated, newCoTraveller);
  router.patch(
    `${path}cotravellers/:coTravellerId`,
    isAuthenticated,
    updateCoTraveller
  );

  /* *****DELETE******
      ==============================================*/

  router.delete(
    `${path}cotravellers/:coTravellerId`,
    isAuthenticated,
    deleteCoTraveller
  );

  // Add other routes if needed
  // router.delete(`${path}deleteUser`, APP.MIDDLEWARES.AUTH, deleteUser);
};

initializeRoutes(userRouter);

// Export the initialized router
export default userRouter;
