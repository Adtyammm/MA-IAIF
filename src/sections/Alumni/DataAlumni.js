import React, { useCallback, useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import { Container, Row, Col, Spinner, Button, Modal } from "react-bootstrap";
import { auth, db, storage } from "../../config/Firebase";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { ref, getDownloadURL, deleteObject } from "firebase/storage";
import DataTable from "react-data-table-component";
import ModalTambahAlumni from "../../components/modals/ModalTambahAlumni";
import ModalEditAlumni from "../../components/modals/ModalEditAlumni";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPenToSquare } from "@fortawesome/free-solid-svg-icons";

const DataAlumni = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModalEdit, setShowModalEdit] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const handleClose = () => setShowModal(false);
  const handleShow = () => setShowModal(true);
  const handleCloseEdit = () => setShowModalEdit(false);
  const handleShowEdit = (user) => {
    setSelectedUser(user);
    setShowModalEdit(true);
  };
  const handleCloseDeleteModal = () => setShowDeleteModal(false);
  const handleShowDeleteModal = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const fetchUsers = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      if (querySnapshot && querySnapshot.docs) {
        const dataPromises = querySnapshot.docs.map(async (doc) => {
          const userData = { id: doc.id, ...doc.data() };
          if (userData.avatar) {
            const avatarUrl = await getDownloadURL(ref(storage, `avatars/${userData.avatar}`));
            userData.avatarUrl = avatarUrl;
          }
          return userData;
        });

        const data = await Promise.all(dataPromises);
        setUsers(data);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error fetching users data: ", error.message);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchUsers();
      } else {
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [fetchUsers, navigate]);

  const handleDelete = async (userId, avatarName) => {
    try {
      // Delete the avatar from storage if it exists
      if (avatarName) {
        const avatarRef = ref(storage, `avatars/${avatarName}`);
        await deleteObject(avatarRef).catch((error) => {
          console.error("Error deleting avatar: ", error.message);
        });
      }

      // Delete the user document from Firestore
      const userDoc = doc(db, "users", userId);
      await deleteDoc(userDoc);

      // Update the users state to remove the deleted user
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
    } catch (error) {
      console.error("Error deleting user: ", error.message);
    }
  };

  const confirmDelete = async () => {
    if (userToDelete) {
      await handleDelete(userToDelete.id, userToDelete.avatar);
      handleCloseDeleteModal();
    }
  };

  const maleUsers = users.filter((user) => user.gender === "Laki-Laki").length;
  const femaleUsers = users.filter((user) => user.gender === "Perempuan").length;

  const data = users.map((item, index) => ({
    ...item,
    index: index + 1,
  }));


  const filteredItems = data.filter((item) => {
    const name = item.name ?? "";
    const email = item.email ?? "";
    const graduated = item.graduated ?? "";
    const nim = item.nim ?? "";
  
    return (
      name.toLowerCase().includes(searchText.toLowerCase()) ||
      email.toLowerCase().includes(searchText.toLowerCase()) ||
      graduated.includes(searchText) ||
      nim.includes(searchText)
    );
  });
  

  const columns = [
    {
      name: "No.",
      selector: (row, index) => index + 1,
      sortable: true,
      width: "5%",
    },
    {
      name: "NIM",
      selector: (row) => row.nim,
      sortable: true,
      width: "10%"
    },
    {
      name: "Nama",
      selector: (row) => row.name,
    },
    {
      name: "Jenis Kelamin",
      selector: (row) => row.gender,
      width: "10%"
    },
    {
      name: "Email",
      selector: (row) => row.email,
    },
    {
      name: "Kontak",
      selector: (row) => row.phone,
    },
    {
      name: "Angkatan",
      selector: (row) => row.yearClass,
      width: "10%",
    },
    {
      name: "Lulusan",
      selector: (row) => row.graduated,
      width: "5%",
    },
    {
      name: "Foto",
      selector: (row) => row.avatarUrl ? <img className="my-2" src={row.avatarUrl} alt="Avatar" style={{ width: '50px', height: '50px', borderRadius: '50%' }} /> : "No Avatar",
      width: "10%",
    },
    {
      name: "Action",
      cell: (row) => (
        <div>
          <Button variant="success" onClick={() => handleShowEdit(row)}><FontAwesomeIcon icon={faPenToSquare} /></Button>
          <Button variant="danger" className="mx-2" onClick={() => handleShowDeleteModal(row)}>
            <FontAwesomeIcon icon={faTrash} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Container fluid>
        <Row>
          <Col md={2}>
            <Sidebar />
          </Col>
          <Col md={10} style={{ paddingTop: "12px" }}>
            <div>
              <h2>Data Alumni</h2>
              <hr />
            </div>
            {isLoading ? (
              <div
                className="d-flex justify-content-center align-items-center"
                style={{ height: "100vh" }}
              >
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              </div>
            ) : (
              <>
                <Row>
                  <Col>Total alumni : {users.length}</Col>
                  <Col>Laki-laki : {maleUsers}</Col>
                  <Col>Perempuan : {femaleUsers}</Col>
                </Row>
                <Row>
                  <Col className="border rounded my-4 py-4">
                    <DataTable
                      responsive
                      striped
                      pagination
                      columns={columns}
                      data={filteredItems}
                      title="List Alumni"
                      highlightOnHover
                      subHeader
                      subHeaderComponent={
                        <Container fluid className="px-0">
                          <Row>
                            <Col md={8}>
                              <input
                                className="form-control"
                                type="text"
                                placeholder="🔍Search"
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                              />
                            </Col>
                            <Col md={4}>
                              <div>
                                <Button onClick={handleShow}>Tambah</Button>
                                <ModalTambahAlumni
                                  show={showModal}
                                  handleClose={handleClose}
                                />
                              </div>
                            </Col>
                          </Row>
                        </Container>
                      }
                    />
                  </Col>
                </Row>
              </>
            )}
          </Col>
        </Row>
      </Container>
      {selectedUser && (
        <ModalEditAlumni
          show={showModalEdit}
          handleClose={handleCloseEdit}
          userData={selectedUser}
        />
      )}
      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this user?</Modal.Body>
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

export default DataAlumni;
