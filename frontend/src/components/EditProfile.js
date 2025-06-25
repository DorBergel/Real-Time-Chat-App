import React, { useState } from "react";
import { Button, Form } from "react-bootstrap";
import "../styles/EditProfile.css";
import { fetchData } from "../fetcher";

const Settings = ({ userDocument }) => {
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

  // Function to get the image source for preview
  const getImageSrc = () => {
    if (selectedImage && selectedImage instanceof File) {
      return URL.createObjectURL(selectedImage);
    }
    if (userDocument && userDocument.profilePicture) {
      return `${process.env.REACT_APP_API_URL}/uploads/profile-pictures/${userDocument.profilePicture}`;
    }
    return null;
  };

  const imagePreviewSrc = getImageSrc();

  return (
    <div className="edit_profile_form">
      <div className="edit_profile_header">
        <h2>Settings</h2>
      </div>
      <div className="edit_profile_content">
        <div className="section profile_image_section">
          {imagePreviewSrc && (
            <div className="image_preview">
              <img
                src={imagePreviewSrc}
                alt="Profile Preview"
                style={{
                  width: "100px",
                  height: "100px",
                  objectFit: "cover",
                  borderRadius: "50%",
                }}
              />
            </div>
          )}
          <Form.Group controlId="profileImage" style={{ marginTop: "15px" }}>
            <Form.Control
              type="file"
              accept="image/jpeg,image/png,image/gif"
              onChange={handleImageChange}
            />
            <Form.Text className="text-muted">
              Maximum file size: 5MB. Supported formats: JPEG, PNG, GIF
            </Form.Text>
          </Form.Group>

          <Button
            variant="primary"
            onClick={handleUpload}
            disabled={!selectedImage}
            style={{ marginTop: "15px" }}
          >
            Upload Profile Picture
          </Button>
        </div>
        <div className="section user_info_section">
          {/* 
          Here user can edit their information like first name, last name, username, email, status, etc.
          */}
          <Form>
            <Form.Group controlId="firstName">
              <Form.Label className="label">First Name</Form.Label>
              <Form.Control
                type="text"
                defaultValue={userDocument.first_name}
              />
            </Form.Group>
            <Form.Group controlId="lastName">
              <Form.Label className="label">Last Name</Form.Label>
              <Form.Control type="text" defaultValue={userDocument.last_name} />
            </Form.Group>
            <Form.Group controlId="username">
              <Form.Label className="label"> Username</Form.Label>
              <Form.Control type="text" defaultValue={userDocument.username} />
            </Form.Group>
            <Form.Group controlId="email">
              <Form.Label className="label">Email</Form.Label>
              <Form.Control type="email" defaultValue={userDocument.email} />
            </Form.Group>
            <Button variant="primary" type="submit">
              Save Changes
            </Button>
          </Form>
        </div>
        <div className="section user_password_section">
          {/*
          Here user can change their password.
          */}
          <Form>
            <Form.Group controlId="currentPassword">
              <Form.Label className="label">Current Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter current password"
              />
            </Form.Group>
            <Form.Group controlId="newPassword">
              <Form.Label className="label">New Password</Form.Label>
              <Form.Control type="password" placeholder="Enter new password" />
            </Form.Group>
            <Form.Group controlId="confirmPassword">
              <Form.Label className="label">Confirm New Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Confirm new password"
              />
            </Form.Group>
            <Button
              variant="primary"
              type="submit"
              style={{ marginTop: "15px" }}
            >
              Change Password
            </Button>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Settings;

/*

<div className="settings_form">
      <div className="settings_header">
        <h2>Settings</h2>
      </div>
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
*/
