// src/middleware/passport.ts
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import { constants } from "../constants/user.constants";
import { IUser, User } from "../models/users";

// Configure Passport Local Strategy
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email: string, password: string, done: Function) => {
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
        return done(err);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done: Function) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

export default passport;
