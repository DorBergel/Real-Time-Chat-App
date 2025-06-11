import "../styles/AppManager.css";
import Sidebar from "./Sidebar";
import { useState, useEffect } from "react";
import Room from "./Room";
import { fetchData } from "../fetcher";
import { useWebSocket } from "../WebSocketContext";
import { handleNewChatCreated, handleNewMessageReceived } from "../eventHandeling";

function AppManager() {
  const userId = localStorage.getItem("user-id"); // Get user ID from local storage
  const [username, setUsername] = useState(""); // State to hold user data
  const [userChats, setUserChats] = useState([]); // State to hold user chats
  const [userContacts, setUserContacts] = useState([]); // State to hold user contacts
  const [currentChat, setCurrentChat] = useState(null); // State to hold current chat
  const [currentMessages, setCurrentMessages] = useState([]); // State to hold current messages
  const { socket, registerListener, unregisterListener } = useWebSocket(); // Access WebSocket context

  // Register WebSocket listener
  useEffect(() => {
    const handleWebSocketMessage = (message) => {
      console.log("AppManager: WebSocket message received:", message);

      if (message.type === "newMessage") {
        handleNewMessageReceived(
          message,
          userChats,
          setUserChats,
          currentMessages,
          setCurrentMessages,
          currentChat
        );
      }
      else if (message.type === "chatCreated") {
        handleNewChatCreated(
          message,
          userChats,
          setUserChats,
          currentChat,
          setCurrentChat
        );
      }

    };
    registerListener(handleWebSocketMessage);
    return () => unregisterListener(handleWebSocketMessage);
  }, [registerListener, unregisterListener, userChats]);
  
  // Register WebSocket listener

  // Effect to fetch user data from backend
  useEffect(() => {
    fetchData(`${process.env.REACT_APP_API_URL}/api/user/user/${userId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log("AppManager - useEffect - User data fetched successfully:", data);
        setUsername(data.user.username);
        setUserContacts(data.user.contacts || []);
        setUserChats(data.user.chats || []);
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  }
  , [userId]);

  return (
    <div className="AppManager">
      <div className="toolbar_container">
        <Sidebar
          username={username}
          chats={userChats}
          contacts={userContacts}
          setContacts={setUserContacts}
          currentChat={currentChat}
          setCurrentChat={setCurrentChat}
        />
      </div>
      <div className="chat_container">
        {currentChat ? (
          <Room
          currentChat={currentChat}
          messages={currentMessages}
          setMessages={setCurrentMessages} />
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
