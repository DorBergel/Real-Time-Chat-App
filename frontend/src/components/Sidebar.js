import React from 'react';
import '../styles/Sidebar.css';
import { useState, useEffect } from 'react';
import { useWebSocket } from '../WebSocketContext'; // Use the hook, not the provider
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ToggleButton from 'react-bootstrap/ToggleButton';

const Sidebar = ({ username, chats = [], contacts = [], currentChat, setCurrentChat }) => {
    const { socket, registerListener, unregisterListener } = useWebSocket(); // Use the hook to access the context
    const userId = localStorage.getItem('user-id'); // Get user ID from local storage
    const [listState, setListState] = useState("Chats"); 

    const handleChatItemClick = (chatId) => {
        console.log('Sidebar - handleChatItemClick - Chat ID:', chatId);
        // Find the chat with the given ID
        const selectedChat = chats.find(chat => chat._id === chatId);
        if (selectedChat) {
            console.log('Sidebar - handleChatItemClick - Selected Chat:', selectedChat);
            setCurrentChat(selectedChat); // Set the current chat to the selected chat
        } else {
            console.error('Sidebar - handleChatItemClick - Chat not found:', chatId);
            setCurrentChat(null); // Clear current chat if not found
        }
    };

    const handleContactItemClick = (contactId) => {
        console.log('Sidebar - handleContactItemClick - Contact ID:', contactId);
        // Find the contact with the given ID
        const selectedContact = contacts.find(contact => contact._id === contactId);
        if (selectedContact) {
            console.log('Sidebar - handleContactItemClick - Selected Contact:', selectedContact);
        } else {
            console.error('Sidebar - handleContactItemClick - Contact not found:', contactId);
        }
    };

    const handleSearchButtonClick = () => {
        const searchInput = document.querySelector('.sidebar_search input');
        switch (listState) {
            case "Chats":
                console.log('Sidebar - Search Chats:', searchInput.value);
                // Implement chat search logic here
                break;
            case "Contacts":
                console.log('Sidebar - Search Contacts:', searchInput.value);
                // Implement contact search logic here
                break;
            default:
                console.error('Sidebar - Unknown list state:', listState);
                break;
        }
    };

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
                    <ButtonGroup className="sidebar_button_group">
                        <ToggleButton
                            id="toggle-chat"
                            type="radio"
                            variant="outline-primary"
                            name="radio"
                            value="1"
                            checked={listState === "Chats"}
                            onChange={() => setListState("Chats")}
                        >
                            Chats
                        </ToggleButton>
                        <ToggleButton
                            id="toggle-contact"
                            type="radio"
                            variant="outline-primary"
                            name="radio"
                            value="2"
                            checked={listState === "Contacts"}
                            onChange={() => setListState("Contacts")}
                        >
                            Contacts
                        </ToggleButton>
                        <ToggleButton
                            id="toggle-onlineUsers"
                            type="radio"
                            variant='outline-primary'
                            name="radio"
                            value="3"
                            checked={listState === "OnlineUsers"}
                            onChange={() => setListState("OnlineUsers")}
                        >
                            Online Users
                        </ToggleButton>
                    </ButtonGroup>
                </div>
            </div>
            <div className="sidebar_search">
                <input type="text" placeholder={listState === 'Contacts' ? "Add new contact" : "Search message"} />
                <button id="search_btn" onClick={handleSearchButtonClick}>Search</button>
            </div>
            
        </div>
    );
};

export default Sidebar;

// TODO: Create new component for displaying chats or contacts or online users based on listState

/*
{ listState === "Chats" ? (
                <div className="chat_list">
                    {chats.length > 0 ? (
                        sortedChats.map((chat) => (
                            <div
                                key={chat._id} // Use unique identifier
                                className={`chat_item ${chat.lastMessage?.seen ? 'seen_item' : 'unseen_item'}`}
                                onClick={() => handleChatItemClick(chat._id)} // Pass type
                            >
                                <h3>{chat.title || "Untitled Chat"}</h3>
                                <p>{chat.lastMessage?.content || "No messages yet"}</p>
                                <hr />
                                <div className="chat_item_status">
                                    <span className="chat_item_status_time">
                                        {chat.lastMessage?.createdAt
                                            ? new Date(chat.lastMessage.createdAt).toLocaleTimeString([], {
                                                  hour: '2-digit',
                                                  minute: '2-digit',
                                                  hour12: false,
                                              })
                                            : "N/A"}
                                    </span>
                                    <span className="chat_item_status_seen">
                                        {chat.lastMessage?.seen ? 'Seen' : 'Not Seen'}
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>No chats available</p>
                    )}
                </div>
            ) : (
                <div className="contact_list">
                    {contacts.length > 0 ? (
                        contacts.map((contact) => (
                            <div
                                key={contact._id} // Use unique identifier
                                className="contact_item"
                                onClick={() => handleContactItemClick(contact._id)} // Pass type
                            >
                                <h3>{contact.username || "Unknown User"}</h3>
                                <p>{contact.status || "No status available"}</p>
                            </div>
                        ))
                    ) : (
                        <p>No contacts available</p>
                    )}
                </div>
            )}
                */