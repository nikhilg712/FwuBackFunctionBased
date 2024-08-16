// models/country.ts
import mongoose, { Document, Schema } from "mongoose";

export interface ICountry extends Document {
  name: string;
  code: string; // ISO country code
}

const countrySchema: Schema<ICountry> = new Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
});

const Country = mongoose.model<ICountry>("Country", countrySchema);

export default Country;
