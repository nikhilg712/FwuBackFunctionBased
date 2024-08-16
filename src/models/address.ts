// models/address.ts
import mongoose, { Document, Schema } from "mongoose";
import { ICountry } from "./country";

export interface IAddress extends Document {
  street: string;
  city: string;
  state: string;
  country: ICountry["_id"]; // Reference to Country
  zipCode: string;
}

const addressSchema: Schema<IAddress> = new Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: Schema.Types.ObjectId, ref: "Country", required: true },
  zipCode: { type: String, required: true },
});

const Address = mongoose.model<IAddress>("Address", addressSchema);

export default Address;
