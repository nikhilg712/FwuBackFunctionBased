import * as yup from "yup";
import {
  dobValidation,
  emailValidation,
  genderValidation,
  objectIdValidation,
  passwordValidation,
  phoneNumberValidation,
  userNameValidation,
} from "./validation";

export const emailOTPValidator = yup.object().shape({
  email: emailValidation.required("Email is required"),
  password: passwordValidation.required("Password is required"),
});

export const phoneNumberValidator = yup.object().shape({
  phone: phoneNumberValidation.required("Phone number is required"),
});

export const profileUpdateValidator = yup.object().shape({
  _id: objectIdValidation,
  username: userNameValidation.required("Username is required"),
  dateOfBirth: dobValidation.required("Date of birth is required"),
  gender: genderValidation.required("Gender is required"),
});
