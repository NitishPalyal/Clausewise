import { Worker } from "bullmq";
import { connection } from "./documentProcessing.connection.ts";
import { ingestionPipline } from "../rag/ingestionPipline.ts";
ingestionPipline;
export const QUEUE_NAME = "document-processing";

export const documentWorker = new Worker(QUEUE_NAME, ingestionPipline, {
  connection,
  concurrency: 5, // how many documents this worker handles at once
});

documentWorker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

documentWorker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed:`, err);
});
