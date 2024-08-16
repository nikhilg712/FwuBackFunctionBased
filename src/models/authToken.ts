import { Schema, Document, model } from "mongoose";

interface IAuthToken extends Document {
  ipAddress: string;
  tokenId: string;
  MemberId: string;
  AgencyId: string;
}

const authtokenSchema = new Schema<IAuthToken>(
  {
    ipAddress: { type: String, required: true, index: true }, // search indexed
    tokenId: { type: String, required: true },
    MemberId: { type: String, required: true },
    AgencyId: { type: String, required: true },
  },
  { timestamps: true, _id: true },
);

const AuthToken = model<IAuthToken>("AuthToken", authtokenSchema);

export default AuthToken;
