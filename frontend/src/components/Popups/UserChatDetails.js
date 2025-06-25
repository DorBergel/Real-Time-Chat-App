import React from "react";

const UserChatDetails = ({ currentChat }) => {
  return (
    <div className="user-chat-details">
      <h2>User Details</h2>
      <p>
        <strong>Username:</strong> {currentChat.title}
      </p>
    </div>
  );
};

export default UserChatDetails;
