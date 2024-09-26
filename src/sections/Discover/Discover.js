import {
  faInfo,
  faPenToSquare,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { deleteObject, getDownloadURL, ref } from "firebase/storage";
import React, { useCallback, useEffect, useState } from "react";
import { Button, Col, Container, Modal, Row, Spinner } from "react-bootstrap";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import ModalDiscoverPreview from "../../components/modals/ModalDiscoverPreview";
import ModalEditDiscover from "../../components/modals/ModalEditDiscover";
import ModalTambahDiscover from "../../components/modals/ModalTambahDiscover";
import Sidebar from "../../components/Sidebar";
import { auth, db, storage } from "../../config/Firebase";

const Discover = () => {
  const [discover, setDiscover] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [previewDiscover, setPreviewDiscover] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const [selectedDiscover, setSelectedDiscover] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const [discoverToDelete, setDiscoverToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const navigate = useNavigate();

  const handleClose = () => setShowModal(false);
  const handleShow = () => setShowModal(true);

  const handleShowPreview = (discover) => {
    setPreviewDiscover(discover);
    setShowPreview(true);
  };

  const handleClosePreview = () => setShowPreview(false);

  const handleShowEditModal = (discover) => {
    setSelectedDiscover(discover);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => setShowEditModal(false);

  const handleShowDeleteModal = (discover) => {
    setDiscoverToDelete(discover);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => setShowDeleteModal(false);

  const confirmDelete = async () => {
    if (discoverToDelete) {
      await handleDelete(discoverToDelete.id, discoverToDelete.image);
      handleCloseDeleteModal();
    }
  };

  const formatDate = (date) => {
    if (!date) return "";
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const fetchDiscoverData = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "discovery"));
      if (querySnapshot && querySnapshot.docs) {
        const dataPromises = querySnapshot.docs.map(async (doc) => {
          const discoverData = { id: doc.id, ...doc.data() };
          if (discoverData.image) {
            const imageUrl = await getDownloadURL(
              ref(storage, `discovery/${discoverData.image}`)
            );
            discoverData.imageUrl = imageUrl;
          }
          return discoverData;
        });

        const data = await Promise.all(dataPromises);
        setDiscover(data);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Gagal mengambil discover data : ", error.message);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchDiscoverData();
      } else {
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [fetchDiscoverData, navigate]);

  const handleDelete = async (discoverId, imageName) => {
    try {
      if (imageName) {
        const imageRef = ref(storage, `discovery/${imageName}`);
        await deleteObject(imageRef).catch((error) => {
          console.error("Error deleting image: ", error.message);
        });
      }

      const userDoc = doc(db, "discovery", discoverId);
      await deleteDoc(userDoc);

      setDiscover((prevDiscover) =>
        prevDiscover.filter((discover) => discover.id !== discoverId)
      );
    } catch (error) {
      console.error("Error deleting user: ", error.message);
    }
  };

  const handleUpdateStatus = async (discoverId, newStatus) => {
    try {
      const docRef = doc(db, "discovery", discoverId);
      await updateDoc(docRef, { status: newStatus });

      setDiscover((prevDiscover) =>
        prevDiscover.map((discover) =>
          discover.id === discoverId
            ? { ...discover, status: newStatus }
            : discover
        )
      );
    } catch (error) {
      console.error("Error updating status: ", error.message);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "pending":
        return { backgroundColor: "#ffc107", color: "white" };
      case "accept":
        return { backgroundColor: "#28a745", color: "white" };
      case "rejected":
        return { backgroundColor: "#dc3545", color: "white" };
      default:
        return { backgroundColor: "gray" };
    }
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
      width: "15%",
    },
    // {
    //   name: "Konten",
    //   selector: (row) => row.content,
    //   width: "15%",
    // },
    {
      name: "Status",
      cell: (row) => (
        <div
          style={{
            backgroundColor: getStatusStyle(row.status).backgroundColor,
            color: getStatusStyle(row.status).color,
            padding: "5px 10px",
            borderRadius: "5px",
            textAlign: "center",
          }}
        >
          {row.status}
        </div>
      ),
      width: "15%",
    },

    {
      name: "Tanggal",
      selector: (row) => (
        <p className="text-gray-500">{formatDate(row.createdAt.toDate())}</p>
      ),
      width: "15%",
    },
    {
      name: "Foto",
      selector: (row) =>
        row.imageUrl ? (
          <img
            className="my-2"
            src={row.imageUrl}
            alt="image_headline"
            style={{ width: "100px", height: "50px" }}
          />
        ) : (
          "No Image"
        ),
      width: "15%",
    },

    {
      name: "Status",
      cell: (row, index) => (
        <div>
          {row.status === "pending" && (
            <Button
              variant="info"
              className="m-1"
              onClick={() => handleUpdateStatus(row.id, "accept")}
            >
              Accept
            </Button>
          )}
          {row.status === "pending" && (
            <Button
              variant="warning"
              className="m-1"
              onClick={() => handleUpdateStatus(row.id, "rejected")}
            >
              Reject
            </Button>
          )}
        </div>
      ),
      width: "10%",
    },
    {
      name: "Pratinjau",
      cell: (row, index) => (
        <Button
          variant="primary"
          className="text-white"
          onClick={() => handleShowPreview(row)}
        >
          <FontAwesomeIcon icon={faInfo} />
        </Button>
      ),
      width: "7%",
    },
    {
      name: "Aksi",
      cell: (row, index) => (
        <div>
          <Button variant="success" onClick={() => handleShowEditModal(row)}>
            <FontAwesomeIcon icon={faPenToSquare} />
          </Button>
          <Button variant="danger" onClick={() => handleShowDeleteModal(row)}>
            <FontAwesomeIcon icon={faTrash} />
          </Button>
        </div>
      ),
      width: "10%",
    },
  ];

  if (isLoading) {
    return (
      <Container fluid>
        <Row>
          <Col md={2}>
            <Sidebar />
          </Col>
          <Col md={10} style={{ paddingTop: "12px" }}>
            <div>
              <h2>Discover</h2>
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
    <div style={{ fontFamily: "sans-serif" }}>
      <Container fluid>
        <Row>
          <Col md={2}>
            <Sidebar />
          </Col>
          <Col md={10} style={{ paddingTop: "12px" }}>
            <div>
              <h2>Discover</h2>
              <hr />
            </div>
            <Container fluid className="my-4">
              <div className="d-flex justify-content-between">
                <h4>List Discover</h4>
                <Button onClick={handleShow}>Tambah Discover</Button>
                <ModalTambahDiscover
                  show={showModal}
                  handleClose={handleClose}
                />
              </div>
              <DataTable striped pagination columns={columns} data={discover} />
            </Container>
          </Col>
        </Row>
      </Container>

      {previewDiscover && (
        <ModalDiscoverPreview
          show={showPreview}
          handleClose={handleClosePreview}
          discoverData={previewDiscover}
        />
      )}

      {selectedDiscover && (
        <ModalEditDiscover
          show={showEditModal}
          handleClose={handleCloseEditModal}
          discoverData={selectedDiscover}
        />
      )}

      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this discover?</Modal.Body>
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

export default Discover;
