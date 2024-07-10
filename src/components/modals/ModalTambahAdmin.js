import { addDoc, collection } from "firebase/firestore";
import React, { useEffect, useMemo, useState } from "react";
import { Button, Form, Modal, Alert } from "react-bootstrap";
import { db } from "../../config/Firebase";

const ModalTambahAdmin = ({ show, handleClose }) => {
  const initialFormData = useMemo(
    () => ({
      email: "",
      password: "",
    }),
    []
  );

  const [formData, setFormData] = useState(initialFormData);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!show) {
      setFormData(initialFormData);
      setConfirmPassword("");
      setError("");
    }
  }, [show, initialFormData]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCloseModal = () => {
    setFormData(initialFormData);
    setConfirmPassword("");
    setError("");
    handleClose();
  };

  const handleSubmit = async () => {
    if (formData.password !== confirmPassword) {
      setError("Password dan konfirmasi password tidak cocok");
      return;
    }

    try {
      const newAdminData = {
        ...formData,
      };

      await addDoc(collection(db, "admin"), newAdminData);

      setFormData(initialFormData);
      setConfirmPassword("");
      setError("");
      handleClose();
    } catch (error) {
      console.error("Error adding admin: ", error.message);
      setError("Terjadi kesalahan saat menambahkan admin");
    }
  };

  return (
    <Modal show={show} onHide={handleCloseModal} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Tambah Admin</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="formEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="text"
              placeholder="Masukkan email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group controlId="formPassword">
            <Form.Label>Kata Sandi</Form.Label>
            <Form.Control
              type="password"
              placeholder="Masukkan kata sandi"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group controlId="formConfirmPassword">
            <Form.Label>Konfirmasi Kata Sandi</Form.Label>
            <Form.Control
              type="password"
              placeholder="Masukkan ulang kata sandi"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </Form.Group>

          {error && <Alert variant="danger">{error}</Alert>}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleCloseModal}>
          Tutup
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Simpan
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalTambahAdmin;
