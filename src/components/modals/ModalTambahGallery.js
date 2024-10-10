import React, { useEffect, useMemo, useState } from "react";
import { db, storage } from "../../config/Firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { addDoc, collection } from "firebase/firestore";
import { Modal, Button, Form } from "react-bootstrap";

const ModalTambahGallery = ({ show, handleClose }) => {
  const initialFormData = useMemo(
    () => ({
      title: "",
      date: "",
      image: "",
      imageUrl: "",
    }),
    []
  );

  const [formData, setFormData] = useState(initialFormData);
  const [imageUpload, setImageUpload] = useState(null);

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

      // Upload image to Firebase Storage
      const imageRef = ref(storage, `gallery/${imageUpload.name}`);
      await uploadBytes(imageRef, imageUpload);

      // Get the download URL for the uploaded image
      const imageUrl = await getDownloadURL(imageRef);

      const newUserData = {
        ...formData,
        image: imageUpload.name,
        imageUrl: imageUrl, // Save the image URL to Firestore
      };

      // Save gallery data including the image URL to Firestore
      await addDoc(collection(db, "gallery"), newUserData);

      // Reset the form data and close the modal
      setFormData(initialFormData);
      setImageUpload(null);
      handleClose();
    } catch (error) {
      console.error("Error adding gallery data: ", error);
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
        <Modal.Title>Tambah Koleksi</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
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

          <Form.Group controlId="formDate" className="mt-3">
            <Form.Label>Tanggal</Form.Label>
            <Form.Control
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group controlId="formPreview" className="mt-3">
            <Form.Label>Foto</Form.Label>
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
    </Modal>
  );
};

export default ModalTambahGallery;
