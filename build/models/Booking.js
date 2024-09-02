"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Booking = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const BookingSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    PNR: {
        type: String,
        required: true,
    },
    ResultIndex: {
        type: String,
        required: true,
    },
    TransactionID: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Transaction",
        default: null
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
    NetPayable: { type: Number },
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
exports.Booking = mongoose_1.default.model("Booking", BookingSchema);
