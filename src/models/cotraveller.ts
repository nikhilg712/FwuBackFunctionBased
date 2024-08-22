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
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    gender: { type: String, required: true },
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
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zipCode: { type: String, required: true },
        country: { type: String, required: true },
      },
    ],
    phone: { type: String, required: true },
    profilePic: { type: String },
  },
  { timestamps: true },
);

const CoTraveller = model<ICoTraveller>("CoTraveller", coTravellerSchema);

export { CoTraveller, ICoTraveller };
