// lib/queue.ts
import { Queue } from "bullmq";
import configKeys from "@/config/config.keys";
import { connection } from "@/shared/connection";

const globalForQueue = globalThis as unknown as { documentQueue: Queue };

export const documentQueue =
  globalForQueue.documentQueue ??
  new Queue("document-processing", { connection: connection });

if (configKeys.NODE_ENV !== "production") {
  globalForQueue.documentQueue = documentQueue;
}

interface DocumentJobData {
  documentVersionId: string;
  fileUrl: string;
}

export async function enqueueDocumentProcessing(data: DocumentJobData) {
  await documentQueue.add("process", data);
}
