import { Schema, model, Document, Model } from "mongoose";

// Define the schema for the Airport document
const createAirportSchema = () => {
  return new Schema<IAirport>(
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
};

// Define the Airport interface
interface IAirport extends Document {
  CITYNAME: string;
  CITYCODE: string;
  COUNTRYCODE: string;
  COUNTRYNAME: string;
  AIRPORTCODE: string;
  AIRPORTNAME: string;
}

// Create and export the Airport model
const createAirportModel = (): Model<IAirport> => {
  const airportSchema = createAirportSchema();
  return model<IAirport>("Airport", airportSchema);
};

export default createAirportModel;
