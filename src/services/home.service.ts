import { NextFunction, Request, Response } from "express";
import AuthToken from "../models/authToken";
import {
  AirportListResponse,
  AuthTokenResponse,
  FareRule,
  FlightDataType,
  SelectedFareQuote,
  SSRFlightData,
} from "../interface/home.interface";
import { AppError } from "../utils/appError";
import { sendApiRequest } from "../utils/requestAPI";
import { constants } from "../constants/home.constants";
import { Airport } from "../models/airport";
import { Booking } from "../models/Booking";
import { sendEmail } from "../services/user.service";
import { ticketTemplate } from "../views/ticket-template";

const getAirportList = async (
  Start: number,
  End: number
): Promise<AirportListResponse> => {
  try {
    const airports = await Airport.find()
      .select("-_id -createdAt -updatedAt")
      .skip(Start)
      .limit(End)
      .exec();
    return { data: airports };
  } catch (err) {
    throw new AppError(constants.ERROR_MSG.NO_SUCH_AIRPORT, 500);
  }
};

const getAirportByCode = async (query: string): Promise<FlightDataType[]> => {
  try {
    const regex = new RegExp(query, "i");
    const airports = await Airport.find({
      $or: [
        { AIRPORTCODE: { $regex: regex } },
        { CITYNAME: { $regex: regex } },
        { COUNTRYCODE: { $regex: regex } },
        { COUNTRYNAME: { $regex: regex } },
        { AIRPORTNAME: { $regex: regex } },
      ],
    })
      .select("-_id -createdAt -updatedAt")
      .limit(10)
      .exec();

    // Explicitly map the query results to match FlightDataType
    const mappedAirports: FlightDataType[] = airports.map((airport) => ({
      CITYNAME: airport.CITYNAME,
      CITYCODE: airport.CITYCODE,
      COUNTRYCODE: airport.COUNTRYCODE,
      COUNTRYNAME: airport.COUNTRYNAME,
      AIRPORTCODE: airport.AIRPORTCODE,
      AIRPORTNAME: airport.AIRPORTNAME,
    }));

    // Sorting logic remains the same
    mappedAirports.sort((a, b) => {
      const aAirportCodeMatch =
        a.AIRPORTCODE.toLowerCase() === query.toLowerCase();
      const bAirportCodeMatch =
        b.AIRPORTCODE.toLowerCase() === query.toLowerCase();
      if (aAirportCodeMatch && !bAirportCodeMatch) {
        return -1;
      }
      if (!aAirportCodeMatch && bAirportCodeMatch) {
        return 1;
      }

      const aStartsWithQueryAndCountryIsLocation =
        a.AIRPORTNAME.toLowerCase().startsWith(query.toLowerCase()) &&
        a.COUNTRYNAME.toLowerCase() === constants.LOCATION.toLowerCase();
      const bStartsWithQueryAndCountryIsLocation =
        b.AIRPORTNAME.toLowerCase().startsWith(query.toLowerCase()) &&
        b.COUNTRYNAME.toLowerCase() === constants.LOCATION.toLowerCase();
      if (
        aStartsWithQueryAndCountryIsLocation &&
        !bStartsWithQueryAndCountryIsLocation
      ) {
        return -1;
      }
      if (
        !aStartsWithQueryAndCountryIsLocation &&
        bStartsWithQueryAndCountryIsLocation
      ) {
        return 1;
      }

      const aCountryIsLocation =
        a.COUNTRYNAME.toLowerCase() === constants.LOCATION.toLowerCase();
      const bCountryIsLocation =
        b.COUNTRYNAME.toLowerCase() === constants.LOCATION.toLowerCase();
      if (aCountryIsLocation && !bCountryIsLocation) {
        return -1;
      }
      if (!aCountryIsLocation && bCountryIsLocation) {
        return 1;
      }

      const aStartsWithQuery = a.AIRPORTNAME.toLowerCase().startsWith(
        query.toLowerCase()
      );
      const bStartsWithQuery = b.AIRPORTNAME.toLowerCase().startsWith(
        query.toLowerCase()
      );
      if (aStartsWithQuery && !bStartsWithQuery) {
        return -1;
      }
      if (!aStartsWithQuery && bStartsWithQuery) {
        return 1;
      }

      return 0;
    });

    return mappedAirports;
  } catch (err) {
    throw new AppError(constants.ERROR_MSG.NO_SUCH_AIRPORT, 500);
  }
};

