import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import {
  Button,
  Col,
  Container,
  Row,
  Spinner,
  Modal,
  Form,
} from "react-bootstrap";
import { auth, db } from "../../config/Firebase";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import {
  getDocs,
  collection,
  addDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import ModalEditBidang from "../../components/modals/ModalEditBidang";

const Organisasi = () => {
  const [usersjabatan, setUsersJabatan] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addBidangModal, setAddBidangModal] = useState(false);
  const [newBidang, setNewBidang] = useState("");
  const [pengurus, setPengurus] = useState([
    { nama_pengurus: "", jabatan_pengurus: "" },
  ]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bidangToDelete, setBidangToDelete] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [bidangToEdit, setBidangToEdit] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchUsersJabatan();
      } else {
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const fetchUsersJabatan = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "jabatan"));
      if (querySnapshot && querySnapshot.docs) {
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsersJabatan(data);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error fetching users data: ", error.message);
      setIsLoading(false);
    }
  };

  const handleAddPengurus = () => {
    setPengurus([...pengurus, { nama_pengurus: "", jabatan_pengurus: "" }]);
  };

  const handleRemovePengurus = (index) => {
    const newPengurus = pengurus.filter((_, i) => i !== index);
    setPengurus(newPengurus);
  };

  const handlePengurusChange = (index, field, value) => {
    const newPengurus = pengurus.map((pengurus, i) =>
      i === index ? { ...pengurus, [field]: value } : pengurus
    );
    setPengurus(newPengurus);
  };

  const handleAddBidang = async () => {
    if (newBidang.trim() === "") return;

    try {
      const docRef = await addDoc(collection(db, "jabatan"), {
        nama_bidang: newBidang,
        pengurus: pengurus.filter((p) => p.nama_pengurus && p.jabatan_pengurus),
      });
      setUsersJabatan([
        ...usersjabatan,
        { id: docRef.id, nama_bidang: newBidang, pengurus },
      ]);
      handleCloseAddBidangModal();
    } catch (error) {
      console.error("Error adding new bidang: ", error.message);
    }
  };

  const handleCloseAddBidangModal = () => {
    setAddBidangModal(false);
    setNewBidang("");
    setPengurus([{ nama_pengurus: "", jabatan_pengurus: "" }]);
  };

  const handleShowDeleteModal = (bidang) => {
    setBidangToDelete(bidang);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setBidangToDelete(null);
    setShowDeleteModal(false);
  };

  const handleDeleteBidang = async () => {
    if (!bidangToDelete) return;

    try {
      await deleteDoc(doc(db, "jabatan", bidangToDelete.id));
      setUsersJabatan(
        usersjabatan.filter((bidang) => bidang.id !== bidangToDelete.id)
      );
      setShowDeleteModal(false);
      setBidangToDelete(null);
    } catch (error) {
      console.error("Error deleting bidang: ", error.message);
    }
  };

  const handleShowEditModal = (bidang) => {
    setBidangToEdit(bidang);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setBidangToEdit(null);
    setShowEditModal(false);
  };

  const handleSaveEdit = (updatedBidang) => {
    setUsersJabatan(usersjabatan.map(b => b.id === updatedBidang.id ? updatedBidang : b));
    handleCloseEditModal();
  };

  const columns = [
    {
      name: "No.",
      selector: (row, index) => index + 1,
      sortable: true,
      width: "5%",
    },
    {
      name: "Nama Pengurus",
      selector: (row) => row.nama_pengurus,
      sortable: true,
    },
    {
      name: "Jabatan Pengurus",
      selector: (row) => row.jabatan_pengurus,
      sortable: true,
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
              <h2>Organisasi</h2>
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
                  <div className="d-flex justify-content-between">
                    <p>Total bidang : {usersjabatan.length}</p>
                    <Button onClick={() => setAddBidangModal(true)}>
                      Tambah Bidang
                    </Button>
                  </div>
                </Row>
                <Row className="mt-3 mb-4">
                  <h4>List Bidang :</h4>
                  {usersjabatan.map((bidang) => (
                    <div key={bidang.id}>
                      <Container fluid className="bg-dark-subtle py-2 w-100">
                        <Row className="align-items-center">
                          <Col>
                            <h4>{bidang.nama_bidang}</h4>
                          </Col>
                          <Col className="d-flex justify-content-end">
                            <Button
                              variant="success"
                              className="border"
                              style={{
                                borderTopRightRadius: "0",
                                borderBottomRightRadius: "0",
                              }}
                              onClick={() => handleShowEditModal(bidang)}
                            >
                              <FontAwesomeIcon icon={faPenToSquare} />
                            </Button>
                            <Button
                              variant="danger"
                              className="border"
                              style={{
                                borderTopLeftRadius: "0",
                                borderBottomLeftRadius: "0",
                              }}
                              onClick={() => handleShowDeleteModal(bidang)}
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </Button>
                          </Col>
                        </Row>
                      </Container>

                      <Col md={12}>
                        <DataTable
                          striped
                          columns={columns}
                          data={bidang.pengurus.map((p, i) => ({ ...p, no: i + 1 }))}
                        />
                      </Col>
                    </div>
                  ))}
                </Row>
              </>
            )}
            <hr />
          </Col>
        </Row>
      </Container>

      <Modal show={addBidangModal} onHide={handleCloseAddBidangModal}>
        <Modal.Header closeButton>
          <Modal.Title>Tambah Bidang</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formNamaBidang">
              <Form.Label>Nama Bidang</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter nama bidang"
                value={newBidang}
                onChange={(e) => setNewBidang(e.target.value)}
              />
            </Form.Group>
            {pengurus.map((p, index) => (
              <div key={index} className="mt-3">
                <Form.Group controlId={`formNamaPengurus${index}`}>
                  <Form.Label>Nama Pengurus {index + 1}</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter nama pengurus"
                    value={p.nama_pengurus}
                    onChange={(e) =>
                      handlePengurusChange(
                        index,
                        "nama_pengurus",
                        e.target.value
                      )
                    }
                  />
                </Form.Group>
                <Form.Group
                  controlId={`formJabatanPengurus${index}`}
                  className="mt-2"
                >
                  <Form.Label>Jabatan Pengurus {index + 1}</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter jabatan pengurus"
                    value={p.jabatan_pengurus}
                    onChange={(e) =>
                      handlePengurusChange(
                        index,
                        "jabatan_pengurus",
                        e.target.value
                      )
                    }
                  />
                </Form.Group>
                {index > 0 && (
                  <Button
                    variant="danger"
                    className="mt-2"
                    onClick={() => handleRemovePengurus(index)}
                  >
                    Remove Pengurus
                  </Button>
                )}
              </div>
            ))}
            <Button
              variant="secondary"
              className="mt-3"
              onClick={handleAddPengurus}
            >
              Add Pengurus
            </Button>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseAddBidangModal}>
            Close
          </Button>
          <Button variant="success" onClick={handleAddBidang}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Bidang</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the bidang :{" "}
          {bidangToDelete?.nama_bidang}?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteModal}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteBidang}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      {bidangToEdit && (
        <ModalEditBidang
          show={showEditModal}
          onHide={handleCloseEditModal}
          bidang={bidangToEdit}
          onSave={handleSaveEdit}
          handleClose={handleCloseEditModal}
        />
      )}
    </div>
  );
};

export default Organisasi;
