import { verifyToken } from "@clerk/backend";
import type { Socket } from "socket.io";
import configKeys from "@/config/config.keys";
import { prisma } from "@/lib/prisma";
import * as UserRepo from "@/repository/user/user.repository.ts";

/**
 * Data attached to a socket after successful authentication
 * and tenant membership verification.
 *
 * userId is the Clerk user ID, not the internal Prisma User.id.
 * tenantId is the internal Clausewise Tenant.id.
 */
export interface AuthenticatedSocketData {
  userId: string;
  tenantId: string;
}

/**
 * Authenticates an incoming Socket.IO connection.
 *
 * Steps:
 * 1. Read the Clerk session token from the connection handshake.
 * 2. Verify the token with Clerk.
 * 3. Extract the authenticated Clerk user ID.
 * 4. Find the corresponding Clausewise user in PostgreSQL.
 * 5. Retrieve the user's tenant ID.
 * 6. Attach the verified identities to socket.data.
 *
 * Connections without a valid token or a registered Clausewise
 * user are rejected.
 */
export async function socketAuthMiddleware(
  socket: Socket,
  next: (error?: Error) => void,
): Promise<void> {
  const token: unknown = socket.handshake.auth?.token;

  // Reject connections that do not provide a session token.
  if (typeof token !== "string" || token.length === 0) {
    return next(new Error("Authentication required"));
  }

  try {
    // Verify that the token was issued by Clerk and is valid.
    const claims = await verifyToken(token, {
      secretKey: configKeys.CLERK_SECRET_KEY,
      authorizedParties: [configKeys.FRONTEND_URL],
    });

    const userId = claims.sub;

    // The token must contain a valid Clerk user ID.
    if (typeof userId !== "string" || userId.length === 0) {
      return next(new Error("Invalid session token"));
    }

    // Find the corresponding user in the Clausewise database.
    const user = await UserRepo.findUserTenantId(userId);

    // Reject users who are not registered in Clausewise.
    if (!user) {
      return next(new Error("User is not registered in Clausewise"));
    }

    // Store verified identities on this socket connection.
    const socketData = socket.data as unknown as AuthenticatedSocketData;

    socketData.userId = userId;
    socketData.tenantId = user.tenantId;

    // Authentication and tenant lookup succeeded.
    next();
  } catch (error) {
    console.error("Socket authentication failed:", error);

    return next(new Error("Authentication failed"));
  }
}