const searchFlights = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<SelectedFareQuote[][]> => {
  try {
    // Fetch the latest authentication data
    const AuthData = await getAuthenticatedToken(request, response, next);

    // Extract and validate request query parameters
    const {
      AdultCount = 1,
      ChildCount = 0,
      InfantCount = 0,
      DirectFlight = false,
      OneStopFlight = false,
      JourneyType = 1,
      Origin,
      Destination,
      FlightCabinClass,
      ReturnFlightCabinClass,
      PreferredAirlines = "null",
      DepartureDate,
      ReturnDepartureDate,
      ArrivalDate,
      ReturnArrivalDate,
      Sources = "null",
      TimeOfDay = 1,
    } = request.query;

    if (!DepartureDate || !ArrivalDate) {
      throw new AppError("DepartureDate and ArrivalDate are required.", 400);
    }

    // Construct the request body for the API call
    const requestBody = {
      EndUserIp: await getClientIp(request, response, next),
      TokenId: AuthData.tokenId,
      AdultCount,
      ChildCount,
      InfantCount,
      JourneyType,
      PreferredAirlines:
        PreferredAirlines === "null"
          ? null
          : PreferredAirlines.toString()
              .split(",")
              .map((code) => code.trim()),
      DirectFlight,
      OneStopFlight,
      Segments: [
        {
          Origin,
          Destination,
          FlightCabinClass,
          PreferredDepartureTime: await getDateTimeWithTimeOfDay(
            DepartureDate.toString(),
            +TimeOfDay
          ),
          PreferredArrivalTime: await getDateTimeWithTimeOfDay(
            ArrivalDate.toString(),
            +TimeOfDay
          ),
        },
      ],
      Sources:
        Sources === "null"
          ? null
          : await getSourceParameter(Sources.toString()),
    };

    // Handle round-trip flights
    if (JourneyType === "2") {
      requestBody.Segments.push({
        Origin: Destination,
        Destination: Origin,
        FlightCabinClass: ReturnFlightCabinClass,
        PreferredDepartureTime: await getDateTimeWithTimeOfDay(
          ReturnDepartureDate?.toString() || "",
          +TimeOfDay
        ),
        PreferredArrivalTime: await getDateTimeWithTimeOfDay(
          ReturnArrivalDate?.toString() || "",
          +TimeOfDay
        ),
      });
    }

    console.log("Request Body:", requestBody);

    // API request to search flights
    let apiResponse;
    try {
      apiResponse = await sendApiRequest({
        url: constants.API_URLS.SEARCH_FLIGHTS,
        data: requestBody,
      });
      console.log(apiResponse);

      // Set TraceId cookie if exists in response
      if (apiResponse?.data?.Response?.TraceId) {
        const traceId = apiResponse.data.Response.TraceId;
        response.cookie("tekTravelsTraceId", traceId, {
          maxAge: 15 * 60 * 60 * 1000, // 15 hours
          httpOnly: true,
          secure: process.env.BUILD_ENV !== "development",
        });
      }
    } catch (error) {
      console.error("API Request Error:", error);
      throw new AppError(constants.SEARCH_FLIGHT_ERROR, 500);
    }

    // Processing the API response
    if (apiResponse?.data?.Response?.Error?.ErrorCode === 0) {
      const finalResponse = apiResponse?.data?.Response?.Results;
      const lowestFareFlights: Record<string, SelectedFareQuote> = {};

      finalResponse[0].forEach((flight: SelectedFareQuote) => {
        const flightNumber = flight?.Segments[0][0].Airline.FlightNumber;
        const baseFare = flight?.Fare?.BaseFare;

        if (
          baseFare &&
          flightNumber &&
          (!lowestFareFlights[flightNumber] ||
            baseFare < lowestFareFlights[flightNumber].Fare.BaseFare)
        ) {
          lowestFareFlights[flightNumber] = flight;
        }
      });

      const lowestFareFlightsArray = finalResponse[0].filter((flight: SelectedFareQuote) => {
        const flightNumber = flight?.Segments[0][0].Airline.FlightNumber;
        return lowestFareFlights[flightNumber] === flight;
      });

      return [lowestFareFlightsArray];
    } else {
      throw new AppError("No flights found or an error occurred during the search.", 404);
    }
  } catch (err: any) {
    console.error("Service Error:", err);
    next(new AppError(err.message, 500));
    return [] as SelectedFareQuote[][];
  }
};


