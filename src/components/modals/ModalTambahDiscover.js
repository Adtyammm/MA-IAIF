import { addDoc, collection, doc, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import React, { useEffect, useMemo, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { db, storage } from "../../config/Firebase";
import Alert from "../Alert";

const ModalTambahDiscover = ({ show, handleClose }) => {
  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const initialFormData = useMemo(
    () => ({
      title: "",
      content: "",
      date: formatDate(new Date()),
      closingContent: "",
      image: "",
      secondImage: "",
    }),
    []
  );

  const [formData, setFormData] = useState(initialFormData);
  const [imageUpload, setImageUpload] = useState(null);
  const [secondImageUpload, setSecondImageUpload] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const handleAlertClose = () => setShowAlert(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e, setImageFunc) => {
    if (e.target.files[0]) {
      setImageFunc(e.target.files[0]);
      setFormData((prevFormData) => ({
        ...prevFormData,
        [e.target.name]: e.target.files[0].name,
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      if (!imageUpload || !secondImageUpload) {
        alert("Masukkan 2 gambar");
        return;
      }

      const timestamp = new Date();
      const docRef = await addDoc(collection(db, "discovery"), {
        title: formData.title,
        content: formData.content,
        closingContent: formData.closingContent,
        imageUrl: "",
        secondImageUrl: "",
        createdAt: timestamp,
        status: "pending",
      });

      const uploadImage = async (image, name) => {
        const imageRef = ref(storage, `discovery/${docRef.id}/${image.name}`);
        await uploadBytes(imageRef, image);
        return getDownloadURL(imageRef);
      };

      const imageUrl = await uploadImage(imageUpload, "image");
      const secondImageUrl = await uploadImage(
        secondImageUpload,
        "secondImage"
      );

      await updateDoc(doc(db, "discovery", docRef.id), {
        imageUrl,
        secondImageUrl,
      });

      setFormData(initialFormData);
      setImageUpload(null);
      setSecondImageUpload(null);
      setAlertMessage("Berhasil tambaha data Discover");
      setShowAlert(true);
      handleClose();
      window.location.reload();
    } catch (error) {
      setAlertMessage("Gagal menambahkan data Discover: " + error.message);
      setShowAlert(true);
    }
  };

  const handleModalClose = () => {
    setFormData(initialFormData);
    setImageUpload(null);
    setSecondImageUpload(null);
    handleClose();
  };

  useEffect(() => {
    if (!show) {
      setFormData(initialFormData);
      setImageUpload(null);
      setSecondImageUpload(null);
    }
  }, [show, initialFormData]);

  return (
    <Modal show={show} onHide={handleModalClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Tambah Discover</Modal.Title>
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

          <Form.Group controlId="formContent">
            <Form.Label>Konten</Form.Label>
            <Form.Control
              as="textarea"
              rows={5}
              placeholder="Tulis konten disini"
              name="content"
              value={formData.content}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group controlId="formImage">
            <Form.Label>Gambar Pertama</Form.Label>
            <Form.Control
              type="file"
              name="image"
              onChange={(e) => handleFileChange(e, setImageUpload)}
            />
          </Form.Group>

          <Form.Group controlId="formSecondImage">
            <Form.Label>Gambar Kedua</Form.Label>
            <Form.Control
              type="file"
              name="secondImage"
              onChange={(e) => handleFileChange(e, setSecondImageUpload)}
            />
          </Form.Group>

          <Form.Group controlId="formClosingContent">
            <Form.Label>Penutup Konten</Form.Label>
            <Form.Control
              as="textarea"
              rows={5}
              placeholder="Tulis penutup konten disini"
              name="closingContent"
              value={formData.closingContent}
              onChange={handleChange}
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

export default ModalTambahDiscover;
