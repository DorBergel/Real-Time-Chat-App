import React, { createContext, useContext, useState, useEffect } from "react";

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const newSocket = new WebSocket(
      `${process.env.REACT_APP_SOCKET_URL}?token=${token}`
    );

    newSocket.onopen = () => {
      console.log("WebSocket connection established");
      setSocket(newSocket); // Correctly set the WebSocket instance
    };

    newSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("WebSocket message received:", data);
      // Handle incoming messages here
    };

    newSocket.onclose = () => {
      console.log("WebSocket connection closed");
    };

    newSocket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      newSocket.close(); // Clean up the WebSocket connection on unmount
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ socket, setSocket }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