const getFareRule = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<FareRule[]> => {
  try {
    const { ResultIndex } = request.query;

    if (!ResultIndex) {
      throw new AppError("ResultIndex is required", 400);
    }

    const AuthData = await getAuthenticatedToken(request, response, next);

    const requestBody = {
      EndUserIp: await getClientIp(request, response, next),
      TokenId: AuthData.tokenId,
      TraceId: request.cookies.tekTravelsTraceId,
      ResultIndex: ResultIndex.toString(),
    };

    let apiResponse: any;
    try {
      apiResponse = await sendApiRequest({
        url: constants.API_URLS.FARE_RULES,
        data: requestBody,
      });
    } catch (err: any) {
      console.error(
        "Error Response:",
        err.response ? err.response.data : err.message
      );
      throw new AppError(constants.ERROR_MSG.FARE_RULE_FETCH_FAILED, 500);
    }

    // Check if the API response contains a valid error code
    if (apiResponse?.data?.Response?.Error?.ErrorCode === 0) {
      // Return the Fare Rules from the API response
      const data: FareRule[] = apiResponse?.data?.Response?.FareRules;
      return data;
    } else {
      throw new AppError("Failed to fetch fare rules.", 500);
    }
  } catch (err: any) {
    next(new AppError(err.message, err.statusCode || 500));
    return [] as FareRule[];
  }
};



const getFareQuote = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { ResultIndex } = request.query;

    if (!ResultIndex) {
      throw new AppError("ResultIndex is required", 400);
    }

    const AuthData = await getAuthenticatedToken(request, response, next);

    const requestBody = {
      EndUserIp: await getClientIp(request, response, next),
      TokenId: AuthData.tokenId,
      TraceId: request.cookies.tekTravelsTraceId,
      ResultIndex: ResultIndex.toString(),
    };

    let apiResponse: any;
    try {
      apiResponse = await sendApiRequest({
        url: constants.API_URLS.FARE_QUOTE,
        data: requestBody,
      });
      console.log(apiResponse);
    } catch (err: any) {
      console.error(
        "Error Response:",
        err.response ? err.response.data : err.message
      );
      throw new AppError(constants.ERROR_MSG.FARE_QUOTE_FETCH_FAILED, 500);
    }

    // Check if the API response contains a valid error code
    if (apiResponse?.data?.Response?.Error?.ErrorCode === 0) {
      // Return the fare quote results from the API response
      return apiResponse?.data?.Response?.Results;
    } else {
      throw new AppError("Failed to fetch fare quote.", 500);
    }
  } catch (err: any) {
    next(new AppError(err.message, err.statusCode || 500));
    return undefined;
  }
};


