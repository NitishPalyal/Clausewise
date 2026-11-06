"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { useAuth } from "@clerk/nextjs";
import { io, type Socket } from "socket.io-client";

type SocketConnectionStatus =
  "connecting" | "connected" | "disconnected" | "error";

interface SocketContextValue {
  socket: Socket | null;
  status: SocketConnectionStatus;
}

// Shared context for the application's Socket.IO connection.
const SocketContext = createContext<SocketContextValue | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn, getToken } = useAuth();

  const [socket, setSocket] = useState<Socket | null>(null);

  const [status, setStatus] = useState<SocketConnectionStatus>("disconnected");

  useEffect(() => {
    // Wait until Clerk finishes loading the authentication session.
    if (!isLoaded) return;

    // Do not connect users who are not signed in.
    if (!isSignedIn) {
      setSocket(null);
      setStatus("disconnected");
      return;
    }

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;

    // Make sure the frontend has a Socket.IO server URL.
    if (!socketUrl) {
      console.error("Missing NEXT_PUBLIC_SOCKET_URL");
      setStatus("error");
      return;
    }

    // Create one Socket.IO client for this authenticated session.
    const socketInstance = io(socketUrl, {
      autoConnect: false,

      // Retrieve a fresh Clerk token for each connection handshake.
      auth: (callback) => {
        void getToken()
          .then((token) => {
            callback({ token: token ?? "" });
          })
          .catch((error: unknown) => {
            console.error("Unable to retrieve Clerk token:", error);
            callback({ token: "" });
          });
      },
    });

    // Update connection status when the server accepts the connection.
    const handleConnect = () => {
      setStatus("connected");
      console.log("Connected to Socket.IO:", socketInstance.id);
    };

    // Update status when the connection is closed.
    const handleDisconnect = (reason: string) => {
      setStatus("disconnected");
      console.log("Socket disconnected:", reason);
    };

    // Handle authentication failures and connection errors.
    const handleConnectError = (error: Error) => {
      setStatus("error");
      console.error("Socket.IO connection failed:", error.message);
    };

    // Register connection lifecycle listeners.
    socketInstance.on("connect", handleConnect);
    socketInstance.on("disconnect", handleDisconnect);
    socketInstance.on("connect_error", handleConnectError);

    setSocket(socketInstance);
    setStatus("connecting");

    // Establish the connection.
    socketInstance.connect();

    // Clean up when the provider unmounts or the session changes.
    return () => {
      socketInstance.off("connect", handleConnect);
      socketInstance.off("disconnect", handleDisconnect);
      socketInstance.off("connect_error", handleConnectError);

      socketInstance.disconnect();
    };
  }, [getToken, isLoaded, isSignedIn]);

  return (
    <SocketContext.Provider value={{ socket, status }}>
      {children}
    </SocketContext.Provider>
  );
}

// Allows any component inside SocketProvider to access the shared connection.
export function useSocket(): SocketContextValue {
  const context = useContext(SocketContext);

  if (!context) {
    throw new Error("useSocket must be used inside SocketProvider");
  }

  return context;
}
