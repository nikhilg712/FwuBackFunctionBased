import { Schema } from "mongoose";

export interface UserType {
  _id: string;
  username: string;
  email: string;
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
  resetPasswordExpiry: number;
  resetPasswordToken: string;
}

export interface CoTravellerType {
  userId: Schema.Types.ObjectId;
  name: string;
  email: string;
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
  profilePic: string;
}

export interface CoTravellerResponseType {
  data: object;
  flag: boolean;
  type: string;
  message: string;
}

export interface SignupSearchResponse {
  data: UserType[];
}

export interface SignupResponseType {
  data: Array<object>;
  flag: boolean;
  type: string;
  message: string;
}

export interface LoginResponseType {
  data: object;
  flag: boolean;
  type: string;
  message: string;
}

export interface UserResponseType {
  data: object;
  flag: boolean;
  type: string;
  message: string;
}

export interface UserSignup {
  phone: string;
  email: string;
  password: string;
}

export interface OtpRequestBody {
  phone: string;
  otp: string;
}
