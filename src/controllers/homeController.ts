// import { NextFunction, Request, Response } from "express";
// // import { HomeControllerService } from "@Modules/home/home.service";
// // import {
// //   AuthTokenResponseType,
// //   FareRuleResponseType,
// //   FlightResponseType,
// //   FareQuoteResponseType,
// // } from "@Modules/home/home.interface";
// // import { constants } from "./home.constant";

// // Create a HomeControllerService instance to use within our functions

// export const getAirportsList = catchAsync(
//   async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     const returnObj: FlightResponseType = {
//       data: [],
//       flag: true,
//       type: "",
//       message: "",
//     };
//     let Start: number = 0;
//     let End: number = 25;

//     if ("pageNo" in req.query && "pageSize" in req.query) {
//       const pageNo: number = +req.query.pageNo;
//       const pageSize: number = +req.query.pageSize;
//       Start = (pageNo - 1) * pageSize;
//       End = pageSize;
//     }

//     try {
//       const airportList = await service.getAirportList(Start, End);
//       returnObj.data = airportList.data;
//     } catch (err) {
//       returnObj.flag = false;
//       returnObj.message = constants.ERROR_MSG.NO_SUCH_AIRPORT;
//     }

//     res.json(returnObj);
//   },
// );

// export const getAirportsByCode = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ): Promise<void> => {
//   const returnObj: FlightResponseType = {
//     data: [],
//     flag: true,
//     type: "",
//     message: "",
//   };

//   const { airportCode } = req.params;

//   try {
//     const airportList = await service.getAirportByCode(airportCode);
//     returnObj.data = airportList.data;
//   } catch (err) {
//     returnObj.flag = false;
//     returnObj.message = constants.AIRPORT_BY_CODE_SEARCH_ERROR;
//   }

//   res.json(returnObj);
// };

// export const searchFlights = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ): Promise<void> => {
//   const returnObj: FlightResponseType = {
//     data: [],
//     flag: true,
//     type: "",
//     message: "",
//   };

//   try {
//     const flights = await service.searchFlights();
//     returnObj.data = flights[0];
//   } catch (err) {
//     returnObj.flag = false;
//     returnObj.message = constants.SEARCH_FLIGHT_ERROR;
//   }

//   res.json(returnObj);
// };

// export const fareRule = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ): Promise<void> => {
//   const returnObj: FareRuleResponseType = {
//     data: [],
//     flag: true,
//     type: "",
//     message: "",
//   };

//   try {
//     const fareRule = await service.getfareRule();
//     returnObj.data = fareRule;
//   } catch (err) {
//     returnObj.flag = false;
//     returnObj.message = constants.FARE_RULE_ERROR;
//   }

//   res.json(returnObj);
// };

// export const fareQuote = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ): Promise<void> => {
//   const returnObj: FareQuoteResponseType = {
//     data: [],
//     flag: true,
//     type: "",
//     message: "",
//   };

//   try {
//     const fareQuote = await service.getfareQuote();
//     returnObj.data = fareQuote;
//   } catch (err) {
//     returnObj.flag = false;
//     returnObj.message = constants.FARE_QUOTE_ERROR;
//   }

//   res.json(returnObj);
// };

// export const authenticateToken = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ): Promise<void> => {
//   const returnObj: AuthTokenResponseType = {
//     data: {},
//     flag: true,
//     type: "",
//     message: "",
//   };

//   try {
//     const token = await service.authenticate();
//     returnObj.data = token.data;
//   } catch (err) {
//     returnObj.flag = false;
//     returnObj.message = "An error occurred while generating token.";
//   }

//   res.json(returnObj);
// };
