import { Redis } from "ioredis";
import { connection } from "@/shared/connection.ts";

export const CHAT_NOTIFICATION_CHANNEL = "chat:reply-ready";

export type ChatReplyReadyEvent = {
  userId: string;
  chatId: string;
};

// Reuse the publisher connection across requests and development reloads.
const globalForRedis = globalThis as unknown as {
  chatNotificationPublisher?: Redis;
};

function getPublisher(): Redis {
  const existingPublisher = globalForRedis.chatNotificationPublisher;

  if (existingPublisher) {
    return existingPublisher;
  }

  const publisher = new Redis(connection);

  publisher.on("error", (error: Error) => {
    console.error("Chat notification Redis publisher error:", error);
  });

  globalForRedis.chatNotificationPublisher = publisher;

  return publisher;
}

/**
 * Publishes a notification when an AI reply has been saved.
 */
export async function publishChatReplyReady(
  event: ChatReplyReadyEvent,
): Promise<void> {
  await getPublisher().publish(
    CHAT_NOTIFICATION_CHANNEL,
    JSON.stringify(event),
  );
}

/**
 * Creates a dedicated Redis connection for receiving notifications.
 */
export function createChatNotificationSubscriber(): Redis {
  const subscriber = new Redis(connection);

  subscriber.on("error", (error: Error) => {
    console.error("Chat notification Redis subscriber error:", error);
  });

  return subscriber;
}
