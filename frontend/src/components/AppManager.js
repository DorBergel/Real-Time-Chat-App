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
  const { registerListener, unregisterListener } = useWebSocket(); // Access WebSocket context

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
    };

    registerListener(handleWebSocketMessage);

    return () => {
      unregisterListener(handleWebSocketMessage);
    };
  }, [registerListener, unregisterListener]);

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
