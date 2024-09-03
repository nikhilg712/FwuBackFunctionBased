import { catchAsync, sendResponse } from "../utils/responseUtils";
import { NextFunction, Request, Response } from "express";
import {
  CountryList,
  FareQuoteResponseType,
  AuthTokenResponseType,
  FlightDataType,
  FlightSearchResponseType,
  FareRule,
  SSRFlightData,
  SSRResponseType,
  SelectedFareQuote,
  Segment,
  FlightDetails,
  SegmentDetails,
} from "../interface/home.interface";
import { CountryModel } from "../models/country";
import {
  getAirportByCode,
  getAirportList,
  searchFlights as getFlights,
  getFareRule,
  getFareQuote,
  getSSR,
  getBooking,
  getBookingDetails,
  ticketNonLCC,
  ticketLCC as LCCTicketBooking,
  getSendChangeReq,
  getChangeRequestStatus,
  getCancellationcharges,
  getCancelPnrReq,
} from "../services/home.service";
import {
  FlightResponseType,
  FareRuleResponseType,
} from "../interface/home.interface";
import { constants } from "../constants/home.constants";
import { AppError } from "../utils/appError";
import crypto from "crypto";
import axios from "axios";
import { Booking } from "../models/Booking";
import { Transaction } from "../models/Transaction";

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
    const flights: SelectedFareQuote[][] = await getFlights(
      request,
      response,
      next
    );

    if (!flights) {
      returnObj.flag = false;
      returnObj.message = constants.SEARCH_FLIGHT_ERROR;
    } else {
      // Process flights to return only selected fields
      returnObj.data = processFlightSearchResults(flights);
      returnObj.message = "Flights fetched successfully";
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

function processFlightSearchResults(
  flights: SelectedFareQuote[][]
): FlightDetails[] {
  return flights[0].map((flight) => {
    const outBound: SegmentDetails[] = [];
    const inBound: SegmentDetails[] = [];

    // Iterate over each segment array in the flight.Segments array
    flight.Segments.forEach((segmentArray: Segment[]) => {
      segmentArray.forEach((segment: Segment) => {
        const segmentDetails: SegmentDetails = {
          airlineName: segment.Airline.AirlineName,
          airlineCode: segment.Airline.AirlineCode,
          flightNumber: segment.Airline.FlightNumber,
          fareClass: segment.Airline.FareClass,
          noOfSeatAvailable: segment.NoOfSeatAvailable,
          originAirportCode: segment.Origin.Airport.AirportCode,
          originAirportName: segment.Origin.Airport.AirportName,
          originTerminal: segment.Origin.Airport.Terminal,
          originCityName: segment.Origin.Airport.CityName,
          destinationAirportCode: segment.Destination.Airport.AirportCode,
          destinationAirportName: segment.Destination.Airport.AirportName,
          destinationTerminal: segment.Destination.Airport.Terminal,
          destinationCityName: segment.Destination.Airport.CityName,
          departureTime: segment.Origin.DepTime,
          arrivalTime: segment.Destination.ArrTime,
          duration: segment.Duration,
          stopOver: segment.StopOver,
          stopPoint: segment.StopPoint,
          stopPointArrivalTime: segment.StopPointArrivalTime,
          stopPointDepartureTime: segment.StopPointDepartureTime,
          baggage: segment.Baggage,
          cabinBaggage: segment.CabinBaggage,
          cabinClass: segment.CabinClass,
        };

        if (segment.TripIndicator === 1) {
          outBound.push(segmentDetails);
        } else if (segment.TripIndicator === 2) {
          inBound.push(segmentDetails);
        }
      });
    });

    return {
      resultIndex: flight.ResultIndex,
      isLCC: flight.IsLCC,
      outBound: outBound,
      inBound: inBound,
      fare: flight.Fare,
    };
  });
}

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

const createPayment = catchAsync(
  async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    const { ResultIndex, IsLCC } = request.query;
    if (!ResultIndex) {
      throw new AppError("ResultIndex is required", 400);
    }

    if (!IsLCC) {
      const user = request.user as { id: string };
      const userId = user.id;
      const { PNR } = request.query;
      const booking = await Booking.findOne({ PNR });
      console.log("Net Payable Amount:", booking?.NetPayable!);
      const merchantTransactionId = booking?.BookingId;
      const data = {
        merchantId: process.env.PHONEPE_MERCHANTID,
        merchantTransactionId,
        merchantUserId: userId,
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
    } else {
      const requestBody = {};
    }
  }
);

const paymentStatus = catchAsync(
  async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    const returnObj: any = {
      data: [],
      flag: true,
      type: "",
      message: "",
    };
    const { merchantTransactionId } = request.params;

    const { IsLCC } = request.params;

    if (!merchantTransactionId) {
      throw new AppError(constants.TRANSACTIONID_NOT_FOUND, 400);
    }
    if (!IsLCC) {
      const booking = await Booking.findOne({ _id: merchantTransactionId });
      const BookingId = merchantTransactionId;

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

      if (booking) {
        const userId = booking.userId;
        const transaction = new Transaction({
          userId,
          BookingId,
          ...phonepeData,
        });

        await transaction.save();
      }

      if (
        phonepeData.code !== "PAYMENT_SUCCESS" ||
        phonepeData.success !== true
      ) {
        throw new AppError(phonepeData.message, 400);
      } else {
        if (booking) {
          booking.PaymentStatus = "Success";
        }
        const bookingNonLCC: any = await ticketNonLCC(request, response, next);
        returnObj.data = bookingNonLCC;
        returnObj.message = "Ticket fetched successfully";

        if (!bookingNonLCC) {
          returnObj.flag = false;
          returnObj.message = constants.TICKET_ERROR;
        }
      }
      sendResponse(
        response,
        returnObj.flag ? 200 : 400,
        returnObj.flag ? "Success" : "Failure",
        returnObj.message,
        returnObj.data
      );
    } else {
      const booking = await Booking.findOne({
        id: merchantTransactionId,
      });
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

      try {
        const userId = booking?.userId;
        const transaction = new Transaction({
          userId,
          ...phonepeData,
        });

        await transaction.save();

        if (
          phonepeData.code !== "PAYMENT_SUCCESS" ||
          phonepeData.success !== true
        ) {
          throw new AppError(phonepeData.message, 400);
        } else {
          if (booking) {
            booking.PaymentStatus = "Success";
          }
          const bookingLCC: any = await LCCTicketBooking(
            request,
            response,
            next
          );
          returnObj.data = bookingLCC;
          returnObj.message = "Ticket fetched successfully";

          if (!bookingLCC) {
            returnObj.flag = false;
            returnObj.message = constants.TICKET_ERROR;
          }
        }
        sendResponse(
          response,
          returnObj.flag ? 200 : 400,
          returnObj.flag ? "Success" : "Failure",
          returnObj.message,
          returnObj.data
        );
      } catch (err: any) {
        console.log(err.message);
      }

      // const booking = await Booking.findOne({ BookingId: merchantTransactionId });
    }
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

    const booking: any = await getBooking(request, response, next);
    returnObj.data = booking;
    returnObj.message = "Booking fetched successfully";

    if (!booking) {
      returnObj.flag = false;
      returnObj.message = constants.BOOKING_FAILED_FOR_NONLCC;
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

const ticketLCC = catchAsync(
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
    const user = request.user as { id: string };
    const userId = user.id;
    console.log(userId);
    const { ResultIndex, IsLCC } = request.query;

    const Passengers = request.body.Passengers;
    if (!ResultIndex) {
      throw new AppError("ResultIndex is required", 400);
    }

    const booking: any = await Booking.findOne({ ResultIndex, userId });
    if (booking) {
      console.log(booking.NetPayable);
    }

    booking.FlightItinerary.Passenger = Passengers;

    const merchantTransactionId = booking?.id;
    const data = {
      merchantId: process.env.PHONEPE_MERCHANTID,
      merchantTransactionId,
      merchantUserId: userId,
      amount: 1 * 100,
      redirectUrl: `${process.env.PHONEPE_REDIRECT_URI}${merchantTransactionId}/${IsLCC}`,
      redirectMode: "REDIRECT",
      callbackUrl: `${process.env.PHONEPE_CALLBACK_URI}${merchantTransactionId}/${IsLCC}`,
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

    // Add passengers to the flightItenary.Passengers array

    // Save the updated booking document
    await booking.save();
    sendResponse(response, 200, "Success", "Payment Initiated", result);

    // const booking: any = await ticketNonLCC(request, response, next);
    // returnObj.data = booking;
    // returnObj.message = "Booking fetched successfully";

    // if (!booking) {
    //   returnObj.flag = false;
    //   returnObj.message = constants.TICKET_ERROR;
    // }

    // sendResponse(
    //   response,
    //   returnObj.flag ? 200 : 400,
    //   returnObj.flag ? "Success" : "Failure",
    //   returnObj.message,
    //   returnObj.data
    // );
  }
);

const bookingDetails = catchAsync(
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

    const booking: any = await getBookingDetails(request, response, next);
    returnObj.data = booking;
    returnObj.message = "Booking fetched successfully";

    if (!booking) {
      returnObj.flag = false;
      returnObj.message = constants.GET_BOOKING_FAILED;
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

const cancelPnrReq = catchAsync(
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

    const booking: any = await getCancelPnrReq(request, response, next);
    returnObj.data = booking;
    returnObj.message = "Booking fetched successfully";

    if (!booking) {
      returnObj.flag = false;
      returnObj.message = constants.GET_BOOKING_FAILED;
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
const sendChangeReq = catchAsync(
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

    const booking: any = await getSendChangeReq(request, response, next);
    returnObj.data = booking;
    returnObj.message = "Booking fetched successfully";

    if (!booking) {
      returnObj.flag = false;
      returnObj.message = constants.GET_BOOKING_FAILED;
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
const changeRequestStatus = catchAsync(
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

    const booking: any = await getChangeRequestStatus(request, response, next);
    returnObj.data = booking;
    returnObj.message = "Booking fetched successfully";

    if (!booking) {
      returnObj.flag = false;
      returnObj.message = constants.GET_BOOKING_FAILED;
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
const cancellationcharges = catchAsync(
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

    const booking: any = await getCancellationcharges(request, response, next);
    returnObj.data = booking;
    returnObj.message = "Booking fetched successfully";

    if (!booking) {
      returnObj.flag = false;
      returnObj.message = constants.GET_BOOKING_FAILED;
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
  fareQuote,
  fareRules,
  searchFlights,
  getAirportsByCode,
  getAirportsList,
  ssr,
  createPayment,
  paymentStatus,
  booking,
  bookingDetails,
  ticketLCC,
  cancelPnrReq,
  sendChangeReq,
  changeRequestStatus,
  cancellationcharges,
};
