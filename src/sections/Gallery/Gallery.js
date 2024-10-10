import React, { useCallback, useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import { Button, Col, Container, Modal, Row, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { auth, db, storage } from "../../config/Firebase";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { deleteObject, getDownloadURL, ref } from "firebase/storage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faTrash } from "@fortawesome/free-solid-svg-icons";
import DataTable from "react-data-table-component";
import ModalTambahGallery from "../../components/modals/ModalTambahGallery";
import ModalEditGallery from "../../components/modals/ModalEditGallery";

const Gallery = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [gallery, setGallery] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedGallery, setSelectedGallery] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [galleryToDelete, setGalleryToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const navigate = useNavigate();

  const fetchGalleryData = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "gallery"));
      if (querySnapshot && !querySnapshot.empty) {
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log("Gallery Data:", data); // Debugging untuk memeriksa data yang diambil
        setGallery(data);
      } else {
        console.warn("No data found in the gallery collection");
        setGallery([]); // Set ke array kosong jika tidak ada data
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching gallery data:", error.message);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchGalleryData();
      } else {
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [fetchGalleryData, navigate]);

  const handleShowAddModal = () => setShowAddModal(true);
  const handleCloseAddModal = () => {
    fetchGalleryData();
    setShowAddModal(false);
  };

  const handleShowEditModal = (gallery) => {
    setSelectedGallery(gallery);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => setShowEditModal(false);

  const handleShowDeleteModal = (gallery) => {
    setGalleryToDelete(gallery);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setGalleryToDelete(null);
  };

  const handleDelete = async (galleryId, imageName) => {
    try {
      setIsLoading(true);
      if (imageName) {
        const imageRef = ref(storage, `gallery/${imageName}`);
        await deleteObject(imageRef).catch((error) => {
          console.error("Error deleting old photo: ", error.message);
        });
      }

      const docRef = doc(db, "gallery", galleryId);
      await deleteDoc(docRef);
      await fetchGalleryData();
    } catch (error) {
      console.error("Error deleting gallery:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (galleryToDelete) {
      await handleDelete(galleryToDelete.id, galleryToDelete.image);
      handleCloseDeleteModal();
    }
  };

  const formatDate = (dateString) => {
    const [year, month, day] = dateString.split("-");
    return `${day}-${month}-${year}`;
  };

  const columns = [
    {
      name: "No",
      selector: (row, index) => index + 1,
      sortable: true,
      width: "5%",
    },
    {
      name: "Judul",
      selector: (row) => row.title,
    },
    {
      name: "Tanggal",
      selector: (row) => formatDate(row.date),
    },
    {
      name: "Foto",
      selector: (row) =>
        row.image ? (
          <img
            className="my-2"
            src={row.imageUrl}
            alt="photo_event"
            style={{ width: "200px", height: "100px" }}
          />
        ) : (
          "No Image"
        ),
    },
    {
      name: "Aksi",
      cell: (row) => (
        <div>
          <Button variant="success" onClick={() => handleShowEditModal(row)}>
            <FontAwesomeIcon icon={faPenToSquare} />
          </Button>
          <Button
            variant="danger"
            className="mx-2"
            onClick={() => handleShowDeleteModal(row)}
          >
            <FontAwesomeIcon icon={faTrash} />
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <Container fluid>
        <Row>
          <Col md={2}>
            <Sidebar />
          </Col>
          <Col md={10} style={{ paddingTop: "12px", fontFamily: "sans-serif" }}>
            <div>
              <h2>Gallery</h2>
              <hr />
            </div>
            <div
              className="d-flex justify-content-center align-items-center"
              style={{ height: "100vh" }}
            >
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <div>
      <Container fluid>
        <Row>
          <Col md={2}>
            <Sidebar />
          </Col>
          <Col md={10} style={{ paddingTop: "12px", fontFamily: "sans-serif" }}>
            <div>
              <h2>Gallery</h2>
              <hr />
            </div>
            <Container fluid className="my-4">
              <div className="d-flex justify-content-between">
                <h4>List Gallery</h4>
                <Button onClick={handleShowAddModal}>Tambah Koleksi</Button>
              </div>
              {gallery.length === 0 ? (
                <p className="text-center">Tidak ada data untuk ditampilkan.</p>
              ) : (
                <DataTable
                  striped
                  pagination
                  columns={columns}
                  data={gallery}
                />
              )}
            </Container>
          </Col>
        </Row>
      </Container>

      <ModalTambahGallery
        show={showAddModal}
        handleClose={handleCloseAddModal}
      />

      {selectedGallery && (
        <ModalEditGallery
          show={showEditModal}
          handleClose={handleCloseEditModal}
          galleryData={selectedGallery}
        />
      )}

      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this item?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteModal}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Gallery;
