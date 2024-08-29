import { catchAsync, sendResponse } from "../utils/responseUtils";
import { NextFunction, Request, Response } from "express";
import {
  CountryList,
  FareQuoteResponseType,
  AuthTokenResponseType,
  FlightDataType,
  Root,
  FlightSearchResponseType,
  FareRule,
  SSRFlightData,
  SSRResponseType,
  SelectedFareQuote,
} from "../interface/home.interface";
import { CountryModel } from "../models/country";
import {
  getAirportByCode,
  getAirportList,
  searchFlights as getFlights,
  authenticate,
  getFareRule,
  getFareQuote,
  getSSR,
} from "../services/home.service";
import {
  FlightResponseType,
  FareRuleResponseType,
} from "../interface/home.interface";
import { constants } from "../constants/home.constants";
import { AppError } from "../utils/appError";
import crypto from "crypto";
import { Buffer } from "buffer";
import os from "os";
import axios from "axios";

const getCountryList = catchAsync(
  async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    const returnObj: CountryList = {
      data: [],
      flag: true,
      type: "",
      message: "",
    };
    const countries = await CountryModel.find({});
    returnObj.data = countries;
    returnObj.message = "Country List Fetched";
    sendResponse(response, 200, "Success", "CountryListFetched", countries);
  }
);

const getAirportsList = catchAsync(
  async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    const returnObj: FlightResponseType = {
      data: [],
      flag: true,
      type: "",
      message: "",
    };

    let start = 0;
    let end = 25;

    if ("pageNo" in request.query && "pageSize" in request.query) {
      const pageNo = Number(request.query.pageNo);
      const pageSize = Number(request.query.pageSize);
      start = (pageNo - 1) * pageSize;
      end = pageSize;
    }

    const airportList = await getAirportList(start, end);
    if (!airportList) {
      returnObj.flag = false;
      throw new AppError("Error fetching airport list:", 400);
    }
    returnObj.data = airportList.data;
    returnObj.message = "Airport list fetched successfully";
    sendResponse(
      response,
      returnObj.flag ? 200 : 400,
      returnObj.flag ? "Success" : "Failure",
      returnObj.message,
      returnObj.data
    );
  }
);

/**
 * @function getAirportByCode
 * @description Retrieves the airports from database according to the query params passed.
 * @param {string} query - The query parameter needed to search the airport
 */
const getAirportsByCode = catchAsync(
  async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    const returnObj: FlightResponseType = {
      data: [],
      flag: true,
      type: "",
      message: "",
    };

    const airportCode = request.query.code as string;

    if (!airportCode) {
      returnObj.flag = false;
      returnObj.message = "Airport code is required.";
    } else {
      // This assumes that getAirportByCode handles errors properly
      const airportList: FlightDataType[] = await getAirportByCode(airportCode);

      returnObj.data = airportList;
      returnObj.message = "Airport data fetched successfully";

      if (!airportList || airportList.length === 0) {
        returnObj.flag = false;
        returnObj.message = constants.AIRPORT_BY_CODE_SEARCH_ERROR;
      }
    }

    sendResponse(
      response,
      returnObj.flag ? 200 : 400,
      returnObj.flag ? "Success" : "Failure",
      returnObj.message,
      returnObj.data
    );
  }
);

const searchFlights = catchAsync(
  async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    const returnObj: FlightSearchResponseType = {
      data: [],
      flag: true,
      type: "",
      message: "",
    };

    // Call the searchFlights service method
    const flights: SelectedFareQuote[] = await getFlights(
      request,
      response,
      next
    );

    if (!flights) {
      returnObj.flag = false;
      returnObj.message = constants.SEARCH_FLIGHT_ERROR;
    }

    returnObj.data = flights;
    returnObj.message = "Flights fetched successfully";

    sendResponse(
      response,
      returnObj.flag ? 200 : 400,
      returnObj.flag ? "Success" : "Failure",
      returnObj.message,
      returnObj.data[0]
    );
  }
);

const fareRules = catchAsync(
  async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    const returnObj: FareRuleResponseType = {
      data: [],
      flag: true,
      type: "",
      message: "",
    };

    // Call the getfareRule service method
    const fareRule: FareRule[] = await getFareRule(request, response, next);
    returnObj.data = fareRule;
    returnObj.message = "Fare rule fetched successfully";
    if (!fareRule) {
      returnObj.flag = false;
      returnObj.message = constants.FARE_RULE_ERROR;
    }

    sendResponse(
      response,
      returnObj.flag ? 200 : 400,
      returnObj.flag ? "Success" : "Failure",
      returnObj.message,
      returnObj.data
    );
  }
);

const fareQuote = catchAsync(
  async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    const returnObj: FareQuoteResponseType = {
      data: [],
      flag: true,
      type: "",
      message: "",
    };

    // Call the getfareQuote service method
    const fareQuote = await getFareQuote(request, response, next);
    returnObj.data = fareQuote;
    returnObj.message = "Fare quote fetched successfully";
    if (!fareQuote) {
      returnObj.flag = false;
      returnObj.message = constants.FARE_QUOTE_ERROR;
      return sendResponse(
        response,
        404,
        "Failure",
        returnObj.message,
        returnObj.data
      );
    }

    sendResponse(
      response,
      returnObj.flag ? 200 : 400,
      returnObj.flag ? "Success" : "Failure",
      returnObj.message,
      returnObj.data
    );
  }
);

