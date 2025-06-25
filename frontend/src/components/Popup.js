import React from "react";
import "../styles/Popup.css";

const Popup = ({ children, onClose }) => {
  return (
    <>
      <div className="popup_overlay"></div>
      <div className="popup">
        <button className="popup_close" onClick={onClose}>
          &times;
        </button>
        <div className="popup_content">{children}</div>
      </div>
    </>
  );
};

export default Popup;
