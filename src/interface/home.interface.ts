export interface Airport {
  _id: string;
  CITYNAME: string;
  CITYCODE: string;
  COUNTRYCODE: string;
  COUNTRYNAME: string;
  AIRPORTCODE: string;
  AIRPORTNAME: string;
}

export interface AirportListResponse {
  data: Airport[];
}

export interface Flight {
  id: number;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
}

export interface FlightSearchResponse {
  data: Root[];
}
export interface FlightDataType {
  CITYNAME: string;
  CITYCODE: string;
  COUNTRYCODE: string;
  COUNTRYNAME: string;
  AIRPORTCODE: string;
  AIRPORTNAME: string;
}
export interface FlightResponseType {
  data: Array<FlightDataType>;
  flag: boolean;
  type: string;
  message: string;
}

export interface FlightSearchResponseType {
  data: Array<Root>;
  flag: boolean;
  type: string;
  message: string;
}



export interface AuthTokenResponseType {
  data: object;
  flag: boolean;
  type: string;
  message: string;
}

export interface AuthTokenResponse {
  data: object;
}

export interface FareRuleResponseType {
  data: Array<FareRule>;
  flag: boolean;
  type: string;
  message: string;
}

export interface FareQuoteResponseType {
  data: Array<object>;
  flag: boolean;
  type: string;
  message: string;
}

export interface Segment {
  Origin: string;
  Destination: string;
  FlightCabinClass?: string;
  PreferredDepartureTime: string;
  PreferredArrivalTime: string;
}

export interface RequestBody {
  EndUserIp: string;
  TokenId: string;
  AdultCount: string;
  ChildCount: string;
  InfantCount: string;
  JourneyType: string;
  PreferredAirlines: string[] | null;
  DirectFlight: string;
  OneStopFlight: string;
  Segments: Segment[];
  Sources: string[] | null;
}

export interface AuthenticateRequestBody {
  ClientId: string | undefined;
  UserName: string | undefined;
  Password: string | undefined;
  EndUserIp: string | undefined;
}

export interface AuthenticateResponse {
  TokenId: string;
  Member: {
    MemberId: string;
    AgencyId: string;
  };
  Error?: {
    ErrorCode: number;
    Message: string;
  };
}

export interface CountryList {
  data: Array<Country>;
  flag: boolean;
  type: string;
  message: string;
}

export interface Country {
  _id: string;
  name: string;
  flag: string;
  code: string;
  dial_code: string;
}


export interface FareClassificationDetails {
  Color: string;
  Type: string;
}
export interface MiniFareRule {
  JourneyPoints: string;
  Type: string;
  From: string | null;
  To: string | null;
  Unit: string | null;
  Details: string;
}
export interface Fare {
  Currency: string;
  BaseFare: number;
  Tax: number;
  TaxBreakup: TaxBreakup[];
  YQTax: number;
  AdditionalTxnFeeOfrd: number;
  AdditionalTxnFeePub: number;
  PGCharge: number;
  OtherCharges: number;
  ChargeBU: ChargeBU[];
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
export interface TaxBreakup {
  key: string;
  value: number;
}
export interface ChargeBU {
  key: string;
  value: number;
}
export interface FareBreakdown {
  Currency: string;
  PassengerType: number;
  PassengerCount: number;
  BaseFare: number;
  Tax: number;
  TaxBreakUp: FareBreakup[];
  YQTax: number;
  AdditionalTxnFeeOfrd: number;
  AdditionalTxnFeePub: number;
  PGCharge: number;
  SupplierReissueCharges: number;
}
export interface FareBreakup {
  key: string;
  value: number;
}
export interface FareRule {
  Origin: string;
  Destination: string;
  Airline: string;
  FareBasisCode: string;
  FareRuleDetail: string;
  FareRestriction: string;
  FareFamilyCode: string;
  FareRuleIndex: string;
}

export interface PenaltyCharges {
  ReissueCharge: string;
  CancellationCharge: string;
}
export interface Root {
  FirstNameFormat: string | null;
  IsBookableIfSeatNotAvailable: boolean;
  IsHoldAllowedWithSSR: boolean;
  IsUpsellAllowed: boolean;
  LastNameFormat: string | null;
  ResultIndex: string;
  Source: number;
  IsLCC: boolean;
  IsRefundable: boolean;
  IsPanRequiredAtBook: boolean;
  IsPanRequiredAtTicket: boolean;
  IsPassportRequiredAtBook: boolean;
  IsPassportRequiredAtTicket: boolean;
  GSTAllowed: boolean;
  IsCouponAppilcable: boolean;
  IsGSTMandatory: boolean;
  AirlineRemark: string;
  IsPassportFullDetailRequiredAtBook: boolean;
  ResultFareType: string;
  Fare: Fare;
  FareBreakdown: FareBreakdown[];
  Segments: Segment[][];
  LastTicketDate: string;
  TicketAdvisory: string;
  FareRules: FareRule[];
  PenaltyCharges: PenaltyCharges;
  AirlineCode: string;
  MiniFareRules: MiniFareRule[][];
  ValidatingAirline: string;
  FareClassification: FareClassificationDetails;
}