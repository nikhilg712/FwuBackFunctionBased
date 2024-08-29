import aws from "aws-sdk";
import dotenv from "dotenv";
import crypto from "crypto";
import { promisify } from "util";

dotenv.config();

const randomBytes = promisify(crypto.randomBytes);

const region = process.env.AWS_REGION as string;
const accessKeyId = process.env.AWS_ACCESSKEYID as string;
const secretAccessKey = process.env.AWS_SECRETACCESSKEY as string;
const bucketName = process.env.AWS_BUCKETNAME as string;

const s3 = new aws.S3({
  region,
  accessKeyId,
  secretAccessKey,
  signatureVersion: "v4",
});

const generateSignedUrl = async (): Promise<string> => {
  const bytes = await randomBytes(16);
  const imageName = bytes.toString("hex");

  const params = {
    Bucket: bucketName,
    Key: imageName,
    Expires: 60,
  };

  const signedUrl = await s3.getSignedUrlPromise("putObject", params);
  return signedUrl;
};

export default generateSignedUrl;
