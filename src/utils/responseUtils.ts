// responseUtils.ts

import { Request, Response, NextFunction } from "express";

// Type for the async function used in catchAsync
type AsyncFunction = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<void>;

/**
 * A higher-order function to catch errors from async functions.
 * @param fn - The async function to wrap.
 * @returns A function that handles errors from the async function.
 */
// const catchAsync = (fn: AsyncFunction) => {
//   return (req: Request, res: Response, next: NextFunction) => {
//     fn(req, res, next).catch(next);
//   };
// };
const catchAsync = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * A utility function to send JSON responses.
 * @param res - The Express response object.
 * @param statusCode - The HTTP status code.
 * @param status - The response status (e.g., 'success', 'error').
 * @param message - The response message.
 * @param data - Optional data to include in the response.
 */
// const sendResponse = (
//   res: Response,
//   statusCode: number,
//   status: string,
//   message: string,
//   data: any = null
// ) => {
//   return res.status(statusCode).json({
//     status,
//     message,
//     ...(data && { data }), // Include data only if it is provided
//   });
// };
const sendResponse = (
  response: Response,
  statusCode: number,
  statusMessage: string,
  message: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any,
) => {
  response.status(statusCode).json({
    statusCode,
    statusMessage,
    message,
    data,
    success: true,
  });
};

// TODO: Remove
// const sendCustomResponse = (
//   // req: any, res: any, type?: any, message?: any) => void;
//   res: Response,
//   statusCode: number,
//   status: string,
//   type: any = null,
//   message: string
// ) => {
//   return res.status(statusCode).json({
//     status,
//     message,
//     type, // Include data only if it is provided
//   });
// };

// const sendSuccessResponse = (
//   request: Request,
//   response: Response,
//   data: object = {},
//   statusCode: number = 200,
//   message: string = ""
// ): any => {
//   const responseBody: ResponseBody = {
//     success: true,
//     StatusMsg: message,
//     ResponseType: "SUCCESS",
//     data: data,
//   };
//   return response.status(statusCode).json(responseBody);
// };

// // Define the structure of the response body
// interface ResponseBody {
//   success: boolean;
//   StatusMsg: string;
//   ResponseType: string;
//   data: object;
// }

export { catchAsync, sendResponse };
