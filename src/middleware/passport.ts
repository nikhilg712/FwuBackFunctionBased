import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models/users";
import OTP from "../models/otp";
import { AppError } from "../utils/appError";
import bcrypt from "bcrypt";

// SIGNUP EMAIL
passport.use(
  "signup-email",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "otp",
    },
    async (email: string, otp: string, done) => {
      try {
        let otpRecord = await OTP.findOne({ email: email })
          .sort({ createdAt: -1 })
          .exec();

        console.log("OTP: ", otp);
        console.log("record: ", otpRecord);

        if (!otpRecord) {
          return done(null, false, {
            message: "No OTP found for the provided user",
          });
        } else if (otpRecord.otp !== otp) {
          return done(null, false, {
            message: "Invalid OTP, Please try again",
          });
        } else if (new Date().getTime() - otpRecord.expiresAt.getTime() > 0) {
          return done(null, false, {
            message: "OTP Expired, Please try again",
          });
        } else {
          let dbUser = await User.findOne({ email: email });
          if (dbUser) {
            dbUser.isVerified = true;
            await dbUser.save();

            // Passportjs login
            return done(null, dbUser);
          } else {
            throw new AppError("No user found", 400);
          }
        }
      } catch (error) {
        return done(error);
      }
    }
  )
);

// SIGNUP PHONE
passport.use(
  "signup-phone",
  new LocalStrategy(
    {
      usernameField: "phone",
      passwordField: "otp",
    },
    async (phone: string, otp: string, done) => {
      try {
        let otpRecord = await OTP.findOne({ phone: phone })
          .sort({ createdAt: -1 })
          .exec();

        if (!otpRecord) {
          return done(null, false, {
            message: "No OTP found for the provided user",
          });
        } else if (otpRecord.otp !== otp) {
          return done(null, false, {
            message: "Invalid OTP, Please try again",
          });
        } else if (new Date().getTime() - otpRecord.expiresAt.getTime() > 0) {
          return done(null, false, {
            message: "OTP Expired, Please try again",
          });
        } else {
          let user = await User.findOne({ phone: phone });
          if (user) {
            user.isVerified = true;
            await user.save();

            // Login via passportjs
            return done(null, user);
          } else {
            return done(null, false, {
              message: "No user found",
            });
          }
        }
      } catch (error) {
        return done(error);
      }
    }
  )
);

// LOGIN EMAIL
passport.use(
  "login-email",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email: string, password: string, done) => {
      try {
        const user = await User.findOne({
          email: email,
          isVerified: true,
        }).exec();

        if (!user) {
          return done(null, false, {
            message: "No user found",
          });
        }

        if (!password) {
          return done(null, false, {
            message: "Please provide password",
          });
        }

        let isMatch = await bcrypt.compare(password, user.password!);
        if (!isMatch) {
          return done(null, false, {
            message: "Incorrect password",
          });
        } else {
          done(null, user);
        }
      } catch (error) {
        return done(error);
      }
    }
  )
);

// LOGIN PHONE // TODO: Optimize
passport.use(
  "login-phone",
  new LocalStrategy(
    {
      usernameField: "phone",
      passwordField: "otp",
    },
    async (phone: string, otp: string, done) => {
      try {
        let otpRecord = await OTP.findOne({ phone: phone })
          .sort({ createdAt: -1 })
          .exec();

        if (!otpRecord) {
          return done(null, false, {
            message: "No OTP found for the provided user",
          });
        } else if (otpRecord.otp !== otp) {
          return done(null, false, {
            message: "Invalid OTP, Please try again",
          });
        } else if (new Date().getTime() - otpRecord.expiresAt.getTime() > 0) {
          return done(null, false, {
            message: "OTP Expired, Please try again",
          });
        } else {
          let user = await User.findOne({ phone: phone });
          if (user) {
            // Login via passportjs
            return done(null, user);
          } else {
            return done(null, false, {
              message: "No user found",
            });
          }
        }
      } catch (error) {
        return done(error);
      }
    }
  )
);

