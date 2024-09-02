"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const userRouter = (0, express_1.Router)();
// Initialize routes function
const initializeRoutes = (router) => {
    const path = "/";
    // // Define routes
    router.post(`${path}signup`, userController_1.signup);
    router.post(`${path}verify-signup`, userController_1.verifySignup);
    router.post(`${path}login`, userController_1.login);
    router.post(`${path}verify-login`, userController_1.verifyLogin);
    router.post(`${path}logout`, userController_1.logout);
    router.get(`${path}get-user`, userController_1.getUser);
    router.get(`${path}google-signin`, userController_1.googleSignIn);
    router.get(`${path}auth/google/callback`, userController_1.googleSignInCallback);
    router.post(`${path}update`, userController_1.updateUser);
    router.get(`${path}aws-url`, userController_1.getAwsUrl);
    // router.get(`${path}profile`, isAuthenticated, getProfile);
    // router.get("/auth/google", googleAuth);
    // // Callback route for Google to redirect to
    // router.get(
    //   "/auth/google/callback",
    //   passport.authenticate("google"),
    //   googleAuthCallback,
    // );
    // router.get(`${path}cotravellers`, isAuthenticated, getCotravellers);
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
    // router.post(`${path}cotravellers`, isAuthenticated, newCoTraveller);
    // router.patch(
    //   `${path}cotravellers/:coTravellerId`,
    //   isAuthenticated,
    //   updateCoTraveller,
    // );
    /* *****DELETE******
        ==============================================*/
    // router.delete(
    //   `${path}cotravellers/:coTravellerId`,
    //   isAuthenticated,
    //   deleteCoTraveller,
    // );
    // Add other routes if needed
    // router.delete(`${path}deleteUser`, APP.MIDDLEWARES.AUTH, deleteUser);
};
initializeRoutes(userRouter);
// Export the initialized router
exports.default = userRouter;
