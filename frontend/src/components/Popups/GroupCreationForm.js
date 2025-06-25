import React, { useState, useRef } from "react";
import { Card } from "react-bootstrap";
import "../../styles/GroupCreationForm.css";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

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
  const [selectedImage, setSelectedImage] = useState(null);
  const [groupName, setGroupName] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const fileInputRef = useRef();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ["image/jpeg", "image/png", "image/gif"];
      if (!validTypes.includes(file.type)) {
        alert("Please select a valid image file (JPEG, PNG, or GIF)");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("File size should be less than 5MB");
        return;
      }
      setSelectedImage(file);
    }
  };

  const handleContactClick = (contact) => {
    setSelectedContacts((prev) =>
      prev.includes(contact)
        ? prev.filter((c) => c !== contact)
        : [...prev, contact]
    );
  };

  const handleCreateGroup = () => {
    if (groupName.trim() === "") {
      alert("Group name cannot be empty");
      return;
    }
    if (selectedContacts.length === 0) {
      alert("Please select at least one contact to create a group");
      return;
    }

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

    // Reset form and close popup
    setGroupName("");
    setSelectedContacts([]);
    setSelectedImage(null);
    setCurrentSlide(0);
    document.querySelector(".popup").style.display = "none";
  };

  const nextSlide = () => setCurrentSlide(1);
  const prevSlide = () => setCurrentSlide(0);

  const canProceed = groupName.trim() !== "";
  const canCreate = selectedContacts.length > 0;

  return (
    <div className="group_creation_form">
      <div className="header">
        <h2>New Group</h2>
      </div>

      <div className="carousel_container">
        {/* Slide 1: Group Info */}
        {currentSlide === 0 && (
          <div className="slide group_info_slide">
            <div className="group_image_upload">
              <img
                src={
                  selectedImage
                    ? URL.createObjectURL(selectedImage)
                    : `${process.env.REACT_APP_API_URL}/uploads/profile-pictures/default_group_picture.jpeg`
                }
                alt="Group"
                className="group_image_preview"
                onClick={() => fileInputRef.current.click()}
              />
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                accept="image/jpeg,image/png,image/gif"
                onChange={handleImageChange}
              />
              <p className="image_hint">Click to change group photo</p>
            </div>

            <Form.Control
              type="text"
              placeholder="Enter group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="group_name_input"
            />
          </div>
        )}

        {/* Slide 2: Contact Selection */}
        {currentSlide === 1 && (
          <div className="slide participants_slide">
            <h3>Select Participants ({selectedContacts.length})</h3>
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
                    <Card.Text>{contact.status || "No status"}</Card.Text>
                  </Card.Body>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="navigation_buttons">
        {currentSlide === 0 && (
          <Button
            variant="primary"
            onClick={nextSlide}
            disabled={!canProceed}
            className="nav_button"
          >
            Next →
          </Button>
        )}

        {currentSlide === 1 && (
          <>
            <Button
              variant="outline-primary"
              onClick={prevSlide}
              className="nav_button"
            >
              ← Back
            </Button>
            <Button
              variant="success"
              onClick={handleCreateGroup}
              disabled={!canCreate}
              className="nav_button"
            >
              Create Group
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default GroupCreationForm;
