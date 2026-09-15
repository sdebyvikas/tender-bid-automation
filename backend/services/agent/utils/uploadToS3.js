import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "./s3.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const isS3Configured = () => {
  const keyId = process.env.AWS_ACCESS_KEY_ID;
  const secret = process.env.AWS_SECRET_ACCESS_KEY;
  const bucket = process.env.AWS_BUCKET_NAME;

  return Boolean(
    keyId &&
    secret &&
    bucket &&
    !keyId.toLowerCase().includes("add ") &&
    !secret.toLowerCase().includes("add ") &&
    !bucket.toLowerCase().includes("add ")
  );
};

export const saveLocally = (buffer, fileName) => {
  const gatewayUploads = path.resolve(__dirname, "../../../gateway/uploads");
  const agentUploads = path.resolve(__dirname, "../uploads");

  try {
    if (!fs.existsSync(gatewayUploads)) {
      fs.mkdirSync(gatewayUploads, { recursive: true });
    }
    fs.writeFileSync(path.join(gatewayUploads, fileName), buffer);
  } catch (err) {
    console.warn("Could not save to gateway uploads:", err.message);
  }

  try {
    if (!fs.existsSync(agentUploads)) {
      fs.mkdirSync(agentUploads, { recursive: true });
    }
    fs.writeFileSync(path.join(agentUploads, fileName), buffer);
  } catch (err) {
    console.warn("Could not save to agent uploads:", err.message);
  }
};

export const uploadToS3 = async (
  buffer,
  fileName,
  contentType
) => {
  if (isS3Configured()) {
    try {
      await s3.send(
        new PutObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: fileName,
          Body: buffer,
          ContentType: contentType
        })
      );
      return fileName;
    } catch (s3Error) {
      console.warn("⚠️ S3 Upload failed, falling back to local storage:", s3Error.message);
      saveLocally(buffer, fileName);
      return fileName;
    }
  } else {
    saveLocally(buffer, fileName);
    return fileName;
  }
};