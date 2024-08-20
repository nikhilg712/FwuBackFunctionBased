import { Document, Schema, model } from "mongoose";
import { IAddress } from "./address";
import { ICountry } from "./country";

// Define the enum for gender
enum Gender {
  Male = "Male",
  Female = "Female",
  Other = "Other",
}

// Define the IUser interface extending Document
interface IUser extends Document {
  username?: string;
  email?: string;
  password?: string;
  gender?: Gender;
  dateOfBirth?: Date;
  passportNo?: string;
  passportExpiry?: Date;
  passportIssuingCountry?: ICountry["_id"];
  panNo?: string;
  nationality?: ICountry["_id"];
  address?: IAddress["_id"];
  phone: string;
  userType?: "Admin" | "Client";
  profilePic?: string;
  wallet?: number;
  refCode?: string;
  deviceId?: string;
  deviceToken?: string;
  googleId?: string;
}

// Create the schema with the IUser type
const userSchema: Schema<IUser> = new Schema(
  {
    username: { type: String, unique: true },
    email: { type: String, unique: true },
    password: { type: String },
    gender: { type: String, enum: Object.values(Gender) },
    dateOfBirth: { type: Date },
    passportNo: { type: String },
    passportExpiry: { type: Date },
    passportIssuingCountry: {
      type: Schema.Types.ObjectId,
      ref: "Country",
    },
    panNo: { type: String },
    nationality: {
      type: Schema.Types.ObjectId,
      ref: "Country",
    },
    address: [{ type: Schema.Types.ObjectId, ref: "Address" }],
    phone: { type: String, required: true },
    userType: { type: String, enum: ["Admin", "Client"], default: "Client" },
    profilePic: { type: String },
    wallet: { type: Number, default: 0 },
    refCode: { type: String },
    deviceId: { type: String },
    deviceToken: { type: String },
    googleId: { type: String, unique: false },
  },
  { timestamps: true },
);

const User = model<IUser>("User", userSchema);

export { User, IUser };
