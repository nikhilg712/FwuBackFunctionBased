import { Document, Schema, model } from "mongoose";

interface ICoTraveller extends Document {
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

const coTravellerSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    name: { type: String },
    email: { type: String },
    gender: { type: String },
    dateOfBirth: { type: Date },
    passportNo: { type: String },
    passportExpiry: { type: Date },
    passportIssuingCountry: {
      countryCode: { type: String },
      countryName: { type: String },
    },
    panNo: { type: String },
    nationality: {
      countryCode: { type: String },
      countryName: { type: String },
    },
    address: [
      {
        street: { type: String },
        city: { type: String },
        state: { type: String },
        zipCode: { type: String },
        country: { type: String },
      },
    ],
    phone: { type: String },
    profilePic: { type: String },
  },
  { timestamps: true },
);

const CoTraveller = model<ICoTraveller>("CoTraveller", coTravellerSchema);

export { CoTraveller, ICoTraveller };
