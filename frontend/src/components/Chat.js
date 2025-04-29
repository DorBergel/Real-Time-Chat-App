import React from "react";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { decode } from "jsonwebtoken";

function Chat() {
  const { chatId } = useParams();
  const [chatData, setChatData] = useState(null);

  const token = localStorage.getItem("token");
  const decodedToken = decode(token);

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

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>Chat with {chatData ? chatData.title : "Loading..."}</h2>
      </div>
      <div className="chat-messages"></div>
    </div>
  );
}
export default Chat;
