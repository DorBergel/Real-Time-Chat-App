import React, { useState, useEffect, use } from "react";
import "../styles/Room.css";
import { fetchData } from "../fetcher";
import { useWebSocket } from "../WebSocketContext";

const Room = ({ currentChat }) => {
  const userId = localStorage.getItem("user-id"); // Get user ID from local storage
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const { socket, registerListener, unregisterListener } = useWebSocket();

  // handle when user is typing
  useEffect(() => {
    const input = document.querySelector(".room_input input");
    if (input && socket) {
      const handleTyping = () => {
        const typingMessage = {
          type: "typing",
          chatId: currentChat?._id,
          messages: userId,
        };
        socket.send(JSON.stringify(typingMessage));
      };

      input.addEventListener("input", handleTyping);

      // Cleanup event listener on unmount
      return () => {
        input.removeEventListener("input", handleTyping);
      };
    }
  }, [currentChat, socket]);

  // Effect to scroll to the bottom of the chat
  useEffect(() => {
    const chatContainer = document.querySelector(".room_messages");
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [messages]); // This effect runs whenever messages change

  // Effect to fetch messages for the current chat
  useEffect(() => {
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
    }
  }, [currentChat]); // Effect runs when currentChat changes

  const handleSubmit = (event) => {
    event.preventDefault();
    const input = document.querySelector(".room_input input");
    const messageContent = input.value.trim();

    console.log("currentChat:", currentChat);

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

      socket.send(JSON.stringify(message)); // Send the message
      input.value = ""; // Clear the input field
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
                {message.seen ? "Seen" : "Not Seen"}
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
