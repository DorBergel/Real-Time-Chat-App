import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import Register from "./components/Register";
import Login from "./components/Login";
import MainScreen from "./components/MainScreen";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Router>
      <div className="container">
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/main" element={<MainScreen />} />
        </Routes>
      </div>
    </Router>
  </React.StrictMode>
);
