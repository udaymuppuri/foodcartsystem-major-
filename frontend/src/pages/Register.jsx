import React, { useState } from "react";
import { Form, Button, Container, Row, Col, Card } from "react-bootstrap";
import "./Register.css";

export default function Register() {
  const [user, setUser] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setUser({ ...user, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://192.168.134.130:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Force role as "student"
        body: JSON.stringify({ ...user, role: "student" }),
      });

      const data = await res.json();
      alert(data.message);

      if (res.ok) window.location.href = "/login";
    } catch (err) {
      console.error(err);
      alert("Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-100">
      <Row className="w-100 justify-content-center">
        <Col xs={12} sm={10} md={8} lg={5}>
          <Card className="register-card shadow-sm p-4">
            <Card.Body>
              <h2 className="text-center mb-4 fw-bold">Student Register</h2>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter your full name"
                    name="name"
                    value={user.name}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter your email"
                    name="email"
                    value={user.email}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter your password"
                    name="password"
                    value={user.password}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                {/* Removed role dropdown */}

                <Button type="submit" className="w-100 btn-primary" disabled={loading}>
                  {loading ? "Registering..." : "Register"}
                </Button>

                <p className="text-center mt-3">
                  Already have an account? <a href="/login">Login</a>
                </p>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
