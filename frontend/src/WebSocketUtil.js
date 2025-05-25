import React, { createContext, useRef, useContext, useEffect, useState } from "react";

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const [socketInstance, setSocketInstance] = useState(null);
  const listenersRef = useRef(new Set());

  useEffect(() => {
    const token = localStorage.getItem("token");
    let socket;

    const connectWebSocket = () => {
      socket = new WebSocket(`${process.env.REACT_APP_SOCKET_URL}?token=${token}`);
      socket.id = Math.random().toString(36).substring(2, 15);
      console.log("🔌 New WebSocket connection established with ID:", socket.id);

      socket.onopen = () => {
        console.log("WebSocket is open with ID:", socket.id);
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("Message on ID:", socket.id, data);
          listenersRef.current.forEach((listener) => listener(data));
        } catch (err) {
          console.warn("Invalid message received:", event.data);
        }
      };

      socket.onclose = () => {
        console.log("WebSocket closed with ID:", socket.id);
      };

      socket.onerror = (err) => {
        console.error("WebSocket error on ID:", socket.id, err);
      };

      setSocketInstance(socket);
    };

    connectWebSocket();

    return () => {
      console.log("Cleaning up WebSocket...");
      if (socket) {
        socket.close();
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
