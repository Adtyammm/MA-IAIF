import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { doc, updateDoc } from 'firebase/firestore';
import { db, storage } from '../../config/Firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import Alert from "../Alert";

const ModalEditAlumni = ({ show, handleClose, userData }) => {
  const initialFormData = {
    avatar: "",
    email: "",
    gender: "",
    graduated: "",
    name: "",
    nim: "",
    password: "",
    phone: "",
    yearClass: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [imageUpload, setImageUpload] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  useEffect(() => {
    if (userData) {
      setFormData(userData);
      if (userData.avatar) {
        getDownloadURL(ref(storage, `avatars/${userData.avatar}`)).then((url) => {
          setFormData((prevData) => ({ ...prevData, avatarUrl: url }));
        });
      }
    }
  }, [userData]);

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
      let avatarName = formData.avatar;

      // Check if a new image is uploaded
      if (imageUpload) {
        // Delete the old avatar from storage if it exists
        if (userData.avatar) {
          const oldImageRef = ref(storage, `avatars/${userData.avatar}`);
          await deleteObject(oldImageRef).catch((error) => {
            console.error("Error deleting old avatar: ", error.message);
          });
        }

        // Upload the new avatar
        const imageRef = ref(storage, `avatars/${imageUpload.name}`);
        await uploadBytes(imageRef, imageUpload);
        avatarName = imageUpload.name;
      }

      // Update the user data in Firestore
      const updatedUserData = {
        ...formData,
        avatar: avatarName,
      };

      const userDoc = doc(db, "users", userData.id);
      await updateDoc(userDoc, updatedUserData);

      setFormData(initialFormData);
      setImageUpload(null);
      setAlertMessage("User data updated successfully");
      setShowAlert(true);
      handleClose();
      window.location.reload();
    } catch (error) {
      setAlertMessage("Error updating user data: " + error.message);
      setShowAlert(true);
    }
  };

  const handleModalClose = () => {
    setFormData(initialFormData);
    setImageUpload(null);
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleModalClose}>
      <Modal.Header closeButton>
        <Modal.Title>Ubah Data Alumni</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
        <Form.Group controlId="formNim">
            <Form.Label>NIM</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter NIM"
              name="nim"
              value={formData.nim}
              onChange={handleChange}
            />
          </Form.Group>

        <Form.Group controlId="formName">
            <Form.Label>Nama</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter name"
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
              placeholder="Masukkan angkatan"
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

          <Form.Group controlId="formAvatar">
            <Form.Label>Foto</Form.Label>
            <Form.Control
              type="file"
              name="avatar"
              onChange={handleFileChange}
            />

            <p>Foto sebelumnya : </p>
            {formData.avatarUrl && (
              <img
                src={formData.avatarUrl}
                alt="Avatar"
                style={{ width: '50px', height: '50px', borderRadius: '50%' }}
              />
            )}
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

export default ModalEditAlumni;