const getSSR = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<SSRFlightData> => {
  try {
    const { ResultIndex } = request.query;

    if (!ResultIndex) {
      throw new AppError("ResultIndex is required", 400);
    }

    const AuthData = await getAuthenticatedToken(request, response, next);

    const requestBody = {
      EndUserIp: await getClientIp(request, response, next),
      TokenId: AuthData.tokenId,
      TraceId: request.cookies.tekTravelsTraceId,
      ResultIndex: ResultIndex.toString(),
    };

    let apiResponse: any;
    try {
      apiResponse = await sendApiRequest({
        url: constants.API_URLS.SSR,
        data: requestBody,
      });
      console.log(apiResponse);
    } catch (err: any) {
      console.error(
        "Error Response:",
        err.response ? err.response.data : err.message
      );
      throw new AppError(constants.ERROR_MSG.SSR_FETCH_FAILED, 500);
    }

    // Check if the API response contains a valid error code
    if (apiResponse?.data?.Response?.Error?.ErrorCode === 0) {
      const result: SSRFlightData = {
        Meal: apiResponse?.data?.Response.Meal,
        SeatDynamic: apiResponse?.data?.Response.SeatDynamic,
      };
      return result;
    } else {
      throw new AppError("Failed to fetch SSR data.", 500);
    }
  } catch (err: any) {
    next(new AppError(err.message, err.statusCode || 500));
    throw err;
  }
};


const getClientIp = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<string> => {
  let headerIp: string | undefined = request.headers[
    "x-forwarded-for"
  ] as string;
  headerIp = headerIp?.split(",").shift()?.trim();
  const userIp = headerIp || request.socket?.remoteAddress;
  return userIp?.startsWith("::1") ? "127.0.0.1" : userIp || "127.0.0.1";
};
const getDateTimeWithTimeOfDay = async (
  date: string,
  timeOfDay: number
): Promise<string> => {
  const timeMapping: { [key: number]: string } = {
    1: "00:00:00", // ALL
    2: "08:00:00", //  Morning
    3: "14:00:00", // Afternoon
    4: "19:00:00", // Evening
    5: "01:00:00", // Night
  };

  // Default to "00:00:00" if timeOfDay is not in the mapping
  const time = timeMapping[timeOfDay] || "00:00:00";

  return `${date}T${time}`;
};

const getSourceParameter = async (type: string): Promise<string[]> => {
  return constants.SOURCES[type] || [];
};

const getBooking = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { ResultIndex } = request.query;

    if (!ResultIndex) {
      throw new AppError("ResultIndex is required", 400);
    }

    const AuthData = await getAuthenticatedToken(request, response, next);

    const passenger = request.body.Passengers;
    const requestBody = {
      EndUserIp: await getClientIp(request, response, next),
      TokenId: AuthData.tokenId,
      TraceId: request.cookies.tekTravelsTraceId,
      ResultIndex: ResultIndex.toString(),
      Passengers: passenger,
    };

    let apiResponse: any;
    try {
      apiResponse = await sendApiRequest({
        url: constants.API_URLS.BOOKING,
        data: requestBody,
      });
      console.log(apiResponse);
    } catch (err: any) {
      console.error(
        "Error Response:",
        err.response ? err.response.data : err.message
      );
      throw new AppError(constants.ERROR_MSG.SSR_FETCH_FAILED, 500);
    }

    const user = request.user as { id: string };
    const userId = user.id;
    console.log(userId);

    if (apiResponse?.data?.Response?.Error?.ErrorCode === 0) {
      const fareData =
        apiResponse.data.Response.Response.FlightItinerary.Fare;
      const TDS =
        fareData.TdsOnCommission +
        fareData.TdsOnPLB +
        fareData.TdsOnIncentive;
      const NetPayable = fareData.OfferedFare + TDS;
      const booking = new Booking({
        userId,
        NetPayable,
        ResultIndex,
        ...apiResponse.data.Response.Response,
      });

      await booking.save();
      return { data: apiResponse.data };
    }
  } catch (err: any) {
    throw new AppError(err.message, err.statusCode || 500);
  }
};

