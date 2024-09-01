import express from "express";
import logger from "morgan";
import cors from "cors";
import passport from "passport";
import session from "express-session";
import initializeRoutes from "./routes/index";
import dotenv from "dotenv";
import upload from "express-fileupload";
import cookieParser from "cookie-parser";
import dbConnection from "./utils/dbConnection";
import MongoStore from "connect-mongo";
import fs from "fs";
import path from "path";
import { IncomingMessage, ServerResponse } from "http";
require("./middleware/passport");

// Load environment variables
dotenv.config();

// Create a writable stream for the combined log file
const logFilePath = path.join(__dirname, "error.log"); // Change the path as needed
const logStream = fs.createWriteStream(logFilePath, { flags: "a" });

// Custom Morgan token for error logging
logger.token("error", (req: IncomingMessage, res: ServerResponse) => {
  return (res as express.Response).locals.errorMessage || "";
});

const initializeConfigsAndRoute = async (app: express.Application) => {
  // Use Morgan to log complete details to a file
  app.use(
    logger(
      ":method :url :status :response-time ms - :res[content-length] :error",
      {
        skip: (req, res) => res.statusCode < 400, // Optionally, only log errors
        stream: logStream, // Log to the file
      }
    )
  );

  // Also log all requests and errors to the console
  app.use(
    logger(
      ":method :url :status :response-time ms - :res[content-length] :error",
      {
        skip: (req, res) => res.statusCode < 400, // Optionally, only log errors
        stream: process.stderr, // Log errors to stderr
      }
    )
  );
  app.use(logger("dev"));
  // Middleware setup
  app.use(
    cors({
      origin: "http://localhost:3000",
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
