import type { Server } from "socket.io";

/**
 * Emits an event to all connected clients belonging to a tenant.
 *
 * The caller must supply a tenant ID obtained from trusted server-side data.
 * Only authenticated and authorized connections should join tenant rooms.
 *
 * @param io - The Socket.IO server instance.
 * @param tenantId - The verified tenant ID.
 * @param eventName - The event name the frontend listens for.
 * @param payload - The data sent with the event.
 */
export function emitToTenant(
  io: Server,
  tenantId: string,
  eventName: string,
  payload: Record<string, unknown>,
): void {
  io.to(`tenant:${tenantId}`).emit(eventName, payload);
}

/**
 * Emits an event to all active connections belonging to one authenticated user.
 *
 * Used for user-specific notifications, such as informing a user
 * that an AI response has been completed.
 *
 * @param io - The Socket.IO server instance.
 * @param userId - The verified Clerk user ID.
 * @param eventName - The event name the frontend listens for.
 * @param payload - The data sent with the event.
 */
export function emitToUser(
  io: Server,
  userId: string,
  eventName: string,
  payload: Record<string, unknown>,
): void {
  io.to(`user:${userId}`).emit(eventName, payload);
}
