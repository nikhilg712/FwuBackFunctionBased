import mongoose from "mongoose";
mongoose.set("strictQuery", false);
const dbConnection = async (): Promise<void> => {
  const url: string | undefined = process.env.MONGODB_URI;
  if (!url) {
    throw new Error("MONGODB_URI is not defined in the environment variables");
  }

  try {
    await mongoose.connect(url);
    console.log("DB connected successfully for FWU DATABASE");
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error connecting to the database:", error.message);
    } else {
      console.error("An unknown error occurred");
      // TODO: throw error
    }
  }
};

export default dbConnection;
