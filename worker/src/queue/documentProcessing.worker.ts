import { Worker } from "bullmq";
import { connection } from "./documentProcessing.connection.ts";
import { ingestionPipline } from "../ingestionPipeline/ingestionPipeline.ts";
import { documentProcessingJobDataSchema } from "./documentProcessing.schema.ts";
import {
  setStatusFailedService,
  setStatusUploadedService,
  setStatusUploadingService,
} from "../service/documentProcessing.service.ts";

export const QUEUE_NAME = "document-processing";

/** Runs ingestion jobs and updates each version as its processing state changes. */
export const documentWorker = new Worker(
  QUEUE_NAME,
  async (job) => {
    const jobPayload = documentProcessingJobDataSchema.parse(job.data);

    await ingestionPipline({
      tenantId: jobPayload.tenantId,
      fileType: jobPayload.fileType,
      documentVersionId: jobPayload.documentVersionId,
      uploadedFileKey: jobPayload.uploadedFileKey,

      // Forward pipeline progress updates to BullMQ.
      onProgress: async (progress) => {
        await job.updateProgress(progress);
      },
    });
  },
  {
    connection,
    concurrency: 5,
    limiter: { max: 5, duration: 1000 },
  },
);

documentWorker.on("active", async (job) => {
  const jobPayload = documentProcessingJobDataSchema.parse(job.data);
  await setStatusUploadingService(jobPayload.documentVersionId);
});

documentWorker.on("completed", async (job) => {
  const jobPayload = documentProcessingJobDataSchema.parse(job.data);
  await setStatusUploadedService(jobPayload.documentVersionId);
});

documentWorker.on("failed", async (job, err) => {
  if (job) {
    const jobPayload = documentProcessingJobDataSchema.parse(job.data);
    await setStatusFailedService(jobPayload.documentVersionId);
  }
});
