import React, { useState, useEffect, useMemo } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { addDoc, collection } from 'firebase/firestore';
import { db, storage } from '../../config/Firebase';
import { ref, uploadBytes } from "firebase/storage";
import Alert from "../Alert";

const ModalTambahAlumni = ({ show, handleClose }) => {
  const initialFormData = useMemo(() => ({
    avatar: "",
    email: "",
    gender: "",
    graduated: "",
    name: "",
    nim: "",
    password: "",
    phone: "",
    yearClass: "",
  }), []);

  const [formData, setFormData] = useState(initialFormData);
  const [imageUpload, setImageUpload] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const handleAlertClose = () => setShowAlert(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setImageUpload(e.target.files[0]);
      setFormData({
        ...formData,
        avatar: e.target.files[0].name,
      });
    }
  };

  const handleSubmit = async () => {
    try {
      if (!imageUpload) {
        alert("Please upload an image.");
        return;
      }

      const imageRef = ref(storage, `avatars/${imageUpload.name}`);
      await uploadBytes(imageRef, imageUpload);

      const newUserData = {
        ...formData,
        avatar: imageUpload.name,
      };

      await addDoc(collection(db, "users"), newUserData);

      setFormData(initialFormData);
      setImageUpload(null);
      setAlertMessage("User data added successfully");
      setShowAlert(true);
      handleClose();
      window.location.reload();
    } catch (error) {
      setAlertMessage("Error adding users data: " + error.message);
      setShowAlert(true);
    }
  };

  const handleModalClose = () => {
    setFormData(initialFormData);
    setImageUpload(null);
    handleClose();
  };

  useEffect(() => {
    if (!show) {
      setFormData(initialFormData);
      setImageUpload(null);
    }
  }, [show, initialFormData]);

  return (
    <Modal show={show} onHide={handleModalClose}>
      <Modal.Header closeButton>
        <Modal.Title>Tambah Alumni</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="formNim">
            <Form.Label>NIM</Form.Label>
            <Form.Control
              type="text"
              placeholder="Masukkan NIM"
              name="nim"
              value={formData.nim}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group controlId="formName">
            <Form.Label>Nama</Form.Label>
            <Form.Control
              type="text"
              placeholder="Masukkan nama"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group controlId="formEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="Masukkan email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group controlId="formGender">
            <Form.Label>Jenis Kelamin</Form.Label>
            <Form.Control
              as="select"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
            >
              <option value="">Pilih jenis kelamin</option>
              <option value="Laki-Laki">Laki-Laki</option>
              <option value="Perempuan">Perempuan</option>
            </Form.Control>
          </Form.Group>

          <Form.Group controlId="formYearClass">
            <Form.Label>Angkatan</Form.Label>
            <Form.Control
              type="text"
              placeholder="Masukkan tahun angkatan"
              name="yearClass"
              value={formData.yearClass}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group controlId="formGraduated">
            <Form.Label>Tahun Lulus</Form.Label>
            <Form.Control
              type="text"
              placeholder="Masukkan tahun lulus"
              name="graduated"
              value={formData.graduated}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group controlId="formPhone">
            <Form.Label>Kontak</Form.Label>
            <Form.Control
              type="text"
              placeholder="Masukkan nomor telepon"
              name="phone"
              value={formData.phone}
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

          <Form.Group controlId="formAvatar">
            <Form.Label>Foto</Form.Label>
            <Form.Control
              type="file"
              name="avatar"
              onChange={handleFileChange}
            />
          </Form.Group>
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
      <Alert show={showAlert} handleClose={handleAlertClose} message={alertMessage} timeout={3000}/>
    </Modal>
  );
};

export default ModalTambahAlumni;
