import React from "react";

const GroupDetails = ({ currentChat }) => {
  return (
    <div className="group-details">
      <h2>Group Details</h2>
      <p>
        <strong>Group Name:</strong> {currentChat.title}
      </p>
      <p>
        <strong>Participants:</strong>
      </p>
      <ul>
        {currentChat.participants.map((participant) => (
          <li key={participant._id}>{participant.username}</li>
        ))}
      </ul>
      <p>
        <strong>Created At:</strong>{" "}
        {new Date(currentChat.createdAt).toLocaleString()}
      </p>
    </div>
  );
};

export default GroupDetails;
