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
  data: Flight[];
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
  data: Array<object>;
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
