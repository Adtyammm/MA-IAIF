import React, { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { doc, updateDoc } from "firebase/firestore";
import { db, storage } from "../../config/Firebase";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import Alert from "../Alert";

const ModalEditBerita = ({ show, handleClose, newsData }) => {
  const initialFormData = {
    author: "",
    title: "",
    content: "",
    image: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [imageUpload, setImageUpload] = useState(null);

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  useEffect(() => {
    if (newsData) {
      setFormData(newsData);
      if (newsData.image) {
        getDownloadURL(ref(storage, `news/${newsData.image}`)).then((url) => {
          setFormData((prevData) => ({ ...prevData, imageUrl: url }));
        });
      }
    }
  }, [newsData]);

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
      let imageName = formData.image;

      // Check if a new image is uploaded
      if (imageUpload) {
        // Delete the old avatar from storage if it exists
        if (newsData.image) {
          const oldImageRef = ref(storage, `news/${newsData.image}`);
          await deleteObject(oldImageRef).catch((error) => {
            console.error("Error deleting old avatar: ", error.message);
          });
        }

        // Upload the new avatar
        const imageRef = ref(storage, `news/${imageUpload.name}`);
        await uploadBytes(imageRef, imageUpload);
        imageName = imageUpload.name;
      }

      // Update the user data in Firestore
      const updatedUserData = {
        ...formData,
        image: imageName,
      };

      const userDoc = doc(db, "news", newsData.id);
      await updateDoc(userDoc, updatedUserData);

      setFormData(initialFormData);
      setImageUpload(null);
      setAlertMessage("User data updated successfully");
      setShowAlert(true);
      handleClose();
      window.location.reload();
    } catch (error) {
      console.error("Error updating news data: ", error.message);
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
    <>
    <Modal show={show} onHide={handleModalClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Edit Berita</Modal.Title>
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

          <Form.Group controlId="formContent">
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

          <Form.Group controlId="formImage">
            <Form.Label>Gambar</Form.Label>
            <Form.Control
              type="file"
              name="image"
              onChange={handleFileChange}
            />
            <p>Gambar sebelumnya : </p>
            {formData.imageUrl || newsData.image ?  (
              <img
                className="my-2"
                src={formData.imageUrl ? formData.imageUrl : newsData.image}
                alt="image_prev"
                style={{ width: "50%", height: "auto"}}
              />
            ) : (
                <p>No image</p>
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
    </Modal>

    <Alert show={showAlert} handleClose={handleAlertClose} message={alertMessage} timeout={5000}/>
    </>
  );
};

export default ModalEditBerita;
