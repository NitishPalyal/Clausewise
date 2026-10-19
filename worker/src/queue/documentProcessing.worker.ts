import { Job, Worker } from "bullmq";
import { connection } from "./documentProcessing.connection.ts";
import { ingestionPipline } from "../ingestionPipeline/ingestionPipeline.ts";
import { documentProcessingJobDataSchema } from "./documentProcessing.schema.ts";
import {
  setStatusFailedService,
  setStatusUploadedService,
  setStatusUploadingService,
} from "../service/documentProcessing.service.ts";

export const QUEUE_NAME = "document-processing";

export const documentWorker = new Worker(
  QUEUE_NAME,
  async (job) => {
    const jobPayload = documentProcessingJobDataSchema.parse(job.data);
    await ingestionPipline({
      tenantId: jobPayload.tenantId,
      fileType: jobPayload.fileType,
      documentVersionId: jobPayload.documentVersionId,
      uploadedFileKey: jobPayload.uploadedFileKey,
    });
  },
  {
    connection,
    concurrency: 5, // how many documents this worker handles at once
    limiter: { max: 5, duration: 1000 },
  },
);

documentWorker.on("active", async (job) => {
  const jobPayload = documentProcessingJobDataSchema.parse(job.data);
  await setStatusUploadingService(jobPayload.documentVersionId);
  // console.log(`Job ${job.id} completed`);
});

documentWorker.on("completed", async (job) => {
  const jobPayload = documentProcessingJobDataSchema.parse(job.data);
  await setStatusUploadedService(jobPayload.documentVersionId);
  // console.log(`Job ${job.id} completed`);
});

documentWorker.on("failed", async (job, err) => {
  if (job) {
    const jobPayload = documentProcessingJobDataSchema.parse(job.data);
    await setStatusFailedService(jobPayload.documentVersionId);
  }

  // console.error(`Job ${job?.id} failed:`, err);
});
