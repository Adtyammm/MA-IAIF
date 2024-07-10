import React, { useState, useEffect, useMemo } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { addDoc, collection } from "firebase/firestore";
import { db, storage } from "../../config/Firebase";
import { ref, uploadBytes } from "firebase/storage";
import Alert from "../Alert";

const ModalTambahBerita = ({ show, handleClose }) => {
  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };
  
  const initialFormData = useMemo(
    () => ({
      author: "",
      title: "",
      date: formatDate(new Date()),
      content: "",
      image: "",
    }),
    []
  );

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
        image: e.target.files[0].name,
      });
    }
  };

  const handleSubmit = async () => {
    try {
      if (!imageUpload) {
        alert("Please upload an image.");
        return;
      }

      const imageRef = ref(storage, `news/${imageUpload.name}`);
      await uploadBytes(imageRef, imageUpload);

      const newNewsData = {
        ...formData,
        image: imageUpload.name,
      };

      await addDoc(collection(db, "news"), newNewsData);

      setFormData(initialFormData);
      setImageUpload(null);
      setAlertMessage("News data added successfully");
      setShowAlert(true);
      handleClose();
      window.location.reload();
    } catch (error) {
      setAlertMessage("Error adding news data: " + error.message);
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
    <Modal show={show} onHide={handleModalClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Tambah Berita</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="formAuthor">
            <Form.Label>Penulis</Form.Label>
            <Form.Control
              type="text"
              placeholder="Masukkan nama penulis"
              name="author"
              value={formData.author}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group controlId="formTitle">
            <Form.Label>Judul</Form.Label>
            <Form.Control
              type="text"
              placeholder="Masukkan judul"
              name="title"
              value={formData.title}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group controlId="formDate">
            <Form.Label>Konten</Form.Label>
            <Form.Control
              as="textarea"
              rows={10}
              type="text"
              placeholder="Tulis konten disini"
              name="content"
              value={formData.content}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group controlId="formPreview">
            <Form.Label>Gambar untuk headline</Form.Label>
            <Form.Control
              type="file"
              name="image"
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
      <Alert
        show={showAlert}
        handleClose={handleAlertClose}
        message={alertMessage}
        timeout={3000}
      />
    </Modal>
  );
};

export default ModalTambahBerita;
