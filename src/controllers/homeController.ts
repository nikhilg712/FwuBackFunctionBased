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
      returnObj.data
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

export {
  getCountryList,
  authenticateToken,
  fareQuote,
  fareRules,
  searchFlights,
  getAirportsByCode,
  getAirportsList,
  ssr,
};
