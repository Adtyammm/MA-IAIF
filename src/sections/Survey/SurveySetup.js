import React, { useEffect, useState } from "react";
import { db } from "../../config/Firebase";
import { useParams, Link } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import {
  Container,
  Form,
  FormLabel,
  Spinner,
  Button,
  Modal,
  Row,
  Col,
} from "react-bootstrap";
import Sidebar from "../../components/Sidebar";
import DataTable from "react-data-table-component";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPenToSquare } from "@fortawesome/free-solid-svg-icons";

const SurveySetup = () => {
  const { id_survey } = useParams();
  const [surveyData, setSurveyData] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [editedSurveyName, setEditedSurveyName] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [newOptions, setNewOptions] = useState([]);
  const [newOption, setNewOption] = useState("");

  const [showEditQuestionModal, setShowEditQuestionModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [editedQuestion, setEditedQuestion] = useState("");
  const [editedOptions, setEditedOptions] = useState([]);

  useEffect(() => {
    const fetchSurveyData = async () => {
      try {
        const surveyDocRef = doc(db, "surveys", id_survey);
        const surveyDocSnapshot = await getDoc(surveyDocRef);

        if (surveyDocSnapshot.exists()) {
          const surveyData = surveyDocSnapshot.data();
          setSurveyData(surveyData);
          setEditedSurveyName(surveyData.name)
          setIsLoading(false);
        } else {
          console.error("Dokumen survey tidak ditemukan.");
        }
      } catch (error) {
        console.error("Error fetching survey data:", error.message);
      }
    };

    fetchSurveyData();
  }, [id_survey]);

  if (isLoading) {
    return (
      <Container fluid>
        <Row>
          <Col md={2}>
            <Sidebar />
          </Col>
          <Col md={10} style={{ paddingTop: "12px" }}>
            <div className="d-flex justify-content-between">
              <Link to={"/kelolasurvey"} className="btn btn-secondary">
                Back
              </Link>
              <h4>Pengaturan Survey</h4>
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

  if (surveyData.questions && Array.isArray(surveyData.questions)) {
    console.log("Isi questions:");
    surveyData.questions.forEach((item, index) => {
      console.log(`Pertanyaan ${index + 1}: ${item.question}`);
      console.log(`Opsi: ${item.options.join(", ")}`);
    });
  } else {
    console.log("Tidak ada pertanyaan yang ditemukan.");
  }

  const handleStatusChange = async () => {
    try {
      setIsUpdatingStatus(true);

      const surveyDocRef = doc(db, "surveys", id_survey);
      await updateDoc(surveyDocRef, {
        isActive: !surveyData.isActive,
      });

      setSurveyData((prevData) => ({
        ...prevData,
        isActive: !prevData.isActive,
      }));
    } catch (error) {
      console.error("Error updating survey status:", error.message);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleSaveChanges = async () => {
    try {
      const surveyDocRef = doc(db, "surveys", id_survey);
      await updateDoc(surveyDocRef, {
        name: editedSurveyName,
        questions: surveyData.questions,
      });

      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
      }, 3000);
    } catch (error) {
      console.error("Error saving survey changes:", error.message);
    }
  };

  const handleShowAddQuestionModal = () => {
    setShowAddQuestionModal(true);
  };

  const handleCloseAddQuestionModal = () => {
    setNewQuestion("");
    setNewOptions([]);
    setNewOption("");
    setShowAddQuestionModal(false);
  };

  const handleAddQuestion = async () => {
    if (newQuestion.trim() !== "") {
      const newQuestionObj = {
        question: newQuestion.trim(),
        options: newOptions.filter((option) => option.trim() !== ""),
      };

      setSurveyData((prevData) => ({
        ...prevData,
        questions: [...(prevData.questions || []), newQuestionObj],
      }));

      setNewQuestion("");
      setNewOptions([]);
      setNewOption("");

      handleCloseAddQuestionModal();
    }
  };

  const handleAddOption = () => {
    if (newOption.trim() !== "") {
      setNewOptions((prevOptions) => [...prevOptions, newOption.trim()]);

      setNewOption("");
    }
  };

  const handleRemoveOption = (index) => {
    setNewOptions((prevOptions) => prevOptions.filter((_, i) => i !== index));
  };

  const handleDeleteQuestion = (index) => {
    const updatedQuestions = [...surveyData.questions];

    updatedQuestions.splice(index, 1);

    setSurveyData((prevData) => ({
      ...prevData,
      questions: updatedQuestions,
    }));
  };

  const handleEditQuestion = (question) => {
    setSelectedQuestion(question);
    setEditedQuestion(question.question);
    setEditedOptions(question.options || []);
    setShowEditQuestionModal(true);
  };

  const handleEditQuestionChange = (value) => {
    setEditedQuestion(value);
  };

  const handleRemoveEditedOption = (index) => {
    setEditedOptions((prevOptions) =>
      prevOptions.filter((_, i) => i !== index)
    );
  };

  const handleAddEditedOption = () => {
    if (newOption.trim() !== "") {
      setEditedOptions((prevOptions) => [...prevOptions, newOption.trim()]);
      setNewOption("");
    }
  };

  const handleCloseEditQuestionModal = () => {
    setSelectedQuestion(null);
    setEditedQuestion("");
    setEditedOptions([]);
    setShowEditQuestionModal(false);
  };

  const handleSaveEditedQuestion = () => {
    const updatedQuestions = surveyData.questions.map((question) => {
      if (question === selectedQuestion) {
        return {
          ...question,
          question: editedQuestion.trim(),
          options: editedOptions.filter((option) => option.trim() !== ""),
        };
      }
      return question;
    });

    setSurveyData((prevData) => ({
      ...prevData,
      questions: updatedQuestions,
    }));

    setSelectedQuestion(null);
    setEditedQuestion("");
    setEditedOptions([]);
    setShowEditQuestionModal(false);
  };

  const columns = [
    {
      name: "No.",
      selector: (row, index) => index + 1,
    },
    {
      name: "Pertanyaan",
      selector: (row) => row.question,
    },
    {
      name: "Opsi",
      cell: (row) =>
        row.options && row.options.length > 0
          ? row.options.join(", ")
          : "Tidak ada opsi",
    },
    {
      name: "Aksi",
      cell: (row, index) => (
        <div>
          <Button variant="success" onClick={() => handleEditQuestion(row)}>
            <FontAwesomeIcon icon={faPenToSquare}/>
          </Button>
          <Button
            variant="danger"
            className="mx-2"
            onClick={() => handleDeleteQuestion(index)}
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
            <div className="d-flex justify-content-between">
              <Link to={"/kelolasurvey"} className="btn btn-secondary">
                Back
              </Link>
              <h4>Pengaturan Survey</h4>
            </div>
            <hr />
            <Container fluid className="px-0 d-flex justify-content-between">
              <p>💡 Pastikan untuk menyimpan perubahan</p>
              <Button variant="success" onClick={handleSaveChanges}>
                Simpan
              </Button>
            </Container>
            <Form>
              <FormLabel>Nama</FormLabel>
              <input
                type="text"
                className="form-control"
                value={editedSurveyName}
                placeholder="Masukkan nama survey"
                onChange={(e) => setEditedSurveyName(e.target.value)}
              />

              <FormLabel>Status</FormLabel>
              <Form.Check
                type="switch"
                id={`switch-${surveyData.isActive}`}
                label={surveyData.isActive ? "Aktif" : "Nonaktif"}
                checked={surveyData.isActive}
                onChange={handleStatusChange}
                disabled={isUpdatingStatus}
              />
            </Form>

            <Container fluid className="px-0">
              <hr />
              <DataTable
                title="List Pertanyaan"
                columns={columns}
                data={surveyData.questions || []}
                pagination
                subHeader
                subHeaderComponent={
                  <Container fluid className="px-0">
                    <Button
                      variant="primary"
                      onClick={handleShowAddQuestionModal}
                    >
                      Tambah pertanyaan
                    </Button>
                  </Container>
                }
              />
            </Container>
          </Col>
        </Row>
      </Container>

      {/* Modal Tambah Pertanyaan */}
      <Modal show={showAddQuestionModal} onHide={handleCloseAddQuestionModal}>
        <Modal.Header closeButton>
          <Modal.Title>Tambah Pertanyaan</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Pertanyaan</Form.Label>
              <Form.Control
                type="text"
                placeholder="Masukkan pertanyaan"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Opsi</Form.Label>
              <Container fluid className="d-flex px-0 justify-content-between">
                <input
                  className="form-control"
                  type="text"
                  placeholder="Masukkan opsi (optional)"
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                />
                <Button
                  variant="transparent"
                  className="px-0 py-0"
                  onClick={handleAddOption}
                  style={{ fontSize: "18px", marginLeft: "10px" }}
                >
                  ➕
                </Button>
              </Container>
            </Form.Group>
            <hr />
            {newOptions.length > 0 && (
              <ul className="px-0">
                <p>List opsi :</p>
                {newOptions.map((option, index) => (
                  <Container
                    fluid
                    className="px-2 border rounded my-2 d-flex justify-content-between"
                    key={index}
                  >
                    <li style={{ listStyle: "none" }}>{option}</li>
                    <Button
                      variant="transparent"
                      className="px-0 py-0"
                      style={{ fontSize: "18px" }}
                      onClick={() => handleRemoveOption(index)}
                    >
                      ⛔
                    </Button>
                  </Container>
                ))}
              </ul>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseAddQuestionModal}>
            Tutup
          </Button>
          <Button variant="primary" onClick={handleAddQuestion}>
            Simpan Pertanyaan
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Edit Pertanyaan */}
      <Modal show={showEditQuestionModal} onHide={handleCloseEditQuestionModal}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Pertanyaan</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Pertanyaan</Form.Label>
              <Form.Control
                type="text"
                placeholder="Masukkan pertanyaan"
                value={editedQuestion}
                onChange={(e) => handleEditQuestionChange(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Opsi</Form.Label>
              <Container fluid className="px-0 d-flex justify-content-between">
                <input
                  className="form-control"
                  type="text"
                  placeholder="Masukkan opsi (optional)"
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                />
                <Button
                  variant="transparent"
                  className="px-0 py-0"
                  onClick={handleAddEditedOption}
                  style={{ fontSize: "18px", marginLeft: "10px" }}
                >
                  ➕
                </Button>
              </Container>
              <hr />
              <Container fluid className="px-0">
                <ul className="px-0">
                  <p>List opsi :</p>
                  {editedOptions.map((option, index) => (
                    <Container
                      fluid
                      className="px-2 border rounded my-2 d-flex justify-content-between form-control"
                      key={index}
                    >
                      <li style={{ listStyle: "none" }}>{option}</li>
                      <Button
                        variant="transparent"
                        className="px-0 py-0"
                        style={{ fontSize: "18px" }}
                        onClick={() => handleRemoveEditedOption(index)}
                      >
                        ⛔
                      </Button>
                    </Container>
                  ))}
                </ul>
              </Container>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseEditQuestionModal}>
            Tutup
          </Button>
          <Button variant="primary" onClick={handleSaveEditedQuestion}>
            Simpan Pertanyaan
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Update Berhasil */}
      <Modal show={showSuccessModal} onHide={() => setShowSuccessModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Update Berhasil</Modal.Title>
        </Modal.Header>
        <Modal.Body>Data survey berhasil diperbarui.</Modal.Body>
      </Modal>
    </div>
  );
};

export default SurveySetup;