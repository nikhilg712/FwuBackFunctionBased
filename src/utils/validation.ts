import * as yup from "yup";

export const emailValidation = yup.string().email("Invalid email format");

export const passwordValidation = yup
  .string()
  .min(4, "Password must be at least 4 characters long");

const phoneNumberRegex =
  /^(?:\(\d{3}\)\s?\d{3}-\d{4}|\d{10}|\+\d{1,4}\s?\d{10})$/;
export const phoneNumberValidation = yup
  .string()
  .matches(phoneNumberRegex, "Invalid phone number format");

export const userNameValidation = yup
  .string()
  .matches(
    /^[a-zA-Z0-9_]+$/,
    "Name can only contain letters, numbers, and underscores"
  );

export const dobValidation = yup.date();

export const genderValidation = yup
  .string()
  .oneOf(["Male", "Female", "Other"], "Invalid gender value");

export const objectIdValidation = yup
  .string()
  .matches(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId format");
