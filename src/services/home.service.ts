import { NextFunction, Request, Response } from "express";
import AuthToken from "../models/authToken";
import {
  AirportListResponse,
  AuthTokenResponse,
  Flight,
  FlightSearchResponse,
} from "../interface/home.interface";
import { AppError } from "../utils/appError";
import { constants } from "../constants/home.constants";
import { Airport } from "../models/airport";
import axios from "axios";

const getAirportList = async (
  Start: number,
  End: number,
): Promise<AirportListResponse> => {
  try {
    const airports = await Airport.find()
      .select("-_id")
      .skip(Start)
      .limit(End)
      .exec();
    return { data: airports };
  } catch (err: any) {
    throw new AppError(constants.ERROR_MSG.NO_SUCH_AIRPORT, 500);
  }
};

const getAirportByCode = async (
  query: string,
): Promise<AirportListResponse> => {
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
      .limit(10)
      .exec();

    airports.sort((a, b) => {
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
        query.toLowerCase(),
      );
      const bStartsWithQuery = b.AIRPORTNAME.toLowerCase().startsWith(
        query.toLowerCase(),
      );
      if (aStartsWithQuery && !bStartsWithQuery) {
        return -1;
      }
      if (!aStartsWithQuery && bStartsWithQuery) {
        return 1;
      }

      return 0;
    });
    return {
      data: airports,
    };
  } catch (err: any) {
    throw new AppError(constants.ERROR_MSG.NO_SUCH_AIRPORT, 500);
  }
};

const searchFlights = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<FlightSearchResponse> => {
  try {
    let AuthData = await AuthToken.findOne().sort({ _id: -1 }).exec();
    if (!AuthData) {
      await authenticate(request, response, next);
      AuthData = await AuthToken.findOne().sort({ _id: -1 }).exec();
      console.log("Authenticated");
    }

    if (!AuthData) {
      throw new AppError("Authentication failed. No token found.", 500);
    }

    const tokenId = AuthData.tokenId;

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

    const requestBody = {
      EndUserIp: await getClientIp(request, response, next),
      TokenId: tokenId,
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
            +TimeOfDay,
          ),
          PreferredArrivalTime: await getDateTimeWithTimeOfDay(
            ArrivalDate.toString(),
            +TimeOfDay,
          ),
        },
      ],
      Sources:
        Sources === "null"
          ? null
          : await getSourceParameter(Sources.toString()),
    };

    if (JourneyType === "2") {
      requestBody.Segments.push({
        Origin: Destination,
        Destination: Origin,
        FlightCabinClass: ReturnFlightCabinClass,
        PreferredDepartureTime: await getDateTimeWithTimeOfDay(
          ReturnDepartureDate?.toString() || "",
          +TimeOfDay,
        ),
        PreferredArrivalTime: await getDateTimeWithTimeOfDay(
          ReturnArrivalDate?.toString() || "",
          +TimeOfDay,
        ),
      });
    }

    console.log("Request Body:", requestBody);

    const options = {
      method: "POST",
      url: "https://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/Search",
      headers: {
        "content-type": "application/json",
      },
      data: requestBody,
    };

    let apiResponse: any;
    try {
      apiResponse = await axios(options);
    } catch (err: any) {
      console.error("Error Response:", err.response || err.message);
      throw new AppError(constants.ERROR_MSG.NO_SUCH_AIRPORT, 500);
    }

    if (apiResponse?.data?.Response?.TraceId) {
      const traceId = apiResponse.data.Response.TraceId;
      response.cookie("tekTravelsTraceId", traceId, {
        maxAge: 15 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.BUILD_ENV !== "development",
      });
    }

    // const finalResponse = apiResponse?.data?.Response?.Results || [];
    // if (finalResponse.length === 0) {
    //   return { data: [] };
    // }

    // const lowestFareFlights: Record<string, any> = {};
    // finalResponse[0].forEach((flight: any) => {
    //   const flightNumber = flight?.Segments[0][0].Airline.FlightNumber;
    //   const baseFare = flight?.Fare?.BaseFare;

    //   if (
    //     baseFare &&
    //     flightNumber &&
    //     (!lowestFareFlights[flightNumber] ||
    //       baseFare < lowestFareFlights[flightNumber].Fare.BaseFare)
    //   ) {
    //     lowestFareFlights[flightNumber] = flight;
    //   }
    // });

    // const lowestFareFlightsArray = Object.values(lowestFareFlights).map(
    //   (flight: any): Flight => ({
    //     id: flight?.Segments[0][0].Airline.FlightNumber,
    //     from: flight?.Segments[0][0].Origin.AirportCode,
    //     to: flight?.Segments[0][0].Destination.AirportCode,
    //     departureTime: flight?.Segments[0][0].DepTime,
    //     arrivalTime: flight?.Segments[0][0].ArrTime,
    //     price: flight?.Fare?.BaseFare,
    //   })
    // );

    // const data: FlightSearchResponse = { data: lowestFareFlightsArray };
    // console.log(data.data.length);
    // return data;
    const finalResponse = apiResponse?.data?.Response?.Results;
    const lowestFareFlights: Record<string, any> = {};
    finalResponse[0].forEach((flight: any) => {
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

    const lowestFareFlightsArray = finalResponse[0].filter((flight: any) => {
      const flightNumber = flight?.Segments[0][0].Airline.FlightNumber;
      return lowestFareFlights[flightNumber] === flight;
    });
    const data: any = [lowestFareFlightsArray];
    console.log(data[0].length);
    return data;
  } catch (err: any) {
    console.error("Service Error:", err);
    next(new AppError(err.message, 500));
    return { data: [] };
  }
};

