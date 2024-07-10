import React, { useState } from "react";
import { Container, Col, Row, Form, Button } from "react-bootstrap";
import LogoIF from "../../assets/logo/logo_if.png";
import LogoUIN from "../../assets/logo/logo_uin.png";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../../config/Firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getDocs, collection, where, query } from "firebase/firestore";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const adminCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const admin = adminCredential.user;

      if (admin) {
        const adminCollectionRef = collection(db, "admin");

        const adminDocRef = query(
          adminCollectionRef,
          where("uid", "==", admin.uid)
        );
        const adminDocSnapshot = await getDocs(adminDocRef);

        if (adminDocSnapshot.size > 0) {
          navigate("/dashboard");
        } else {
          alert("Data pengguna tidak ditemukan.");
        }
      }
    } catch (error) {
      console.error("Gagal login:", error.message);
    }
  };

  return (
    <div className="d-flex vh-100 justify-content-center align-items-center">
      <Container
        className="border rounded p-4 text-white"
        style={{
          maxWidth: "600px",
          backgroundColor: "#14213D",
          fontFamily: "sans-serif",
        }}
      >
        <Row>
          <Col xs={6}>
            <Row
              className="mb-3 justify-content-center fw-bold"
              style={{ fontSize: "28px" }}
            >
              Login
            </Row>
            <Row>
              <Form>
                <Form.Group controlId="formEmail" className="mt-2">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Form.Group>
                <Form.Group controlId="formPassword" className="mt-2">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </Form.Group>
                <Button variant="primary" className="my-4 px-4" onClick={handleLogin}>
                  Login
                </Button>
              </Form>
              <p>Don't have an account ?</p>
              <Link to={"/"}>Register</Link>
            </Row>
          </Col>
          <Col xs={6} className="border rounded bg-white">
            <Row style={{ height: "auto" }} className="mb-3 py-2">
              <img
                src={LogoIF}
                alt="logo_if"
                style={{ width: "100%", height: "auto" }}
              />
            </Row>
            <Row>
              <img
                src={LogoUIN}
                alt="logo_uin"
                style={{ width: "100%", height: "auto" }}
              />
            </Row>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Login;
