import { S3Client } from "@aws-sdk/client-s3";
import configKeys from "@/config/config.keys.ts";

const b2 = new S3Client({
  region: "us-east-005",
  endpoint: configKeys.B2_ENDPOINT!,
  credentials: {
    accessKeyId: configKeys.B2_KEY_ID!,
    secretAccessKey: configKeys.B2_APPLICATION_KEY!,
  },
});

export default b2;
