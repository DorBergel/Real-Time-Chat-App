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

            if (message.type === 'messageSeen') {
                // update the relevant chat in the sidebar
                console.log('Message seen event received for chat:', message.chatId);
                setCurrentChat((prevChat) => {
                    if (prevChat && prevChat._id === message.chatId) {
                        // Update the last message to mark it as seen
                        return {
                            ...prevChat,
                            lastMessage: message.message
                        };
                    }
                    return prevChat; // No change if current chat doesn't match
                });
            }
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

    // sort chats by last message time
    const sortedChats = [...chats].sort((a, b) => {
        const aTime = new Date(a.lastMessage?.createdAt || 0);
        const bTime = new Date(b.lastMessage?.createdAt || 0);
        return bTime - aTime; // Sort in descending order
    });

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
                    sortedChats.map((chat, index) => (
                        <div key={index} className={`chat_item ${chat.lastMessage?.seen ? `seen_item` : 'unseen_item'}`} onClick={() => handleItemClick(chat)}>
                            <h3>{chat.title}</h3>
                            <p>{chat.lastMessage?.content}</p>
                            <hr />
                            <div className='chat_item_status'>
                                <span className='chat_item_status_time'>
                                    {new Date(chat.lastMessage?.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                                </span>
                                <span className='chat_item_status_seen'>
                                    {chat.lastMessage?.seen ? 'Seen' : 'Not Seen'}
                                </span>
                            </div>
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