const ticketNonLCC = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const merchantTransactionId = +request.params.merchantTransactionId;
    const booking = await Booking.findOne({ BookingId: merchantTransactionId });
    const AuthData = await getAuthenticatedToken(request, response, next);
    const requestBody = {
      EndUserIp: await getClientIp(request, response, next),
      TokenId: AuthData.tokenId,
      TraceId: request.cookies.tekTravelsTraceId,
      ResultIndex: booking?.ResultIndex.toString(),
      PNR: booking?.PNR,
      BookingId: booking?.BookingId,
      Passport: booking?.FlightItinerary?.Passenger?.map(
        ({ PaxId, PassportNo, PassportExpiry, DateOfBirth }) => ({
          PaxId,
          PassportNo,
          PassportExpiry,
          DateOfBirth,
        })
      ),
    };

    // booking.ticketRequestBody = requestBody;
    // await booking.save();

    // const response = await tekTravelsApi.post(
    //   "/BookingEngineService_Air/AirService.svc/rest/Ticket",
    //   requestBody
    // );

    let apiResponse: any;
    try {
      apiResponse = await sendApiRequest({
        url: constants.API_URLS.TICKET,
        data: requestBody,
      });
      console.log(apiResponse);
    } catch (err: any) {
      console.error(
        "Error Response:",
        err.response ? err.response.data : err.message
      );
      throw new AppError(constants.ERROR_MSG.SSR_FETCH_FAILED, 500);
    }

    if (apiResponse?.data?.Response?.Error?.ErrorCode === 0) {
      if (booking) {
        const ticketResponse = apiResponse.data.Response.Response;
        const template = ticketTemplate(
          ticketResponse.BookingId,
          ticketResponse.PNR,
          ticketResponse.FlightItinerary.Passenger[0].FirstName,
          ticketResponse.FlightItinerary.Origin,
          ticketResponse.FlightItinerary.Destination
        );
        const email = booking.FlightItinerary.Passenger[0].Email;
        await sendEmail(email, template, "Ticket Confirmed");
      }

      return { data: apiResponse.data };
    }
  } catch (err: any) {
    throw new AppError(err.message, err.statusCode || 500);
  }
};

const ticketLCC = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {};
const getBookingDetails = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { PNR } = request.query;

    const AuthData = await getAuthenticatedToken(request, response, next);

    const booking = await Booking.findOne({ PNR });
    if (!booking) {
      throw new AppError("Booking Not found.", 400);
    }
    const requestBody = {
      EndUserIp: await getClientIp(request, response, next),
      TokenId: AuthData.tokenId,
      FirstName: booking?.FlightItinerary?.Passenger?.[0]?.FirstName,
      LastName: booking?.FlightItinerary?.Passenger?.[0]?.LastName,
      PNR: PNR,
    };

    let apiResponse: any;
    try {
      apiResponse = await sendApiRequest({
        url: constants.API_URLS.GET_BOOKING_DETAILS,
        data: requestBody,
      });
      console.log(apiResponse);
    } catch (err: any) {
      console.error(
        "Error Response:",
        err.response ? err.response.data : err.message
      );
      throw new AppError(constants.ERROR_MSG.SSR_FETCH_FAILED, 500);
    }

    if (apiResponse?.data?.Response?.Error?.ErrorCode === 0) {
      return { data: apiResponse.data };
    }
  } catch (err: any) {
    throw new AppError(err.message, err.statusCode || 500);
  }
};

// Authenticates and retrieves the latest AuthToken
async function getAuthenticatedToken(
  request: Request,
  response: Response,
  next: NextFunction
): Promise<any> {
  let AuthData = await AuthToken.findOne().sort({ _id: -1 }).exec();
  

  if (!AuthData) {
    throw new AppError("Authentication failed. No token found.", 500);
  }

  return AuthData;
}

export {
  getAirportByCode,
  getAirportList,
  getClientIp,
  getFareQuote,
  searchFlights,
  getFareRule,
  getSSR,
  getBooking,
  getBookingDetails,
  ticketNonLCC,
  ticketLCC,
};
