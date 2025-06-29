import React from "react";
import { Image } from "react-bootstrap";
import "../../styles/UserChatDetails.css";

const UserChatDetails = ({ currentChat }) => {
  const userId = localStorage.getItem("user-id");

  return (
    <div className="user_details_form">
      <div className="user_details_header">
        <h2>User Details</h2>
      </div>
      
      <div className="user_details_content">
        <div className="section user_info_section">
          <div className="user_image_display">
            <Image
              src={`${process.env.REACT_APP_API_URL}/uploads/profile-pictures/${
                currentChat.chatImage || "default_profile_picture.jpeg"
              }`}
              alt="User"
            />
          </div>
          
          <div className="user_basic_info">
            <h3>{currentChat.title}</h3>
            <p className="user_status">
              <strong>Status:</strong>{" "}
              {currentChat.status || "No status available"}
            </p>
            <p className="user_last_seen">
              <strong>Last seen:</strong>{" "}
              {currentChat.lastSeen 
                ? new Date(currentChat.lastSeen).toLocaleString()
                : "Unknown"
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserChatDetails;
