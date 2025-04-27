import "bootstrap/dist/css/bootstrap.min.css";
import Button from "react-bootstrap/Button";
import { useEffect, useState } from "react";
import "../styles/MainScreen.css";
import { decode } from "jsonwebtoken";

function MainScreen() {
  const [listState, setListState] = useState("Contacts");
  const [contactsList, setContactsList] = useState([]);

  const handleContactsButtonClick = () => {
    console.log("Contacts list button clicked");
    setListState("Contacts");
  };

  const handleChatsButtonClick = () => {
    console.log("Chats list button clicked");
    setListState("Chats");
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const decodedToken = decode(token);

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

  return (
    <div className="MainScreen">
      <div className="Main-header">
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
        {contactsList.length > 0 ? (
          contactsList.map((contact, index) => (
            <div key={index} className="contact-item">
              <p>{contact.username}</p>{" "}
            </div>
          ))
        ) : (
          <p>No contacts available</p>
        )}
      </div>
    </div>
  );
}

export default MainScreen;
