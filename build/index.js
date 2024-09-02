"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const passport_1 = __importDefault(require("passport"));
const express_session_1 = __importDefault(require("express-session"));
const index_1 = __importDefault(require("./routes/index"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dbConnection_1 = __importDefault(require("./utils/dbConnection"));
const connect_mongo_1 = __importDefault(require("connect-mongo"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
require("./middleware/passport");
// Load environment variables
dotenv_1.default.config();
// Create a writable stream for the combined log file
const logFilePath = path_1.default.join(__dirname, "error.log"); // Change the path as needed
const logStream = fs_1.default.createWriteStream(logFilePath, { flags: "a" });
// Custom Morgan token for error logging
morgan_1.default.token("error", (req, res) => {
    return res.locals.errorMessage || "";
});
const initializeConfigsAndRoute = async (app) => {
    // Use Morgan to log complete details to a file
    app.use((0, morgan_1.default)(":method :url :status :response-time ms - :res[content-length] :error", {
        skip: (req, res) => res.statusCode < 400, // Optionally, only log errors
        stream: logStream, // Log to the file
    }));
    // Also log all requests and errors to the console
    app.use((0, morgan_1.default)(":method :url :status :response-time ms - :res[content-length] :error", {
        skip: (req, res) => res.statusCode < 400, // Optionally, only log errors
        stream: process.stderr, // Log errors to stderr
    }));
    app.use((0, morgan_1.default)("dev"));
    // Middleware setup
    app.use((0, cors_1.default)({
        origin: "http://localhost:3000",
        credentials: true,
    }));
    app.use((0, express_fileupload_1.default)());
    app.use(express_1.default.json({ limit: "6000mb" }));
    app.use(express_1.default.urlencoded({ extended: true, limit: "6000mb" }));
    const mongoStore = connect_mongo_1.default.create({
        mongoUrl: process.env.MONGODB_URI,
        collectionName: "sessions",
        ttl: 14 * 24 * 60 * 60,
    });
    app.use((0, express_session_1.default)({
        secret: process.env.SECRET_KEY,
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
    }));
    app.use(passport_1.default.initialize());
    app.use(passport_1.default.session());
    app.use((0, cookie_parser_1.default)());
    (0, index_1.default)(app);
};
const startServer = async (app) => {
    app.listen(process.env.PORT, async () => {
        console.log(`App listening on the port ${process.env.PORT}`);
        await (0, dbConnection_1.default)();
    });
};
// Create and configure the Express app
const createApp = async () => {
    const app = (0, express_1.default)();
    await initializeConfigsAndRoute(app);
    return app;
};
// Start the application
createApp()
    .then(startServer)
    .catch((error) => {
    console.error("Error initializing the application:", error);
});
