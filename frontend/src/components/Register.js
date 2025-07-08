import "bootstrap/dist/css/bootstrap.min.css";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { useState } from "react";
import "../styles/Register.css";

function Register() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreviewSrc, setImagePreviewSrc] = useState(null);

  // Default profile image URL or base64
  const defaultProfileImage =
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRTVFN0VCIi8+CjxwYXRoIGQ9Ik01MCA1OEM1Ni42Mjc0IDU4IDYyIDUyLjYyNzQgNjIgNDZDNjIgMzkuMzcyNiA1Ni42Mjc0IDM0IDUwIDM0QzQzLjM3MjYgMzQgMzggMzkuMzcyNiAzOCA0NkMzOCA1Mi42Mjc0IDQzLjM3MjYgNTggNTAgNThaIiBmaWxsPSIjOUM5Q0E2Ii8+CjxwYXRoIGQ9Ik0yOCA3NkMyOCA2Ny43MTU3IDM0LjcxNTcgNjEgNDMgNjFINTdDNjUuMjg0MyA2MSA3MiA2Ny43MTU3IDcyIDc2VjgwSDI4Vjc2WiIgZmlsbD0iIzlDOUNBNiIvPgo8L3N2Zz4K";

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }

      // Validate file type
      const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
      if (!allowedTypes.includes(file.type)) {
        alert("Only JPEG, PNG, and GIF files are allowed");
        return;
      }

      setSelectedImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviewSrc(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.target;
    const firstName = form.firstName.value;
    const lastName = form.lastName.value;
    const username = form.username.value;
    const email = form.email.value;
    const birthday = form.birthday.value;
    const password = form.password.value;
    const confirmPassword = form.confirmPassword.value;
    const status = form.status.value;

    // Basic validation
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters long!");
      return;
    }

    // Create FormData for file upload
    const formData = new FormData();
    formData.append("u_firstname", firstName);
    formData.append("u_lastname", lastName);
    formData.append("u_username", username);
    formData.append("u_email", email);
    formData.append("u_birthday", birthday);
    formData.append("u_password", password);
    formData.append("u_status", status);

    const jsonPayload = {
      u_firstname: firstName,
      u_lastname: lastName,
      u_username: username,
      u_email: email,
      u_birthday: birthday,
      u_password: password,
      u_profilePicture: selectedImage ? selectedImage.name : null,
      u_status: status,
    };

    /*
    u_username,
    u_firstname,
    u_lastname,
    u_email,
    u_password,
    u_birthday,
    */

    if (selectedImage) {
      formData.append("profilePicture", selectedImage);
    }

    console.log("Register.js - handle submit - First Name:", firstName);
    console.log("Register.js - handle submit - Last Name:", lastName);
    console.log("Register.js - handle submit - Username:", username);
    console.log("Register.js - handle submit - Email:", email);
    console.log("Register.js - handle submit - Birthday:", birthday);
    console.log("Register.js - handle submit - Status:", status);
    console.log(
      "Register.js - handle submit - API URL:",
      process.env.REACT_APP_API_URL
    );

    fetch(`${process.env.REACT_APP_API_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(jsonPayload), // Don't set Content-Type header when using FormData
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Registration successful:", data);
        alert("Registration successful! Please log in.");
        window.location.href = "/"; // Redirect to login page
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
        alert("Registration failed. Please try again.");
      });
  };

  return (
    <div className="Register">
      <div className="Register-header">
        <h1 className="text-center">Register</h1>
        <p className="text-center">
          Please fill in the form below to create an account.
        </p>
      </div>
      <Form onSubmit={handleSubmit} className="Register-form">
        <Row>
          <Col md={12} lg={6} className="left-column">
            {/* Here I want the user details */}
            <div className="form-part-a">
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="formFirstName">
                    <Form.Label>First Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter your first name"
                      name="firstName"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="formLastName">
                    <Form.Label>Last Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter your last name"
                      name="lastName"
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={12}>
                  <Form.Group className="mb-3" controlId="formUsername">
                    <Form.Label>Username</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter your username"
                      name="username"
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={12}>
                  <Form.Group className="mb-3" controlId="formEmail">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Enter your email"
                      name="email"
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={12}>
                  <Form.Group className="mb-3" controlId="formBirthday">
                    <Form.Label>Birthday</Form.Label>
                    <Form.Control type="date" name="birthday" required />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="formPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Enter your password"
                      name="password"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="formConfirmPassword">
                    <Form.Label>Confirm</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Confirm your password"
                      name="confirmPassword"
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
            </div>
          </Col>
          <Col md={12} lg={6} className="right-column">
            {/* Here I want user image and status */}
            <div className="form-part-b">
              <Row>
                <Col md={12}>
                  <div className="profile_image_section">
                    <div className="image_preview text-center mb-3">
                      <img
                        src={imagePreviewSrc || defaultProfileImage}
                        alt="Profile Preview"
                        style={{
                          width: "100px",
                          height: "100px",
                          objectFit: "cover",
                          borderRadius: "50%",
                          border: "2px solid #dee2e6",
                          backgroundColor: "#f8f9fa",
                        }}
                      />
                    </div>
                    <Form.Group className="mb-3" controlId="formProfilePicture">
                      <Form.Control
                        type="file"
                        accept="image/jpeg,image/png,image/gif"
                        onChange={handleImageChange}
                        name="profilePicture"
                      />
                      <Form.Text className="text-muted">
                        Maximum file size: 5MB. Supported formats: JPEG, PNG,
                        GIF
                      </Form.Text>
                    </Form.Group>
                  </div>
                </Col>
              </Row>
              <Row>
                <Col md={12}>
                  <Form.Group className="mb-3" controlId="formStatus">
                    <Form.Label>Status</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter your status"
                      name="status"
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={12}>
                  <Button
                    variant="primary"
                    type="submit"
                    className="Register-button w-100"
                  >
                    Register
                  </Button>
                </Col>
              </Row>
            </div>
          </Col>
        </Row>
      </Form>
      <div className="Register-footer text-center">
        <p>
          Already have an account? <a href="/">Login here</a>
        </p>
      </div>
    </div>
  );
}

export default Register;
