import '../styles/AppManager.css';
import Sidebar from './Sidebar';
import { useState, useEffect } from 'react';
import Room from './Room';
import { fetchData } from '../fetcher';
import { useWebSocket } from '../WebSocketContext';

// TODO: need that lastMessage field in chat document be populated with the last message in the chat


function AppManager() {
  const userId = localStorage.getItem('user-id'); // Get user ID from local storage
  const [username, setUsername] = useState(""); // State to hold user data
  const [userChats, setUserChats] = useState([]); // State to hold user chats
  const [userContacts, setUserContacts] = useState([]); // State to hold user contacts
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

  // Effect to fetch user contacts from backend
  useEffect(() => {
    fetchData(`${process.env.REACT_APP_API_URL}/api/user/contacts/${userId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        console.log('AppManager - useEffect - User contacts fetched successfully:', data);
        // Assuming data.contacts is an array of contact objects
        setUserContacts(data.contacts);
      }).catch(error => {
        console.error('There was a problem with the fetch operation:', error);
        setUserContacts([]);
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
      console.log('AppManager: WebSocket message received:', message);

      if (message.type === 'chatMessage') {
        setUserChats((prevChats) =>
          prevChats.map((chat) =>
            chat._id === message.chatId
              ? { ...chat, lastMessage: message.message }
              : chat
          )
        );
      } else if (message.type === 'messageSeen') {
        console.log('Message seen event received for chat:', message.chatId);

        // Update the userChats state to mark the last message as seen
        setUserChats((prevChats) =>
          prevChats.map((chat) =>
            chat._id === message.chatId
              ? {
                  ...chat,
                  lastMessage: {
                    ...chat.lastMessage,
                    seen: true, // Update the seen status
                  },
                }
              : chat
          )
        );

        // Debugging log to verify state update
        console.log('AppManager: Updated userChats after messageSeen event:', userChats);
      }
    };

    registerListener(handleWebSocketMessage);

    return () => {
      unregisterListener(handleWebSocketMessage);
    };
  }, [registerListener, unregisterListener, userChats]);

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
        <Sidebar username={username} chats={userChats} contacts={userContacts} currentChat={currentChat} setCurrentChat={setCurrentChat} />
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
