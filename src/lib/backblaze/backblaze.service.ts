import configKeys from "@/config/config.keys";
import { logger } from "@/shared/logger.ts";
import b2 from "@/lib/backblaze/backblaze.config.ts";
import { SUPPORTED_MIME_TYPES } from "@/lib/backblaze/backblaze.types.ts";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { generateFileKeyParam } from "@/lib/backblaze/backblaze.utility.ts";
import type {
  uploadToStorageParam,
  MimeType,
} from "@/lib/backblaze/backblaze.types.ts";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";

// UPLOAD FILE TO STORAGE //
export async function uploadToStorageService({
  buffer,
  mimeType,
  folderName,
  originalname,
  tenantId,
}: uploadToStorageParam): Promise<string> {
  try {
    if (!SUPPORTED_MIME_TYPES.includes(mimeType as MimeType)) {
      throw new Error("Unsupported file type");
    }

    const uploadedFileKey = generateFileKeyParam({
      mimeType: mimeType,
      folderName,
      originalname,
      tenantId,
    });

    await b2.send(
      new PutObjectCommand({
        Bucket: configKeys.B2_BUCKET_NAME,
        Key: uploadedFileKey,
        Body: buffer,
        ContentType: String(mimeType),
      }),
    );

    return uploadedFileKey;
  } catch (error) {
    logger.error("Error in uploadToStorageService", "backblaze.service", error);
    throw error;
  }
}

// DOWNLOAD FILE FROM STORAGR SERVICE //
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

// DELETE FILE FROM STORAGE SERVICE //
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

// GET UPLODED AND PROCESSES FILE URL //
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
        expiresIn: 600, // 10 minutes
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
