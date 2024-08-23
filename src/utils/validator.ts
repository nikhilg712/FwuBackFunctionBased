import * as yup from "yup";
import {
  emailValidation,
  passwordValidation,
  phoneNumberValidation,
} from "./validation";

export const emailOTPValidator = yup.object().shape({
  email: emailValidation,
  password: passwordValidation,
});

export const phoneNumberValidator = yup.object().shape({
  phone: phoneNumberValidation,
});
