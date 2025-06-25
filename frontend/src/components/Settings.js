import React, { useState } from "react";
import { Button, Form } from "react-bootstrap";
import "../styles/Settings.css";
import { fetchData } from "../fetcher";

const Settings = ({ username }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const userId = localStorage.getItem("user-id");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type and size
      const validTypes = ["image/jpeg", "image/png", "image/gif"];
      if (!validTypes.includes(file.type)) {
        alert("Please select a valid image file (JPEG, PNG, or GIF)");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        alert("File size should be less than 5MB");
        return;
      }
      setSelectedImage(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedImage) {
      alert("Please select an image first");
      return;
    }

    const formData = new FormData();
    formData.append("profilePicture", selectedImage);

    try {
      const response = await fetchData(
        `${process.env.REACT_APP_API_URL}/api/user/profile-picture/${userId}`,
        {
          method: "POST",
          body: formData,
        }
      );
      if (!response.ok) {
        throw new Error("Failed to upload image");
      }
      const data = await response.json();
      console.log("Image uploaded successfully:", data);
      alert("Profile picture updated successfully");
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload profile picture. Please try again.");
    }
    setSelectedImage(null); // Clear the selected image after upload
    document.querySelector("#profileImage").value = ""; // Reset the file input
  };

  return (
    <div className="settings_form">
      <h2>Settings</h2>
      <div className="settings_content">
        <Form.Group controlId="profileImage">
          <Form.Label>Profile Image</Form.Label>
          <Form.Control
            type="file"
            accept="image/jpeg,image/png,image/gif"
            onChange={handleImageChange}
          />
          <Form.Text className="text-muted">
            Maximum file size: 5MB. Supported formats: JPEG, PNG, GIF
          </Form.Text>
        </Form.Group>
        {selectedImage && (
          <div className="image_preview">
            <img
              src={URL.createObjectURL(selectedImage)}
              alt="Preview"
              style={{
                width: "100px",
                height: "100px",
                objectFit: "cover",
                borderRadius: "50%",
              }}
            />
          </div>
        )}
        <Button
          variant="primary"
          onClick={handleUpload}
          disabled={!selectedImage}
        >
          Upload Profile Picture
        </Button>
      </div>
    </div>
  );
};

export default Settings;
