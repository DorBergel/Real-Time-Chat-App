import React from "react";
import "../styles/Popup.css";

const Popup = ({ children, onClose }) => {
  return (
    <div className="popup">
      <div className="popup_content">
        {children}
        <button className="close_popup_button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default Popup;