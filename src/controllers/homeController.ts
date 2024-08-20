import { catchAsync, sendResponse } from "../utils/responseUtils";
import { NextFunction, Request, Response } from "express";
import { CountryList, Country } from "../interface/home.interface";
import { CountryModel } from "../models/country";

const getCountryList = catchAsync(
  async (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    const returnObj: CountryList = {
      data: [],
      flag: true,
      type: "",
      message: "",
    };
    const countries = await CountryModel.find({});
    returnObj.data = countries;
    returnObj.message = "Country List Fetched";
    sendResponse(response, 200, "Success", "CountryListFetched", countries);
  },
);

export { getCountryList };
