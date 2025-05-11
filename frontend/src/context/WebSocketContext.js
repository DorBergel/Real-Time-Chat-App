import React, { createContext, useContext, useEffect, useState } from "react";

const WebSocketContext = createContext(null);

let globalSocket = null;

export const WebSocketProvider = ({ children }) => {
  const [socketInstance, setSocketInstance] = useState(null);

  useEffect(() => {
    if (!globalSocket || globalSocket.readyState === WebSocket.CLOSED) {
      const token = localStorage.getItem("token");
      globalSocket = new WebSocket(`${process.env.REACT_APP_SOCKET_URL}?token=${token}`);
      globalSocket.id = Math.random().toString(36).substring(2, 15);
      console.log("🔌 New WebSocket connection established with ID:", globalSocket.id);

      globalSocket.onopen = () => {
        console.log("WebSocket is open with ID:", globalSocket.id);
      };

      globalSocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("Message on ID:", globalSocket.id, data);

          // Handle messages based on the user location in the app
          

        } catch (err) {
          console.warn("Invalid message received:", event.data);
        }
      };

      globalSocket.onclose = () => {
        console.log("WebSocket closed with ID:", globalSocket.id);
      };

      globalSocket.onerror = (err) => {
        console.error("WebSocket error on ID:", globalSocket.id, err);
      };
    } else {
      console.log("Socket already exists:", globalSocket.id);
    }

    setSocketInstance(globalSocket);

    return () => {
      console.log("WebSocketProvider unmounted — socket stays alive.");
    };
  }, []);

  return (
    <WebSocketContext.Provider value={socketInstance}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};
