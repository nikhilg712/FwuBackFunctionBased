import { Schema, model, Document, Model } from "mongoose";

// Define the Airport interface
interface IAirport extends Document {
  CITYNAME: string;
  CITYCODE: string;
  COUNTRYCODE: string;
  COUNTRYNAME: string;
  AIRPORTCODE: string;
  AIRPORTNAME: string;
}

// Define the schema for the Airport document
const airportSchema: Schema<IAirport> = new Schema(
  {
    CITYNAME: { type: String, required: true, index: true }, // search indexed
    CITYCODE: { type: String, required: true },
    COUNTRYCODE: { type: String, required: true },
    COUNTRYNAME: { type: String, required: true },
    AIRPORTCODE: { type: String, required: true },
    AIRPORTNAME: { type: String, required: false },
  },
  { timestamps: true, _id: true },
);

// Create and export the Airport model

const Airport = model<IAirport>("Airport", airportSchema);

export { Airport, IAirport };
