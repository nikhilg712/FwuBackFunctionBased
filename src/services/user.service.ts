import { NextFunction, Request, Response } from "express";
import { User, IUser } from "../models/users";
import { UserType } from "../interface/user.interface";
import bcrypt from "bcrypt";

/**
 * @function sayHello
 * @description Returns a greeting message.
 * @returns {object} - An object containing the greeting message.
 */
const sayHello = (): { data: string } => ({
  data: "hello",
});

/**
 * @function createUser
 * @description Creates a new user in the database.
 * @param {UserType} userData - The user data to create.
 * @returns {Promise<UserType>} - A promise that resolves to the created user object.
 */
const createUser = async (userData: UserType): Promise<UserType> => {
  const user = new User(userData);
  return user.save();
};

/**
 * @function findUserByUsername
 * @description Retrieves user details from the database by username.
 * @param {string} username - The username of the user to retrieve.
 * @returns {Promise<UserType | null>} - A promise that resolves to the user object or null if not found.
 */
const findUserByUsername = async (
  username: string,
): Promise<UserType | null> => {
  return User.findOne({ username }).exec();
};

/**
 * @function findUserByEmail
 * @description Retrieves user details from the database by email.
 * @param {string} email - The email of the user to retrieve.
 * @returns {Promise<UserType | null>} - A promise that resolves to the user object or null if not found.
 */
const findUserByEmail = async (email: string): Promise<UserType | null> => {
  return User.findOne({ email }).exec();
};

/**
 * @function validatePassword
 * @description Validates the password entered by the user with the password stored in the database.
 * @param {string} inputPassword - The password entered by the user.
 * @param {string} storedPassword - The hashed password stored in the database.
 * @returns {Promise<boolean>} - A promise that resolves to a boolean indicating whether the password is valid.
 */
const validatePassword = async (
  inputPassword: string,
  storedPassword: string,
): Promise<boolean> => {
  return bcrypt.compare(inputPassword, storedPassword);
};

/**
 * @function findUserById
 * @description Retrieves user details from the database by ID.
 * @param {string} id - The ID of the user to retrieve.
 * @returns {Promise<UserType | null>} - A promise that resolves to the user object or null if not found.
 */
const findUserById = async (id: string): Promise<UserType | null> => {
  return User.findById(id).exec();
};

// Export the functions
export {
  sayHello,
  createUser,
  findUserByUsername,
  findUserByEmail,
  validatePassword,
  findUserById,
};
