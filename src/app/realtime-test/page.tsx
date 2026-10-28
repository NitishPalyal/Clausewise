"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRealtimeSocket } from "@/lib/socket/useSocket.ts";

type ConnectionStatus =
  | "checking-session"
  | "signed-out"
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";

export default function RealtimeTestPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const socket = useRealtimeSocket();

  const [socketStatus, setSocketStatus] =
    useState<ConnectionStatus>("connecting");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const status: ConnectionStatus = !isLoaded
    ? "checking-session"
    : !isSignedIn
      ? "signed-out"
      : !socket
        ? "connecting"
        : socket.connected
          ? "connected"
          : socketStatus;

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !socket) return;

    const onConnect = () => {
      setSocketStatus("connected");
      setErrorMessage(null);
    };

    const onDisconnect = () => {
      setSocketStatus("disconnected");
    };

    const onConnectError = (error: Error) => {
      setSocketStatus("error");
      setErrorMessage(error.message);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
    };
  }, [isLoaded, isSignedIn, socket]);

  return (
    <main style={{ padding: "24px", maxWidth: "600px", margin: "40px auto" }}>
      <h1>Socket.IO Connection Test</h1>

      <p>
        Status: <strong>{status}</strong>
      </p>

      {errorMessage && <p>Connection error: {errorMessage}</p>}
    </main>
  );
}
