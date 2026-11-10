// Importing the worker module registers the queue processor.
import "./queue/documentProcessing.worker.ts";

console.log("Worker started, listening for jobs...");

process.on("SIGTERM", async () => {
  console.log("Shutting down worker...");
  process.exit(0);
});
