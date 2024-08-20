import mongoose, { Document, Schema } from "mongoose";

// Define the IOTP interface
export interface IOTP extends Document {
  phone: string;
  otp: string;
  expiresAt: Date;
}

// Create the OTP schema
const otpSchema: Schema<IOTP> = new Schema(
  {
    phone: {
      type: String,
      required: true,
      unique: true, // Ensure that each phone number has only one OTP
    },
    otp: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Create the OTP model
const OTP = mongoose.model<IOTP>("OTP", otpSchema);

export default OTP;
