import express from "express";
import logger from "morgan";
import cors from "cors";
import passport from "passport";
import session from "express-session";
import initializeRoutes from "./routes/index";
import dotenv from "dotenv";
// import { BaseApp } from "@Base";
import upload from "express-fileupload";
// import { PassportConfig } from "@Main/middleware/AUTH";
import cookieParser from "cookie-parser";
import dbConnection from "./utils/dbConnection";

// Load environment variables
dotenv.config();
const initializeConfigsAndRoute = async (app: express.Application) => {
  // Initialize Passport configuration
  //   new PassportConfig();

  // Middleware setup
  app.use(logger("dev"));
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || "*",
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-CSRF-Token",
        "X-Requested-With",
      ],
      credentials: true,
    }),
  );
  app.use(upload());
  app.use(express.json({ limit: "6000mb" }));
  app.use(express.urlencoded({ extended: true, limit: "6000mb" }));
  app.use(
    session({
      secret: process.env.SECRET_KEY as string,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24,
      },
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(cookieParser());

  initializeRoutes(app);
};

const startServer = async (app: express.Application) => {
  app.listen(process.env.PORT, async () => {
    console.log(`App listening on the port ${process.env.PORT}`);
    await dbConnection();
  });
};

// Create and configure the Express app
const createApp = async () => {
  const app = express();
  await initializeConfigsAndRoute(app);
  return app;
};

// Start the application
createApp()
  .then(startServer)
  .catch((error) => {
    console.error("Error initializing the application:", error);
  });
