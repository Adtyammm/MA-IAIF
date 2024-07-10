import React, { useEffect, useState } from "react";
import { db, storage } from "../../config/Firebase";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { doc, updateDoc } from "firebase/firestore";
import { Modal, Button, Form } from "react-bootstrap";

const ModalEditGallery = ({ show, handleClose, galleryData }) => {
  const initialFormData = {
    title: "",
    date: "",
    image: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [imageUpload, setImageUpload] = useState(null);

  useEffect(() => {
    if (galleryData) {
      setFormData(galleryData);
      if (galleryData.image) {
        getDownloadURL(ref(storage, `gallery/${galleryData.image}`)).then(
          (url) => {
            setFormData((prevData) => ({ ...prevData, imageUrl: url }));
          }
        );
      }
    }
  }, [galleryData]);

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
        if (galleryData.image) {
          const oldImageRef = ref(storage, `gallery/${galleryData.image}`);
          await deleteObject(oldImageRef).catch((error) => {
            console.error("Error deleting old photo: ", error.message);
          });
        }

        // Upload the new avatar
        const imageRef = ref(storage, `gallery/${imageUpload.name}`);
        await uploadBytes(imageRef, imageUpload);
        imageName = imageUpload.name;
      }

      // Update the user data in Firestore
      const updatedUserData = {
        ...formData,
        image: imageName,
      };

      const userDoc = doc(db, "gallery", galleryData.id);
      await updateDoc(userDoc, updatedUserData);

      setFormData(initialFormData);
      setImageUpload(null);
      handleClose();
      window.location.reload();
    } catch (error) {
      console.error("Error updating gallery data: ", error.message);
    }
  };

  const handleModalClose = () => {
    setFormData(initialFormData);
    setImageUpload(null);
    handleClose();
  };

  return(
    <Modal show={show} onHide={handleModalClose} size="lg">
    <Modal.Header closeButton>
      <Modal.Title>Edit Berita</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <Form>
        <Form.Group controlId="formAuthor">
          <Form.Label>Judul</Form.Label>
          <Form.Control
            type="text"
            placeholder="Masukkan judul"
            name="title"
            value={formData.title}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group controlId="formTitle">
          <Form.Label>Tanggal</Form.Label>
          <Form.Control
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group controlId="formImage">
          <Form.Label>Foto</Form.Label>
          <Form.Control
            type="file"
            name="image"
            onChange={handleFileChange}
          />
          <p>Foto sebelumnya : </p>
          {formData.imageUrl || galleryData.image ?  (
            <img
              className="my-2"
              src={formData.imageUrl ? formData.imageUrl : galleryData.image}
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
  );
};

export default ModalEditGallery;
