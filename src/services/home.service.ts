import { NextFunction, Request, Response } from "express";
import AuthToken from "../models/authToken";
import {
  AirportListResponse,
  AuthTokenResponse,
  FareRule,
  Flight,
  FlightDataType,
  FlightSearchResponse,
  Root,
  SelectedFareQuote,
  SSRFlightData,
} from "../interface/home.interface";
import { AppError } from "../utils/appError";
import { sendApiRequest } from "../utils/requestAPI";
import { constants } from "../constants/home.constants";
import { Airport } from "../models/airport";
import axios from "axios";
import crypto from "crypto";
import { Buffer } from "buffer";
import fs from "fs/promises";
import os from "os";
import sha256 from "sha256";

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
): Promise<Root[]> => {
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

    let apiResponse: any; // Declare apiResponse outside the try block to ensure it is accessible later

    try {
      apiResponse = await sendApiRequest({
        url: constants.API_URLS.SEARCH_FLIGHTS,
        data: requestBody,
      });
      console.log(apiResponse);

      // Set the TraceId cookie if it exists in the response
      if (apiResponse?.data?.Response?.TraceId) {
        const traceId = apiResponse.data.Response.TraceId;
        response.cookie("tekTravelsTraceId", traceId, {
          maxAge: 15 * 60 * 60 * 1000, // 15 hours
          httpOnly: true,
          secure: process.env.BUILD_ENV !== "development",
        });
      }
    } catch (error) {
      console.error(error);
      throw new AppError(constants.SEARCH_FLIGHT_ERROR, 500);
    }

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
    const data: Root[] = [lowestFareFlightsArray];
    const mappedFlightInfo: SelectedFareQuote[] = data.map((flight) => ({
      FirstNameFormat: flight.FirstNameFormat,
      IsBookableIfSeatNotAvailable: flight.IsBookableIfSeatNotAvailable,
      IsHoldAllowedWithSSR: flight.IsHoldAllowedWithSSR,
      IsUpsellAllowed: flight.IsUpsellAllowed,
      LastNameFormat: flight.LastNameFormat,
      ResultIndex: flight.ResultIndex,
      Source: flight.Source,
      IsLCC: flight.IsLCC,
      IsRefundable: flight.IsRefundable,
      IsPanRequiredAtBook: flight.IsPanRequiredAtBook,
      IsPanRequiredAtTicket: flight.IsPanRequiredAtTicket,
      IsPassportRequiredAtBook: flight.IsPassportRequiredAtBook,
      IsPassportRequiredAtTicket: flight.IsPassportRequiredAtTicket,
      GSTAllowed: flight.GSTAllowed,
      IsCouponAppilcable: flight.IsCouponAppilcable,
      IsGSTMandatory: flight.IsGSTMandatory,
      AirlineRemark: flight.AirlineRemark,
      IsPassportFullDetailRequiredAtBook:
        flight.IsPassportFullDetailRequiredAtBook,
      ResultFareType: flight.ResultFareType,
      Fare: flight.Fare,
      FareBreakdown: flight.FareBreakdown,
      Segments: flight.Segments,
      LastTicketDate: flight.LastTicketDate,
      TicketAdvisory: flight.TicketAdvisory,
      FareRules: flight.FareRules,
      PenaltyCharges: flight.PenaltyCharges,
      AirlineCode: flight.AirlineCode,
      MiniFareRules: flight.MiniFareRules,
      ValidatingAirline: flight.ValidatingAirline,
      FareClassification: flight.FareClassification,
    }));

    return mappedFlightInfo;
  } catch (err: any) {
    console.error("Service Error:", err);
    next(new AppError(err.message, 500));
    return [] as Root[];
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

    // Return the Fare Rules from the API response
    const data: FareRule[] = apiResponse?.data?.Response?.FareRules;
    return data;
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

    return apiResponse?.data?.Response?.Results;
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
      url: "http://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/SSR",
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
        err.response ? err.response.data : err.message
      );
      throw new AppError(constants.ERROR_MSG.FARE_QUOTE_FETCH_FAILED, 500);
    }
    const result: SSRFlightData = {
      Meal: apiResponse?.data?.Response.Meal,
      SeatDynamic: apiResponse?.data?.Response.SeatDynamic,
    };
    return result;
  } catch (err: any) {
    throw new AppError(err.message, err.statusCode || 500);
  }
};

