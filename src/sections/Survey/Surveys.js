import React, { useEffect, useState, useCallback } from "react";
import Sidebar from "../../components/Sidebar";
import { auth, db } from "../../config/Firebase";
import { useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import {
  Col,
  Container,
  Row,
  Spinner,
  Form,
  Button,
  Modal,
} from "react-bootstrap";
import DataTable from "react-data-table-component";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPenToSquare } from "@fortawesome/free-solid-svg-icons";

const Surveys = () => {
  const [surveyData, setSurveyData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newSurveyName, setNewSurveyName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchSurveys = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "surveys"));
      if (querySnapshot && querySnapshot.docs) {
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSurveyData(data);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error fetching surveys:", error.message);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchSurveys();
      } else {
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [fetchSurveys, navigate]);

  const handleAddSurvey = async () => {
    try {
      const newSurveyRef = await addDoc(collection(db, "surveys"), {
        name: newSurveyName,
        isActive: false,
      });

      setSurveyData([
        ...surveyData,
        { id: newSurveyRef.id, name: newSurveyName, isActive: false },
      ]);
      setNewSurveyName("");
      setShowModal(false);
    } catch (error) {
      console.error("Error adding survey:", error.message);
    }
  };

  const handleToggleStatus = async (row) => {
    try {
      const updatedSurveyData = surveyData.map((survey) => {
        if (survey.id === row.id) {
          return { ...survey, isActive: !survey.isActive };
        } else {
          return survey;
        }
      });

      setSurveyData(updatedSurveyData);

      const surveyDocRef = doc(db, "surveys", row.id);
      await updateDoc(surveyDocRef, {
        isActive: !row.isActive,
      });
    } catch (error) {
      console.error("Error toggling status:", error.message);
    }
  };

  const handleDeleteSurvey = async (row) => {
    const confirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus ${row.name} ?`
    );
    if (confirmed) {
      try {
        setIsDeleting(true);

        const surveyDocRef = doc(db, "surveys", row.id);
        await deleteDoc(surveyDocRef);

        const updatedSurveyData = surveyData.filter(
          (survey) => survey.id !== row.id
        );
        setSurveyData(updatedSurveyData);
      } catch (error) {
        console.error("Error deleting survey:", error.message);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleCloseAddModal = () => {
    setShowModal(false);
    setNewSurveyName("");
  };

  const columns = [
    { name: "No", selector: (row, index) => index + 1, width: "5%" },
    { name: "ID", selector: (row) => row.id, sortable: true },
    { name: "Nama", selector: (row) => row.name },
    {
      name: "Status",
      selector: "isActive",
      cell: (row) => (
        <Form.Check
          type="switch"
          id={`switch-${row.id}`}
          label={row.isActive ? "Aktif" : "Nonaktif"}
          checked={row.isActive}
          onChange={() => handleToggleStatus(row)}
        />
      ),
    },
    {
      name: "Aksi",
      cell: (row) => (
        <div className="d-flex justify-content-center">
          <Button
            variant="success"
            onClick={() => {
              navigate("/kelolasurvey/" + row.id);
            }}
          >
            <FontAwesomeIcon icon={faPenToSquare}/>
          </Button>
          <Button
            variant="danger"
            className="mx-2"
            onClick={() => handleDeleteSurvey(row)}
          >
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
              <h2>Kelola Survey</h2>
              <hr />
            </div>
            {isLoading || isDeleting ? (
              <div
                className="d-flex justify-content-center align-items-center"
                style={{ height: "100vh" }}
              >
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              </div>
            ) : (
              <DataTable
                striped
                columns={columns}
                data={surveyData}
                title= "List Survey"
                pagination
                subHeader
                subHeaderComponent={
                  <Button
                    variant="primary"
                    className="mt-2"
                    onClick={() => setShowModal(true)}
                  >
                    Tambah survey
                  </Button>
                }
              />
            )}
          </Col>
        </Row>
      </Container>

      {/* Modal tambah survey */}
      <Modal show={showModal} onHide={handleCloseAddModal}>
        <Modal.Header closeButton>
          <Modal.Title>Tambah Survey</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formSurveyName">
              <Form.Label>Nama Survey</Form.Label>
              <Form.Control
                type="text"
                placeholder="Masukkan nama survey"
                value={newSurveyName}
                onChange={(e) => setNewSurveyName(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseAddModal}>
            Batal
          </Button>
          <Button variant="primary" onClick={handleAddSurvey}>
            Simpan
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Surveys;