// GOOGLE SIGNUP
passport.use(
  "google",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!!,
      callbackURL: "http://localhost:8000/fwu/api/v1/user/auth/google/callback",
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: any,
      done: Function
    ) => {
      try {
        console.log("Hi");
        console.log("Access Token:", accessToken);
        console.log("Refresh Token:", refreshToken);
        console.log("Profile:", profile);

        const existingUser = await User.findOne({ googleId: profile.id });
        if (existingUser) {
          return done(null, existingUser);
        }

        const email = profile.emails?.[0]?.value || "";
        if (!email) {
          return done(new AppError("No email found in Google profile", 400));
        }

        const newUser = await new User({
          googleId: profile.id,
          username: profile.displayName,
          email: profile.emails[0].value,
          isVerified: true,
        }).save();

        // Send user to callback function
        done(null, newUser);
      } catch (err: any) {
        console.log(err.message);
        throw new AppError(err, 400);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  console.log("Serializing passport user: ", user);
  done(null, user?._id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// import passport from "passport";
// import { Strategy as LocalStrategy, VerifyFunction } from "passport-local";
// import { Strategy as CustomStrategy } from "passport-custom";
// import { Strategy as GoogleStrategy } from "passport-google-oauth20";
// import bcrypt from "bcrypt";
// import { constants } from "../constants/user.constants";
// import { IUser, User } from "../models/users";
// import { IAddress } from "../models/address";
// import { ICountry } from "../models/country";
// import { AppError } from "../utils/appError";
// import { catchAsync } from "../utils/responseUtils";
// import { OtpRequestBody } from "../interface/user.interface";
// import dotenv from "dotenv";
// import OTP from "../models/otp";
// dotenv.config();

// // Define the type for the `done` callback function
// type DoneCallback = (
//   err: Error | null,
//   user?: IUser | false,
//   info?: { message: string },
// ) => void;

// // Function to handle user authentication
// const authenticateUser: VerifyFunction = async (
//   email: string,
//   password: string,
//   done: DoneCallback,
// ) => {
//   try {
//     const user = await User.findOne({ email }).exec();
//     if (!user) {
//       return done(null, false, {
//         message: constants.ERROR_MSG.INCORRECT_EMAIL,
//       });
//     }

//     // Check if user password is defined
//     if (typeof user.password !== "string") {
//       return done(new AppError("User password is not set", 400), false);
//     }

//     // Ensure password is a string
//     if (typeof password !== "string") {
//       return done(new AppError("Password is required", 400), false);
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return done(null, false, {
//         message: constants.ERROR_MSG.INCORRECT_PASSWORD,
//       });
//     }

//     return done(null, user);
//   } catch (err) {
//     return done(err as Error);
//   }
// };

// const authenticateOtp = async (
//   req: unknown, // Use unknown to handle the type mismatch
//   done: DoneCallback,
// ) => {
//   try {
//     // Assert req as Request type
//     const request = req as Request;
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     const body: any = request.body;
//     const { phone, otp } = body;

//     if (typeof phone !== "string" || typeof otp !== "string") {
//       return done(new AppError("Phone and OTP must be strings", 400), false);
//     }

//     // Debugging: Log the phone and OTP values
//     console.log(`Phone: ${phone}, OTP: ${otp}`);

//     const otpRecord = await OTP.findOne({ phone, otp }).exec();
//     if (!otpRecord) {
//       return done(new AppError("Invalid OTP or OTP has expired", 400), false);
//     }

//     const user = await User.findOne({ phone }).exec();
//     if (!user) {
//       // Create new user
//       const newUser = await new User({
//         phone: phone,
//       }).save();

//       console.log(
//         `User not found for phone,So created new user with this : ${phone}`,
//       );
//       return done(null, newUser);
//     }

//     return done(null, user);
//   } catch (err) {
//     return done(err as Error);
//   }
// };

// // Serialize user into session
// passport.serializeUser((user, done) => {
//   // Ensure user ID is of type string
//   done(null, (user as IUser)._id.toString()); // Use _id if that is the property name
// });

// // Deserialize user from session
// passport.deserializeUser(async (id: string, done) => {
//   try {
//     const user = await User.findById(id)
//       .populate({
//         path: "address", // Address field in User schema
//         populate: {
//           path: "country", // Country field in Address schema
//           model: "Country", // Ensure this matches the model name
//         },
//       })
//       .populate({
//         path: "passportIssuingCountry", // Passport issuing country field
//         model: "Country", // Ensure this matches the model name
//       })
//       .populate({
//         path: "nationality", // Nationality field
//         model: "Country", // Ensure this matches the model name
//       })
//       .exec();
//     // If user exists, filter out sensitive properties
//     if (user) {
//       // Create a plain object to exclude properties
//       done(null, user);
//     } else {
//       done(new Error("User not found"));
//     }
//   } catch (err) {
//     done(err as Error);
//   }
// });

// // Configure Passport Local Strategy
// passport.use(
//   new LocalStrategy(
//     {
//       usernameField: "email",
//       passwordField: "password",
//     },
//     authenticateUser,
//   ),
// );

// // Configure Passport Custom Strategy for phone and OTP
// passport.use(
//   "otp",
//   new CustomStrategy((req: unknown, done: DoneCallback) =>
//     authenticateOtp(req, done),
//   ),
// );

// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID || "",
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET || "", // Your Client Secret
//       callbackURL: "http://localhost:8000/fwu/api/v1/user/auth/google/callback",
//     },
//     async (
//       accessToken: string,
//       refreshToken: string,
//       // eslint-disable-next-line @typescript-eslint/no-explicit-any
//       profile: any,
//       // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
//       done: Function,
//     ) => {
//       try {
//         console.log("Access Token:", accessToken);
//         console.log("Refresh Token:", refreshToken);
//         console.log("Profile:", profile);

//         const existingUser = await User.findOne({ googleId: profile.id });
//         if (existingUser) {
//           return done(null, existingUser);
//         }

//         const newUser = await new User({
//           googleId: profile.id,
//           username: profile.displayName,
//           email: profile.emails[0].value,
//         }).save();

//         done(null, newUser);
//         // eslint-disable-next-line @typescript-eslint/no-explicit-any
//       } catch (err: any) {
//         console.log(err.message);
//         throw new AppError(err, 400);
//       }
//     },
//   ),
// );
// export default passport;
