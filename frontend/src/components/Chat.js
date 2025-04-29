import React from "react";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { decode } from "jsonwebtoken";
import "../styles/Chat.css";

function Chat() {
  const { chatId } = useParams();
  const [chatData, setChatData] = useState(null);
  const [messages, setMessages] = useState([]);
  const token = localStorage.getItem("token");

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
  }, [chatId, token]
  );

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>Chat with {chatData ? chatData.title : "Loading..."}</h2>
      </div>
      <div className="chat-messages">
        {messages.map((message) => {
          return (
          <div key={message._id} className= {`message ${message.author._id === decode(token).id ? "sent" : "received"}`}>
            <p className="author">{message.author.username}</p>
            <hr></hr>
            <p className="content">{message.content}</p>
          </div>
        )})
        }
      </div>
    </div>
  )};

export default Chat;
