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
  data: CoTravellerType[];
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

export interface OtpRequestEmailBody {
  email: string;
  otp: string;
}

export interface UserData {
  googleId: string; // Google ID associated with the user
  username: string; // User's display name
  email: string; // User's email address
  _id?: string; // Optional: MongoDB ObjectId if the user has already been created
  refreshToken?: string; // Optional: Refresh token if applicable
  // Add any other fields as necessary
}

export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  bucket: string;
  key: string;
  acl: string;
  contentType: string;
  contentDisposition: string | null;
  contentEncoding: string | null;
  storageClass: string;
  serverSideEncryption: string | null;
  metadata: {
    fieldName: string;
  };
  location: string;
  etag: string;
  versionId?: string;
}
