import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import Register from "./components/Register";
import Login from "./components/Login";
import MainScreen from "./components/MainScreen";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Chat from "./components/Chat";
import { WebSocketProvider } from "./context/WebSocketContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <WebSocketProvider>
    <React.StrictMode>
      <Router>
        <div className="container">
          <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/main" element={<MainScreen />} />
            <Route path="/chat/:chatId" element={<Chat />} />
          </Routes>
        </div>
      </Router>
    </React.StrictMode>
  </WebSocketProvider>
);
