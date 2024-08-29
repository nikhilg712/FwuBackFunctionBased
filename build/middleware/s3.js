"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const dotenv_1 = __importDefault(require("dotenv"));
const crypto_1 = __importDefault(require("crypto"));
const util_1 = require("util");
dotenv_1.default.config();
const randomBytes = (0, util_1.promisify)(crypto_1.default.randomBytes);
const region = process.env.AWS_REGION;
const accessKeyId = process.env.AWS_ACCESSKEYID;
const secretAccessKey = process.env.AWS_SECRETACCESSKEY;
const bucketName = process.env.AWS_BUCKETNAME;
const s3 = new aws_sdk_1.default.S3({
    region,
    accessKeyId,
    secretAccessKey,
    signatureVersion: "v4",
});
const generateSignedUrl = async () => {
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
exports.default = generateSignedUrl;
