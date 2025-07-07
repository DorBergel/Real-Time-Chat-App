import "../styles/AppManager.css";
import Sidebar from "./Sidebar";
import { useState, useEffect } from "react";
import Room from "./Room";
import { fetchData } from "../fetcher";
import { useWebSocket } from "../WebSocketContext";
import {
  handleNewChatCreated,
  handleNewGroupChatCreated,
  handleNewMessageReceived,
  handleSeenEventReceived,
  handleTypingEventReceived,
} from "../eventHandling";

function AppManager() {
  const userId = localStorage.getItem("user-id"); // Get user ID from local storage
  const [username, setUsername] = useState(""); // State to hold user data
  const [userChats, setUserChats] = useState([]); // State to hold user chats
  const [userContacts, setUserContacts] = useState([]); // State to hold user contacts
  const [currentChat, setCurrentChat] = useState(null); // State to hold current chat
  const [currentMessages, setCurrentMessages] = useState([]); // State to hold current messages
  const { socket, registerListener, unregisterListener } = useWebSocket(); // Access WebSocket context
  const [userDocument, setUserDocument] = useState(null); // State to hold user document

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
      } else if (message.type === "chatCreated") {
        // If the currentChat is a temp chat, update it to the real chat
        if (
          currentChat &&
          currentChat._id &&
          currentChat._id.toString().includes("temp-") &&
          message.load &&
          message.load.chat
        ) {
          setCurrentChat(message.load.chat);
        }
        handleNewChatCreated(
          message,
          userChats,
          setUserChats,
          currentChat,
          setCurrentChat
        );
      } else if (message.type === "seenMessage") {
        handleSeenEventReceived(
          message,
          userChats,
          setUserChats,
          currentMessages,
          setCurrentMessages,
          currentChat,
          setCurrentChat
        );
      } else if (message.type === "isTyping") {
        handleTypingEventReceived(
          message,
          userChats,
          setUserChats,
          currentMessages,
          setCurrentMessages,
          currentChat,
          setCurrentChat
        );
      } else if (message.type === "newGroup") {
        handleNewGroupChatCreated(
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
  }, [registerListener, unregisterListener, userChats, currentChat]);

  // Effect to fetch user data from backend
  useEffect(() => {
    fetchData(`${process.env.REACT_APP_API_URL}/api/user/${userId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log(
          "AppManager - useEffect - User data fetched successfully:",
          data
        );
        setUserDocument(data.user);
        setUsername(data.user.username);
        setUserContacts(data.user.contacts || []);
        setUserChats(data.user.chats || []);
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  }, [userId]);

  // Effect to handle just if userDocument is updated
  useEffect(() => {
    if (userDocument) {
      console.log(
        "AppManager - useEffect - User document updated:",
        userDocument
      );
      setUsername(userDocument.username);
      setUserContacts(userDocument.contacts || []);
      setUserChats(userDocument.chats || []);
    }
  }, [userDocument]);

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
          userDocument={userDocument}
          setUserDocument={setUserDocument}
        />
      </div>
      <div className="chat_container">
        {currentChat ? (
          <Room
            currentChat={currentChat}
            messages={currentMessages}
            setMessages={setCurrentMessages}
            contacts={userContacts}
          />
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