const authenticate = async (
  request: Request,
  response: Response,
  next: NextFunction
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

    let apiResponse: any;
    try {
      apiResponse = await sendApiRequest({
        url: constants.API_URLS.AUTHENTICATE,
        data: JSON.stringify(body),
      });
      console.log(apiResponse);
    } catch (err: any) {
      console.error(
        "Error Response:",
        err.response ? err.response.data : err.message
      );
      throw new AppError(constants.ERROR_MSG.AUTHENTICATION_FAILED, 500);
    }

    if (apiResponse?.data?.Error?.ErrorCode === 0) {
      const auth = new AuthToken({
        ipAddress: process.env.SERVER_IP_ADDRESS,
        tokenId: apiResponse.data.TokenId,
        MemberId: apiResponse.data.Member.MemberId,
        AgencyId: apiResponse.data.Member.AgencyId,
      });

      await auth.save();
      return { data: apiResponse.data };
    } else {
      throw new AppError("Failed", 400);
    }
  } catch (error: any) {
    throw new AppError(error.message, 400);
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

const generateTransactionId = () => {
  const timestamp = Date.now();
  const randomNum = Math.floor(Math.random() * 1000000);
  return `HS-${timestamp}${randomNum}`;
};

const objectId = () => {
  const secondInHex = Math.floor(new Date().getTime() / 1000).toString(16);
  const machineId = crypto
    .createHash("md5")
    .update(os.hostname())
    .digest("hex")
    .slice(0, 6);
  const processId = process.pid.toString(16).slice(0, 4).padStart(4, "0");
  const counter = process.hrtime()[1].toString(16).slice(0, 6).padStart(6, "0");

  return secondInHex + machineId + processId + counter;
};
const createPayment = async (response: Response): Promise<void> => {
  try {
    const merchantTransactionId = generateTransactionId();
    const data = {
      merchantId: "PGTESTPAYUAT",
      merchantTransactionId,
      merchantUserId: objectId(), //changes
      amount: 100 * 100,
      callbackUrl: `http://localhost:8000/fwu/api/v1/home/payment/validate/${merchantTransactionId}`,
      redirectUrl: `http://localhost:8000/fwu/api/v1/home/payment/validate/${merchantTransactionId}`,
      redirectMode: "POST",
      mobileNumber: "9999999999", // user phone no
      paymentInstrument: {
        type: "PAY_PAGE",
      },
    };
    const key = "	099eb0cd-02cf-4e2a-8aca-3e6c6aff0399"; //flewwithus
    const payload = JSON.stringify(data);
    console.log(data, payload);
    const payloadMain = Buffer.from(payload, "utf-8").toString("base64");
    console.log("payload", payloadMain);

    let keyIndex = 1;
    const string = payloadMain + "/pg/v1/pay" + key;
    const sha256 = crypto.createHash("sha256").update(string).digest("hex");
    const checksum = sha256 + "###" + keyIndex; // changes

    console.log("checksum", checksum);
    console.log("payloadMain", payloadMain);
    const options = {
      method: "post",
      url: "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay",
      headers: { "x-verify": checksum, "Content-Type": "application/json" },
      data: { payloadMain },
    };
    axios
      .request(options)
      .then(function (res) {
        console.log(res.data);
        //response.redirect(res.data.data.instrumentResponse.redirectInfo.url);
      })
      .catch(function (error) {
        console.error(error);
      });
  } catch (error) {
    console.log(error);
  }
};

const paymentStatus = async (request: Request, response: Response) => {
  const { merchantTransactionId } = request.params;
  // check the status of the payment using merchantTransactionId
  if (merchantTransactionId) {
    let statusUrl =
      `https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status/PGTESTPAYUAT/` +
      merchantTransactionId;

    // generate X-VERIFY
    let string =
      `/pg/v1/status/PGTESTPAYUAT/` +
      merchantTransactionId +
      "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399";
    let sha256_val = sha256(string);
    let xVerifyChecksum = sha256_val + "###" + 1;

    axios
      .get(statusUrl, {
        headers: {
          "Content-Type": "application/json",
          "X-VERIFY": xVerifyChecksum,
          "X-MERCHANT-ID": merchantTransactionId,
          accept: "application/json",
        },
      })
      .then(function (res) {
        console.log("response->", res.data);
        if (res.data && res.data.code === "PAYMENT_SUCCESS") {
          // redirect to FE payment success status page
          response.send(res.data);
        } else {
          // redirect to FE payment failure / pending status page
        }
      })
      .catch(function (error) {
        // redirect to FE payment failure / pending status page
        response.send(error);
      });
  } else {
    response.send("Sorry!! Error");
  }
};

export {
  getAirportByCode,
  getAirportList,
  getClientIp,
  getFareQuote,
  searchFlights,
  authenticate,
  getFareRule,
  getSSR,
  createPayment,
  paymentStatus,
};
