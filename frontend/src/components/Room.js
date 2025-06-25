import React, { useState, useEffect, use } from "react";
import "../styles/Room.css";
import { fetchData } from "../fetcher";
import { useWebSocket } from "../WebSocketContext";
import { Button, Form } from "react-bootstrap";
import GroupDetails from "./Popups/GroupDetails";
import UserChatDetails from "./Popups/UserChatDetails";
import Popup from "./Popup";

const Room = ({ currentChat, messages = [], setMessages, contacts }) => {
  const userId = localStorage.getItem("user-id"); // Get user ID from local storage
  const [isTyping, setIsTyping] = useState(false);
  const { socket, registerListener, unregisterListener } = useWebSocket();
  const [displayDetails, setDisplayDetails] = useState(false);

  // Effect to scroll to the bottom of the chat
  useEffect(() => {
    console.log(
      "Room - useEffect - Scrolling to bottom of chat messages - currentChat:",
      currentChat
    );
    const chatContainer = document.querySelector(".room_messages");
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    // section to handle unseen messages
    const unseenMessages = messages.filter(
      (message) =>
        !message.seenBy?.includes(userId) && message.author?._id !== userId
    );

    console.log("Room - useEffect - Unseen messages:", unseenMessages);

    if (unseenMessages.length > 0 && socket) {
      console.log("Room - useEffect - Sending seen event for unseen messages");
      const seenEvent = {
        type: "seenMessage",
        userId: userId,
        load: {
          chatId: currentChat._id,
          messagesId: unseenMessages.map((msg) => msg._id),
        },
      };
      socket.send(JSON.stringify(seenEvent)); // Send the seen event
    }
  }, [messages]); // This effect runs whenever messages change

  // Effect to fetch messages for the current chat
  useEffect(() => {
    console.log(
      "Room - useEffect - Fetching messages for current chat:",
      currentChat
    );
    if (currentChat && !currentChat._id.toString().includes("temp-")) {
      fetchData(
        `${process.env.REACT_APP_API_URL}/api/message/${currentChat._id}`
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((data) => {
          console.log(
            "Room - useEffect - Messages fetched successfully:",
            data
          );
          setMessages(data.messages);
        })
        .catch((error) => {
          console.error("There was a problem with the fetch operation:", error);
        });
    } else {
      console.warn(
        "Room - useEffect - No valid current chat to fetch messages for."
      );
      setMessages([]); // Clear messages if no valid chat
    }
  }, [currentChat]); // Effect runs when currentChat changes

  useEffect(() => {
    if (currentChat) {
      setIsTyping(currentChat?.isTyping || false);
    }
  }, [currentChat, messages]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const input = document.querySelector(".room_input input");
    const messageContent = input.value.trim();

    console.log("Room - handleSubmit - Message content:", messageContent);

    if (messageContent && socket) {
      // Send the message through WebSocket
      const message = {
        type: "newMessage",
        userId: userId,
        load: {
          chat: currentChat,
          message: {
            author: userId,
            content: messageContent,
            chat: currentChat._id,
          },
        },
      };
      console.log("Room - handleSubmit - Sending message:", message);
      socket.send(JSON.stringify(message)); // Send the message
      input.value = ""; // Clear the input field
    }
  };

  // Sending typing status
  const handleTyping = () => {
    if (socket) {
      console.log("Room - handleTyping - User is typing...");
      const typingEvent = {
        type: "isTyping",
        userId: userId,
        load: {
          chatId: currentChat._id,
        },
      };
      socket.send(JSON.stringify(typingEvent)); // Send typing event
    }
  };

  const handleOnChatHeaderClick = () => {
    console.log("Room - handleOnChatHeaderClick - Current chat:", currentChat);
    setDisplayDetails(!displayDetails); // Toggle for both group and non-group
  };

  const handleCloseDetails = () => {
    console.log("Room - handleCloseDetails - Closing group details popup");
    setDisplayDetails(false); // Close group details popup
  };

  return (
    <div className="room">
      <div className="room_header" onClick={handleOnChatHeaderClick}>
        <div className="room_header_content">
          <div className="room_header_image">
            {currentChat.isGroup ? (
              <img
                src={`${
                  process.env.REACT_APP_API_URL
                }/uploads/profile-pictures/${
                  currentChat.chatImage || "default_group_picture.jpeg"
                }`}
                alt="Group"
                className="chat-image"
              />
            ) : (
              <img
                src={`${
                  process.env.REACT_APP_API_URL
                }/uploads/profile-pictures/${
                  currentChat.participants.find((p) => p._id !== userId)
                    ?.profilePicture || "default_profile_picture.jpeg"
                }`}
                alt="Profile"
                className="chat-image"
              />
            )}
          </div>
          <h1>
            {currentChat.isGroup
              ? currentChat.title
              : currentChat.participants.find((p) => p._id !== userId)
                  ?.username || "Unknown User"}
          </h1>
        </div>
      </div>
      <div className="room_messages">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${
              message.author?._id === userId ? "sent" : "received"
            }`}
          >
            <p>
              <strong>{message.author?.username || "Unknown"}</strong>:{" "}
              {message.content}
            </p>
            {message.author?._id === userId ? (
              <span className="seen-status">
                {currentChat.isGroup
                  ? message.seenBy?.length ===
                    currentChat.participants.length - 1
                    ? "Seen by all"
                    : `Seen by ${message.seenBy?.length} out of ${
                        currentChat.participants.length - 1
                      }`
                  : message.seenBy?.some((seenUserId) => seenUserId !== userId)
                  ? "Seen"
                  : "Not Seen"}
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
        <Form.Control
          type="text"
          placeholder="Type a message..."
          onChange={handleTyping}
        />
        <Button onClick={handleSubmit}>Send</Button>
      </div>
      {displayDetails && currentChat.isGroup && (
        <Popup onClose={handleCloseDetails}>
          <GroupDetails currentChat={currentChat} />
        </Popup>
      )}
      {displayDetails && !currentChat.isGroup && (
        <Popup onClose={handleCloseDetails}>
          <UserChatDetails currentChat={currentChat} />
        </Popup>
      )}
    </div>
  );
};

export default Room;
