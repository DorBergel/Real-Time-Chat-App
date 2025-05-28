import React, { useState, useEffect } from 'react';
import '../styles/Room.css';
import { fetchData } from '../fetcher';
import { useWebSocket } from '../WebSocketContext';

const Room = ({ currentChat }) => {
    const userId = localStorage.getItem('user-id'); // Get user ID from local storage
    const [messages, setMessages] = useState([]);
    const { socket, registerListener, unregisterListener } = useWebSocket();
    
    // Register a listener for WebSocket messages
    useEffect(() => {
        const handleWebSocketMessage = (message) => {
            console.log('Room - WebSocket message received:', message);
            console.log('Room - WebSocket message currentChat:', currentChat);
            if (message.type === 'chatMessage' && message.chatId === currentChat._id) {
                // Update messages state with the new message
                setMessages((prevMessages) => [...prevMessages, message.message]);

                // send a message seen event back to the server
                if (socket && currentChat && currentChat._id === message.chatId && message.message.author._id !== userId) {
                    console.log('Sending message seen event for chat:', currentChat._id);
                    const seenMessage = {
                        type: 'messageSeen',
                        chatId: currentChat._id,
                        message: userId
                    };
                    socket.send(JSON.stringify(seenMessage)); // Send the seen event
                }
            } 
            else if (message.type === 'messageSeen') {
                // Update all messages in the current chat to mark them as seen
                if (currentChat && currentChat._id === message.chatId) {
                  console.log('Message seen event received for chat:', message.chatId);
                  
                  // Update all messages in the current chat to mark them as seen
                  
                  setMessages((prevMessages) =>
                    prevMessages.map((msg) =>
                        !msg.seen ? { ...msg, seen: true } : msg // Only update if not already seen
                    )
                );
                }
              }
        };

        registerListener(handleWebSocketMessage);

        // Cleanup function to unregister the listener
        return () => {
            unregisterListener(handleWebSocketMessage);
        };
    }, [currentChat, registerListener, unregisterListener]);

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

        if (messageContent && socket) {
            // Send the message through WebSocket
            const message = {
                type: 'chatMessage',
                chatId: currentChat._id,
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
                        className={`message ${message.author._id === userId ? 'sent' : 'received'}`}
                    >
                        <p>
                            <strong>{message.author.username}</strong>: {message.content}
                        </p>
                        {(message.author._id === userId) ?
                        <span className='seen-status'>
                            {message.seen ? 'Seen' : 'Not Seen'}
                        </span> : null}
                    </div>
                ))}
            </div>
            <div className="room_input">
                <input type="text" placeholder="Type a message..." />
                <button onClick={handleSubmit}>Send</button>
            </div>
        </div>
    );
};

export default Room;