import { NextFunction, Request, Response, Router } from "express";
import {
  signup,
  login,
  logout,
  getProfile,
  loginByPhone,
  sendOtp,
  verifyOtp,
  googleAuth,
  googleAuthCallback,
} from "../controllers/userController";
import passport from "passport";
import { isAuthenticated } from "../middleware/authenticate";

const userRouter = Router();
// Initialize routes function
const initializeRoutes = (router: Router) => {
  const path = "/";

  // // Define routes
  router.get(`${path}profile`, isAuthenticated, getProfile);
  router.get("/auth/google", googleAuth);

  // Callback route for Google to redirect to
  router.get(
    "/auth/google/callback",
    passport.authenticate("google"),
    googleAuthCallback,
  );

  router.post(`${path}signup`, signup);
  router.post(
    `${path}login`,
    passport.authenticate("local", { session: true }),
    login,
  );
  router.post(`${path}logout`, logout);
  router.post(`${path}loginByPhone`, loginByPhone);
  router.post(`${path}send-otp`, sendOtp);
  router.post(`${path}verify-otp`, verifyOtp);

  // Add other routes if needed
  // router.delete(`${path}deleteUser`, APP.MIDDLEWARES.AUTH, deleteUser);
};

initializeRoutes(userRouter);

// Export the initialized router
export default userRouter;
