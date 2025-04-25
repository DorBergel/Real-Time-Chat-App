import "bootstrap/dist/css/bootstrap.min.css";
import Button from "react-bootstrap/Button";
import { useState } from "react";
import "../styles/MainScreen.css";

function MainScreen() {
  const [listState, setListState] = useState("Contacts");

  const handleContactsButtonClick = () => {
    console.log("Contacts list button clicked");
    setListState("Contacts");
  };

  const handleChatsButtonClick = () => {
    console.log("Chats list button clicked");
    setListState("Chats");
  };

  // Last update: I added a new button to the toolbar to switch between contacts and chats lists.
  // The button changes its color based on the selected list. I also added a console log to each button click event.

  //TODO : Add a list of contacts and chats to the List component.
  //TODO : Add a button to create a new chat. The button should be placed in the toolbar and should be styled like the other buttons.
  //TODO : Add a button to delete a chat. The button should be placed in the List component and should be styled like the other buttons.
  //TODO : Add a button to delete a contact. The button should be placed in the List component and should be styled like the other buttons.
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
        
      </div>
    </div>
  );
}

export default MainScreen;