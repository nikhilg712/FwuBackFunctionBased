import express, { NextFunction, Request, Response, Router } from "express";
import {
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
  bookingDetails,
  ticket,
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
  router.get(`${path}searchFlights`, searchFlights);
  router.get(`${path}fareRule`, fareRules);
  router.get(`${path}fareQuote`, fareQuote);
  router.get(`${path}ssr`, ssr);
  router.get(`${path}pay`, createPayment);
  router.get(`${path}payment/validate/:merchantTransactionId`, paymentStatus);
  router.get(`${path}booking`, isAuthenticated, booking);
  router.get(`${path}bookingDetails`, bookingDetails);
  router.get(`${path}ticketNonLCC`, ticket);
  /* *****POST******
        ==============================================*/

  router.post(`${path}authenticate`, authenticateToken);
};

initializeRoutes(homeRouter);

// Export the initialized router
export default homeRouter;
