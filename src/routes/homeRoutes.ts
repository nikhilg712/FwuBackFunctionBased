import express, { NextFunction, Request, Response, Router } from "express";
import {
  getCountryList,
  //   fareQuote,
  //   fareRule,
  //   getAirportsList,
  //   getAirportsByCode,
  //   authenticateToken,
  //   searchFlights,
} from "../controllers/homeController";
import { isAuthenticated } from "../middleware/authenticate";

const homeRouter = Router();
// Initialize routes function
const initializeRoutes = (router: Router) => {
  const path = "/";

  // // Define routes
  router.get(`${path}country`, getCountryList);
};

initializeRoutes(homeRouter);

// Export the initialized router
export default homeRouter;
