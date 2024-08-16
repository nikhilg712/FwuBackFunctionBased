import { Request, Response, NextFunction } from "express";

// Middleware to check if the user is authenticated
export const isAuthenticated = (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  if (request.isAuthenticated()) {
    return next(); // User is authenticated, proceed to the next handler
  } else {
    response.status(401).json({
      status: "fail",
      message: "User is not authenticated",
    });
  }
};
