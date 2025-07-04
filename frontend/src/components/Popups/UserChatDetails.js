import React, { useState, useEffect } from "react";
import { Image } from "react-bootstrap";
import "../../styles/UserChatDetails.css";
import { fetchData } from "../../fetcher";

const UserChatDetails = ({ currentChat }) => {
  const userId = localStorage.getItem("user-id");
  const [user, setUser] = useState({});

  // Add safety check for participants array
  const contactId = currentChat?.participants?.filter(
    (participant) => participant._id !== userId
  )[0]?._id;

  // Fetch contact basic information
  useEffect(() => {
    // Only fetch if contactId exists
    if (!contactId) return;

    fetchData(
      `${process.env.REACT_APP_API_URL}/api/user/contact_basic/${contactId}`,
      "GET"
    )
      .then((data) => {
        if (data.ok) {
          return data.json();
        }
      })
      .then((userData) => {
        console.log("User data fetched:", userData.contact);
        setUser(userData.contact);
      })
      .catch((error) => {
        console.error("Error fetching user details:", error);
      });
  }, [contactId]);

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
                user.profilePicture || "default_profile_picture.jpeg"
              }`}
              alt="User"
            />
          </div>

          <div className="user_basic_info">
            <h3>{user?.username || "Unknown User"}</h3>
            <p className="user_status">
              <strong>Status:</strong> {user?.status || "No status available"}
            </p>
            <p className="user_last_seen">
              <strong>Last seen:</strong>{" "}
              {currentChat.lastSeen
                ? new Date(currentChat.lastSeen).toLocaleString()
                : "Unknown"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserChatDetails;
