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
import MongoStore from "connect-mongo";
require("./middleware/passport");

// Load environment variables
dotenv.config();
const initializeConfigsAndRoute = async (app: express.Application) => {
  // Initialize Passport configuration
  //   new PassportConfig();

  // Middleware setup
  app.use(logger("dev"));

  // app.use((req, res, next) => {
  //   res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // Replace with your frontend origin
  //   res.header("Access-Control-Allow-Credentials", "true");
  //   res.header(
  //     "Access-Control-Allow-Headers",
  //     "Origin, X-Requested-With, Content-Type, Accept"
  //   );
  //   res.header(
  //     "Access-Control-Allow-Methods",
  //     "GET, POST, PUT, DELETE, OPTIONS"
  //   );
  //   next();
  // });

  app.use(
    cors({
      origin: "http://localhost:3000",
      // methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      // allowedHeaders: [
      //   "Content-Type",
      //   "Authorization",
      //   "X-CSRF-Token",
      //   "X-Requested-With",
      // ],
      credentials: true,
    })
  );
  app.use(upload());
  app.use(express.json({ limit: "6000mb" }));
  app.use(express.urlencoded({ extended: true, limit: "6000mb" }));

  const mongoStore = MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: "sessions",
    ttl: 14 * 24 * 60 * 60,
  });

  app.use(
    session({
      secret: process.env.SECRET_KEY as string,
      resave: false,
      proxy: true,
      saveUninitialized: false,
      store: mongoStore,
      cookie: {
        maxAge: 31536000,
        secure: false,
        sameSite: "strict",
        httpOnly: false,
      },
    })
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
