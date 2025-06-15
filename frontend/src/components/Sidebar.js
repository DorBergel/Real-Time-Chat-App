import React, { useState, useEffect } from "react";
import "../styles/Sidebar.css";
import { useWebSocket } from "../WebSocketContext"; // Use the hook, not the provider
import ButtonGroup from "react-bootstrap/ButtonGroup";
import ToggleButton from "react-bootstrap/ToggleButton";
import { fetchData } from "../fetcher";
import GroupCreationForm from "./GroupCreationForm";
import Popup from "./Popup"; // Import the Popup component

const Sidebar = ({
  username,
  chats = [],
  contacts = [],
  setContacts,
  currentChat,
  setCurrentChat,
  setChats,
}) => {
  const { socket, registerListener, unregisterListener } = useWebSocket(); // Use the hook to access the context
  const userId = localStorage.getItem("user-id"); // Get user ID from local storage
  const [listState, setListState] = useState("Chats");
  const [showGroupCreationForm, setShowGroupCreationForm] = useState(false); // State to toggle the form visibility

  const handleChatItemClick = (chatId) => {
    console.log("Sidebar - handleChatItemClick - Chat ID:", chatId);

    // Find the chat with the given ID
    const selectedChat = chats.find((chat) => chat._id === chatId);
    if (selectedChat) {
      console.log(
        "Sidebar - handleChatItemClick - Selected Chat:",
        selectedChat
      );
      setCurrentChat(selectedChat); // Set the current chat to the selected chat
    } else {
      console.error("Sidebar - handleChatItemClick - Chat not found:", chatId);
      setCurrentChat(null); // Clear current chat if not found
    }
  };

  const handleContactItemClick = (contactId) => {
    console.log("Sidebar - handleContactItemClick - Contact ID:", contactId);
    const selectedContact = contacts.find(
      (contact) => contact._id === contactId
    );
    if (selectedContact) {
      const existingChat = chats.find((chat) =>
        chat.participants.includes(selectedContact._id)
      );
      if (existingChat) {
        setCurrentChat(existingChat);
      } else {
        // Create a new chat with the selected contact, send an event to the server
        console.log(
          "Sidebar - handleContactItemClick - Creating new chat with contact:",
          selectedContact
        );

        // Create a new temporary chat object
        const newChat = {
          _id: `temp-${contactId}`, // Temporary ID for the new chat
          title: `${selectedContact.username} & ${username}` || "New Chat",
          participants: [userId, selectedContact._id],
        };

        setCurrentChat(newChat);

        socket.send(
          JSON.stringify({
            type: "newChat",
            userId: userId,
            load: newChat,
          })
        );

        console.log(
          "Sidebar - handleContactItemClick - New chat created and sent to server:",
          newChat
        );

        // The server should recieve this, create the chat, and then send it back to client.
        // TODO: Handle the server response to update the chats state
      }
    } else {
      console.error("Sidebar - Contact not found:", contactId);
    }
  };

  const handleSearchButtonClick = () => {
    const searchInput = document.getElementById("searchContactInput");
    console.log(
      "Sidebar - handleSearchButtonClick - Search Input Value:",
      searchInput.value
    );
    fetchData(
      `${process.env.REACT_APP_API_URL}/api/user/contacts/add/${userId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: { contactUsername: searchInput.value },
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log(
          "Sidebar - handleSearchButtonClick - Search results:",
          data
        );
        if (data.contacts && Array.isArray(data.contacts)) {
          setContacts(data.contacts);
        }
      })
      .catch((error) => {
        if (error.status === 404) {
          console.error(
            "Sidebar - handleSearchButtonClick - Contact not found:",
            error
          );
          alert("Contact not found. Please check the username and try again.");
        } else {
          console.error(
            "Sidebar - handleSearchButtonClick - There was a problem with the fetch operation:",
            error
          );
          alert("Search failed. Please try again.");
        }
      });
  };

  // Debug effect to log user data
  useEffect(() => {
    console.log("Sidebar - DEBUG - Username:", username);
    console.log("Sidebar - DEBUG - Chats:", chats);
  }, [username, chats]);

  // sort chats by last message time
  const sortedChats = [...chats].sort((a, b) => {
    const aTime = new Date(a.lastMessage?.createdAt || 0);
    const bTime = new Date(b.lastMessage?.createdAt || 0);
    return bTime - aTime; // Sort in descending order
  });

  const handleCreateGroupClick = () => {
    console.log("Create Group button clicked");
    setShowGroupCreationForm(true); // Show the group creation form
  };

  const handleCloseGroupCreationForm = () => {
    setShowGroupCreationForm(false); // Hide the group creation form
  };

  return (
    <div className="sidebar">
      <div className="sidebar_header">
        <div className="logo">
          {/* Logo can be an image or text */}
          <h2 onClick={() => setCurrentChat(null)}>
            {username ? username : "ERROR"}
          </h2>
        </div>
        <div className="sidebar_buttons">
          <ButtonGroup className="sidebar_button_group">
            <ToggleButton
              id="toggle-chat"
              type="radio"
              variant="outline-primary"
              name="radio"
              value="1"
              checked={listState === "Chats"}
              onChange={() => setListState("Chats")}
            >
              Chats
            </ToggleButton>
            <ToggleButton
              id="toggle-contact"
              type="radio"
              variant="outline-primary"
              name="radio"
              value="2"
              checked={listState === "Contacts"}
              onChange={() => setListState("Contacts")}
            >
              Contacts
            </ToggleButton>
          </ButtonGroup>
        </div>
      </div>

      {listState === "Chats" ? (
        <div className="items_list">
          {chats.length > 0 ? (
            sortedChats.map((chat) => (
              <div
                key={chat._id} // Use unique identifier
                className={`chat_item ${
                  chat.lastMessage?.seen ? "seen_item" : "unseen_item"
                }`}
                onClick={() => handleChatItemClick(chat._id)} // Pass type
              >
                <h3>
                  {chat.title || "Untitled Chat"}{" "}
                  {chat.isTyping && (
                    <span className="typing-indicator">Typing...</span>
                  )}
                </h3>
                <p>{chat.lastMessage?.content || "No messages yet"}</p>
                <hr />
                <div className="chat_item_status">
                  <span className="chat_item_status_time">
                    {chat.lastMessage?.createdAt
                      ? new Date(chat.lastMessage.createdAt).toLocaleTimeString(
                          [],
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          }
                        )
                      : "N/A"}
                  </span>
                  <span className="chat_item_status_seen">
                    {chat.lastMessage?.author?._id === userId ||
                    chat.lastMessage?.author === userId
                      ? chat.lastMessage.seen
                        ? "Seen"
                        : "Not Seen"
                      : ""}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p>No chats available</p>
          )}
        </div>
      ) : (
        <div className="items_list">
          <div className="contact_search">
            <input
              id="searchContactInput"
              type="text"
              placeholder={`Search ${listState.toLowerCase()}...`}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleSearchButtonClick();
                }
              }}
            />
            <button
              onClick={handleSearchButtonClick}
              className="searchContactBtn"
            >
              Search
            </button>
          </div>
          {contacts.length > 0 ? (
            contacts.map((contact) => (
              <div
                key={contact._id} // Use unique identifier
                className="contact_item"
                onClick={() => handleContactItemClick(contact._id)} // Pass type
              >
                <h3>{contact.username || "Unknown User"}</h3>
                <p>{contact.status || "No status available"}</p>
              </div>
            ))
          ) : (
            <p>No contacts available</p>
          )}
        </div>
      )}

      <div className="sidebar_footer">
        <button
          className="create_group_button"
          onClick={handleCreateGroupClick}
        >
          Create Group
        </button>
      </div>

      {/* Use Popup component for GroupCreationForm */}
      {showGroupCreationForm && (
        <Popup onClose={handleCloseGroupCreationForm}>
          <GroupCreationForm
            username={username}
            chats={chats}
            contacts={contacts}
            setContacts={setContacts}
            currentChat={currentChat}
            setCurrentChat={setCurrentChat}
            setChats={setChats}
            socket={socket}
          />
        </Popup>
      )}
    </div>
  );
};

export default Sidebar;
