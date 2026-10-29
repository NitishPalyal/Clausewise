import { verifyToken } from "@clerk/backend";
import configKeys from "@/config/config.keys";
import { Server } from "socket.io";
import { startDocumentQueueEvents } from "./queue/documentProcessing.events";

const PORT = Number(configKeys.SOCKET_PORT);
const FRONTEND_URL = configKeys.FRONTEND_URL;

const CLERK_SECRET_KEY = configKeys.CLERK_SECRET_KEY;

if (!CLERK_SECRET_KEY) {
  throw new Error("Missing CLERK_SECRET_KEY in environment variables");
}

export const io = new Server(PORT, {
  cors: {
    origin: FRONTEND_URL,
  },
});

// Authenticate each incoming connection.
io.use(async (socket, next) => {
  const token: unknown = socket.handshake.auth?.token;

  if (typeof token !== "string" || token.length === 0) {
    return next(new Error("Authentication required"));
  }

  try {
    const claims = await verifyToken(token, {
      secretKey: CLERK_SECRET_KEY,
      authorizedParties: [FRONTEND_URL],
    });

    const userId = claims.sub;

    if (typeof userId !== "string" || userId.length === 0) {
      return next(new Error("Invalid session token"));
    }

    // Save the user ID obtained from the verified token.
    socket.data.userId = userId;

    next();
  } catch {
    next(new Error("Invalid or expired session token"));
  }
});

// Start listening for BullMQ events once.
const stopDocumentQueueEvents = startDocumentQueueEvents(io);

io.on("connection", (socket) => {
  console.log(
    `Socket connected for user ${socket.data.userId}; socket ID: ${socket.id}`,
  );

  socket.on("disconnect", (reason) => {
    console.log(`Socket disconnected: ${socket.id}. Reason: ${reason}`);
  });
});

// Stop the listener when the whole server is shutting down.
async function shutdown() {
  await stopDocumentQueueEvents();
  io.close();
}

process.once("SIGINT", () => {
  void shutdown();
});

process.once("SIGTERM", () => {
  void shutdown();
});

console.log(`Socket.IO server listening on port ${PORT}`);
