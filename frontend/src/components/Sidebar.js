import React, { useState, useEffect } from "react";
import "../styles/Sidebar.css";
import { useWebSocket } from "../WebSocketContext"; // Use the hook, not the provider
import ButtonGroup from "react-bootstrap/ButtonGroup";
import ToggleButton from "react-bootstrap/ToggleButton";
import Button from "react-bootstrap/Button";
import Image from "react-bootstrap/Image";
import { fetchData } from "../fetcher";
import InputGroup from "react-bootstrap/InputGroup";
import Form from "react-bootstrap/Form";
import GroupCreationForm from "./Popups/GroupCreationForm";
import Popup from "./Popup"; // Import the Popup component
import Settings from "./Popups/EditProfile"; // Import the Settings component
import { Col, Row } from "react-bootstrap";

const Sidebar = ({
  username,
  chats = [],
  contacts = [],
  setContacts,
  currentChat,
  setCurrentChat,
  setChats,
  userDocument,
  setUserDocument,
}) => {
  const { socket, registerListener, unregisterListener } = useWebSocket(); // Use the hook to access the context
  const userId = localStorage.getItem("user-id"); // Get user ID from local storage
  const [listState, setListState] = useState("Chats");
  const [showGroupCreationForm, setShowGroupCreationForm] = useState(false); // State to toggle the form visibility
  const [showSettings, setShowSettings] = useState(false); // State for settings popup
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Debounce search to avoid too many API calls
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const timeoutId = setTimeout(() => {
        handleSearch(searchQuery);
      }, 500); // Wait 500ms after user stops typing

      return () => clearTimeout(timeoutId);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleSearch = async (query) => {
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetchData(
        `${process.env.REACT_APP_API_URL}/api/user/search?query=${encodeURIComponent(
          query
        )}`,
        {
          method: "GET",
        }
      );

      const data = await response.json();

      // Filter out current user and existing contacts
      const filteredResults =
        data.users?.filter(
          (user) =>
            user._id !== userId &&
            !contacts.some((contact) => contact._id === user._id)
        ) || [];

      setSearchResults(filteredResults);
    } catch (error) {
      console.error("Error searching users:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddContact = async (contactId) => {
    try {
      const response = await fetchData(
        `${process.env.REACT_APP_API_URL}/api/user/add-contact/${userId}`,
        {
          method: "POST",
          body: JSON.stringify({ contactId }),
        }
      );

      const data = await response.json();
      console.log("Contact added successfully:", data);

      // Update user document with new contact list
      setUserDocument(data.user);

      // Remove the added user from search results
      setSearchResults((prev) => prev.filter((user) => user._id !== contactId));
    } catch (error) {
      console.error("Error adding contact:", error);
    }
  };

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
    console.log(
      "Sidebar - handleContactItemClick - Contact: ",
      contacts.find((contact) => contact._id === contactId)
    );
    // Check if there is an existing private chat with the contact
    const existingChat = chats.find(
      (chat) => {
        if (!chat.isGroup) {
          return (
            chat.participants.length === 2 &&
            chat.participants.some((p) => p._id === contactId) &&
            chat.participants.some((p) => p._id === userId)
          );
        } else {
          return false;
        }
      }
    );

    // If an existing chat is found, set it as the current chat
    if (existingChat) {
      console.log(
        "Sidebar - handleContactItemClick - Existing chat found:",
        existingChat
      );
      setCurrentChat(existingChat);
    } // If no existing chat, create a new temporary chat object
    else {
      console.log("Sidebar - handleContactItemClick - No existing chat found");
      const newChat = {
        _id: `temp-${contactId}${userId}`,
        title: "doesn't matter",
        participants: [userId, contactId],
        isGroup: false,
        chatImage: "default_profile_picture.jpeg",
      };
      setCurrentChat(newChat); // Set the new chat as the current chat
      console.log(
        "Sidebar - handleContactItemClick - New temporary chat created:",
        newChat
      );

      socket.send(
        JSON.stringify({
          type: "newChat",
          userId: userId,
          load: {
            chat: newChat,
          },
        })
      );
      console.log(
        "Sidebar - handleContactItemClick - Sent newChat event to server"
      );
    }
  };

  // sort chats by last message time
  const sortedChats = [...chats].sort((a, b) => {
    const aTime = new Date(a.lastMessage?.createdAt || 0);
    const bTime = new Date(b.lastMessage?.createdAt || 0);
    return bTime - aTime; // Sort in descending order
  });

  const handleCreateGroupClick = () => {
    console.log("Create Group button clicked");
    console.log("showGroupCreationForm state before:", showGroupCreationForm);
    setShowGroupCreationForm(true); // Show the group creation form
  };

  const handleCloseGroupCreationForm = () => {
    console.log("Closing group creation form");
    setShowGroupCreationForm(false); // Hide the group creation form
  };

  const handleSettingsClick = () => {
    console.log("Settings button clicked");
    setShowSettings(true);
  };

  const handleRemoveContact = (contactId) => {
    console.log("Removing contact with ID:", contactId);

    fetchData(
      `${process.env.REACT_APP_API_URL}/api/user/delete-contact/${userId}`,
      {
        method: "POST",
        body: JSON.stringify({ contactId }),
      }
    )
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        console.log("Contact removed successfully, data:", data);

        setUserDocument(data.user);
      })
      .catch((error) => {
        console.error("Error removing contact:", error);
      });
  };

  return (
    <div className="sidebar">
      <div className="sidebar_header">
        <Row>
          <Col lg={3} className="sidebar_header_image">
            <Image
              src={`${process.env.REACT_APP_API_URL}/uploads/profile-pictures/${
                userDocument?.profilePicture || "default.jpeg"
              }`}
              alt="User Profile"
              className="user-profile-image"
              roundedCircle
              onClick={handleSettingsClick} // Open settings on profile image click
              style={{ cursor: "pointer" }}
            />
          </Col>
          <Col lg={9} className="sidebar_header_title">
            <h2>{username ? username : "ERROR"}</h2>
            <p>{userDocument?.status || "No status available"}</p>
          </Col>
        </Row>
        <Row className="sidebar_header_buttons">
          <Col lg={12} className="sidebar_header_buttons">
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
          </Col>
        </Row>
      </div>

      {listState === "Chats" ? (
        <div className="items_list">
          {chats.length > 0 ? (
            sortedChats.map((chat) => (
              <Row
                key={chat._id}
                className={`chat_item ${
                  chat.lastMessage &&
                  !chat.lastMessage.seenBy?.includes(userId) &&
                  chat.lastMessage.author?._id !== userId
                    ? "unseen_item"
                    : ""
                }`}
                onClick={() => handleChatItemClick(chat._id)}
              >
                <Col lg={3} className="chat_item_image">
                  <Image
                    src={`${
                      process.env.REACT_APP_API_URL
                    }/uploads/profile-pictures/${
                      chat.isGroup
                        ? chat.chatImage || "default_group_picture.jpeg"
                        : chat.participants.find((p) => p._id !== userId)
                            ?.profilePicture || "default_profile_picture.jpeg"
                    }`}
                    alt="Chat"
                    className="chat-profile-image"
                    roundedCircle
                  />
                </Col>
                <Col lg={6} className="chat_item_text">
                  <h3>
                    {chat.isGroup
                      ? chat.title
                      : chat.participants.find((p) => p._id !== userId)
                          ?.username || "Unknown User"}
                    {chat.isTyping && (
                      <span className="typing-indicator">Typing...</span>
                    )}
                  </h3>
                  <p>{chat.lastMessage?.content || "No messages yet"}</p>
                </Col>
                <Col lg={3} className="chat_item_status">
                  <span className="chat_item_status_time">
                    {chat.lastMessage?.createdAt
                      ? new Date(chat.lastMessage.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })
                      : "N/A"}
                  </span>
                </Col>
              </Row>
            ))
          ) : (
            <p>No chats available</p>
          )}
        </div>
      ) : (
        <div className="items_list">
          <div className="contact_search">
            <InputGroup className="mb-3 contact_search">
              <Form.Control
                id="searchContactInput"
                type="text"
                placeholder="Search users to add..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    //handleSearchButtonClick();
                  }
                }}
              />
              
            </InputGroup>
          </div>

          {/* Search Results */}
          {searchQuery.trim().length > 0 && (
            <div className="search_results">
              <h5>Search Results:</h5>
              {isSearching ? (
                <p>Searching...</p>
              ) : searchResults.length > 0 ? (
                searchResults.map((user) => (
                  <Row key={user._id} className="search_result_item">
                    <Col lg={3} className="search_result_image">
                      <Image
                        src={`${process.env.REACT_APP_API_URL}/uploads/profile-pictures/${
                          user.profilePicture || "default.jpeg"
                        }`}
                        alt={user.username}
                        className="contact-profile-image"
                        roundedCircle
                      />
                    </Col>
                    <Col lg={6} className="search_result_text">
                      <h4>{user.username}</h4>
                      <p>{user.email}</p>
                    </Col>
                    <Col lg={3} className="search_result_action">
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleAddContact(user._id)}
                      >
                        Add
                      </Button>
                    </Col>
                  </Row>
                ))
              ) : (
                <p>No users found</p>
              )}
            </div>
          )}

          {/* Existing Contacts */}
          <div className="existing_contacts">
            {searchQuery.trim().length === 0 && <h5>Your Contacts:</h5>}
            {contacts.length > 0 ? (
              contacts.map((contact) => (
                <Row
                  key={contact._id}
                  className="contact_item"
                  onClick={() => handleContactItemClick(contact._id)}
                >
                  <Col lg={3} className="contact_item_image">
                    <Image
                      src={`${
                        process.env.REACT_APP_API_URL
                      }/uploads/profile-pictures/${
                        contact.profilePicture || "default.jpeg"
                      }`}
                      alt={contact.username}
                      className="contact-profile-image"
                      roundedCircle
                    />
                  </Col>
                  <Col lg={9} className="contact_item_text">
                    <h3>{contact.username || "Unknown User"}</h3>
                    <p>{contact.status || "No status available"}</p>
                  </Col>
                  {/* add a float button to the side of each contact to remove contact */}
                  <Col lg={1} className="contact_item_remove">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent the click from propagating to the Row
                        handleRemoveContact(contact._id);
                      }}
                    >
                      X
                    </Button>
                  </Col>
                </Row>
              ))
            ) : (
              <p>No contacts available</p>
            )}
          </div>
        </div>
      )}

      <div className="sidebar_footer">
        <Button
          className="create_group_button"
          onClick={handleCreateGroupClick}
        >
          Create Group
        </Button>
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
      {showSettings && (
        <Popup onClose={() => setShowSettings(false)}>
          <Settings
            userDocument={userDocument}
            setUserDocument={setUserDocument}
          />
        </Popup>
      )}
    </div>
  );
};

