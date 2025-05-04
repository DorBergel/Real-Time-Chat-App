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
    };

    socket.onmessage = (event) => {
      console.log("New message received:", event.data);
      const message = JSON.parse(event.data);

      console.log("Message", message);
      console.log("message type", typeof message);
      console.log("Message content", message.content);

      fetch(`${process.env.REACT_APP_API_URL}/api/message/${chatId}`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: decode(token).id,
          chatId: chatId,
          content: message.content,
        }),
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error("Failed to send message");
          }
        })
        .then((data) => {
          console.log("Message sent successfully:", data);
          setMessages((prevMessages) => [...prevMessages, data.newMessage]);
        })
        .catch((error) => {
          console.error("Error sending message:", error);
        });
    };

    socket.onclose = () => {
      console.log("WebSocket connection closed");
    };

    setSocket(socket);
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

  const handleSubmit = (event) => {
    event.preventDefault();
    const message = event.target.message.value;
    if (message && socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          chatId: chatId,
          content: message,
        })
      );
    }

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
