import configKeys from "../config/config.ts";
import { logger } from "../shared/logger.ts";
import b2 from "../lib/backblaze.config.ts";
import { FILE_TYPE_MIME_TYPES } from "./backblaze.types.ts";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { generateFileKey } from "./backblaze.utility.ts";
import type { uploadToStorageParam } from "./backblaze.types.ts";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";

/** Uploads a file to Backblaze and returns the generated object key. */
export async function uploadToStorageService({
  buffer,
  fileType,
  folderName,
  originalname,
  tenantId,
}: uploadToStorageParam): Promise<string> {
  try {
    const uploadedFileKey = generateFileKey({
      fileType,
      folderName,
      originalname,
      tenantId,
    });

    await b2.send(
      new PutObjectCommand({
        Bucket: configKeys.B2_BUCKET_NAME,
        Key: uploadedFileKey,
        Body: buffer,
        ContentType: FILE_TYPE_MIME_TYPES[fileType],
      }),
    );

    return uploadedFileKey;
  } catch (error) {
    logger.error("Error in uploadToStorageService", "backblaze.service", error);
    throw error;
  }
}

/** Downloads a stored object and returns its contents as a buffer. */
export async function downloadFromStorageService(
  uploadedFileKey: string,
): Promise<Buffer> {
  try {
    const response = await b2.send(
      new GetObjectCommand({
        Bucket: configKeys.B2_BUCKET_NAME,
        Key: uploadedFileKey,
      }),
    );

    if (!response.Body) {
      throw new Error("File body is empty");
    }

    const buffer = Buffer.from(await response.Body.transformToByteArray());

    return buffer;
  } catch (error) {
    logger.error(
      "Error in downloadFromStorageService",
      "backblaze.service",
      error,
    );
    throw error;
  }
}

/** Deletes an object by its Backblaze key. */
export async function deleteFromStorageService(uploadedImageKey: string) {
  try {
    await b2.send(
      new DeleteObjectCommand({
        Bucket: configKeys.B2_BUCKET_NAME,
        Key: uploadedImageKey,
      }),
    );
  } catch (error) {
    logger.error(
      "Error in deleteFromStorageService",
      "backblaze.service",
      error,
    );
    throw error;
  }
}

/** Creates a signed URL that allows temporary access to a stored object. */
export async function getFileUrlFromStorageService(
  uploadedFileKey: string,
): Promise<string> {
  try {
    const url = await getSignedUrl(
      b2,
      new GetObjectCommand({
        Bucket: configKeys.B2_BUCKET_NAME,
        Key: uploadedFileKey,
      }),
      {
        expiresIn: 600,
      },
    );
    return url;
  } catch (error) {
    logger.error(
      "Error in getFileUrlFromStorageService",
      "backblaze.service",
      error,
    );
    throw error;
  }
}
