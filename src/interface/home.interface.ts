export interface AirportList {
  _id: string;
  CITYNAME: string;
  CITYCODE: string;
  COUNTRYCODE: string;
  COUNTRYNAME: string;
  AIRPORTCODE: string;
  AIRPORTNAME: string;
}

export interface AirportListResponse {
  data: AirportList[];
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
  data: FlightDetails[];
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

export interface Airline {
  AirlineCode: string;
  AirlineName: string;
  FlightNumber: string;
  FareClass: string;
  OperatingCarrier: string;
}

export interface Airport {
  AirportCode: string;
  AirportName: string;
  Terminal: string;
  CityCode: string;
  CityName: string;
  CountryCode: string;
  CountryName: string;
}

export interface Origin {
  Airport: Airport;
  DepTime: string;
}

export interface Destination {
  Airport: Airport;
  ArrTime: string;
}

export interface Segment {
  Baggage: string;
  CabinBaggage: string;
  CabinClass: number;
  SupplierFareClass: string | null;
  TripIndicator: number;
  SegmentIndicator: number;
  Airline: Airline;
  NoOfSeatAvailable: number;
  Origin: Origin;
  Destination: Destination;
  Duration: number;
  GroundTime: number;
  Mile: number;
  StopOver: boolean;
  FlightInfoIndex: string;
  StopPoint: string;
  StopPointArrivalTime: string | null;
  StopPointDepartureTime: string | null;
  Craft: string;
  Remark: string | null;
  IsETicketEligible: boolean;
  FlightStatus: string;
  Status: string;
  FareClassification: {
      Type: string;
  };
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

export interface FlightDetails {
  resultIndex: string;
  airlineName: string;
  airlineCode: string;
  flightNumber: string;
  fareClass: string;
  noOfSeatAvailable: number;
  originAirportCode: string;
  originAirportName: string;
  originTerminal: string;
  originCityName: string;
  destinationAirportCode: string;
  destinationAirportName: string;
  destinationTerminal:string;
  destinationCityName: string;
  departureTime: string;
  arrivalTime: string;
  duration: number;
  stopOver: boolean;
  stopPoint: string;
  stopPointArrivalTime: string | null;
  stopPointDepartureTime: string | null;
  isLCC: boolean;
  fare: Fare;
  baggage: string;
  cabinBaggage: string;
  cabinClass:number;
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

export interface SelectedFareQuote {
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
//////////////////SSR Interface////////////////////
export interface MealOption {
  Code: string;
  Description: string;
}

export interface Seat {
  AirlineCode: string;
  FlightNumber: string;
  CraftType: string;
  Origin: string;
  Destination: string;
  AvailablityType: number;
  Description: number | string; // Adjust based on actual usage
  Code: string;
  RowNo: string;
  SeatNo: string | null;
  SeatType: number;
  SeatWayType: number;
  Compartment: number;
  Deck: number;
  Currency: string;
  Price: number;
  Text: string;
}

export interface RowSeat {
  Seats: Seat[];
}

export interface SegmentSeat {
  RowSeats: RowSeat[];
}

export interface SeatDynamic {
  SegmentSeat: SegmentSeat[];
}

export interface SSRFlightData {
  Meal: MealOption[];
  SeatDynamic: SeatDynamic[];
}

export interface SSRResponseType {
  data: SSRFlightData;
  flag: boolean;
  type: string;
  message: string;
}
