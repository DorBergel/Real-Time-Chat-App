import React, { useState } from "react";
import { Card } from "react-bootstrap";
import "../styles/GroupCreationForm.css";

const GroupCreationForm = ({
  username,
  chats = [],
  contacts,
  setContacts,
  currentChat,
  setCurrentChat,
  setChats,
  socket,
}) => {
  const [selectedContacts, setSelectedContacts] = useState([]);

  const handleContactClick = (contact) => {
    if (selectedContacts.includes(contact)) {
      setSelectedContacts(selectedContacts.filter((c) => c !== contact));
    } else {
      setSelectedContacts([...selectedContacts, contact]);
    }
  };

  const handleCreateGroup = () => {
    const groupName = document.querySelector(".group_name_input").value.trim();
    if (groupName === "") {
      alert("Group name cannot be empty");
      return;
    }
    if (selectedContacts.length === 0) {
      alert("Please select at least one contact to create a group");
      return;
    }

    console.log(
      `Creating group: ${groupName} with contacts:`,
      selectedContacts
    );

    socket.send(
      JSON.stringify({
        type: "newGroup",
        userId: localStorage.getItem("user-id"),
        load: {
          title: groupName,
          participants: selectedContacts.map((contact) => contact._id),
          chatImage: "default_group_picture.jpeg",
        },
      })
    );

    // close the popup
    document.querySelector(".popup").style.display = "none";
  };

  return (
    <div className="group_creation_form">
      <div className="header">
        <h2>New Group</h2>
        <input
          type="text"
          placeholder="Group Name"
          className="group_name_input"
        ></input>
        <button
          className="create_group_button"
          disabled={selectedContacts.length === 0}
          onClick={handleCreateGroup}
        >
          Create Group
        </button>
      </div>
      <div className="contacts_list">
        {contacts.map((contact, index) => (
          <Card
            className={`contact_item ${
              selectedContacts.includes(contact) ? "selected" : ""
            }`}
            key={index}
            onClick={() => handleContactClick(contact)}
          >
            <Card.Body>
              <Card.Title>{contact.username}</Card.Title>
              <Card.Text>
                {contact.status ? contact.status : "no status"}
              </Card.Text>
            </Card.Body>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default GroupCreationForm;
