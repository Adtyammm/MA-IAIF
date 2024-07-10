import React, { useCallback, useEffect, useState } from "react";
import { Button, Col, Container, Row, Spinner, Modal } from "react-bootstrap";
import Sidebar from "../../components/Sidebar";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { auth, db, storage } from "../../config/Firebase";
import { useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faInfo,
  faPenToSquare,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import ModalTambahBerita from "../../components/modals/ModalTambahBerita";
import ModalNewsPreview from "../../components/modals/ModalNewsPreview";
import ModalEditBerita from "../../components/modals/ModalEditBerita";
import { ref, deleteObject, getDownloadURL } from "firebase/storage";

const News = () => {
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [previewNews, setPreviewNews] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const [selectedNews, setSelectedNews] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const [newsToDelete, setNewsToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const navigate = useNavigate();

  const handleClose = () => setShowModal(false);
  const handleShow = () => setShowModal(true);

  const handleShowPreview = (news) => {
    setPreviewNews(news);
    setShowPreview(true);
  };

  const handleClosePreview = () => setShowPreview(false);

  const handleShowEditModal = (news) => {
    setSelectedNews(news);
    setShowEditModal(true);
  };

  const handleCloseEditModal = (news) => {
    setSelectedNews(news);
    setShowEditModal(false);
  };

  const handleShowDeleteModal = (news) => {
    setNewsToDelete(news);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => setShowDeleteModal(false);

  const confirmDelete = async () => {
    if (newsToDelete) {
      await handleDelete(newsToDelete.id, newsToDelete.image);
      handleCloseDeleteModal();
    }
  };

  const fetchNewsData = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "news"));
      if (querySnapshot && querySnapshot.docs) {
        const dataPromises = querySnapshot.docs.map(async (doc) => {
          const newsData = { id: doc.id, ...doc.data() };
          if (newsData.image) {
            const imageUrl = await getDownloadURL(
              ref(storage, `news/${newsData.image}`)
            );
            newsData.imageUrl = imageUrl;
          }
          return newsData;
        });

        const data = await Promise.all(dataPromises);
        setNews(data);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error fetching news data : ", error.message);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchNewsData();
      } else {
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [fetchNewsData, navigate]);

  const handleDelete = async (newsId, imageName) => {
    try {
      // Delete the avatar from storage if it exists
      if (imageName) {
        const imageRef = ref(storage, `news/${imageName}`);
        await deleteObject(imageRef).catch((error) => {
          console.error("Error deleting image: ", error.message);
        });
      }

      // Delete the user document from Firestore
      const userDoc = doc(db, "news", newsId);
      await deleteDoc(userDoc);

      // Update the users state to remove the deleted user
      setNews((prevNews) => prevNews.filter((news) => news.id !== newsId));
    } catch (error) {
      console.error("Error deleting user: ", error.message);
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
      name: "Penulis",
      selector: (row) => row.author,
    },
    {
      name: "Judul",
      selector: (row) => row.title,
      width: "45%",
    },
    {
      name: "Tanggal",
      selector: (row) => row.date,
      width: "10%",
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
          <Col md={10} style={{ paddingTop: "12px" }}>
            <div>
              <h2>News</h2>
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
              <h2>News</h2>
              <hr />
            </div>
            <Container fluid className="my-4">
              <div className="d-flex justify-content-between">
                <h4>List News</h4>
                <Button onClick={handleShow}>Tambah Berita</Button>
                <ModalTambahBerita show={showModal} handleClose={handleClose} />
              </div>
              <DataTable striped pagination columns={columns} data={news} />
            </Container>
          </Col>
        </Row>
      </Container>

      {previewNews && (
        <ModalNewsPreview
          show={showPreview}
          handleClose={handleClosePreview}
          newsData={previewNews}
        />
      )}

      {selectedNews && (
        <ModalEditBerita
          show={showEditModal}
          handleClose={handleCloseEditModal}
          newsData={selectedNews}
        />
      )}

      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this news?</Modal.Body>
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

export default News;
