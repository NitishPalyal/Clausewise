import { Server } from "socket.io";

export function emitDocumentEvent(
  io: Server,
  tenantId: string,
  eventName: string,
  payload: Record<string, unknown>,
) {
  io.to(`tenant:${tenantId}`).emit(eventName, payload);
}
