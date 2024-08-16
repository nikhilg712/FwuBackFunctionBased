import { Document, Schema, model } from "mongoose";
import bcrypt from "bcrypt";

// Define the IUser interface extending Document
interface IUser extends Document {
  username: string;
  email: string;
  uid: string;
  password: string;
  gender: string;
  dateOfBirth: Date;
  passportNo: string;
  passportExpiry: Date;
  passportIssuingCountry: {
    countryCode: string;
    countryName: string;
  };
  panNo: string;
  nationality: {
    countryCode: string;
    countryName: string;
  };
  address: Array<{
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  }>;
  phone: string;
  userType: "Admin" | "Client";
  profilePic: string;
  wallet: number;
  refCode: string;
  deviceId: string;
  deviceToken: string;
  googleId: string;
}

// Create the schema with the IUser type
const userSchema: Schema<IUser> = new Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    uid: { type: String, required: true, unique: true },
    password: {
      type: String,
      required: true,
      // TODO: Apply custom validation logic only in controllers
      validate: {
        validator: function (v: string) {
          // Debugging: log the password being validated
          console.log("Validating password:", v);
          // Regular expression for validation
          return /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(v);
        },
        message:
          "Password must be at least 8 characters long, with at least one uppercase letter, one number, and one special character.",
      },
    },
    gender: { type: String, required: true }, // TODO: use enum
    dateOfBirth: { type: Date, required: true },
    passportNo: { type: String, required: true },
    passportExpiry: { type: Date, required: true },
    passportIssuingCountry: {
      countryCode: { type: String, required: true },
      countryName: { type: String, required: true },
    },
    panNo: { type: String, required: true },
    nationality: {
      countryCode: { type: String, required: true },
      countryName: { type: String, required: true },
    },
    address: [
      {
        // TODO: Avoid using objects inside models
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zipCode: { type: String, required: true },
        country: { type: String, required: true },
      },
    ],
    phone: { type: String, required: true },
    userType: {
      type: String,
      enum: ["Admin", "Client"],
      default: "Client",
    },
    profilePic: { type: String },
    wallet: { type: Number, default: 0 },
    refCode: { type: String },
    deviceId: { type: String },
    deviceToken: { type: String },
    googleId: { type: String, unique: false },
  },
  // eslint-disable-next-line prettier/prettier
  { timestamps: true }
);

// Correctly type the pre-save hook function
// eslint-disable-next-line @typescript-eslint/no-explicit-any
userSchema.pre<IUser>("save", async function (next: any) {
  // TODO: always do encryption in controller
  if (this.isModified("password")) {
    const password = this.password;

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(password)) {
      const error = new Error(
        // eslint-disable-next-line prettier/prettier
        "Password must be at least 8 characters long, with at least one uppercase letter, one number, and one special character."
      );
      return next(error);
    }

    try {
      const saltRounds = 10;
      const salt = await bcrypt.genSalt(saltRounds);
      const hashedPassword = await bcrypt.hash(password, salt);
      this.password = hashedPassword;
    } catch (err) {
      return next(err);
    }
  }

  next();
});

const User = model<IUser>("User", userSchema);

export { User, IUser };
