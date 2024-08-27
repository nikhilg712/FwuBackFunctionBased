import axios, { AxiosRequestConfig } from "axios";

interface ApiRequestOptions {
  url: string;
  method?: "GET" | "POST" | "PUT" | "DELETE"; // Make method optional with a default value
  data?: any;
  headers?: Record<string, string>; // Optional headers
}

export async function sendApiRequest({
  url,
  method = "POST", // Default method to POST
  data,
  headers = {
    "content-type": "application/json", // Default headers to content-type JSON
  }, // Default headers to an empty object
}: ApiRequestOptions): Promise<any> {
  const options: AxiosRequestConfig = {
    url,
    method,
    headers,
    data,
  };

  try {
    const response = await axios(options);
    return response;
  } catch (err: any) {
    console.error(
      "Error Response:",
      err.response ? err.response.data : err.message
    );
    throw err; // Re-throw the error to be handled by the caller
  }
}
