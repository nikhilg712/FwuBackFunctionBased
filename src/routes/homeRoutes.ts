import express, { NextFunction, Request, Response, Router } from "express";
import {
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
} from "../controllers/homeController";
import { isAuthenticated } from "../middleware/authenticate";

const homeRouter = Router();
// Initialize routes function
const initializeRoutes = (router: Router) => {
  const path = "/";

  // // Define routes
  router.get(`${path}country`, getCountryList);
  router.get(`${path}airports`, getAirportsList);
  router.get(`${path}airportByCode`, getAirportsByCode);
  router.get(`${path}searchFlights`, isAuthenticated, searchFlights);
  router.get(`${path}fareRule`, isAuthenticated, fareRules);
  router.get(`${path}fareQuote`, isAuthenticated, fareQuote);
  router.get(`${path}ssr`, isAuthenticated, ssr);
  router.get(`${path}pay`, isAuthenticated, createPayment);
  router.get(
    `${path}payment/validate/:merchantTransactionId`,
    isAuthenticated,
    paymentStatus
  );
  router.get(`${path}booking`, isAuthenticated, booking);
  router.get(`${path}bookingDetails`, isAuthenticated, bookingDetails);
  router.get(`${path}ticketLCC`, isAuthenticated, ticketLCC);
  /* *****POST******
        ==============================================*/
};

initializeRoutes(homeRouter);

// Export the initialized router
export default homeRouter;
