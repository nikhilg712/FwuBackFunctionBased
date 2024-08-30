// Define the type for SOURCES
export type SourceTypes =
  | "normal"
  | "splReturn"
  | "advanceSearch"
  | "multiStop";

interface Sources {
  [key: string]: string[];
}

const MAIN_URL =
  "https://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/";

// Define constants with the SOURCES type
export const constants = {
  API_URLS: {
    MAIN_URL,
    SEARCH_FLIGHTS: `${MAIN_URL}Search`,
    FARE_RULES: `${MAIN_URL}FareRule`,
    FARE_QUOTE: `${MAIN_URL}FareQuote`,
    SSR: `${MAIN_URL}SSR`,
    GET_BOOKING_DETAILS: `${MAIN_URL}GetBookingDetails`,
    TICKET: `${MAIN_URL}ticket`,
    AUTHENTICATE:
      "https://api.tektravels.com/SharedServices/SharedData.svc/rest/Authenticate",
    BOOKING: `${MAIN_URL}Book`,
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
  TRANSACTIONID_NOT_FOUND: "no transaction id found",
  ACCOUNT_NOT_FOUND: "ACCOUNT_NOT_FOUND",
  LOCATION: "India",
  FARE_RULE_ERROR: "An error occurred while fetching the fareRule.",
  FARE_QUOTE_ERROR: "An error occurred while fetching the fareQuote.",
  BOOKING_FAILED_FOR_NONLCC: "An error occurred while booking the flight.",
  GET_BOOKING_FAILED: "An error occurred while fetching booking details.",
  TICKET_ERROR: "An error occured while generating ticket.",
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
