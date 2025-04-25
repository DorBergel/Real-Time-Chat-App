import "bootstrap/dist/css/bootstrap.min.css";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import "../styles/Login.css";
import { handleLoginSubmit } from "../services/api";

function Login() {
  return (
    <div className="Login">
      <div className="Login-header">
        <h1 className="text-center">Login</h1>
        <p className="text-center">Please fill in the form below to log in.</p>
      </div>

      <div className="Login-form">
        <Form onSubmit={handleLoginSubmit}>
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
