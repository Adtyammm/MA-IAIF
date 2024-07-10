import { doc, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { db } from "../../config/Firebase";
import { Alert, Button, Form, Modal } from "react-bootstrap";

const ModalEditAdmin = ({ show, handleClose, adminData }) => {
  const initialFormData = {
    email: "",
    password: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (adminData) {
      setFormData(adminData);
    }
  }, [adminData]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    if (formData.password !== confirmPassword) {
      setError("Password dan konfirmasi password tidak cocok");
      return;
    }
    try {
      const updatedAdminData = {
        ...formData,
      };

      const adminDoc = doc(db, "admin", adminData.id);
      await updateDoc(adminDoc, updatedAdminData);

      setFormData(initialFormData);
      handleClose();
    } catch (error) {
      console.error("Error updating admin data: ", error.message);
    }
  };

  const handleModalClose = () => {
    setFormData(initialFormData);
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleModalClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Edit Admin</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="formAuthor">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="text"
              placeholder="Masukkan email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group controlId="formTitle">
            <Form.Label>Kata Sandi</Form.Label>
            <Form.Control
              type="password"
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
        <Button variant="secondary" onClick={handleModalClose}>
          Tutup
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Simpan
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalEditAdmin;
