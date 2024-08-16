// import express, { NextFunction, Request, Response, Router } from "express";
// import {
//   fareQuote,
//   fareRule,
//   getAirportsList,
//   getAirportsByCode,
//   authenticateToken,
//   searchFlights,
// } from "@Controllers/homeController";
// import {
//   catchAsync,
//   sendResponse,
//   sendCustomResponse,
// } from "@Utils/responseUtils";

// /**
//  * Creates and returns a router for the home routes.
//  *
//  * @returns {Router} - The configured express router.
//  */
// export default function HomeRoutes(): Router {
//   const router = Router();

//   router.get(
//     "/airports",
//     async (req: Request, res: Response, next: NextFunction) => {
//       try {
//         const result = await getAirportsList();
//         if (!result.flag) {
//           sendCustomResponse(
//             req,
//             statusCode,
//             status,
//             result.type,
//             result.message,
//           );
//         } else {
//           APP.GLOBALS.FN.successResponse(
//             req,
//             res,
//             result.data,
//             result?.message,
//           );
//         }
//       } catch (err: any) {
//         APP.GLOBALS.FN.errorResponse(req, res, 400, err.message);
//       }
//     },
//   );

//   router.get(
//     "/airportbycode",
//     async (req: Request, res: Response, next: NextFunction) => {
//       try {
//         const code = req.query.code as string;
//         const result = await homeController.getAirportsByCode(code);
//         if (!result.flag) {
//           APP.GLOBALS.FN.customisedErrorResponse(
//             req,
//             res,
//             result.type,
//             result.message,
//           );
//         } else {
//           APP.GLOBALS.FN.successResponse(
//             req,
//             res,
//             result.data,
//             result?.message,
//           );
//         }
//       } catch (err: any) {
//         APP.GLOBALS.FN.errorResponse(req, res, 400, err.message);
//       }
//     },
//   );

//   router.get(
//     "/searchFlights",
//     async (req: Request, res: Response, next: NextFunction) => {
//       try {
//         const result = await homeController.searchFlights();
//         if (!result.flag) {
//           APP.GLOBALS.FN.customisedErrorResponse(
//             req,
//             res,
//             result.type,
//             result.message,
//           );
//         } else {
//           APP.GLOBALS.FN.successResponse(
//             req,
//             res,
//             result.data,
//             result?.message,
//           );
//         }
//       } catch (err: any) {
//         APP.GLOBALS.FN.errorResponse(req, res, 400, err.message);
//       }
//     },
//   );

//   router.get(
//     "/fareRule",
//     async (req: Request, res: Response, next: NextFunction) => {
//       try {
//         const result = await homeController.fareRule();
//         if (!result.flag) {
//           APP.GLOBALS.FN.customisedErrorResponse(
//             req,
//             res,
//             result.type,
//             result.message,
//           );
//         } else {
//           APP.GLOBALS.FN.successResponse(
//             req,
//             res,
//             result.data,
//             result?.message,
//           );
//         }
//       } catch (err: any) {
//         APP.GLOBALS.FN.errorResponse(req, res, 400, err.message);
//       }
//     },
//   );

//   router.get(
//     "/fareQuote",
//     async (req: Request, res: Response, next: NextFunction) => {
//       try {
//         const result = await homeController.fareQuote();
//         if (!result.flag) {
//           APP.GLOBALS.FN.customisedErrorResponse(
//             req,
//             res,
//             result.type,
//             result.message,
//           );
//         } else {
//           APP.GLOBALS.FN.successResponse(
//             req,
//             res,
//             result.data,
//             result?.message,
//           );
//         }
//       } catch (err: any) {
//         APP.GLOBALS.FN.errorResponse(req, res, 400, err.message);
//       }
//     },
//   );

//   router.post(
//     "/authenticate",
//     async (req: Request, res: Response, next: NextFunction) => {
//       try {
//         const result = await homeController.authenticateToken();
//         if (!result.flag) {
//           APP.GLOBALS.FN.customisedErrorResponse(
//             req,
//             res,
//             result.type,
//             result.message,
//           );
//         } else {
//           APP.GLOBALS.FN.successResponse(
//             req,
//             res,
//             result.data,
//             result?.message,
//           );
//         }
//       } catch (err: any) {
//         APP.GLOBALS.FN.errorResponse(req, res, 400, err.message);
//       }
//     },
//   );

//   return router;
// }
