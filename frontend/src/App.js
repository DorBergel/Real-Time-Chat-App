import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppManager from './components/AppManager';
import Login from './components/Login';
import Register from './components/Register';
import './App.css';
import { WebSocketProvider } from './WebSocketContext'; // Import WebSocket context

function App() {
  const accessToken = localStorage.getItem('access-token');

  return (
    <div className="App">
      <WebSocketProvider accessToken={accessToken}>
        <Router>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/main" element={<AppManager />} />
          </Routes>
        </Router>
      </WebSocketProvider>
    </div>
  );
}

export default App;
