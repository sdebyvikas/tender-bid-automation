import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "./s3.js";
import { isS3Configured } from "./uploadToS3.js";

export const getDownloadUrl = async (
  fileName,
  expiresIn = 600
) => {
  if (isS3Configured()) {
    try {
      return await getSignedUrl(
        s3,
        new GetObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: fileName
        }),
        {
          expiresIn
        }
      );
    } catch (err) {
      console.warn("⚠️ S3 presigned URL generation failed, falling back to local URL:", err.message);
    }
  }

  const gatewayUrl = process.env.GATEWAY_URL || "http://localhost:8000";
  return `${gatewayUrl}/uploads/${fileName}`;
};