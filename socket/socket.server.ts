import configKeys from "@/config/config.keys";
import { prisma } from "@/lib/prisma";
import {
  CHAT_NOTIFICATION_CHANNEL,
  createChatNotificationSubscriber,
  type ChatReplyReadyEvent,
} from "@/lib/redis/chatNotification";
import { Server } from "socket.io";

import {
  socketAuthMiddleware,
  type AuthenticatedSocketData,
} from "./socket.auth.middleware";

import { startDocumentQueueEvents } from "./queue/documentProcessing.events";
import { emitToUser } from "./socket.service";

/**
 * Validates incoming Redis notification data.
 */
function isChatReplyReadyEvent(value: unknown): value is ChatReplyReadyEvent {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const event = value as Record<string, unknown>;

  return (
    typeof event.userId === "string" &&
    event.userId.length > 0 &&
    typeof event.chatId === "string" &&
    event.chatId.length > 0
  );
}

const PORT = Number(configKeys.SOCKET_PORT);
const FRONTEND_URL = configKeys.FRONTEND_URL;

if (!Number.isInteger(PORT) || PORT <= 0 || PORT > 65535) {
  throw new Error("Invalid SOCKET_PORT configuration");
}

if (!FRONTEND_URL) {
  throw new Error("Missing FRONTEND_URL configuration");
}

// Create the Socket.IO server.
export const io = new Server({
  cors: {
    origin: FRONTEND_URL,
  },
});

// Authenticate incoming connections.
io.use(socketAuthMiddleware);

// Start listening to document-processing events.
const stopDocumentQueueEvents = startDocumentQueueEvents(io);

// Create a dedicated Redis subscriber connection.
const chatNotificationSubscriber = createChatNotificationSubscriber();

// Listen for AI reply notifications from Redis.
chatNotificationSubscriber.on("message", (channel, message) => {
  if (channel !== CHAT_NOTIFICATION_CHANNEL) {
    return;
  }

  try {
    const event: unknown = JSON.parse(message);

    if (!isChatReplyReadyEvent(event)) {
      console.warn("Invalid chat notification received from Redis");
      return;
    }

    // Notify only the intended authenticated user.
    emitToUser(io, event.userId, "chat:reply-ready", {
      chatId: event.chatId,
    });
  } catch (error) {
    console.error("Failed to process chat notification:", error);
  }
});

// Subscribe to AI reply notifications.
void chatNotificationSubscriber
  .subscribe(CHAT_NOTIFICATION_CHANNEL)
  .then(() => {
    console.log("Subscribed to chat notification channel");
  })
  .catch((error: Error) => {
    console.error("Failed to subscribe to chat notifications:", error);
  });

// Handle authenticated socket connections.
io.on("connection", async (socket) => {
  const { userId, tenantId } = socket.data as AuthenticatedSocketData;

  const userRoom = `user:${userId}`;
  const tenantRoom = `tenant:${tenantId}`;

  await socket.join([userRoom, tenantRoom]);

  console.log(
    `Socket connected: ${socket.id} | User: ${userId} | Tenant: ${tenantId}`,
  );

  socket.on("disconnect", (reason) => {
    console.log(`Socket disconnected: ${socket.id}. Reason: ${reason}`);
  });
});

// Start accepting connections.
io.listen(PORT);

// Gracefully close resources during shutdown.
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
    await chatNotificationSubscriber.quit();
  } catch (error) {
    console.error("Failed to close chat notification subscriber:", error);
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
