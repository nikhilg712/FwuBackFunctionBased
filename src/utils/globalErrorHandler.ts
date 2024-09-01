import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/appError";

const globalErrorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  res.setHeader("Content-Type", "application/json");

  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error("ERRORS:", err);

    res.status(500).json({
      status: "error",
      message: "Something went very wrong!",
    });
  }
};

export default globalErrorHandler;
