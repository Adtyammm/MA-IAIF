import { doc, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import React, { useEffect, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { db, storage } from "../../config/Firebase";
import Alert from "../Alert";

const ModalEditDiscover = ({ show, handleClose, discoverData }) => {
  const [formData, setFormData] = useState({
    title: discoverData.title || "",
    content: discoverData.content || "",
    closingContent: discoverData.closingContent || "",
    imageUrl: discoverData.imageUrl || "",
    secondImageUrl: discoverData.secondImageUrl || "",
    status: discoverData.status || "",
  });
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
      const docRef = doc(db, "discovery", discoverData.id);

      const uploadImage = async (image, name) => {
        const imageRef = ref(storage, `discovery/${docRef.id}/${image.name}`);
        await uploadBytes(imageRef, image);
        return getDownloadURL(imageRef);
      };

      if (imageUpload) {
        const imageUrl = await uploadImage(imageUpload, "image");
        formData.imageUrl = imageUrl;
      }

      if (secondImageUpload) {
        const secondImageUrl = await uploadImage(
          secondImageUpload,
          "secondImage"
        );
        formData.secondImageUrl = secondImageUrl;
      }

      await updateDoc(docRef, {
        title: formData.title,
        content: formData.content,
        closingContent: formData.closingContent,
        imageUrl: formData.imageUrl,
        secondImageUrl: formData.secondImageUrl,
        status: formData.status,
      });

      setAlertMessage("Berhasil edit Discover Data");
      setShowAlert(true);
      handleClose();
      window.location.reload();
    } catch (error) {
      setAlertMessage("Gagal Update Discover Data: " + error.message);
      setShowAlert(true);
    }
  };

  useEffect(() => {
    setFormData({
      title: discoverData.title || "",
      content: discoverData.content || "",
      closingContent: discoverData.closingContent || "",
      imageUrl: discoverData.imageUrl || "",
      secondImageUrl: discoverData.secondImageUrl || "",
      status: discoverData.status || "",
    });
  }, [discoverData]);

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Edit Discover</Modal.Title>
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
            <Form.Label>Edit Gambar Pertama </Form.Label>
            <Form.Control
              type="file"
              name="image"
              onChange={(e) => handleFileChange(e, setImageUpload)}
            />
          </Form.Group>

          <Form.Group controlId="formSecondImage">
            <Form.Label>Edit Gambar Kedua </Form.Label>
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

          <Form.Group controlId="formStatus">
            <Form.Label>Status</Form.Label>
            <Form.Control
              as="select"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="pending">Pending</option>
              <option value="accept">Accept</option>
              <option value="rejected">Rejected</option>
            </Form.Control>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Tutup
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Simpan Perubahan
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

export default ModalEditDiscover;
