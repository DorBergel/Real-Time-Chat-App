import React from "react";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { decode } from "jsonwebtoken";
import "../styles/Chat.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

function Chat() {
  const { chatId } = useParams();
  const [chatData, setChatData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const token = localStorage.getItem("token");

  // Effect to establish WebSocket connection
  useEffect(() => {
    const socket = new WebSocket(`${process.env.REACT_APP_SOCKET_URL}`);

    socket.onopen = () => {
      console.log("WebSocket connection established");
      socket.send(JSON.stringify({type: "join", chatId: chatId}));
    }

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("WebSocket message received:", data);
      if (data.chatId === chatId) {
        setMessages((prevMessages) => [...prevMessages, data.message]);
      }
    };

    socket.onclose = () => {
      console.log("WebSocket connection closed");
    };

    setSocket(socket);

    return () => {
      socket.close();
      console.log("WebSocket connection closed on component unmount");
    }
  }, [chatId]);

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
  }, []);

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
  }, [chatId, token]);

  // Effect to scroll to the bottom of the chat messages
  // This effect runs every time the `messages` state changes
  useEffect(() => {
    const chatMessages = document.querySelector(".chat-messages");
    if (chatMessages) {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  }, [messages]); // Trigger this effect whenever `messages` updates

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log("message", event.target.message.value);
    const message = event.target.message.value;
    socket.send(JSON.stringify({type: "message", chatId: chatId, message: message}));
    console.log("Message sent:", message);

    event.target.reset();
  };


  console.log("messages", messages);

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
                {message.content ? message.content : ""}
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
