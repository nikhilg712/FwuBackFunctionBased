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
  TransactionID: Schema.Types.ObjectId;
  PNR: string;
  BookingId: number;
  SSRDenied: boolean;
  SSRMessage: string | null;
  Status: number;
  IsPriceChanged: boolean;
  IsTimeChanged: boolean;
  FlightItinerary: FlightItinerary;
  PaymentStatus: string;
  NetPayable:number;
  ResultIndex:string;
}

const BookingSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  PNR: {
    type: String,
    required: true,
  },
  ResultIndex:{
    type: String,
    required: true,
  },
  TransactionID: {
    type: Schema.Types.ObjectId,
    ref: "Transaction",
    default:null
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
  PaymentStatus: { type: String, default: "Initiated" },
  NetPayable:{ type: Number },
  FlightItinerary: {
    JourneyType: { type: Number },
    SearchCombinationType: { type: Number },
    TripIndicator: { type: Number },
    BookingAllowedForRoamer: { type: Boolean, default: true },
    BookingId: { type: Number },
    PNR: { type: String },
    IsDomestic: { type: Boolean },
    ResultFareType: { type: String },
    Source: { type: Number },
    Origin: { type: String },
    Destination: { type: String },
    AirlineCode: { type: String },
    LastTicketDate: { type: Date },
    ValidatingAirlineCode: { type: String },
    AirlineRemark: { type: String, default: "" },
    IsLCC: { type: Boolean, default: false },
    NonRefundable: { type: Boolean, default: false },
    FareType: { type: String },
    Fare: {
      Currency: { type: String },
      BaseFare: { type: Number },
      Tax: { type: Number },
      TaxBreakup: [
        {
          key: { type: String },
          value: { type: Number },
        },
      ],
      YQTax: { type: Number, default: 0 },
      AdditionalTxnFeeOfrd: { type: Number, default: 0 },
      AdditionalTxnFeePub: { type: Number, default: 0 },
      PGCharge: { type: Number, default: 0 },
      OtherCharges: { type: Number, default: 0 },
      ChargeBU: [
        {
          key: { type: String },
          value: { type: Number },
        },
      ],
      Discount: { type: Number, default: 0 },
      PublishedFare: { type: Number },
      CommissionEarned: { type: Number },
      PLBEarned: { type: Number, default: 0 },
      IncentiveEarned: { type: Number, default: 0 },
      OfferedFare: { type: Number },
      TdsOnCommission: { type: Number },
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
        PaxId: { type: Number },
        Title: { type: String },
        FirstName: { type: String },
        LastName: { type: String },
        PaxType: { type: Number },
        DateOfBirth: { type: Date },
        Gender: { type: Number },
        IsPANRequired: { type: Boolean, default: false },
        IsPassportRequired: { type: Boolean, default: false },
        PAN: { type: String, default: "" },
        PassportNo: { type: String },
        PassportExpiry: { type: Date },
        AddressLine1: { type: String },
        Fare: {
          Currency: { type: String },
          BaseFare: { type: Number },
          Tax: { type: Number },
          TaxBreakup: [
            {
              key: { type: String },
              value: { type: Number },
            },
          ],
          YQTax: { type: Number, default: 0 },
          AdditionalTxnFeeOfrd: { type: Number, default: 0 },
          AdditionalTxnFeePub: { type: Number, default: 0 },
          PGCharge: { type: Number, default: 0 },
          OtherCharges: { type: Number, default: 0 },
          ChargeBU: [
            {
              key: { type: String },
              value: { type: Number },
            },
          ],
          Discount: { type: Number, default: 0 },
          PublishedFare: { type: Number },
          CommissionEarned: { type: Number },
          PLBEarned: { type: Number, default: 0 },
          IncentiveEarned: { type: Number, default: 0 },
          OfferedFare: { type: Number },
          TdsOnCommission: { type: Number },
          TdsOnPLB: { type: Number, default: 0 },
          TdsOnIncentive: { type: Number, default: 0 },
          ServiceFee: { type: Number, default: 0 },
          TotalBaggageCharges: { type: Number, default: 0 },
          TotalMealCharges: { type: Number, default: 0 },
          TotalSeatCharges: { type: Number, default: 0 },
          TotalSpecialServiceCharges: { type: Number, default: 0 },
        },
        City: { type: String },
        CountryCode: { type: String },
        Nationality: { type: String },
        ContactNo: { type: String },
        Email: { type: String },
        IsLeadPax: { type: Boolean, default: false },
      },
    ],
    Segments: [
      {
        Baggage: { type: String },
        CabinBaggage: { type: String, default: null },
        CabinClass: { type: Number },
        SupplierFareClass: { type: String, default: null },
        TripIndicator: { type: Number },
        SegmentIndicator: { type: Number },
        Airline: {
          AirlineCode: { type: String },
          AirlineName: { type: String },
          FlightNumber: { type: String },
          FareClass: { type: String },
          OperatingCarrier: { type: String },
        },
        Origin: {
          Airport: {
            AirportCode: { type: String },
            AirportName: { type: String },
            Terminal: { type: String },
            CityCode: { type: String },
            CityName: { type: String },
            CountryCode: { type: String },
            CountryName: { type: String },
          },
          DepTime: { type: Date },
        },
        Destination: {
          Airport: {
            AirportCode: { type: String },
            AirportName: { type: String },
            Terminal: { type: String },
            CityCode: { type: String },
            CityName: { type: String },
            CountryCode: { type: String },
            CountryName: { type: String },
          },
          ArrTime: { type: Date },
        },
        Duration: { type: Number },
        GroundTime: { type: Number },
        Mile: { type: Number },
        StopOver: { type: Boolean, default: false },
        Craft: { type: String },
        Remark: { type: String, default: null },
        IsETicketEligible: { type: Boolean, default: true },
        FlightStatus: { type: String },
        Status: { type: String },
      },
    ],
    FareRules: [
      {
        Origin: { type: String },
        Destination: { type: String },
        Airline: { type: String },
        FareBasisCode: { type: String },
        FareRuleDetail: { type: String },
      },
    ],
  },
});

export const Booking = mongoose.model<BookingDocument>(
  "Booking",
  BookingSchema
);
