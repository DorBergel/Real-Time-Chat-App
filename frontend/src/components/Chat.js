import React from "react";
import { useLocation, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { decode } from "jsonwebtoken";
import "../styles/Chat.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useWebSocket } from "../context/WebSocketContext";

function Chat() {
  const socket = useWebSocket();
  const { chatId } = useParams();
  const [chatData, setChatData] = useState(null);
  const [messages, setMessages] = useState([]);
  const token = localStorage.getItem("token");

  // Effect for debugging
  useEffect(() => {
    console.log("ChatId:", chatId);
    console.log("Token:", token);
    console.log("Socket:", socket);
  }, [chatId, token]);

  // Effect to fetch chat data
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/chat/${chatId}`, {
      method: "GET",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }).then((response) => {
      if (response.ok) {
        response.json().then((data) => {
          console.log("Chat data:", data);
          setChatData(data.chat);
        });
      } else {
        console.error("Failed to fetch chat");
      }
    });
  }, []); // Fetch chat data only once when the component mounts

  // Effect to fetch messages
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/message/${chatId}`, {
      method: "GET",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }).then((response) => {
      if (response.ok) {
        response.json().then((data) => {
          console.log("Messages data:", data.messages);
          setMessages(data.messages);
        });
      } else {
        console.error("Failed to fetch messages");
      }
    });
  }, [chatId, token]); // Fetch messages when chatId or token changes

  // Effect to scroll to the bottom of the chat messages
  // This effect runs every time the `messages` state changes
  useEffect(() => {
    const chatMessages = document.querySelector(".chat-messages");
    if (chatMessages) {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    console.log("messages", messages);
  }, [messages]); // Trigger this effect whenever `messages` updates

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log("message", event.target.message.value);
    const message = event.target.message.value;
    const author = decode(token).id;

    console.log("author", author);
    if (socket) {
      socket.send(
        JSON.stringify({
          type: "chatMessage",
          chatId: chatId,
          message: message,
        })
      );
      console.log("Message sent:", message);

      event.target.reset();
    } else {
      console.error("Socket is not connected");
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>Chat with {chatData ? chatData.title : "Loading..."}</h2>
      </div>
      <div className="chat-messages">
        {messages.map((message) => {
          return (
            <div
              key={message._id}
              className={`message ${
                message.author && message.author._id === decode(token).id
                  ? "sent"
                  : "received"
              }`}
            >
              <p className="author">
                {message.author ? message.author.username : "Unknown"}
              </p>
              <hr></hr>
              <p className="content">
                {message.content ? message.content : "error loading content"}
              </p>
            </div>
          );
        })}
      </div>
      <div className="chat-input">
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="formMessage">
            <Form.Label>Type your message</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter your message"
              name="message"
            />
          </Form.Group>
          <Button variant="primary" type="submit" className="w-100">
            Send
          </Button>
        </Form>
      </div>
    </div>
  );
}

export default Chat;
