// Define the type for SOURCES
export type SourceTypes =
  | "normal"
  | "splReturn"
  | "advanceSearch"
  | "multiStop";

interface Sources {
  [key: string]: string[];
}

// Define constants with the SOURCES type
export const constants = {
  API_URLS: {
    SEARCH_FLIGHTS:
      "https://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/Search",
    FARE_RULES:
      "http://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/FareRule",
    FARE_QUOTE:
      "http://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/FareQuote",
    AUTHENTICATE:
      "https://api.tektravels.com/SharedServices/SharedData.svc/rest/Authenticate",
    SSR: "http://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/SSR",
    BOOKING:
      "http://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/Book",
  },
  ERROR_TYPE: {
    ERROR: "ERROR",
  },
  ERROR_MSG: {
    NO_SUCH_AIRPORT: "No Such Airport Found",
    FARE_RULE_FETCH_FAILED: "Can't fetch fair rules",
    FARE_QUOTE_FETCH_FAILED: "Can't fetch fair quotes",
    AUTHENTICATION_FAILED: "Authentication Failed",
    SSR_FETCH_FAILED: "SSR Ftech Failed",
  },
  ACCOUNT_NOT_FOUND: "ACCOUNT_NOT_FOUND",
  LOCATION: "India",
  FARE_RULE_ERROR: "An error occurred while fetching the fareRule.",
  FARE_QUOTE_ERROR: "An error occurred while fetching the fareQuote.",
  BOOKING_FAILED_FOR_NONLCC: "An error occurred while booking the flight.",
  SEARCH_FLIGHT_ERROR: "An error occurred while searching for flights.",
  AIRPORT_BY_CODE_SEARCH_ERROR:
    "An error occurred while fetching the airport list.",
  SOURCES: {
    normal: ["GDS", "SG", "6E", "G8", "G9", "FZ", "IX", "AK", "LB"],
    splReturn: ["SG", "6E", "G8", "GDS"],
    advanceSearch: ["GDS"],
    multiStop: ["GDS"],
  } as Sources,
};
