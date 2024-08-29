"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentStatus = exports.createPayment = exports.ssr = exports.getAirportsList = exports.getAirportsByCode = exports.searchFlights = exports.fareRules = exports.fareQuote = exports.authenticateToken = exports.getCountryList = void 0;
const responseUtils_1 = require("../utils/responseUtils");
const country_1 = require("../models/country");
const home_service_1 = require("../services/home.service");
const home_constants_1 = require("../constants/home.constants");
const appError_1 = require("../utils/appError");
const crypto_1 = __importDefault(require("crypto"));
const os_1 = __importDefault(require("os"));
const axios_1 = __importDefault(require("axios"));
const getCountryList = (0, responseUtils_1.catchAsync)(async (request, response, next) => {
    const returnObj = {
        data: [],
        flag: true,
        type: "",
        message: "",
    };
    const countries = await country_1.CountryModel.find({});
    returnObj.data = countries;
    returnObj.message = "Country List Fetched";
    (0, responseUtils_1.sendResponse)(response, 200, "Success", "CountryListFetched", countries);
});
exports.getCountryList = getCountryList;
const getAirportsList = (0, responseUtils_1.catchAsync)(async (request, response, next) => {
    const returnObj = {
        data: [],
        flag: true,
        type: "",
        message: "",
    };
    let start = 0;
    let end = 25;
    if ("pageNo" in request.query && "pageSize" in request.query) {
        const pageNo = Number(request.query.pageNo);
        const pageSize = Number(request.query.pageSize);
        start = (pageNo - 1) * pageSize;
        end = pageSize;
    }
    const airportList = await (0, home_service_1.getAirportList)(start, end);
    if (!airportList) {
        returnObj.flag = false;
        throw new appError_1.AppError("Error fetching airport list:", 400);
    }
    returnObj.data = airportList.data;
    returnObj.message = "Airport list fetched successfully";
    (0, responseUtils_1.sendResponse)(response, returnObj.flag ? 200 : 400, returnObj.flag ? "Success" : "Failure", returnObj.message, returnObj.data);
});
exports.getAirportsList = getAirportsList;
/**
 * @function getAirportByCode
 * @description Retrieves the airports from database according to the query params passed.
 * @param {string} query - The query parameter needed to search the airport
 */
