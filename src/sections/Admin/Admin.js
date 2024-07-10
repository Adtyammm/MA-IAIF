import React, { useCallback, useEffect, useState } from "react";
import { Button, Col, Container, Modal, Row, Spinner } from "react-bootstrap";
import Sidebar from "../../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { auth, db } from "../../config/Firebase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faTrash } from "@fortawesome/free-solid-svg-icons";
import DataTable from "react-data-table-component";
import ModalTambahAdmin from "../../components/modals/ModalTambahAdmin";
import ModalEditAdmin from "../../components/modals/ModalEditAdmin";

const Admin = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [adminData, setAdminData] = useState([]);

  const [showPasswords, setShowPasswords] = useState({});

  const navigate = useNavigate();

  const [adminToDelete, setAdminToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);

  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const fetchAdminData = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "admin"));
      if (querySnapshot && querySnapshot.docs) {
        const dataPromises = querySnapshot.docs.map(async (doc) => {
          const adminData = { id: doc.id, ...doc.data() };
          return adminData;
        });
        const data = await Promise.all(dataPromises);
        setAdminData(data);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error fetching admin data : ", error.message);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchAdminData();
      } else {
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [fetchAdminData, navigate]);

  const togglePasswordVisibility = (id) => {
    setShowPasswords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleShowDeleteModal = (admin) => {
    setAdminToDelete(admin);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => setShowDeleteModal(false);

  const handleDelete = async (adminId) => {
    try {
        setIsLoading(true);
        const docRef = doc(db, "admin", adminId);
        await deleteDoc(docRef);
        await fetchAdminData();
    } catch (error) {
        console.error("Error deleting admin: ", error.message);
    } finally {
        setIsLoading(false);
    }
  }

  const confirmDelete = async () => {
    if (adminToDelete) {
        await handleDelete(adminToDelete.id);
        handleCloseDeleteModal();
    }
  };

  const handleShowAddModal = () => setShowAddModal(true);
  const handleCloseAddModal = () => {
    fetchAdminData();
    setShowAddModal(false);
  }

  const handleShowEditModal = (admin) => {
    setSelectedAdmin(admin);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    fetchAdminData();
    setShowEditModal(false);
  }

  const columns = [
    {
      name: "No",
      selector: (row, index) => index + 1,
      sortable: true,
      width: "5%",
    },
    {
      name: "Email",
      selector: (row) => row.email,
    },
    {
      name: "Kata Sandi",
      selector: (row) => 
        row.password ? (
          <p onClick={() => togglePasswordVisibility(row.id)} style={{ cursor: 'pointer' }}>
            {showPasswords[row.id] ? row.password : '*'.repeat(row.password.length)}
          </p>
        ) : (
          "No Password"
        ),
    },
    {
      name: "Aksi",
      cell: (row) => (
        <div>
          <Button variant="success" onClick={() => handleShowEditModal(row)}>
            <FontAwesomeIcon icon={faPenToSquare} />
          </Button>
          <Button variant="danger" className="mx-2" onClick={() => handleShowDeleteModal(row)}>
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
              <h2>Admin</h2>
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
              <h2>Admin</h2>
              <hr />
            </div>
            <Container fluid className="my-4">
              <div className="d-flex justify-content-between">
                <h4>List Admin</h4>
                <Button onClick={handleShowAddModal}>Tambah Admin</Button>
              </div>
              <DataTable
                striped
                pagination
                data={adminData}
                columns={columns}
              />
            </Container>
          </Col>
        </Row>
      </Container>

      {/* Add Modal */}
      <ModalTambahAdmin
        show={showAddModal}
        handleClose={handleCloseAddModal}
      />

      {/* Edit Modal */}
      <ModalEditAdmin
        show={showEditModal}
        handleClose={handleCloseEditModal}
        adminData={selectedAdmin} />

      {/* Delete Modal */}
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

export default Admin;
