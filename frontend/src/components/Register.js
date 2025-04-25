import "bootstrap/dist/css/bootstrap.min.css";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import "../styles/Register.css";
import React from "react";
import { handleRegisterSubmit } from "../services/api";

function Register() {
  return (
    <div className="Register">
      <div className="Register-header">
        <h1 className="text-center">Register</h1>
        <p className="text-center">
          Please fill in the form below to create an account.
        </p>
      </div>

      <div className="Register-form">
        <Form onSubmit={handleRegisterSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="formFirstName">
                <Form.Label>First Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter your first name"
                  name="firstName"
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
                  minLength={8}
                  aria-describedby="passwordHelpBlock"
                  name="password"
                />
                <Form.Text id="passwordHelpBlock" muted>
                  Your password must be at least 8 characters long.
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <Form.Group className="mb-3" controlId="formBirthday">
                <Form.Label>Birthday</Form.Label>
                <Form.Control
                  type="date"
                  placeholder="Enter your birthday"
                  name="birthday"
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <Form.Check
                type="radio"
                id="termsAndConditions"
                label="I agree to the terms and conditions"
                required
              />
            </Col>
          </Row>
          <Row>
            <Col md={12} className="text-center">
              <Button
                variant="primary"
                type="submit"
                className="Register-button"
              >
                Register
              </Button>
            </Col>
          </Row>
        </Form>
      </div>

      <div className="Register-footer text-center">
        <p>
          Already have an account? <a href="/login">Login here</a>
        </p>
      </div>
    </div>
  );
}

export default Register;

/**
 
function Register() {
  return (
    <div className="Register">
      <div className="Register-header">
        <h1 className="text-center">Register</h1>
        <p className="text-center">Please fill in the form below to create an account.</p>
      </div>

      <div className='Register-form'>
        <Form>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="formFirstName">
                <Form.Label>First Name</Form.Label>
                <Form.Control type="text" placeholder="Enter your first name" />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="formLastName">
                <Form.Label>Last Name</Form.Label>
                <Form.Control type="text" placeholder="Enter your last name" />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <Form.Group className="mb-3" controlId="formUsername">
                <Form.Label>Username</Form.Label>
                <Form.Control type="text" placeholder="Enter your username" />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <Form.Group className="mb-3" controlId="formEmail">
                <Form.Label>Email</Form.Label>
                <Form.Control type="email" placeholder="Enter your email" />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <Form.Group className="mb-3" controlId="formPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control type="password" placeholder="Enter your password" />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <Form.Group className="mb-3" controlId="formBirthday">
                <Form.Label>Birthday</Form.Label>
                <Form.Control type="date" placeholder="Enter your birthday" />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={12}>
                <Form.Check 
                  type="radio" 
                  id="termsAndConditions" 
                  label="I agree to the terms and conditions" 
                  required 
                />
            </Col>
          </Row>
          <Row>
            <Col md={12} className="text-center">
              <Button variant="primary" type="submit" className='Register-button'>
                Register
              </Button>
            </Col>
          </Row>
        </Form>
      </div>

      <div className="Register-footer text-center">
        <p>Already have an account? <a href="/login">Login here</a></p>
      </div>
    </div>
  );
}

 */
