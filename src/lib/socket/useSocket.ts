"use client";

import { useEffect, useMemo } from "react";
import { useAuth } from "@clerk/nextjs";
import { io, type Socket } from "socket.io-client";

export function useRealtimeSocket() {
  const { isLoaded, isSignedIn, getToken } = useAuth();

  const socket = useMemo<Socket | null>(() => {
    if (!isLoaded || !isSignedIn) return null;

    return io(process.env.NEXT_PUBLIC_REALTIME_URL ?? "", {
      autoConnect: false,
      auth: (callback) => {
        void getToken()
          .then((token) => callback({ token: token ?? "" }))
          .catch((error: unknown) => {
            console.error(
              "Unable to retrieve the Socket.IO auth token.",
              error,
            );
            callback({ token: "" });
          });
      },
    });
  }, [getToken, isLoaded, isSignedIn]);

  useEffect(() => {
    if (!socket) return;

    socket.on("connect", () => {
      console.log("Connected to Socket.IO:", socket.id);
    });

    socket.on("connect_error", (error) => {
      console.error("Socket.IO connection failed:", error.message);
    });

    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, [socket]);

  return socket;
}
