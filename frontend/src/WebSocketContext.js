/**

import React, { createContext, useEffect, useRef, useContext, useState } from "react";

const WebSocketContext = createContext();

export const WebSocketProvider = ({ accessToken, children }) => {
    const [socket, setSocket] = useState(null);
    const listenersRef = useRef([]);

    useEffect(() => {
        if (!accessToken) return;

        let socketInstance = new WebSocket(`${process.env.REACT_APP_SOCKET_URL}/?token=${accessToken}`);
        setSocket(socketInstance);

        socketInstance.onopen = () => {
            console.log("WebSocket connection established");
        };

        socketInstance.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                console.log("WebSocket message received:", message);
                listenersRef.current.forEach((listener) => listener(message));
            } catch (error) {
                console.error("Failed to parse WebSocket message:", event.data, error);
            }
        };

        socketInstance.onclose = () => {
            console.log("WebSocket connection closed");
        };

        socketInstance.onerror = (error) => {
            console.error("WebSocket error:", error); 
            console.error("WebSocket error details:", {
                message: error.message,
                code: error.code,
                reason: error.reason,
            });
        };

        return () => {
            socketInstance.close();
            listenersRef.current = [];
        };
    }, [accessToken]);

    const registerListener = (listener) => {
        if (!listenersRef.current.includes(listener)) {
            listenersRef.current.push(listener);
        }
    };

    const unregisterListener = (listener) => {
        listenersRef.current = listenersRef.current.filter((l) => l !== listener);
    };

    return (
        <WebSocketContext.Provider value={{ socket, registerListener, unregisterListener }}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => {
    return useContext(WebSocketContext);
};

*/

import React, { createContext, useRef, useContext, useEffect, useState } from "react";

// from prev project


const WebSocketContext = createContext(null);

let globalSocket = null;

export const WebSocketProvider = ({ children }) => {
    const [socketInstance, setSocketInstance] = useState(null);
    const listenersRef = useRef([]);
    let reconnectAttempts = 0;

    useEffect(() => {
        if (!globalSocket || globalSocket.readyState === WebSocket.CLOSED) {
            const token = localStorage.getItem("access-token");
            globalSocket = new WebSocket(`${process.env.REACT_APP_SOCKET_URL}/?token=${token}`);
            globalSocket.id = Math.random().toString(36).substring(2, 15);
            console.log("New WebSocket connection established with ID:", globalSocket.id);

            globalSocket.onopen = () => {
                console.log("WebSocket is open with ID:", globalSocket.id);
            };
            
            globalSocket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    console.log("(Received) Message on ID:", globalSocket.id, data);

                    // Handle messages based on the user location in the app
                    listenersRef.current.forEach((listener) => listener(data));

                } catch (err) {
                    console.warn("Invalid message received:", event.data);
                }
            };

            globalSocket.onclose = () => {
                console.log("WebSocket closed with ID:", globalSocket.id);
            };

            const reconnectWebSocket = () => {
                if (reconnectAttempts < 5) {
                    setTimeout(() => {
                        reconnectAttempts++;
                        globalSocket = new WebSocket(`${process.env.REACT_APP_SOCKET_URL}/?token=${token}`);
                    }, 1000 * reconnectAttempts); // Exponential backoff
                } else {
                    console.error("Max reconnection attempts reached.");
                }
            };

            globalSocket.onerror = (err) => {
                console.error("WebSocket error:", err);
                reconnectWebSocket();
            };
        }
        else {
            console.log("Socket already exists:", globalSocket.id);
        }
        setSocketInstance(globalSocket);
        return () => {
            if (globalSocket) {
                globalSocket.close();
                globalSocket = null;
            }
            listenersRef.current = [];
        };
    }
    , []);

    const registerListener = (listener) => {
        if (!listenersRef.current.includes(listener)) {
            listenersRef.current.push(listener);
        }
    };

    const unregisterListener = (listener) => {
        listenersRef.current = listenersRef.current.filter((l) => l !== listener);
    };

    return (
        <WebSocketContext.Provider value={{ socket: socketInstance, registerListener, unregisterListener }}>
            {children}
        </WebSocketContext.Provider>
    );
}

export const useWebSocket = () => {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error("useWebSocket must be used within a WebSocketProvider");
    }
    return context;
};
