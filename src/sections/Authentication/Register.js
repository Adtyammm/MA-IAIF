import React, { useState } from "react";
import { Container, Col, Row, Form, Button } from "react-bootstrap";
import LogoIF from "../../assets/logo/logo_if.png";
import LogoUIN from "../../assets/logo/logo_uin.png";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../../config/Firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { addDoc, collection } from "firebase/firestore";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const registerUser = async (name, email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      if (user) {
        const userDocRef = collection(db, "admin");
        await addDoc(userDocRef, { uid: user.uid, name, email, password });
      }

      return user;
    } catch (error) {
      console.error("Gagal mendaftar:", error.message);
      throw error;
    }
  };

  const handleRegister = async () => {
    try {
      if (password !== confirmPassword) {
        console.error("Kata sandi tidak sesuai");
        return;
      }

      const user = await registerUser(name, email, password);

      if (user) {
        navigate("/login");
      }
    } catch (error) {
      console.error("Gagal mendaftar:", error.message);
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
              Register
            </Row>
            <Row>
              <Form>
                <Form.Group controlId="formName">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    placeholder="Masukkan nama"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </Form.Group>
                <Form.Group controlId="formEmail" className="mt-2">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="Masukkan email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Form.Group>
                <Form.Group controlId="formPassword" className="mt-2">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    placeholder="Masukkan password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </Form.Group>
                <Form.Group controlId="formConfirmPassword" className="mt-2">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    placeholder="Konfirmasi password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </Form.Group>
                <Button
                  variant="primary"
                  className="my-4 px-4"
                  onClick={handleRegister}
                >
                  Register
                </Button>
              </Form>
              <p>Already have an account ?</p>
              <Link to={"/login"}>Login</Link>
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

export default Register;
