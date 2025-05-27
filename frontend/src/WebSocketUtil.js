import React, { createContext, useRef, useContext, useEffect, useState } from "react";

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const [socketInstance, setSocketInstance] = useState(null);
  const listenersRef = useRef(new Set());
  let reconnectAttempts = 0;

  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem("refresh-token");
    if (!refreshToken) {
      console.error("No refresh token available. Redirecting to login...");
      window.location.href = "/login";
      return null;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/refresh-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const { accessToken, refreshToken: newRefreshToken } = await response.json();
        localStorage.setItem("access-token", accessToken);
        localStorage.setItem("refresh-token", newRefreshToken);
        return accessToken;
      } else {
        console.error("Failed to refresh token. Redirecting to login...");
        localStorage.removeItem("access-token");
        localStorage.removeItem("refresh-token");
        window.location.href = "/login";
        return null;
      }
    } catch (error) {
      console.error("Error refreshing token:", error);
      window.location.href = "/login";
      return null;
    }
  };

  useEffect(() => {
    const connectWebSocket = async () => {
      let token = localStorage.getItem("access-token");

      if (!token) {
        token = await refreshAccessToken();
        if (!token) return;
      }

      let socket = new WebSocket(`${process.env.REACT_APP_SOCKET_URL}?token=${token}`);
      socket.id = Math.random().toString(36).substring(2, 15);
      console.log("🔌 New WebSocket connection established with ID:", socket.id);

      socket.onopen = () => {
        console.log("WebSocket is open with ID:", socket.id);
        reconnectAttempts = 0; // Reset reconnect attempts on successful connection
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("(Received) Message on ID:", socket.id, data);
          listenersRef.current.forEach((listener) => listener(data));
        } catch (err) {
          console.warn("Invalid message received:", event.data);
        }
      };

      socket.onclose = async (event) => {
        console.log("WebSocket closed with ID:", socket.id, event.reason);

        if (event.code === 440) { // Custom code for token expiration
          console.log("Token expired. Attempting to refresh...");
          const newToken = await refreshAccessToken();
          if (newToken) {
            connectWebSocket(); // Reconnect with the new token
          }
        } else if (reconnectAttempts < 5) {
          reconnectAttempts++;
          setTimeout(connectWebSocket, 1000 * reconnectAttempts); // Exponential backoff
        } else {
          console.error("Max reconnection attempts reached.");
        }
      };

      socket.onerror = (err) => {
        console.error("WebSocket error on ID:", socket.id, err);
      };

      setSocketInstance(socket);
    };

    connectWebSocket();

    return () => {
      console.log("Cleaning up WebSocket...");
      if (socketInstance) {
        socketInstance.close();
      }
      listenersRef.current.clear();
    };
  }, []);

  const registerMessageHandler = (handler) => {
    listenersRef.current.add(handler);
  };

  const unregisterMessageHandler = (handler) => {
    listenersRef.current.delete(handler);
  };

  return (
    <WebSocketContext.Provider value={{ socketInstance, registerMessageHandler, unregisterMessageHandler }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};
