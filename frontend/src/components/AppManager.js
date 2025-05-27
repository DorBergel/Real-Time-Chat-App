import '../styles/AppManager.css';
import Sidebar from './Sidebar';
import { useState, useEffect } from 'react';
import Room from './Room';
import { fetchData } from '../fetcher';
import { useWebSocket } from '../WebSocketContext';

function AppManager() {
  const userId = localStorage.getItem('user-id'); // Get user ID from local storage
  const [username, setUsername] = useState(""); // State to hold user data
  const [userChats, setUserChats] = useState([]); // State to hold user chats
  const [currentChat, setCurrentChat] = useState(null); // State to hold current chat
  const { socket, registerListener, unregisterListener } = useWebSocket(); // Access WebSocket context

  // Effect to fetch username from backend
  useEffect(() => {
    fetchData(`${process.env.REACT_APP_API_URL}/api/user/username/${userId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        console.log('AppManager - useEffect - User data fetched successfully:', data);
        setUsername(data.username);
      })
      .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
      });
  }, [userId]);

  // Effect to fetch user chats from backend
  useEffect(() => {
    fetchData(`${process.env.REACT_APP_API_URL}/api/user/chats/${userId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        console.log('AppManager - useEffect - User chats fetched successfully:', data);
        setUserChats(data.chats);
      })
      .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
        setUserChats([]);
      });
  }, [userId]);

  // WebSocket listener to update chats dynamically
  useEffect(() => {
    const handleWebSocketMessage = (message) => {
      if (message.type === 'chatMessage') {
        setUserChats((prevChats) =>
          prevChats.map((chat) =>
            chat._id === message.chatId
              ? { ...chat, lastMessage: message.message.content }
              : chat
          )
        );
      } 
      // Handle incoming messageSeen event
      /*else if (message.type === 'messageSeen') {
        // Update all messages in the current chat to mark them as seen
        if (currentChat && currentChat._id === message.chatId) {
          console.log('Message seen event received for chat:', message.chatId);
          setCurrentChat((prevChat) => ({
            ...prevChat,
            lastMessage: {
              ...prevChat.lastMessage,
              seen: true, // Assuming lastMessage has a seen property
            },
          }));
        }
      }*/
    };

    registerListener(handleWebSocketMessage);

    return () => {
      unregisterListener(handleWebSocketMessage);
    };
  }, [registerListener, unregisterListener]);

  // Effect to handle current chat changes
  useEffect(() => {
    if (currentChat) {
      console.log('Current chat changed:', currentChat);

      // if last message is sent by the other user, mark it as seen
      if (currentChat.lastMessage && currentChat.lastMessage.sender !== userId && socket) {
        console.log('Send messageSeen event for all messages in the current chat');
        const messageSeenEvent = {
          type: 'messageSeen',
          chatId: currentChat._id,
          message: userId,
        };
        socket.send(JSON.stringify(messageSeenEvent));
      }
    }
  }, [currentChat]);

  return (
    <div className="AppManager">
      <div className='toolbar_container'>
        <Sidebar username={username} chats={userChats} currentChat={currentChat} setCurrentChat={setCurrentChat} />
      </div>
      <div className='chat_container'>
        {currentChat ? (
          <Room currentChat={currentChat} />
        ) : (
          <div className="welcome_message">
            <h1>Welcome to the Chat App</h1>
            <p>Select a chat to start messaging!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AppManager;
