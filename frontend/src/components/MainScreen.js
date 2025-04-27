import "bootstrap/dist/css/bootstrap.min.css";
import Button from "react-bootstrap/Button";
import { useEffect, useState } from "react";
import "../styles/MainScreen.css";
import { decode } from "jsonwebtoken";

function MainScreen() {
  const [listState, setListState] = useState("Contacts");
  const [contactsList, setContactsList] = useState([]);
  const [chatsList, setChatsList] = useState([]);

  const token = localStorage.getItem("token");
  const decodedToken = decode(token);

  const handleContactsButtonClick = () => {
    console.log("Contacts list button clicked");
    setListState("Contacts");
  };

  const handleChatsButtonClick = () => {
    console.log("Chats list button clicked");
    setListState("Chats");
  };

  const handleContactItemClick = (contactId) => {
    console.log("Contact item clicked:", contactId);
    {/* Navigate to the chat screen with the selected contactId */}
  };

  const handleChatItemClick = (chatId) => {
    console.log("Chat item clicked:", chatId);
    {/* Navigate to the chat screen with the selected chatId */}
  }

  // Fetch contacts from the server when the component mounts
  useEffect(() => {
    
    fetch(
      `${process.env.REACT_APP_API_URL}/api/user/contacts/${decodedToken.id}`,
      {
        method: "GET",
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    ).then((response) => {
      if (response.ok) {
        response.json().then((data) => {
          console.log("Contacts data:", data);
          setContactsList(data.contacts);
        });
      } else {
        console.error("Failed to fetch contacts");
      }
    });
  }, []);

  // Fetch chats from the server when the component mounts
  useEffect(() => {

    fetch(
      `${process.env.REACT_APP_API_URL}/api/user/chats/${decodedToken.id}`,
      {
        method: "GET",
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    ).then((response) => {
      if (response.ok) {
        response.json().then((data) => {
          console.log("data:", JSON.stringify(data));
          console.log("data.chats:", data.chats);

          setChatsList(data.chats);
        });
      } else {
        console.error("Failed to fetch chats");
      }
  })}, []);

  return (
    <div className="MainScreen">
      <div className="Main-header" style={{ textAlign: "center" }}>
        <h1>Main Screen</h1>
        <p>Here you can create a new chat or enter to previous ones</p>
      </div>

      <div
        className="toolbar"
        style={{ display: "flex", justifyContent: "flex-start", gap: "10px" }}
      >
        <div className="toolbar-item">
          <Button
            variant={listState === "Contacts" ? "primary" : "outline-primary"}
            size="sm"
            id="contacts_list"
            onClick={handleContactsButtonClick}
          >
            Contacts
          </Button>
        </div>
        <div className="toolbar-item">
          <Button
            variant={listState === "Chats" ? "primary" : "outline-primary"}
            size="sm"
            id="chats_list"
            onClick={handleChatsButtonClick}
          >
            Chats
          </Button>
        </div>
      </div>

      <div className="List">
        {listState === "Contacts" ? (
          <div className="list">
            {contactsList.map((contact) => (
              <div
                key={contact._id}
                className="item"
                onClick={() => handleContactItemClick(contact._id)}
              >
                <h3>{contact.first_name} {contact.last_name}</h3>
                <p>AKA {contact.username}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="list">
            {chatsList.map((chat) => (
              <div
                key={chat._id}
                className="item"
                onClick={() => handleChatItemClick(chat._id)}
              >
                <h3>{chat.title}</h3>
                <p>{chat.lastMessage ? chat.lastMessage : "No message yet"}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

}
export default MainScreen;