const getAirportsByCode = (0, responseUtils_1.catchAsync)(async (request, response, next) => {
    const returnObj = {
        data: [],
        flag: true,
        type: "",
        message: "",
    };
    const airportCode = request.query.code;
    if (!airportCode) {
        returnObj.flag = false;
        returnObj.message = "Airport code is required.";
    }
    else {
        // This assumes that getAirportByCode handles errors properly
        const airportList = await (0, home_service_1.getAirportByCode)(airportCode);
        returnObj.data = airportList;
        returnObj.message = "Airport data fetched successfully";
        if (!airportList || airportList.length === 0) {
            returnObj.flag = false;
            returnObj.message = home_constants_1.constants.AIRPORT_BY_CODE_SEARCH_ERROR;
        }
    }
    (0, responseUtils_1.sendResponse)(response, returnObj.flag ? 200 : 400, returnObj.flag ? "Success" : "Failure", returnObj.message, returnObj.data);
});
exports.getAirportsByCode = getAirportsByCode;
const searchFlights = (0, responseUtils_1.catchAsync)(async (request, response, next) => {
    const returnObj = {
        data: [],
        flag: true,
        type: "",
        message: "",
    };
    // Call the searchFlights service method
    const flights = await (0, home_service_1.searchFlights)(request, response, next);
    if (!flights) {
        returnObj.flag = false;
        returnObj.message = home_constants_1.constants.SEARCH_FLIGHT_ERROR;
    }
    returnObj.data = flights;
    returnObj.message = "Flights fetched successfully";
    (0, responseUtils_1.sendResponse)(response, returnObj.flag ? 200 : 400, returnObj.flag ? "Success" : "Failure", returnObj.message, returnObj.data);
});
exports.searchFlights = searchFlights;
const fareRules = (0, responseUtils_1.catchAsync)(async (request, response, next) => {
    const returnObj = {
        data: [],
        flag: true,
        type: "",
        message: "",
    };
    // Call the getfareRule service method
    const fareRule = await (0, home_service_1.getFareRule)(request, response, next);
    returnObj.data = fareRule;
    returnObj.message = "Fare rule fetched successfully";
    if (!fareRule) {
        returnObj.flag = false;
        returnObj.message = home_constants_1.constants.FARE_RULE_ERROR;
    }
    (0, responseUtils_1.sendResponse)(response, returnObj.flag ? 200 : 400, returnObj.flag ? "Success" : "Failure", returnObj.message, returnObj.data);
});
exports.fareRules = fareRules;
const fareQuote = (0, responseUtils_1.catchAsync)(async (request, response, next) => {
    const returnObj = {
        data: [],
        flag: true,
        type: "",
        message: "",
    };
    // Call the getfareQuote service method
    const fareQuote = await (0, home_service_1.getFareQuote)(request, response, next);
    returnObj.data = fareQuote;
    returnObj.message = "Fare quote fetched successfully";
    if (!fareQuote) {
        returnObj.flag = false;
        returnObj.message = home_constants_1.constants.FARE_QUOTE_ERROR;
        return (0, responseUtils_1.sendResponse)(response, 404, "Failure", returnObj.message, returnObj.data);
    }
    (0, responseUtils_1.sendResponse)(response, returnObj.flag ? 200 : 400, returnObj.flag ? "Success" : "Failure", returnObj.message, returnObj.data);
});
exports.fareQuote = fareQuote;
const ssr = (0, responseUtils_1.catchAsync)(async (request, response, next) => {
    const returnObj = {
        data: { Meal: [], SeatDynamic: [] },
        flag: true,
        type: "",
        message: "",
    };
    // Call the getfareQuote service method
    const ssr = await (0, home_service_1.getSSR)(request, response, next);
    returnObj.data = ssr;
    returnObj.message = "SSR fetched successfully";
    if (!ssr) {
        returnObj.flag = false;
        returnObj.message = home_constants_1.constants.FARE_QUOTE_ERROR;
    }
    (0, responseUtils_1.sendResponse)(response, returnObj.flag ? 200 : 400, returnObj.flag ? "Success" : "Failure", returnObj.message, returnObj.data);
});
exports.ssr = ssr;
const generateTransactionId = () => {
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000000);
    return `HS-${timestamp}${randomNum}`;
};
const objectId = () => {
    const secondInHex = Math.floor(new Date().getTime() / 1000).toString(16);
    const machineId = crypto_1.default
        .createHash("md5")
        .update(os_1.default.hostname())
        .digest("hex")
        .slice(0, 6);
    const processId = process.pid.toString(16).slice(0, 4).padStart(4, "0");
    const counter = process.hrtime()[1].toString(16).slice(0, 6).padStart(6, "0");
    return secondInHex + machineId + processId + counter;
};
const createPayment = (0, responseUtils_1.catchAsync)(async (request, response, next) => {
    const merchantTransactionId = generateTransactionId();
    const data = {
        merchantId: process.env.PHONEPE_MERCHANTID,
        merchantTransactionId,
        merchantUserId: objectId(),
        amount: 1 * 100,
        redirectUrl: `${process.env.PHONEPE_REDIRECT_URI}${merchantTransactionId}`,
        redirectMode: "REDIRECT",
        callbackUrl: `${process.env.PHONEPE_CALLBACK_URI}${merchantTransactionId}`,
        mobileNumber: "",
        paymentInstrument: {
            type: "PAY_PAGE",
        },
    };
    const encode = btoa(JSON.stringify(data));
    const saltKey = process.env.PHONEPE_SALTKEY;
    const saltIndex = 1;
    const encodedData = encode + "/pg/v1/pay" + saltKey;
    const hash = crypto_1.default.createHash("sha256");
    //Pass the original data to be hashed
    const originalValue = hash.update(encodedData, "utf-8");
    //Creating the hash value in the specific format
    const hashValue = originalValue.digest("hex");
    const sha256 = hashValue + "###" + saltIndex;
    const options = {
        method: "POST",
        url: process.env.PHONEPE_API,
        data: { request: encode },
        headers: { "x-verify": sha256, "Content-Type": "application/json" },
    };
    const result = await axios_1.default
        .request(options)
        .then(function (response) {
        return response.data;
    })
        .catch(function (error) {
        console.log(error);
    });
    (0, responseUtils_1.sendResponse)(response, 200, "Success", "Payment Initiated", result);
    console.log(result);
});
exports.createPayment = createPayment;
const paymentStatus = async (request, response) => {
    const { merchantTransactionId } = request.params;
    if (!merchantTransactionId) {
        console.log("no transaction id found");
    }
    // if (!TransactionId) { throw constants.TRANSACTIONID_NOT_RECEIVED; }
    // if (!paymentInstrument) { throw constants.PAYMENT_INSTRUMENT_NOT_RECEIVED; }
    const saltKey = process.env.PHONEPE_SALTKEY;
    const saltIndex = process.env.PHONEPE_SALTINDEX;
    const encodeData = "/pg/v1/status/" +
        process.env.PHONEPE_MERCHANTID +
        "/" +
        merchantTransactionId +
        saltKey;
    const hash = crypto_1.default.createHash("sha256");
    //Pass the original data to be hashed
    const originalValue = hash.update(encodeData, "utf-8");
    //Creating the hash value in the specific format
    const hashValue = originalValue.digest("hex");
    const sha256 = hashValue + "###" + saltIndex;
    const options = {
        method: "GET",
        url: `${process.env.PHONEPE_CHECKSTATUS_API}${process.env.PHONEPE_MERCHANTID}/${merchantTransactionId}`,
        headers: {
            accept: "application/json",
            "Content-Type": "application/json",
            "x-verify": sha256,
            "X-MERCHANT-ID": process.env.PHONEPE_MERCHANTID,
        },
    };
    const phonepeData = await axios_1.default
        .request(options)
        .then(function (response) {
        return response.data;
    })
        .catch(function (error) {
        console.error(error);
    });
    if (phonepeData.code !== "PAYMENT_SUCCESS" || phonepeData.success !== true) {
        throw new appError_1.AppError(phonepeData.message, 400);
    }
    (0, responseUtils_1.sendResponse)(response, 200, "success", phonepeData.message, phonepeData.data);
};
exports.paymentStatus = paymentStatus;
const authenticateToken = (0, responseUtils_1.catchAsync)(async (request, response, next) => {
    const returnObj = {
        data: {},
        flag: true,
        type: "",
        message: "",
    };
    const token = await (0, home_service_1.authenticate)(request, response, next);
    returnObj.data = token.data;
    returnObj.message = "Token generated successfully";
    if (!token) {
        returnObj.flag = false;
        returnObj.message = "An error occurred while generating token.";
    }
    (0, responseUtils_1.sendResponse)(response, returnObj.flag ? 200 : 500, "Success", returnObj.message, returnObj.data);
});
exports.authenticateToken = authenticateToken;
