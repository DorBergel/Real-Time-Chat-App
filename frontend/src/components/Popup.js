import React from "react";
import "../styles/Popup.css";

const Popup = ({ children, onClose }) => {
  return (
    <div className="popup">
      <button className="popup_close" onClick={onClose}>
        &times; {/* Unicode for the "x" symbol */}
      </button>
      <div className="popup_content">{children}</div>
    </div>
  );
};

export default Popup;
