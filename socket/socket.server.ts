import configKeys from "@/config/config.keys";
import { prisma } from "@/lib/prisma";
import { Server } from "socket.io";

import {
  socketAuthMiddleware,
  type AuthenticatedSocketData,
} from "./socket.auth.middleware";

import { startDocumentQueueEvents } from "./queue/documentProcessing.events";

/**
 * Entry point for the dedicated Socket.IO server.
 *
 * Responsibilities:
 * 1. Create the Socket.IO server.
 * 2. Authenticate incoming connections.
 * 3. Join authenticated users to their private rooms.
 * 4. Start BullMQ document event listeners.
 * 5. Gracefully close connections during shutdown.
 */

const PORT = Number(configKeys.SOCKET_PORT);
const FRONTEND_URL = configKeys.FRONTEND_URL;

// Validate required server configuration.
if (!Number.isInteger(PORT) || PORT <= 0 || PORT > 65535) {
  throw new Error("Invalid SOCKET_PORT configuration");
}

if (!FRONTEND_URL) {
  throw new Error("Missing FRONTEND_URL configuration");
}

// Create the Socket.IO server without listening yet.
export const io = new Server({
  cors: {
    origin: FRONTEND_URL,
  },
});

// Register authentication before accepting connections.
io.use(socketAuthMiddleware);

// Start listening to the existing BullMQ queue.
const stopDocumentQueueEvents = startDocumentQueueEvents(io);

// Handle successfully authenticated connections.
io.on("connection", async (socket) => {
  const { userId, tenantId } = socket.data as AuthenticatedSocketData;

  // Create the room names using server-verified identities.
  const userRoom = `user:${userId}`;
  const tenantRoom = `tenant:${tenantId}`;

  // Join both private rooms.
  await socket.join([userRoom, tenantRoom]);

  console.log(
    `Socket connected: ${socket.id} | User: ${userId} | Tenant: ${tenantId}`,
  );

  socket.on("disconnect", (reason) => {
    console.log(`Socket disconnected: ${socket.id}. Reason: ${reason}`);
  });
});

// Start accepting connections after all handlers are registered.
io.listen(PORT);

// Gracefully close resources when the process shuts down.
let isShuttingDown = false;

async function shutdown() {
  if (isShuttingDown) return;

  isShuttingDown = true;

  try {
    await stopDocumentQueueEvents();
  } catch (error) {
    console.error("Failed to close BullMQ listeners:", error);
  }

  try {
    await prisma.$disconnect();
  } catch (error) {
    console.error("Failed to disconnect Prisma:", error);
  }

  io.close(() => {
    process.exit(0);
  });
}

process.once("SIGINT", () => {
  void shutdown();
});

process.once("SIGTERM", () => {
  void shutdown();
});

console.log(`Socket.IO server listening on port ${PORT}`);
