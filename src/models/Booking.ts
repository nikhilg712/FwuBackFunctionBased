import mongoose, { Schema, Document } from "mongoose";

// Define interfaces for nested objects
interface Fare {
  Currency: string;
  BaseFare: number;
  Tax: number;
  TaxBreakup: { key: string; value: number }[];
  YQTax: number;
  AdditionalTxnFeeOfrd: number;
  AdditionalTxnFeePub: number;
  PGCharge: number;
  OtherCharges: number;
  ChargeBU: { key: string; value: number }[];
  Discount: number;
  PublishedFare: number;
  CommissionEarned: number;
  PLBEarned: number;
  IncentiveEarned: number;
  OfferedFare: number;
  TdsOnCommission: number;
  TdsOnPLB: number;
  TdsOnIncentive: number;
  ServiceFee: number;
  TotalBaggageCharges: number;
  TotalMealCharges: number;
  TotalSeatCharges: number;
  TotalSpecialServiceCharges: number;
}

interface Passenger {
  PaxId: number;
  Title: string;
  FirstName: string;
  LastName: string;
  PaxType: number;
  DateOfBirth: Date;
  Gender: number;
  IsPANRequired: boolean;
  IsPassportRequired: boolean;
  PAN: string;
  PassportNo: string;
  PassportExpiry: Date;
  AddressLine1: string;
  Fare: Fare;
  City: string;
  CountryCode: string;
  Nationality: string;
  ContactNo: string;
  Email: string;
  IsLeadPax: boolean;
}

interface Segment {
  Baggage: string;
  CabinBaggage: string | null;
  CabinClass: number;
  SupplierFareClass: string | null;
  TripIndicator: number;
  SegmentIndicator: number;
  Airline: {
    AirlineCode: string;
    AirlineName: string;
    FlightNumber: string;
    FareClass: string;
    OperatingCarrier: string;
  };
  Origin: {
    Airport: {
      AirportCode: string;
      AirportName: string;
      Terminal: string;
      CityCode: string;
      CityName: string;
      CountryCode: string;
      CountryName: string;
    };
    DepTime: Date;
  };
  Destination: {
    Airport: {
      AirportCode: string;
      AirportName: string;
      Terminal: string;
      CityCode: string;
      CityName: string;
      CountryCode: string;
      CountryName: string;
    };
    ArrTime: Date;
  };
  Duration: number;
  GroundTime: number;
  Mile: number;
  StopOver: boolean;
  Craft: string;
  Remark: string | null;
  IsETicketEligible: boolean;
  FlightStatus: string;
  Status: string;
}

interface FareRule {
  Origin: string;
  Destination: string;
  Airline: string;
  FareBasisCode: string;
  FareRuleDetail: string;
}

// Define the main FlightItinerary interface
interface FlightItinerary {
  JourneyType: number;
  SearchCombinationType: number;
  TripIndicator: number;
  BookingAllowedForRoamer: boolean;
  BookingId: number;
  PNR: string;
  IsDomestic: boolean;
  ResultFareType: string;
  Source: number;
  Origin: string;
  Destination: string;
  AirlineCode: string;
  LastTicketDate: Date;
  ValidatingAirlineCode: string;
  AirlineRemark: string;
  IsLCC: boolean;
  NonRefundable: boolean;
  FareType: string;
  Fare: Fare;
  Passenger: Passenger[];
  Segments: Segment[];
  FareRules: FareRule[];
}

// Main booking schema
export interface BookingDocument extends Document {
  userId: Schema.Types.ObjectId; // Reference to User model
  PNR: string;
  BookingId: number;
  SSRDenied: boolean;
  SSRMessage: string | null;
  Status: number;
  IsPriceChanged: boolean;
  IsTimeChanged: boolean;
  FlightItinerary: FlightItinerary;
}

const BookingSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  PNR: {
    type: String,
    required: true,
  },
  BookingId: {
    type: Number,
    required: true,
  },
  SSRDenied: {
    type: Boolean,
    default: false,
  },
  SSRMessage: {
    type: String,
    default: null,
  },
  Status: {
    type: Number,
    required: true,
  },
  IsPriceChanged: {
    type: Boolean,
    default: false,
  },
  IsTimeChanged: {
    type: Boolean,
    default: false,
  },
  FlightItinerary: {
    JourneyType: { type: Number, required: true },
    SearchCombinationType: { type: Number, required: true },
    TripIndicator: { type: Number, required: true },
    BookingAllowedForRoamer: { type: Boolean, default: true },
    BookingId: { type: Number, required: true },
    PNR: { type: String, required: true },
    IsDomestic: { type: Boolean, required: true },
    ResultFareType: { type: String, required: true },
    Source: { type: Number, required: true },
    Origin: { type: String, required: true },
    Destination: { type: String, required: true },
    AirlineCode: { type: String, required: true },
    LastTicketDate: { type: Date, required: true },
    ValidatingAirlineCode: { type: String, required: true },
    AirlineRemark: { type: String, default: "" },
    IsLCC: { type: Boolean, default: false },
    NonRefundable: { type: Boolean, default: false },
    FareType: { type: String, required: true },
    Fare: {
      Currency: { type: String, required: true },
      BaseFare: { type: Number, required: true },
      Tax: { type: Number, required: true },
      TaxBreakup: [
        {
          key: { type: String, required: true },
          value: { type: Number, required: true },
        },
      ],
      YQTax: { type: Number, default: 0 },
      AdditionalTxnFeeOfrd: { type: Number, default: 0 },
      AdditionalTxnFeePub: { type: Number, default: 0 },
      PGCharge: { type: Number, default: 0 },
      OtherCharges: { type: Number, default: 0 },
      ChargeBU: [
        {
          key: { type: String, required: true },
          value: { type: Number, required: true },
        },
      ],
      Discount: { type: Number, default: 0 },
      PublishedFare: { type: Number, required: true },
      CommissionEarned: { type: Number, required: true },
      PLBEarned: { type: Number, default: 0 },
      IncentiveEarned: { type: Number, default: 0 },
      OfferedFare: { type: Number, required: true },
      TdsOnCommission: { type: Number, required: true },
      TdsOnPLB: { type: Number, default: 0 },
      TdsOnIncentive: { type: Number, default: 0 },
      ServiceFee: { type: Number, default: 0 },
      TotalBaggageCharges: { type: Number, default: 0 },
      TotalMealCharges: { type: Number, default: 0 },
      TotalSeatCharges: { type: Number, default: 0 },
      TotalSpecialServiceCharges: { type: Number, default: 0 },
    },
    Passenger: [
      {
        PaxId: { type: Number, required: true },
        Title: { type: String, required: true },
        FirstName: { type: String, required: true },
        LastName: { type: String, required: true },
        PaxType: { type: Number, required: true },
        DateOfBirth: { type: Date, required: true },
        Gender: { type: Number, required: true },
        IsPANRequired: { type: Boolean, default: false },
        IsPassportRequired: { type: Boolean, default: false },
        PAN: { type: String, default: "" },
        PassportNo: { type: String, required: true },
        PassportExpiry: { type: Date, required: true },
        AddressLine1: { type: String, required: true },
        Fare: {
          Currency: { type: String, required: true },
          BaseFare: { type: Number, required: true },
          Tax: { type: Number, required: true },
          TaxBreakup: [
            {
              key: { type: String, required: true },
              value: { type: Number, required: true },
            },
          ],
          YQTax: { type: Number, default: 0 },
          AdditionalTxnFeeOfrd: { type: Number, default: 0 },
          AdditionalTxnFeePub: { type: Number, default: 0 },
          PGCharge: { type: Number, default: 0 },
          OtherCharges: { type: Number, default: 0 },
          ChargeBU: [
            {
              key: { type: String, required: true },
              value: { type: Number, required: true },
            },
          ],
          Discount: { type: Number, default: 0 },
          PublishedFare: { type: Number, required: true },
          CommissionEarned: { type: Number, required: true },
          PLBEarned: { type: Number, default: 0 },
          IncentiveEarned: { type: Number, default: 0 },
          OfferedFare: { type: Number, required: true },
          TdsOnCommission: { type: Number, required: true },
          TdsOnPLB: { type: Number, default: 0 },
          TdsOnIncentive: { type: Number, default: 0 },
          ServiceFee: { type: Number, default: 0 },
          TotalBaggageCharges: { type: Number, default: 0 },
          TotalMealCharges: { type: Number, default: 0 },
          TotalSeatCharges: { type: Number, default: 0 },
          TotalSpecialServiceCharges: { type: Number, default: 0 },
        },
        City: { type: String, required: true },
        CountryCode: { type: String, required: true },
        Nationality: { type: String, required: true },
        ContactNo: { type: String, required: true },
        Email: { type: String, required: true },
        IsLeadPax: { type: Boolean, default: false },
      },
    ],
    Segments: [
      {
        Baggage: { type: String, required: true },
        CabinBaggage: { type: String, default: null },
        CabinClass: { type: Number, required: true },
        SupplierFareClass: { type: String, default: null },
        TripIndicator: { type: Number, required: true },
        SegmentIndicator: { type: Number, required: true },
        Airline: {
          AirlineCode: { type: String, required: true },
          AirlineName: { type: String, required: true },
          FlightNumber: { type: String, required: true },
          FareClass: { type: String, required: true },
          OperatingCarrier: { type: String, required: true },
        },
        Origin: {
          Airport: {
            AirportCode: { type: String, required: true },
            AirportName: { type: String, required: true },
            Terminal: { type: String, required: true },
            CityCode: { type: String, required: true },
            CityName: { type: String, required: true },
            CountryCode: { type: String, required: true },
            CountryName: { type: String, required: true },
          },
          DepTime: { type: Date, required: true },
        },
        Destination: {
          Airport: {
            AirportCode: { type: String, required: true },
            AirportName: { type: String, required: true },
            Terminal: { type: String, required: true },
            CityCode: { type: String, required: true },
            CityName: { type: String, required: true },
            CountryCode: { type: String, required: true },
            CountryName: { type: String, required: true },
          },
          ArrTime: { type: Date, required: true },
        },
        Duration: { type: Number, required: true },
        GroundTime: { type: Number, required: true },
        Mile: { type: Number, required: true },
        StopOver: { type: Boolean, default: false },
        Craft: { type: String, required: true },
        Remark: { type: String, default: null },
        IsETicketEligible: { type: Boolean, default: true },
        FlightStatus: { type: String, required: true },
        Status: { type: String, required: true },
      },
    ],
    FareRules: [
      {
        Origin: { type: String, required: true },
        Destination: { type: String, required: true },
        Airline: { type: String, required: true },
        FareBasisCode: { type: String, required: true },
        FareRuleDetail: { type: String, required: true },
      },
    ],
  },
});

export const Booking = mongoose.model<BookingDocument>(
  "Booking",
  BookingSchema
);
