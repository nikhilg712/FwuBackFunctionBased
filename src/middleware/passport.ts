import passport from "passport";
import { Strategy as LocalStrategy, VerifyFunction } from "passport-local";
import { Strategy as CustomStrategy } from "passport-custom";
import bcrypt from "bcrypt";
import { constants } from "../constants/user.constants";
import { IUser, User } from "../models/users";
import { IAddress } from "../models/address";
import { ICountry } from "../models/country";
import { AppError } from "../utils/appError";
import { catchAsync } from "../utils/responseUtils";
import OTP from "../models/phoneotp";
import { OtpRequestBody } from "../interface/user.interface";

// Define the type for the `done` callback function
type DoneCallback = (
  err: Error | null,
  user?: IUser | false,
  info?: { message: string }
) => void;

// Function to handle user authentication
const authenticateUser: VerifyFunction = async (
  email: string,
  password: string,
  done: DoneCallback
) => {
  try {
    const user = await User.findOne({ email }).exec();
    if (!user) {
      return done(null, false, {
        message: constants.ERROR_MSG.INCORRECT_EMAIL,
      });
    }

    // Check if user password is defined
    if (typeof user.password !== "string") {
      return done(new AppError("User password is not set", 400), false);
    }

    // Ensure password is a string
    if (typeof password !== "string") {
      return done(new AppError("Password is required", 400), false);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return done(null, false, {
        message: constants.ERROR_MSG.INCORRECT_PASSWORD,
      });
    }

    return done(null, user);
  } catch (err) {
    return done(err as Error);
  }
};

const authenticateOtp = async (
  req: unknown, // Use unknown to handle the type mismatch
  done: DoneCallback
) => {
  try {
    // Assert req as Request type
    const request = req as Request;
    const body: any = request.body;
    const { phone, otp } = body;

    if (typeof phone !== "string" || typeof otp !== "string") {
      return done(new AppError("Phone and OTP must be strings", 400), false);
    }

    // Debugging: Log the phone and OTP values
    console.log(`Phone: ${phone}, OTP: ${otp}`);

    const otpRecord = await OTP.findOne({ phone, otp }).exec();
    if (!otpRecord) {
      return done(new AppError("Invalid OTP or OTP has expired", 400), false);
    }

    const user = await User.findOne({ phone }).exec();
    if (!user) {
      // Debugging: Log user not found case
      console.log(`User not found for phone: ${phone}`);
      return done(new AppError("User not found", 404), false);
    }

    return done(null, user);
  } catch (err) {
    return done(err as Error);
  }
};

// Serialize user into session
passport.serializeUser((user, done) => {
  // Ensure user ID is of type string
  done(null, (user as IUser)._id.toString()); // Use _id if that is the property name
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id)
      .populate({
        path: "address", // Address field in User schema
        populate: {
          path: "country", // Country field in Address schema
          model: "Country", // Ensure this matches the model name
        },
      })
      .populate({
        path: "passportIssuingCountry", // Passport issuing country field
        model: "Country", // Ensure this matches the model name
      })
      .populate({
        path: "nationality", // Nationality field
        model: "Country", // Ensure this matches the model name
      })
      .exec();
    // If user exists, filter out sensitive properties
    if (user) {
      // Create a plain object to exclude properties
      done(null, user);
    } else {
      done(new Error("User not found"));
    }
  } catch (err) {
    done(err as Error);
  }
});

// Configure Passport Local Strategy
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    authenticateUser
  )
);

// Configure Passport Custom Strategy for phone and OTP
passport.use(
  "otp",
  new CustomStrategy((req: unknown, done: DoneCallback) =>
    authenticateOtp(req, done)
  )
);
export default passport;
