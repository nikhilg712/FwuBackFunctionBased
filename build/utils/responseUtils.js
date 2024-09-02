"use strict";
// responseUtils.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendResponse = exports.catchAsync = void 0;
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
const catchAsync = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.catchAsync = catchAsync;
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
const sendResponse = (response, statusCode, statusMessage, message, 
// eslint-disable-next-line @typescript-eslint/no-explicit-any
data) => {
    response.status(statusCode).json({
        statusCode,
        statusMessage,
        message,
        data,
        success: true,
    });
};
exports.sendResponse = sendResponse;
