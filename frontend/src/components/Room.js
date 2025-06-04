import React, { useState, useEffect } from 'react';
import '../styles/Room.css';
import { fetchData } from '../fetcher';
import { useWebSocket } from '../WebSocketContext';

const Room = ({ currentChat }) => {
    const userId = localStorage.getItem('user-id'); // Get user ID from local storage
    const [messages, setMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const { socket, registerListener, unregisterListener } = useWebSocket();
    
    // Register a listener for WebSocket messages
    useEffect(() => {
        const handleWebSocketMessage = (message) => {
            if (!message || !message.type) {
                console.warn('Invalid WebSocket message received:', message);
                return;
            }

            console.log('Room - WebSocket message received:', message);
            console.log('Room - WebSocket message currentChat:', currentChat);

            if (message.type === 'chatMessage' && currentChat?.['_id'] === message.chatId) {
                setMessages((prevMessages) => [...prevMessages, message.message]);

                if (
                    socket &&
                    currentChat &&
                    currentChat._id === message.chatId &&
                    message.message?.author?._id !== userId
                ) {
                    const seenMessage = {
                        type: 'messageSeen',
                        chatId: currentChat._id,
                        message: userId,
                    };
                    socket.send(JSON.stringify(seenMessage));
                }
            } else if (message.type === 'messageSeen' && currentChat?.['_id'] === message.chatId) {
                setMessages((prevMessages) =>
                    prevMessages.map((msg) =>
                        !msg.seen ? { ...msg, seen: true } : msg
                    )
                );
            } else if (message.type === 'typing' && currentChat?.['_id'] === message.chatId) {
                setIsTyping(true);
                setTimeout(() => setIsTyping(false), 3000); // Hide typing indicator after 3 seconds
            }
        };

        registerListener(handleWebSocketMessage);

        // Cleanup function to unregister the listener
        return () => {
            unregisterListener(handleWebSocketMessage);
        };
    }, [currentChat, registerListener, unregisterListener]);

    // handle when user is typing
    useEffect(() => {
        const input = document.querySelector('.room_input input');
        if (input && socket) {
            const handleTyping = () => {
                const typingMessage = {
                    type: 'typing',
                    chatId: currentChat?._id,
                    messages: userId
                };
                socket.send(JSON.stringify(typingMessage));
            };

            input.addEventListener('input', handleTyping);

            // Cleanup event listener on unmount
            return () => {
                input.removeEventListener('input', handleTyping);
            };
        }
    }, [currentChat, socket]);

    // Effect to scroll to the bottom of the chat
    useEffect(() => {
        const chatContainer = document.querySelector('.room_messages');
        if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    }, [messages]); // This effect runs whenever messages change

    // Effect to fetch messages for the current chat
    useEffect(() => {
        if (currentChat) {
            fetchData(`${process.env.REACT_APP_API_URL}/api/message/${currentChat._id}`)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then((data) => {
                    console.log('Room - useEffect - Messages fetched successfully:', data);
                    setMessages(data.messages);
                })
                .catch((error) => {
                    console.error('There was a problem with the fetch operation:', error);
                });
        }
    }, [currentChat]); // Effect runs when currentChat changes

    const handleSubmit = (event) => {
        event.preventDefault();
        const input = document.querySelector('.room_input input');
        const messageContent = input.value.trim();

        console.log('currentChat:', currentChat);

        if (messageContent && socket) {
            // Send the message through WebSocket
            const message = {
                type: 'chatMessage',
                chatId: currentChat?._id,
                message: messageContent,
            };

            socket.send(JSON.stringify(message)); // Send the message
            input.value = ''; // Clear the input field
        }
    };

    return (
        <div className="room">
            <div className="room_header">
                <h1>{currentChat.title}</h1>
            </div>
            <div className="room_messages">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`message ${message.author?._id === userId ? 'sent' : 'received'}`}
                    >
                        <p>
                            <strong>{message.author?.username || 'Unknown'}</strong>: {message.content}
                        </p>
                        {message.author?._id === userId ? (
                            <span className="seen-status">
                                {message.seen ? 'Seen' : 'Not Seen'}
                            </span>
                        ) : null}
                    </div>
                ))}
            </div>
            <div className="typing-indicator">
                {isTyping && (
                    <div className="typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                )}
            </div>
            <div className="room_input">
                <input type="text" placeholder="Type a message..." />
                <button onClick={handleSubmit}>Send</button>
            </div>
        </div>
    );
};

export default Room;