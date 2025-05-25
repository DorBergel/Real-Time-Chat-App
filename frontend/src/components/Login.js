import "bootstrap/dist/css/bootstrap.min.css";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import '../styles/Login.css';


function Login() {

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.target; 
    const username = form.username.value;
    const password = form.password.value;

    console.log("Login.js - handle submit - Username:", username);
    console.log("Login.js - handle submit - Password:", password);

    console.log("Login.js - handle submit - API URL:", process.env.REACT_APP_API_URL);

    fetch(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        u_username: username,
        u_password: password
      })
    }).then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    }).then(data => {
      console.log('Login successful:', data);
      localStorage.setItem('access-token', data.accessToken); // Store the access token in local storage
      localStorage.setItem('refresh-token', data.refreshToken); // Store the refresh token in local storage
      localStorage.setItem('user-id', data.user._id); // Store the user ID in local storage
      
      window.location.href = '/main'; // Redirect to the main page
    }).catch(error => {
      console.error('There was a problem with the fetch operation:', error);
      alert("Login failed. Please check your username and password.");
    });
  };

  return (
    <div className="Login">
      <div className="Login-header">
        <h1 className="text-center">Login</h1>
        <p className="text-center">Please fill in the form below to log in.</p>
      </div>

      <div className="Login-form">
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={12}>
              <Form.Group className="mb-3" controlId="formUsername">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter your username"
                  name="username"
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <Form.Group className="mb-3" controlId="formPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Enter your password"
                  name="password"
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <Button
                variant="primary"
                type="submit"
                className="Login-button w-100"
              >
                Login
              </Button>
            </Col>
          </Row>
        </Form>
      </div>
      <div className="Login-footer text-center">
        <p>
          Don't have an account? <a href="/register">Register here</a>
        </p>
      </div>
    </div>
  );
}

export default Login;