const ssr = catchAsync(
  async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    const returnObj: SSRResponseType = {
      data: { Meal: [], SeatDynamic: [] },
      flag: true,
      type: "",
      message: "",
    };

    // Call the getfareQuote service method
    const ssr: SSRFlightData = await getSSR(request, response, next);
    returnObj.data = ssr;
    returnObj.message = "SSR fetched successfully";
    if (!ssr) {
      returnObj.flag = false;
      returnObj.message = constants.FARE_QUOTE_ERROR;
    }

    sendResponse(
      response,
      returnObj.flag ? 200 : 400,
      returnObj.flag ? "Success" : "Failure",
      returnObj.message,
      returnObj.data
    );
  }
);
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

const createPayment = catchAsync(
  async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    const merchantTransactionId = generateTransactionId();
    const data = {
      merchantId: process.env.PHONEPE_MERCHANTID,
      merchantTransactionId,
      merchantUserId: objectId(),
      amount: 1 * 100,
      redirectUrl: `${process.env.PHONEPE_REDIRECT_URI}${merchantTransactionId}`,
      redirectMode: "REDIRECT",
      callbackUrl: `${process.env.PHONEPE_CALLBACK_URI}${merchantTransactionId}`,
      mobileNumber: "",
      paymentInstrument: {
        type: "PAY_PAGE",
      },
    };
    const encode = btoa(JSON.stringify(data));
    const saltKey = process.env.PHONEPE_SALTKEY;
    const saltIndex = 1;

    const encodedData = encode + "/pg/v1/pay" + saltKey;
    const hash = crypto.createHash("sha256");
    //Pass the original data to be hashed
    const originalValue = hash.update(encodedData, "utf-8");
    //Creating the hash value in the specific format
    const hashValue = originalValue.digest("hex");
    const sha256 = hashValue + "###" + saltIndex;

    const options = {
      method: "POST",
      url: process.env.PHONEPE_API,
      data: { request: encode },
      headers: { "x-verify": sha256, "Content-Type": "application/json" },
    };

    const result = await axios
      .request(options)
      .then(function (response: any) {
        return response.data;
      })
      .catch(function (error: any) {
        console.log(error);
      });

    sendResponse(response, 200, "Success", "Payment Initiated", result);
    console.log(result);
  }
);

const paymentStatus = async (request: Request, response: Response) => {
  const { merchantTransactionId } = request.params;

  if (!merchantTransactionId) {
    console.log("no transaction id found");
  }
  // if (!TransactionId) { throw constants.TRANSACTIONID_NOT_RECEIVED; }
  // if (!paymentInstrument) { throw constants.PAYMENT_INSTRUMENT_NOT_RECEIVED; }

  const saltKey = process.env.PHONEPE_SALTKEY;

  const saltIndex = process.env.PHONEPE_SALTINDEX;

  const encodeData =
    "/pg/v1/status/" +
    process.env.PHONEPE_MERCHANTID +
    "/" +
    merchantTransactionId +
    saltKey;

  const hash = crypto.createHash("sha256");

  //Pass the original data to be hashed
  const originalValue = hash.update(encodeData, "utf-8");

  //Creating the hash value in the specific format
  const hashValue = originalValue.digest("hex");

  const sha256 = hashValue + "###" + saltIndex;

  const options = {
    method: "GET",
    url: `${process.env.PHONEPE_CHECKSTATUS_API}${process.env.PHONEPE_MERCHANTID}/${merchantTransactionId}`,
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      "x-verify": sha256,
      "X-MERCHANT-ID": process.env.PHONEPE_MERCHANTID,
    },
  };

  const phonepeData: any = await axios
    .request(options)
    .then(function (response: any) {
      return response.data;
    })
    .catch(function (error: any) {
      console.error(error);
    });

  if (phonepeData.code !== "PAYMENT_SUCCESS" || phonepeData.success !== true) {
    throw new AppError(phonepeData.message, 400);
  }
  sendResponse(response, 200, "success", phonepeData.message, phonepeData.data);
};

const authenticateToken = catchAsync(
  async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    const returnObj: AuthTokenResponseType = {
      data: {},
      flag: true,
      type: "",
      message: "",
    };

    const token = await authenticate(request, response, next);
    returnObj.data = token.data;
    returnObj.message = "Token generated successfully";
    if (!token) {
      returnObj.flag = false;
      returnObj.message = "An error occurred while generating token.";
    }

    sendResponse(
      response,
      returnObj.flag ? 200 : 500,
      "Success",
      returnObj.message,
      returnObj.data
    );
  }
);

const booking = catchAsync(
  async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    const returnObj: any = {
      data: {},
      flag: true,
      type: "",
      message: "",
    };

    // Call the getfareQuote service method
    const booking: any = await getSSR(request, response, next);
    returnObj.data = ssr;
    returnObj.message = "SSR fetched successfully";
    if (!ssr) {
      returnObj.flag = false;
      returnObj.message = constants.FARE_QUOTE_ERROR;
    }

    sendResponse(
      response,
      returnObj.flag ? 200 : 400,
      returnObj.flag ? "Success" : "Failure",
      returnObj.message,
      returnObj.data
    );
  }
);
export {
  getCountryList,
  authenticateToken,
  fareQuote,
  fareRules,
  searchFlights,
  getAirportsByCode,
  getAirportsList,
  ssr,
  createPayment,
  paymentStatus,
  booking,
};
