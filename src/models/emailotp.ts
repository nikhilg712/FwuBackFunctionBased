import mongoose, { Document, Schema } from "mongoose";

// Define the IOTP interface
export interface EmailIOTP extends Document {
  email: string;
  otp: string;
  expiresAt: Date;
}

// Create the OTP schema
const otpEmailSchema: Schema<EmailIOTP> = new Schema(
  {
    email: {
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
const EmailOtp = mongoose.model<EmailIOTP>("EmailOtp", otpEmailSchema);

export default EmailOtp;
