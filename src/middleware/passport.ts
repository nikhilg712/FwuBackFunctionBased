import passport from "passport";
import { Strategy as LocalStrategy, VerifyFunction } from "passport-local";
import bcrypt from "bcrypt";
import { constants } from "../constants/user.constants";
import { IUser, User } from "../models/users";

// Define the type for the `done` callback function
type DoneCallback = (
  err: Error | null,
  user?: IUser | false,
  info?: { message: string },
) => void;

// Function to handle user authentication
const authenticateUser: VerifyFunction = async (
  email: string,
  password: string,
  done: DoneCallback,
) => {
  try {
    const user = await User.findOne({ email }).exec();
    if (!user) {
      return done(null, false, {
        message: constants.ERROR_MSG.INCORRECT_EMAIL,
      });
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

// Serialize user into session
passport.serializeUser((user, done) => {
  // Ensure user ID is of type string
  done(null, (user as IUser)._id.toString()); // Use _id if that is the property name
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id).exec();
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
    authenticateUser,
  ),
);

export default passport;
