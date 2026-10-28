import { Queue, QueueEvents } from "bullmq";
import type { Server } from "socket.io";

const QUEUE_NAME = "document-processing";

type DocumentJobData = {
  tenantId: string;
  documentVersionId: string;
};

export function startDocumentQueueEvents(io: Server) {
  const connection = {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT || "6379"),
  };

  const queue = new Queue(QUEUE_NAME, { connection });
  const queueEvents = new QueueEvents(QUEUE_NAME, { connection });

  async function emitToTenant(
    jobId: string,
    eventName: string,
    payload: Record<string, unknown> = {},
  ) {
    const job = await queue.getJob(jobId);

    if (!job) {
      console.warn(`Cannot find BullMQ job: ${jobId}`);
      return;
    }

    const jobData = job.data as Partial<DocumentJobData>;

    if (
      typeof jobData.tenantId !== "string" ||
      typeof jobData.documentVersionId !== "string"
    ) {
      console.warn(`Invalid document job data: ${jobId}`);
      return;
    }

    io.to(`tenant:${jobData.tenantId}`).emit(eventName, {
      jobId,
      documentVersionId: jobData.documentVersionId,
      ...payload,
    });
  }

  queueEvents.on("active", ({ jobId }) => {
    void emitToTenant(jobId, "document:processing", {
      status: "processing",
    }).catch(console.error);
  });

  queueEvents.on("progress", ({ jobId, data }) => {
    void emitToTenant(jobId, "document:progress", {
      progress: data,
    }).catch(console.error);
  });

  queueEvents.on("completed", ({ jobId }) => {
    void emitToTenant(jobId, "document:ready", {
      status: "completed",
    }).catch(console.error);
  });

  queueEvents.on("failed", ({ jobId }) => {
    void emitToTenant(jobId, "document:failed", {
      status: "failed",
      message: "Document processing failed.",
    }).catch(console.error);
  });

  queueEvents.on("error", (error) => {
    console.error("BullMQ QueueEvents error:", error);
  });

  return async function stopDocumentQueueEvents() {
    await queueEvents.close();
    await queue.close();
  };
}
