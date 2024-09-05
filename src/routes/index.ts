import express from "express";
import BaseRouter from "./baseRoutes";
import HomeRoutes from "../routes/homeRoutes";
import userRouter from "../routes/userRoutes";
import globalErrorHandler from "../utils/globalErrorHandler";
import rateLimit from "express-rate-limit";

/**
 * Function to initialize all routes.
 *
 * @param app - The express application instance.
 */
const initializeRoutes = (app: express.Application): void => {

  const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // Limit each IP to 5 requests per `windowMs`
    standardHeaders: true, // Send rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: 'Too many requests from this IP, please try again later.',
    handler: (req, res) => {
      res.status(429).json({
        statusCode: 429, 
        status: 'fail',
        message: 'Too many requests from this IP, please try again later.',
      });
    }
  });


  //Set up routes
  // app.use("/fwu/api/v1/", limiter); 
  app.use("/fwu/api/v1/", BaseRouter);
  app.use("/fwu/api/v1/home/",limiter, HomeRoutes);
  app.use("/fwu/api/v1/user/",limiter, userRouter);
  app.use(globalErrorHandler);
};

export default initializeRoutes;
