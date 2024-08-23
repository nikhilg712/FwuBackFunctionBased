import * as yup from "yup";

export const emailValidation = yup
  .string()
  .email("Invalid email format")
  .required("Email is required");

export const passwordValidation = yup
  .string()
  .min(4, "Password must be at least 4 characters long")
  .required("Password is required");

const phoneNumberRegex =
  /^(?:\(\d{3}\)\s?\d{3}-\d{4}|\d{10}|\+\d{1,4}\s?\d{10})$/;
export const phoneNumberValidation = yup
  .string()
  .matches(phoneNumberRegex, "Invalid phone number format")
  .required("Phone number is required");
