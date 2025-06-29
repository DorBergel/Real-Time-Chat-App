import React from "react";
import { Image, Card } from "react-bootstrap";
import "../../styles/GroupDetails.css";

const GroupDetails = ({ currentChat }) => {
  const userId = localStorage.getItem("user-id");

  return (
    <div className="group_details_form">
      <div className="group_details_header">
        <h2>Group Details</h2>
      </div>
      
      <div className="group_details_content">
        <div className="section group_info_section">
          <div className="group_image_display">
            <Image
              src={`${process.env.REACT_APP_API_URL}/uploads/profile-pictures/${
                currentChat.chatImage || "default_group_picture.jpeg"
              }`}
              alt="Group"
            />
          </div>
          
          <div className="group_basic_info">
            <h3>{currentChat.title}</h3>
            <p className="group_created_date">
              <strong>Created:</strong>{" "}
              {currentChat.createdAt 
                ? new Date(currentChat.createdAt).toLocaleDateString()
                : "Unknown"
              }
            </p>
          </div>
        </div>

        <div className="section participants_section">
          <h4>Participants ({currentChat.participants?.length || 0})</h4>
          <div className="participants_list">
            {currentChat.participants?.length > 0 ? (
              currentChat.participants.map((participant) => (
                <Card key={participant._id} className="participant_item">
                  <Card.Body>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <Image
                        src={`${process.env.REACT_APP_API_URL}/uploads/profile-pictures/${
                          participant.profilePicture || "default_profile_picture.jpeg"
                        }`}
                        alt={participant.username}
                      />
                      <div>
                        <Card.Title>
                          {participant.username}
                          {participant._id === userId && " (You)"}
                        </Card.Title>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              ))
            ) : (
              <p>No participants found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupDetails;