export default Sidebar;
{
  /**
                <div
                  key={chat._id}
                  className={`chat_item `}
                  onClick={() => handleChatItemClick(chat._id)}
                >
                  <div className="chat_item_content">
                    <Image
                      src={`${
                        process.env.REACT_APP_API_URL
                      }/uploads/profile-pictures/${
                        chat.isGroup
                          ? chat.chatImage || "default_group_picture.jpeg"
                          : chat.participants.find((p) => p._id !== userId)
                              ?.profilePicture || "default_profile_picture.jpeg"
                      }`}
                      alt="Chat"
                      className="chat-profile-image"
                      roundedCircle
                    />
                    <div className="chat_item_text">
                      <h3>
                        {chat.isGroup
                          ? chat.title
                          : chat.participants.find((p) => p._id !== userId)
                              ?.username || "Unknown User"}
                        {chat.isTyping && (
                          <span className="typing-indicator">Typing...</span>
                        )}
                      </h3>
                      <p>{chat.lastMessage?.content || "No messages yet"}</p>
                    </div>
                  </div>
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
                      {chat.lastMessage &&
                        (chat.lastMessage.author?._id === userId ||
                          chat.lastMessage.author === userId) && // Only show if last message is mine
                        (() => {
                          const seenBy = Array.isArray(chat.lastMessage.seenBy)
                            ? chat.lastMessage.seenBy.filter(
                                (id) => id !== userId
                              )
                            : [];
                          if (chat.isGroup) {
                            // Group chat: show "seen by x of y"
                            const totalMembers = chat.participants.length - 1; // exclude myself
                            return `Seen by ${seenBy.length} of ${totalMembers}`;
                          } else {
                            // Private chat: show "Seen" or "Not Seen"
                            return seenBy.length > 0 ? "Seen" : "Not Seen";
                          }
                        })()}
                    </span>
                  </div>
                </div>
              */
}
