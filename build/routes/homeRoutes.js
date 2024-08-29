"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const homeController_1 = require("../controllers/homeController");
const homeRouter = (0, express_1.Router)();
// Initialize routes function
const initializeRoutes = (router) => {
    const path = "/";
    // // Define routes
    router.get(`${path}country`, homeController_1.getCountryList);
    router.get(`${path}airports`, homeController_1.getAirportsList);
    router.get(`${path}airportByCode`, homeController_1.getAirportsByCode);
    router.get(`${path}searchFlights`, homeController_1.searchFlights);
    router.get(`${path}fareRule`, homeController_1.fareRules);
    router.get(`${path}fareQuote`, homeController_1.fareQuote);
    router.get(`${path}ssr`, homeController_1.ssr);
    router.get(`${path}pay`, homeController_1.createPayment);
    router.get(`${path}payment/validate/:merchantTransactionId`, homeController_1.paymentStatus);
    /* *****POST******
          ==============================================*/
    router.post(`${path}authenticate`, homeController_1.authenticateToken);
};
initializeRoutes(homeRouter);
// Export the initialized router
exports.default = homeRouter;