const getFareRule = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<any> => {
  try {
    const { ResultIndex } = request.query;

    if (!ResultIndex) {
      throw new AppError("ResultIndex is required", 400);
    }

    let AuthData = await AuthToken.findOne().sort({ _id: -1 }).exec();
    if (!AuthData) {
      await authenticate(request, response, next);
      AuthData = await AuthToken.findOne().sort({ _id: -1 }).exec();
    }

    if (!AuthData) {
      throw new AppError("Authentication failed. No token found.", 500);
    }

    const requestBody = {
      EndUserIp: await getClientIp(request, response, next),
      TokenId: AuthData.tokenId,
      TraceId: request.cookies.tekTravelsTraceId,
      ResultIndex: ResultIndex.toString(),
    };

    const options = {
      method: "POST",
      url: "http://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/FareRule",
      headers: {
        "content-type": "application/json",
      },
      data: requestBody,
    };

    let apiResponse: any;
    try {
      // Send request and get response
      apiResponse = await axios(options);
    } catch (err: any) {
      console.error(
        "Error Response:",
        err.response ? err.response.data : err.message,
      );
      throw new AppError(constants.ERROR_MSG.FARE_RULE_FETCH_FAILED, 500);
    }

    // Return the Fare Rules from the API response
    return apiResponse?.data?.Response?.FareRules;
  } catch (err: any) {
    next(new AppError(err.message, err.statusCode || 500));
    return undefined;
  }
};

const getFareQuote = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<any> => {
  try {
    const { ResultIndex } = request.query;

    if (!ResultIndex) {
      throw new AppError("ResultIndex is required", 400);
    }

    let AuthData = await AuthToken.findOne().sort({ _id: -1 }).exec();
    if (!AuthData) {
      await authenticate(request, response, next);
      AuthData = await AuthToken.findOne().sort({ _id: -1 }).exec();
    }

    if (!AuthData) {
      throw new AppError("Authentication failed. No token found.", 500);
    }

    const requestBody = {
      EndUserIp: await getClientIp(request, response, next),
      TokenId: AuthData.tokenId,
      TraceId: request.cookies.tekTravelsTraceId,
      ResultIndex: ResultIndex.toString(),
    };

    const options = {
      method: "POST",
      url: "http://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/FareQuote",
      headers: {
        "content-type": "application/json",
      },
      data: requestBody,
    };

    let apiResponse: any;
    try {
      // Send request and get response
      apiResponse = await axios(options);
      console.log("TBO API Response:", apiResponse?.data?.Response?.Results);
    } catch (err: any) {
      console.error(
        "Error Response:",
        err.response ? err.response.data : err.message,
      );
      throw new AppError(constants.ERROR_MSG.FARE_QUOTE_FETCH_FAILED, 500);
    }

    return apiResponse?.data?.Response?.Results;
  } catch (err: any) {
    next(new AppError(err.message, err.statusCode || 500));
    return undefined;
  }
};

const authenticate = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<AuthTokenResponse> => {
  try {
    let headerip: string | undefined = request.headers[
      "x-forwarded-for"
    ] as string;
    headerip = headerip?.split(",").shift();
    const userIP: string = headerip || request.socket?.remoteAddress || "";

    const body = {
      ClientId: process.env.TEK_TRAVELS_CLIENT_ID,
      UserName: process.env.TEK_TRAVELS_USERNAME,
      Password: process.env.TEK_TRAVELS_PASSWORD,
      EndUserIp: userIP,
    };

    const options = {
      method: "POST",
      url: "https://api.tektravels.com/SharedServices/SharedData.svc/rest/Authenticate",
      headers: {
        "content-type": "application/JSON",
      },
      data: JSON.stringify(body),
    };

    const result = await axios(options);

    if (result?.data?.Error?.ErrorCode === 0) {
      const auth = new AuthToken({
        ipAddress: process.env.SERVER_IP_ADDRESS,
        tokenId: result.data.TokenId,
        MemberId: result.data.Member.MemberId,
        AgencyId: result.data.Member.AgencyId,
      });

      await auth.save();
      return { data: result.data };
    }

    throw new AppError("Authentication Failed", 400);
  } catch (error: any) {
    throw new AppError(error.message, 400);
  }
};

const getClientIp = async (
  request: Request,
  response: Response,
  next: NextFunction,
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
  timeOfDay: number,
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

export {
  getAirportByCode,
  getAirportList,
  getClientIp,
  getFareQuote,
  getSourceParameter,
  searchFlights,
  getDateTimeWithTimeOfDay,
  authenticate,
  getFareRule,
};
