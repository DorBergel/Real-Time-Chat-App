import React from 'react';
import '../styles/Sidebar.css';
import { useEffect } from 'react';
import { useWebSocket } from '../WebSocketContext'; // Use the hook, not the provider

const Sidebar = ({ username, chats = [], currentChat, setCurrentChat }) => {
    const { socket, registerListener, unregisterListener } = useWebSocket(); // Use the hook to access the context

    // Register a listener for WebSocket messages
    useEffect(() => {
        const handleWebSocketMessage = (message) => {
            console.log('Sidebar - WebSocket message received:', message);
        };

        registerListener(handleWebSocketMessage);

        // Cleanup function to unregister the listener
        return () => {
            unregisterListener(handleWebSocketMessage);
        };
    }, [registerListener, unregisterListener]);

    const handleItemClick = (chatId) => {
        // Handle chat item click
        console.log(`Chat item clicked: ${chatId}`);
        setCurrentChat(chatId);
    };

    // Debug effect to log user data
    useEffect(() => {
        console.log('Sidebar - useEffect - Username:', username);
        console.log('Sidebar - useEffect - Chats:', chats);
    }, [username, chats]);

    return (
        <div className="sidebar">
            <div className="sidebar_header">
                <div className="logo">
                    {/* Logo can be an image or text */}
                    <h2>{username ? username : "ERROR"}</h2>
                </div>
                <div className="sidebar_buttons">
                    <button id="settings_btn">Settings</button>
                    <button id="logout_btn">Logout</button>
                    <button id="new_chat_btn">New Chat</button>
                </div>
            </div>
            <div className="sidebar_search">
                <input type="text" placeholder="Search..." />
                <button id="search_btn">Search</button>
            </div>
            <div className="chat_list">
                {chats.length > 0 ? (
                    chats.map((chat, index) => (
                        <div key={index} className="chat_item" onClick={() => handleItemClick(chat)}>
                            <h3>{chat.title}</h3>
                            <p>{chat.lastMessage}</p>
                        </div>
                    ))
                ) : (
                    <p>No chats available</p>
                )}
            </div>
        </div>
    );
};

export default Sidebar;