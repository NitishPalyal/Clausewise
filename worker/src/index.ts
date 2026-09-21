import "./queue/documentProcessing.worker.ts"; // importing this line starts the Worker

console.log("Worker started, listening for jobs...");

process.on("SIGTERM", async () => {
  console.log("Shutting down worker...");
  process.exit(0);
});
