"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSSR = exports.getFareRule = exports.authenticate = exports.searchFlights = exports.getFareQuote = exports.getClientIp = exports.getAirportList = exports.getAirportByCode = void 0;
const authToken_1 = __importDefault(require("../models/authToken"));
const btoa_1 = __importDefault(require("btoa"));
const appError_1 = require("../utils/appError");
const requestAPI_1 = require("../utils/requestAPI");
const home_constants_1 = require("../constants/home.constants");
const airport_1 = require("../models/airport");
const axios_1 = __importDefault(require("axios"));
const crypto_1 = __importDefault(require("crypto"));
const os_1 = __importDefault(require("os"));
const getAirportList = async (Start, End) => {
    try {
        const airports = await airport_1.Airport.find()
            .select("-_id -createdAt -updatedAt")
            .skip(Start)
            .limit(End)
            .exec();
        return { data: airports };
    }
    catch (err) {
        throw new appError_1.AppError(home_constants_1.constants.ERROR_MSG.NO_SUCH_AIRPORT, 500);
    }
};
exports.getAirportList = getAirportList;
const getAirportByCode = async (query) => {
    try {
        const regex = new RegExp(query, "i");
        const airports = await airport_1.Airport.find({
            $or: [
                { AIRPORTCODE: { $regex: regex } },
                { CITYNAME: { $regex: regex } },
                { COUNTRYCODE: { $regex: regex } },
                { COUNTRYNAME: { $regex: regex } },
                { AIRPORTNAME: { $regex: regex } },
            ],
        })
            .select("-_id -createdAt -updatedAt")
            .limit(10)
            .exec();
        // Explicitly map the query results to match FlightDataType
        const mappedAirports = airports.map((airport) => ({
            CITYNAME: airport.CITYNAME,
            CITYCODE: airport.CITYCODE,
            COUNTRYCODE: airport.COUNTRYCODE,
            COUNTRYNAME: airport.COUNTRYNAME,
            AIRPORTCODE: airport.AIRPORTCODE,
            AIRPORTNAME: airport.AIRPORTNAME,
        }));
        // Sorting logic remains the same
        mappedAirports.sort((a, b) => {
            const aAirportCodeMatch = a.AIRPORTCODE.toLowerCase() === query.toLowerCase();
            const bAirportCodeMatch = b.AIRPORTCODE.toLowerCase() === query.toLowerCase();
            if (aAirportCodeMatch && !bAirportCodeMatch) {
                return -1;
            }
            if (!aAirportCodeMatch && bAirportCodeMatch) {
                return 1;
            }
            const aStartsWithQueryAndCountryIsLocation = a.AIRPORTNAME.toLowerCase().startsWith(query.toLowerCase()) &&
                a.COUNTRYNAME.toLowerCase() === home_constants_1.constants.LOCATION.toLowerCase();
            const bStartsWithQueryAndCountryIsLocation = b.AIRPORTNAME.toLowerCase().startsWith(query.toLowerCase()) &&
                b.COUNTRYNAME.toLowerCase() === home_constants_1.constants.LOCATION.toLowerCase();
            if (aStartsWithQueryAndCountryIsLocation &&
                !bStartsWithQueryAndCountryIsLocation) {
                return -1;
            }
            if (!aStartsWithQueryAndCountryIsLocation &&
                bStartsWithQueryAndCountryIsLocation) {
                return 1;
            }
            const aCountryIsLocation = a.COUNTRYNAME.toLowerCase() === home_constants_1.constants.LOCATION.toLowerCase();
            const bCountryIsLocation = b.COUNTRYNAME.toLowerCase() === home_constants_1.constants.LOCATION.toLowerCase();
            if (aCountryIsLocation && !bCountryIsLocation) {
                return -1;
            }
            if (!aCountryIsLocation && bCountryIsLocation) {
                return 1;
            }
            const aStartsWithQuery = a.AIRPORTNAME.toLowerCase().startsWith(query.toLowerCase());
            const bStartsWithQuery = b.AIRPORTNAME.toLowerCase().startsWith(query.toLowerCase());
            if (aStartsWithQuery && !bStartsWithQuery) {
                return -1;
            }
            if (!aStartsWithQuery && bStartsWithQuery) {
                return 1;
            }
            return 0;
        });
        return mappedAirports;
    }
    catch (err) {
        throw new appError_1.AppError(home_constants_1.constants.ERROR_MSG.NO_SUCH_AIRPORT, 500);
    }
};
exports.getAirportByCode = getAirportByCode;
const searchFlights = async (request, response, next) => {
    try {
        let AuthData = await authToken_1.default.findOne().sort({ _id: -1 }).exec();
        if (!AuthData) {
            await authenticate(request, response, next);
            AuthData = await authToken_1.default.findOne().sort({ _id: -1 }).exec();
            console.log("Authenticated");
        }
        if (!AuthData) {
            throw new appError_1.AppError("Authentication failed. No token found.", 500);
        }
        const tokenId = AuthData.tokenId;
        const { AdultCount = 1, ChildCount = 0, InfantCount = 0, DirectFlight = false, OneStopFlight = false, JourneyType = 1, Origin, Destination, FlightCabinClass, ReturnFlightCabinClass, PreferredAirlines = "null", DepartureDate, ReturnDepartureDate, ArrivalDate, ReturnArrivalDate, Sources = "null", TimeOfDay = 1, } = request.query;
        if (!DepartureDate || !ArrivalDate) {
            throw new appError_1.AppError("DepartureDate and ArrivalDate are required.", 400);
        }
        const requestBody = {
            EndUserIp: await getClientIp(request, response, next),
            TokenId: tokenId,
            AdultCount,
            ChildCount,
            InfantCount,
            JourneyType,
            PreferredAirlines: PreferredAirlines === "null"
                ? null
                : PreferredAirlines.toString()
                    .split(",")
                    .map((code) => code.trim()),
            DirectFlight,
            OneStopFlight,
            Segments: [
                {
                    Origin,
                    Destination,
                    FlightCabinClass,
                    PreferredDepartureTime: await getDateTimeWithTimeOfDay(DepartureDate.toString(), +TimeOfDay),
                    PreferredArrivalTime: await getDateTimeWithTimeOfDay(ArrivalDate.toString(), +TimeOfDay),
                },
            ],
            Sources: Sources === "null"
                ? null
                : await getSourceParameter(Sources.toString()),
        };
        if (JourneyType === "2") {
            requestBody.Segments.push({
                Origin: Destination,
                Destination: Origin,
                FlightCabinClass: ReturnFlightCabinClass,
                PreferredDepartureTime: await getDateTimeWithTimeOfDay(ReturnDepartureDate?.toString() || "", +TimeOfDay),
                PreferredArrivalTime: await getDateTimeWithTimeOfDay(ReturnArrivalDate?.toString() || "", +TimeOfDay),
            });
        }
        console.log("Request Body:", requestBody);
        let apiResponse; // Declare apiResponse outside the try block to ensure it is accessible later
        try {
            apiResponse = await (0, requestAPI_1.sendApiRequest)({
                url: home_constants_1.constants.API_URLS.SEARCH_FLIGHTS,
                data: requestBody,
            });
            console.log(apiResponse);
            // Set the TraceId cookie if it exists in the response
            if (apiResponse?.data?.Response?.TraceId) {
                const traceId = apiResponse.data.Response.TraceId;
                response.cookie("tekTravelsTraceId", traceId, {
                    maxAge: 15 * 60 * 60 * 1000, // 15 hours
                    httpOnly: true,
                    secure: process.env.BUILD_ENV !== "development",
                });
            }
        }
        catch (error) {
            console.error(error);
            throw new appError_1.AppError(home_constants_1.constants.SEARCH_FLIGHT_ERROR, 500);
        }
        const finalResponse = apiResponse?.data?.Response?.Results;
        const lowestFareFlights = {};
        finalResponse[0].forEach((flight) => {
            const flightNumber = flight?.Segments[0][0].Airline.FlightNumber;
            const baseFare = flight?.Fare?.BaseFare;
            if (baseFare &&
                flightNumber &&
                (!lowestFareFlights[flightNumber] ||
                    baseFare < lowestFareFlights[flightNumber].Fare.BaseFare)) {
                lowestFareFlights[flightNumber] = flight;
            }
        });
        const lowestFareFlightsArray = finalResponse[0].filter((flight) => {
            const flightNumber = flight?.Segments[0][0].Airline.FlightNumber;
            return lowestFareFlights[flightNumber] === flight;
        });
        let data = [lowestFareFlightsArray];
        // data = data[0];
        // const mappedFlightInfo: SelectedFareQuote[] = data.map((flight) => ({
        //   FirstNameFormat: flight.FirstNameFormat,
        //   IsBookableIfSeatNotAvailable: flight.IsBookableIfSeatNotAvailable,
        //   IsHoldAllowedWithSSR: flight.IsHoldAllowedWithSSR,
        //   IsUpsellAllowed: flight.IsUpsellAllowed,
        //   LastNameFormat: flight.LastNameFormat,
        //   ResultIndex: flight.ResultIndex,
        //   Source: flight.Source,
        //   IsLCC: flight.IsLCC,
        //   IsRefundable: flight.IsRefundable,
        //   IsPanRequiredAtBook: flight.IsPanRequiredAtBook,
        //   IsPanRequiredAtTicket: flight.IsPanRequiredAtTicket,
        //   IsPassportRequiredAtBook: flight.IsPassportRequiredAtBook,
        //   IsPassportRequiredAtTicket: flight.IsPassportRequiredAtTicket,
        //   GSTAllowed: flight.GSTAllowed,
        //   IsCouponAppilcable: flight.IsCouponAppilcable,
        //   IsGSTMandatory: flight.IsGSTMandatory,
        //   AirlineRemark: flight.AirlineRemark,
        //   IsPassportFullDetailRequiredAtBook:
        //     flight.IsPassportFullDetailRequiredAtBook,
        //   ResultFareType: flight.ResultFareType,
        //   Fare: flight.Fare,
        //   FareBreakdown: flight.FareBreakdown,
        //   Segments: flight.Segments,
        //   LastTicketDate: flight.LastTicketDate,
        //   TicketAdvisory: flight.TicketAdvisory,
        //   FareRules: flight.FareRules,
        //   PenaltyCharges: flight.PenaltyCharges,
        //   AirlineCode: flight.AirlineCode,
        //   MiniFareRules: flight.MiniFareRules,
        //   ValidatingAirline: flight.ValidatingAirline,
        //   FareClassification: flight.FareClassification,
        // }));
        return data;
    }
    catch (err) {
        console.error("Service Error:", err);
        next(new appError_1.AppError(err.message, 500));
        return [];
    }
};
exports.searchFlights = searchFlights;
const getFareRule = async (request, response, next) => {
    try {
        const { ResultIndex } = request.query;
        if (!ResultIndex) {
            throw new appError_1.AppError("ResultIndex is required", 400);
        }
        let AuthData = await authToken_1.default.findOne().sort({ _id: -1 }).exec();
        if (!AuthData) {
            await authenticate(request, response, next);
            AuthData = await authToken_1.default.findOne().sort({ _id: -1 }).exec();
        }
        if (!AuthData) {
            throw new appError_1.AppError("Authentication failed. No token found.", 500);
        }
        const requestBody = {
            EndUserIp: await getClientIp(request, response, next),
            TokenId: AuthData.tokenId,
            TraceId: request.cookies.tekTravelsTraceId,
            ResultIndex: ResultIndex.toString(),
        };
        let apiResponse;
        try {
            apiResponse = await (0, requestAPI_1.sendApiRequest)({
                url: home_constants_1.constants.API_URLS.FARE_RULES,
                data: requestBody,
            });
        }
        catch (err) {
            console.error("Error Response:", err.response ? err.response.data : err.message);
            throw new appError_1.AppError(home_constants_1.constants.ERROR_MSG.FARE_RULE_FETCH_FAILED, 500);
        }
        // Return the Fare Rules from the API response
        const data = apiResponse?.data?.Response?.FareRules;
        return data;
    }
    catch (err) {
        next(new appError_1.AppError(err.message, err.statusCode || 500));
        return [];
    }
};
exports.getFareRule = getFareRule;
const getFareQuote = async (request, response, next) => {
    try {
        const { ResultIndex } = request.query;
        if (!ResultIndex) {
            throw new appError_1.AppError("ResultIndex is required", 400);
        }
        let AuthData = await authToken_1.default.findOne().sort({ _id: -1 }).exec();
        if (!AuthData) {
            await authenticate(request, response, next);
            AuthData = await authToken_1.default.findOne().sort({ _id: -1 }).exec();
        }
        if (!AuthData) {
            throw new appError_1.AppError("Authentication failed. No token found.", 500);
        }
        const requestBody = {
            EndUserIp: await getClientIp(request, response, next),
            TokenId: AuthData.tokenId,
            TraceId: request.cookies.tekTravelsTraceId,
            ResultIndex: ResultIndex.toString(),
        };
        let apiResponse;
        try {
            apiResponse = await (0, requestAPI_1.sendApiRequest)({
                url: home_constants_1.constants.API_URLS.FARE_QUOTE,
                data: requestBody,
            });
            console.log(apiResponse);
        }
        catch (err) {
            console.error("Error Response:", err.response ? err.response.data : err.message);
            throw new appError_1.AppError(home_constants_1.constants.ERROR_MSG.FARE_QUOTE_FETCH_FAILED, 500);
        }
        return apiResponse?.data?.Response?.Results;
    }
    catch (err) {
        next(new appError_1.AppError(err.message, err.statusCode || 500));
        return undefined;
    }
};
exports.getFareQuote = getFareQuote;
const getSSR = async (request, response, next) => {
    try {
        const { ResultIndex } = request.query;
        if (!ResultIndex) {
            throw new appError_1.AppError("ResultIndex is required", 400);
        }
        let AuthData = await authToken_1.default.findOne().sort({ _id: -1 }).exec();
        if (!AuthData) {
            await authenticate(request, response, next);
            AuthData = await authToken_1.default.findOne().sort({ _id: -1 }).exec();
        }
        if (!AuthData) {
            throw new appError_1.AppError("Authentication failed. No token found.", 500);
        }
        const requestBody = {
            EndUserIp: await getClientIp(request, response, next),
            TokenId: AuthData.tokenId,
            TraceId: request.cookies.tekTravelsTraceId,
            ResultIndex: ResultIndex.toString(),
        };
        let apiResponse;
        try {
            apiResponse = await (0, requestAPI_1.sendApiRequest)({
                url: home_constants_1.constants.API_URLS.SSR,
                data: requestBody,
            });
            console.log(apiResponse);
        }
        catch (err) {
            console.error("Error Response:", err.response ? err.response.data : err.message);
            throw new appError_1.AppError(home_constants_1.constants.ERROR_MSG.SSR_FETCH_FAILED, 500);
        }
        const result = {
            Meal: apiResponse?.data?.Response.Meal,
            SeatDynamic: apiResponse?.data?.Response.SeatDynamic,
        };
        return result;
    }
    catch (err) {
        throw new appError_1.AppError(err.message, err.statusCode || 500);
    }
};
exports.getSSR = getSSR;
const authenticate = async (request, response, next) => {
    try {
        let headerip = request.headers["x-forwarded-for"];
        headerip = headerip?.split(",").shift();
        const userIP = headerip || request.socket?.remoteAddress || "";
        const body = {
            ClientId: process.env.TEK_TRAVELS_CLIENT_ID,
            UserName: process.env.TEK_TRAVELS_USERNAME,
            Password: process.env.TEK_TRAVELS_PASSWORD,
            EndUserIp: userIP,
        };
        let apiResponse;
        try {
            apiResponse = await (0, requestAPI_1.sendApiRequest)({
                url: home_constants_1.constants.API_URLS.AUTHENTICATE,
                data: JSON.stringify(body),
            });
            console.log(apiResponse);
        }
        catch (err) {
            console.error("Error Response:", err.response ? err.response.data : err.message);
            throw new appError_1.AppError(home_constants_1.constants.ERROR_MSG.AUTHENTICATION_FAILED, 500);
        }
        if (apiResponse?.data?.Error?.ErrorCode === 0) {
            const auth = new authToken_1.default({
                ipAddress: process.env.SERVER_IP_ADDRESS,
                tokenId: apiResponse.data.TokenId,
                MemberId: apiResponse.data.Member.MemberId,
                AgencyId: apiResponse.data.Member.AgencyId,
            });
            await auth.save();
            return { data: apiResponse.data };
        }
        else {
            throw new appError_1.AppError("Failed", 400);
        }
    }
    catch (error) {
        throw new appError_1.AppError(error.message, 400);
    }
};
exports.authenticate = authenticate;
const getClientIp = async (request, response, next) => {
    let headerIp = request.headers["x-forwarded-for"];
    headerIp = headerIp?.split(",").shift()?.trim();
    const userIp = headerIp || request.socket?.remoteAddress;
    return userIp?.startsWith("::1") ? "127.0.0.1" : userIp || "127.0.0.1";
};
exports.getClientIp = getClientIp;
const getDateTimeWithTimeOfDay = async (date, timeOfDay) => {
    const timeMapping = {
        1: "00:00:00", // ALL
        2: "08:00:00", //  Morning
        3: "14:00:00", // Afternoon
        4: "19:00:00", // Evening
        5: "01:00:00", // Night
    };
    // Default to "00:00:00" if timeOfDay is not in the mapping
    const time = timeMapping[timeOfDay] || "00:00:00";
    return `${date}T${time}`;
};
const getSourceParameter = async (type) => {
    return home_constants_1.constants.SOURCES[type] || [];
};
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
const createPayment = async (response) => {
    let data = {
        merchantId: "M1CYTZHRDI5E",
        merchantTransactionId: 987455446545,
        merchantUserId: 321448856,
        amount: 1 * 100,
        redirectUrl: "http://localhost:8000/fwu/api/v1",
        redirectMode: "REDIRECT",
        callbackUrl: "http://localhost:8000/fwu/api/v1",
        mobileNumber: "",
        paymentInstrument: {
            type: "PAY_PAGE",
        },
    };
    let encode = (0, btoa_1.default)(JSON.stringify(data));
    let saltKey = "1667c257-14d9-4806-9e08-1be522b79426";
    let saltIndex = 1;
    let encodedData = encode + "/pg/v1/pay" + saltKey;
    var hash = crypto_1.default.createHash("sha256");
    //Pass the original data to be hashed
    let originalValue = hash.update(encodedData, "utf-8");
    //Creating the hash value in the specific format
    let hashValue = originalValue.digest("hex");
    let sha256 = hashValue + "###" + saltIndex;
    const options = {
        method: "POST",
        url: "https://api.phonepe.com/apis/hermes/pg/v1/pay",
        data: { request: encode },
        headers: { "x-verify": sha256, "Content-Type": "application/json" },
    };
    let result = await axios_1.default
        .request(options)
        .then(function (response) {
        return response.data;
    })
        .catch(function (error) {
        console.log(error);
    });
    console.log(result);
};
